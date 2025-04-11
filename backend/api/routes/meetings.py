from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from typing_extensions import Annotated
from typing import List, Union, Optional
import os
import shutil
import tempfile
import uuid
from datetime import datetime
from pydantic import BaseModel
import json

from models.meeting import MeetingRecord, MeetingAnalysisJSON, SentimentAnalysisOutput, SpeakerAnalysisOutput, TopicsOutput, ParticipantStatsOutput, ReactionItemOutput, ReactionsAnalysisOutput
from db.supabase_client import get_supabase_client
from supabase import Client

# Import the SHARED analysis pipeline function
from services.analysis_pipeline import run_full_analysis_pipeline
from services.pdf_generator import generate_pdf_report, generate_pdf_from_file

router = APIRouter(
    prefix="/api/meetings",
    tags=["Meetings"],
)

# Define base path for meeting recordings
# Go up three levels from backend/api/routes to the project root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')) 
MEETING_DATA_BASE_PATH = os.path.join(project_root, 'data', 'meeting_recordings')

# Mapping from logical Meeting IDs to actual directory names
# (Centralize this if used elsewhere)
MEETING_ID_TO_DIRECTORY_MAP = {
    "zoom-dataset-1": "Zoom", 
    "w3ml-dataset-1": "ZoomW3ML", 
    "demo-dataset-1": "Demo"    
}

# Expected filenames within dataset directories (adjust if needed)
TRANSCRIPT_FILENAMES = ["transcript.vtt"] # Add other possible names like .txt, .m4a
CHAT_FILENAME = "chat.txt" # Assuming this is the standard chat file name

class AnalyzeDatasetRequest(BaseModel):
    meetingId: str # The logical meeting ID (e.g., "zoom-dataset-1")

@router.post("/analyze", summary="Upload and analyze a meeting file")
async def analyze_meeting(
    supabase: Annotated[Union[Client, None], Depends(get_supabase_client)],
    file: UploadFile = File(...)
):
    """
    Accepts a meeting file (.vtt, .txt, .m4a), processes it through the AI pipeline,
    stores the results in Supabase, and returns the analysis.
    """
    if supabase is None:
        raise HTTPException(status_code=503, detail="Supabase client not available")

    if not file.filename:
         raise HTTPException(status_code=400, detail="No filename provided")

    # Validate file type
    file_extension = os.path.splitext(file.filename)[1].lower()
    allowed_extensions = {".vtt", ".txt", ".m4a"}
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}")

    # Save uploaded file temporarily
    temp_dir = tempfile.mkdtemp()
    temp_file_path = os.path.join(temp_dir, file.filename)
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"Temporary file saved at: {temp_file_path}")

        # Run the analysis pipeline using the SHARED function
        file_type = file_extension[1:]
        analysis_result: MeetingAnalysisJSON = await run_full_analysis_pipeline(temp_file_path, file_type)

        # TODO: Get authenticated user ID (replace with actual auth logic)
        # user_id = uuid.uuid4() # Placeholder
        # TODO: Replace with actual authenticated user's email from request context/token
        user_email_placeholder = "test@example.com" 

        # Prepare data for Supabase insertion
        meeting_data_to_insert = {
            # "user_id": str(user_id),
            "created_by": user_email_placeholder, # Use created_by
            "file_name": file.filename,
            "analysis_json": analysis_result.model_dump(exclude_unset=True), 
            # Potentially redundant fields - get from analysis_json if needed
            # Add dummy values for required fields if not already set by defaults
            "title": analysis_result.metadata.get("source_file", "Uploaded Meeting"), # Use filename as title default
            "date": datetime.utcnow().isoformat(), # Format date to ISO string
        }

        # Insert into Supabase
        try:
            insert_response = supabase.table("meetings").insert(meeting_data_to_insert).execute()
            
            if not insert_response.data:
                 # Log the error details if available in the response
                 print("Supabase insertion error:", insert_response.error)
                 raise HTTPException(status_code=500, detail="Failed to store analysis results in database.")
            
            inserted_record = insert_response.data[0]
            print(f"Analysis results stored in Supabase with ID: {inserted_record.get('id')}")
            
            # Return the analysis results along with the new ID
            return JSONResponse(content={
                "success": True, 
                "meeting_id": inserted_record.get('id'),
                "analysis": analysis_result.model_dump(exclude_unset=True)
            }, status_code=201)

        except Exception as db_error:
            print(f"Database insertion error: {db_error}")
            raise HTTPException(status_code=500, detail=f"Database error: {db_error}")

    except Exception as e:
        # Catch errors during file processing or analysis
        print(f"Error during analysis process: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")
    finally:
        # Clean up temporary file and directory
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        print(f"Temporary directory cleaned up: {temp_dir}")

# TODO: Add GET endpoint to retrieve analysis by ID

@router.get("/download-pdf/{meeting_id}", summary="Download meeting analysis as PDF")
async def download_pdf(
    meeting_id: str,  # Changed from uuid.UUID to str to allow logical IDs
    supabase: Annotated[Union[Client, None], Depends(get_supabase_client)],
    version: Optional[int] = None
):
    """Fetches analysis data for a meeting ID and generates a comprehensive PDF report 
    that matches the dashboard display with metrics, summary, speakers, topics, and insights.
    
    Optionally specify a version number to get a historical version.
    """
    # Import MeetingAnalysisJSON here to ensure it's available
    from models.meeting import MeetingAnalysisJSON
    
    if supabase is None:
        raise HTTPException(status_code=503, detail="Supabase client not available")

    try:
        print(f"Fetching meeting data for PDF export: {meeting_id}, version: {version or 'latest'}")
        
        # First check if meeting_id is a UUID or a logical ID
        is_uuid = False
        try:
            uuid_obj = uuid.UUID(meeting_id)
            is_uuid = True
        except ValueError:
            # Not a UUID, assume it's a logical ID
            is_uuid = False
            
        # Query based on UUID or logical ID
        if is_uuid:
            # Base query to get the record by UUID
            query = supabase.table("meetings").select("id, file_name, title, analysis_json, version, previous_versions, metadata_json").eq("id", meeting_id)
        else:
            # Query by logical_id in metadata_json
            query = supabase.table("meetings").select("id, file_name, title, analysis_json, version, previous_versions, metadata_json").filter("metadata_json->>'logical_id'", "eq", meeting_id)
        
        # Execute query to get the record
        result = query.maybe_single().execute()

        if not result or not result.data:
            # If logical ID didn't work, try finding the record in the filesystem
            if not is_uuid:
                # Try to load analysis directly from file system
                analysis_file_path = os.path.join('public', 'analysis-data', meeting_id, f"meeting-analysis-{meeting_id}.json")
                project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
                full_path = os.path.join(project_root, analysis_file_path)
                
                if os.path.exists(full_path):
                    try:
                        # Open the file with explicit UTF-8 encoding to handle special characters
                        with open(full_path, 'r', encoding='utf-8') as f:
                            analysis_json_data = json.load(f)
                            
                        # Make sure we have required fields for MeetingAnalysisJSON
                        if not "metadata" in analysis_json_data:
                            analysis_json_data["metadata"] = {}
                            
                        # Generate PDF with error handling
                        try:
                            pdf_buffer = generate_pdf_from_file(analysis_json_data, meeting_id, version)
                            
                            # Create a descriptive filename
                            pdf_filename = f"meeting_analysis_{meeting_id}.pdf"
                            
                            # Return the PDF stream
                            return StreamingResponse(
                                pdf_buffer, 
                                media_type="application/pdf",
                                headers={"Content-Disposition": f"attachment; filename=\"{pdf_filename}\""}
                            )
                        except Exception as pdf_err:
                            print(f"Error generating PDF from file data: {pdf_err}")
                            raise HTTPException(status_code=500, detail=f"Error generating PDF: {pdf_err}")
                    except UnicodeDecodeError as encode_err:
                        print(f"Unicode decode error - trying with error handling: {encode_err}")
                        # Try again with error handling mode
                        try:
                            with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
                                analysis_json_data = json.load(f)
                                
                            # Make sure we have required fields for MeetingAnalysisJSON
                            if not "metadata" in analysis_json_data:
                                analysis_json_data["metadata"] = {}
                                
                            pdf_buffer = generate_pdf_from_file(analysis_json_data, meeting_id, version)
                            return StreamingResponse(
                                pdf_buffer, 
                                media_type="application/pdf",
                                headers={"Content-Disposition": f"attachment; filename=\"meeting_analysis_{meeting_id}.pdf\""}
                            )
                        except Exception as fallback_err:
                            print(f"Error in fallback encoding path: {fallback_err}")
                            raise HTTPException(status_code=500, detail=f"Could not process file with encoding issues: {fallback_err}")
                    except Exception as file_err:
                        print(f"Error loading analysis from file: {file_err}")
                        
            raise HTTPException(status_code=404, detail=f"Meeting analysis not found for ID: {meeting_id}")
            
        record = result.data
        current_version = record.get("version", 1)
        original_filename = record.get("file_name", "meeting")
        meeting_title = record.get("title", "Meeting Analysis")
        analysis_json_data = record.get("analysis_json")
        
        # Add the meeting title to analysis data if available
        if meeting_title and analysis_json_data and isinstance(analysis_json_data, dict):
            if "meeting_title" not in analysis_json_data:
                analysis_json_data["meeting_title"] = meeting_title
                
        # Make sure we have required fields for MeetingAnalysisJSON
        if isinstance(analysis_json_data, dict) and not "metadata" in analysis_json_data:
            analysis_json_data["metadata"] = {}
        
        # Check if a specific version was requested
        if version is not None and version != current_version:
            print(f"Historical version {version} requested (current is {current_version})")
            
            # Check if the requested version exists in previous_versions
            previous_versions = record.get("previous_versions", [])
            requested_version = None
            
            for v in previous_versions:
                if v.get("version") == version:
                    requested_version = v
                    break
                    
            if not requested_version:
                raise HTTPException(status_code=404, detail=f"Version {version} not found for meeting ID: {meeting_id}")
                
            print(f"Found historical version {version} in previous_versions")
            
            # For historical versions, we only have compact data
            # If full historical data is needed, you can fetch it from file storage
            # or enhance the compact version for PDF generation
            
            # Extract available data from compact version
            compact_data = {
                "meeting_title": meeting_title,
                "meetingId": record.get("metadata_json", {}).get("logical_id", str(meeting_id)),
                "meetingTitle": f"{original_filename} (Version {version})",
                "summary": requested_version.get("summary", ""),
                "date": requested_version.get("timestamp", ""),
                "sentiment": requested_version.get("sentiment", {"overall": 0}),
                "topics": {"topics": [{"name": t, "percentage": 0} for t in requested_version.get("topics", [])]},
                "action_items": requested_version.get("action_items", []),
                "version_info": {
                    "version": version,
                    "is_historical": True,
                    "current_version": current_version
                }
            }
            
            analysis_json_data = compact_data
            
        if not analysis_json_data:
            raise HTTPException(status_code=404, detail=f"Analysis data missing for meeting ID: {meeting_id}")

        # Validate data with Pydantic model for current version
        # For historical version, we use the compact data directly
        if version is None or version == current_version:
            try:
                # Add meeting title to the data if available
                if meeting_title and not analysis_json_data.get("meeting_title"):
                    analysis_json_data["meeting_title"] = meeting_title
                
                analysis_data = MeetingAnalysisJSON(**analysis_json_data)
            except Exception as pydantic_error:
                 print(f"Pydantic validation error for meeting {meeting_id}: {pydantic_error}")
                 raise HTTPException(status_code=500, detail="Error processing stored analysis data.")
        else:
            # Use compact data directly
            analysis_data = analysis_json_data

        # Generate PDF
        try:
            pdf_buffer = generate_pdf_report(analysis_data, original_filename)
        except Exception as pdf_error:
             print(f"PDF generation error for meeting {meeting_id}: {pdf_error}")
             raise HTTPException(status_code=500, detail="Failed to generate PDF report.")

        # Create filename for download
        pdf_filename_base = meeting_title or os.path.splitext(os.path.basename(original_filename))[0]
        pdf_filename_base = pdf_filename_base.replace(" ", "_").replace(":", "_")
        version_suffix = f"_v{version}" if version is not None else ""
        pdf_filename = f"{pdf_filename_base}_analysis{version_suffix}.pdf"

        # Return PDF as a streaming response
        return StreamingResponse(
            pdf_buffer, 
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=\"{pdf_filename}\""}
        )

    except HTTPException as http_exc: # Re-raise HTTP exceptions
        raise http_exc
    except Exception as e:
        print(f"Error during PDF download process for meeting {meeting_id}: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during PDF generation: {e}")

# New endpoint to get analysis results/status
@router.get("/{meeting_id}/result", summary="Get meeting analysis result/status")
async def get_analysis_result(
    meeting_id: uuid.UUID,
    supabase: Annotated[Union[Client, None], Depends(get_supabase_client)] 
):
    """Fetches the analysis status and results for a given meeting ID."""
    if supabase is None:
        raise HTTPException(status_code=503, detail="Supabase client not available")

    try:
        print(f"Checking analysis result for meeting ID: {meeting_id}")
        # Fetch relevant fields: status, analysis_json, error_detail
        result = supabase.table("meetings")\
            .select("id, status, analysis_json, error_detail")\
            .eq("id", str(meeting_id))\
            .maybe_single()\
            .execute()

        if not result or not result.data:
            raise HTTPException(status_code=404, detail=f"Meeting analysis record not found for ID: {meeting_id}")

        record = result.data
        status = record.get("status", "UNKNOWN")
        analysis_data = record.get("analysis_json")
        error = record.get("error_detail")

        response_payload = {
            "meeting_id": str(meeting_id),
            "status": status,
            "analysis": None, # Default to None
            "error": error
        }

        if status == "COMPLETE" and analysis_data:
            # Validate with Pydantic before returning if needed, or assume structure is correct
            try:
                analysis_validated = MeetingAnalysisJSON(**analysis_data)
                response_payload["analysis"] = analysis_validated.model_dump(exclude_unset=True)
                print(f"Returning COMPLETE status and analysis data for {meeting_id}")
            except Exception as p_error:
                 print(f"Pydantic validation failed for completed analysis {meeting_id}: {p_error}")
                 response_payload["status"] = "ERROR_PARSING_RESULT" # Indicate data is bad
                 response_payload["error"] = "Failed to parse stored analysis data."

        elif status == "FAILED":
             print(f"Returning FAILED status for {meeting_id}. Error: {error}")
             # Analysis data should be None
        
        elif status == "PROCESSING":
            print(f"Returning PROCESSING status for {meeting_id}")
            # Analysis data should be None
            
        else: # PENDING, UNKNOWN, etc.
            print(f"Returning status {status} for {meeting_id}")
            
        return JSONResponse(content=response_payload, status_code=200)

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error fetching analysis result for meeting {meeting_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analysis status.")

# REMOVE: Placeholder comment for PDF download if endpoint exists above
# TODO: Add GET endpoint for PDF download 

@router.post("/analyze-dataset", summary="Analyze a pre-existing meeting dataset")
async def analyze_dataset(
    request: AnalyzeDatasetRequest,
    supabase: Annotated[Union[Client, None], Depends(get_supabase_client)] 
):
    """
    Analyzes a meeting dataset located in the predefined data directory structure,
    saves results to the public analysis data folder, AND updates the Supabase record.
    """
    # Check for Supabase client first
    if supabase is None:
        raise HTTPException(status_code=503, detail="Supabase client not available")
        
    logical_meeting_id = request.meetingId
    print(f"Received request to analyze dataset for logical ID: {logical_meeting_id}")

    # 1. Find the dataset directory
    source_directory_name = MEETING_ID_TO_DIRECTORY_MAP.get(logical_meeting_id)
    if not source_directory_name:
        raise HTTPException(status_code=400, detail=f"Invalid meetingId. No directory mapping found for: {logical_meeting_id}")
    
    dataset_path = os.path.join(MEETING_DATA_BASE_PATH, source_directory_name)
    if not os.path.isdir(dataset_path):
        raise HTTPException(status_code=404, detail=f"Dataset directory not found at: {dataset_path}")
    print(f"Dataset directory located: {dataset_path}")

    # 2. Find the main transcript file by pattern
    transcript_file_path = None
    file_type = None
    transcript_suffix = '.transcript.vtt' # The ending pattern to search for
    try:
        for filename in os.listdir(dataset_path):
            if filename.endswith(transcript_suffix):
                transcript_file_path = os.path.join(dataset_path, filename)
                file_type = transcript_suffix.split('.')[-1] 
                break
    except OSError as e:
         raise HTTPException(status_code=500, detail=f"Error reading dataset directory {dataset_path}: {e}")
    
    if not transcript_file_path:
        raise HTTPException(status_code=404, detail=f"Transcript file ending with '{transcript_suffix}' not found in {dataset_path}")
    print(f"Transcript file found: {transcript_file_path} (Type: {file_type})")

    # 3. Find the chat file (optional) - Look for files ending with Chat.txt
    chat_file_path = None
    chat_suffix_to_find = 'Chat.txt'
    try:
        for filename in os.listdir(dataset_path):
            if filename.endswith(chat_suffix_to_find):
                chat_file_path = os.path.join(dataset_path, filename)
                print(f"Chat file found using pattern '*{chat_suffix_to_find}': {chat_file_path}")
                break
    except OSError as e:
        print(f"Warning: Error scanning for chat file in {dataset_path}: {e}")

    if chat_file_path:
        print(f"Chat file identified: {chat_file_path}")
    else:
        print(f"Chat file ending with '{chat_suffix_to_find}' not found in {dataset_path}. Proceeding without chat analysis.")

    # 4. Define the output directory
    output_dir_relative = os.path.join('public', 'analysis-data', logical_meeting_id)
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
    output_dir_absolute = os.path.join(project_root, output_dir_relative)
    print(f"Output directory set to: {output_dir_absolute}")
    os.makedirs(output_dir_absolute, exist_ok=True)

    # --- ADDED: Find Supabase record ID based on logical_meeting_id --- 
    # This requires a way to map logical_meeting_id to the actual record ID.
    # We will try finding based on logical_id in metadata_json
    supabase_record_id = None
    current_version = 1
    previous_versions = []
    
    try:
        print(f"Attempting to find Supabase record matching logical ID: {logical_meeting_id}")
        
        # Look for a record with matching logical_id in metadata_json
        # DEBUG: First, inspect all meeting records to see what we have
        all_meetings = supabase.table("meetings").select("id, metadata_json").execute()
        print(f"Found {len(all_meetings.data)} meetings in database.")
        
        # Print the first few for debugging
        for i, meeting in enumerate(all_meetings.data[:3]):
            print(f"Meeting {i+1}: id={meeting.get('id')}, metadata={meeting.get('metadata_json')}")
        
        # Try multiple ways to search for the meeting
        # Method 1: Filter using the -> operator (more direct PostgreSQL syntax)
        potential_matches = supabase.table("meetings").select("id, file_name, metadata_json, version, previous_versions").filter("metadata_json->>logical_id", "eq", logical_meeting_id).execute()
        
        if not potential_matches.data:
            print(f"First query found no matches. Trying alternative query...")
            # Method 2: Filter using the ->> operator with quotes
            potential_matches = supabase.table("meetings").select("id, file_name, metadata_json, version, previous_versions").filter("metadata_json->>'logical_id'", "eq", logical_meeting_id).execute()
            
        if not potential_matches.data:
            print(f"Second query found no matches. Trying JSON contains...")
            
            # Method 3: Use a safer approach with jsonb_contains
            # Instead of using the 'cs' operator which is causing syntax errors,
            # use a more direct approach with the '->>'' operator we already know works
            try:
                logical_id_str = str(logical_meeting_id).replace("'", "''")  # Escape single quotes for SQL safety
                # Use the filter method which we know works from Method 2
                potential_matches = supabase.table("meetings").select("id, file_name, metadata_json, version, previous_versions").filter("metadata_json->>'logical_id'", "eq", logical_id_str).execute()
                print(f"Used direct filter with escaped value: '{logical_id_str}'")
            except Exception as query_error:
                print(f"Error with direct query: {query_error}")
                # Try one more fallback with just a basic select
                try:
                    # Just get all records and filter in Python
                    all_records = supabase.table("meetings").select("id, file_name, metadata_json, version, previous_versions").execute()
                    
                    # Create an empty container for matches in case the variable doesn't exist yet
                    if 'potential_matches' not in locals() or potential_matches is None:
                        class EmptyResponse:
                            def __init__(self):
                                self.data = []
                        potential_matches = EmptyResponse()
                    
                    if all_records and hasattr(all_records, 'data') and all_records.data:
                        # Manual filtering in Python
                        potential_matches.data = [
                            record for record in all_records.data 
                            if record.get('metadata_json') and record.get('metadata_json', {}).get('logical_id') == logical_meeting_id
                        ]
                        print(f"Fallback: Filtered {len(all_records.data)} records to {len(potential_matches.data)} matches")
                    else:
                        print("Fallback query returned no records")
                        potential_matches.data = []
                except Exception as fallback_error:
                    print(f"Fallback query error: {fallback_error}")
        
        print(f"Query results: {len(potential_matches.data)} potential matches found")
        
        if potential_matches.data:
            # Continue with existing logic
            supabase_record_id = potential_matches.data[0]['id']
            current_version = potential_matches.data[0].get('version', 1) + 1  # Increment version
            previous_versions = potential_matches.data[0].get('previous_versions', [])
            
            print(f"Found matching Supabase record ID: {supabase_record_id}, current version: {current_version-1}")
            
            # Prepare compact version data from existing record
            try:
                # Get the current analysis_json to create compact version
                current_analysis = supabase.table("meetings").select("analysis_json").eq("id", supabase_record_id).single().execute()
                
                if current_analysis.data and 'analysis_json' in current_analysis.data:
                    analysis_json = current_analysis.data['analysis_json']
                    
                    # Create compact version with essential data
                    compact_version = {
                        "version": current_version - 1,
                        "timestamp": datetime.utcnow().isoformat(),
                        "summary": analysis_json.get("summary", ""),
                        "sentiment": {"overall": analysis_json.get("sentiment", {}).get("overall", 0)},
                        "topics": [t["name"] for t in analysis_json.get("topics", {}).get("topics", [])],
                        "action_items": analysis_json.get("action_items", [])
                    }
                    
                    # Append to previous versions
                    previous_versions.append(compact_version)
                    print(f"Created compact version of previous analysis (v{current_version-1})")
            except Exception as compact_error:
                print(f"Error creating compact version: {compact_error}")
                # Continue with creating/updating record even if compact version fails
        else:
            print(f"No record found with logical_id: {logical_meeting_id}. Creating new record.")
            
            # Create a new record if matching fails
            try:
                # Create a meaningful title from the dataset
                title = f"Meeting Analysis: {source_directory_name}"
                if logical_meeting_id.startswith("zoom-dataset"):
                    title = f"Zoom Meeting Analysis ({source_directory_name})"
                
                # Store the logical ID in a metadata_json field
                metadata_json = {
                    "logical_id": logical_meeting_id,
                    "source_directory": source_directory_name,
                    "creation_note": "Auto-created during analysis"
                }
                
                current_time = datetime.utcnow().isoformat()
                
                insert_response = supabase.table("meetings").insert({
                    "file_name": os.path.join(source_directory_name, os.path.basename(transcript_file_path)),
                    "title": title,
                    "status": "PROCESSING",
                    "source_type": "dataset",
                    "metadata_json": metadata_json,
                    "version": current_version,
                    "previous_versions": previous_versions,
                    "created_at": current_time
                }).execute()
                
                if insert_response.data:
                    supabase_record_id = insert_response.data[0]['id']
                    print(f"Created new Supabase record with ID: {supabase_record_id}, version: {current_version}")
                else:
                    print("Failed to create new Supabase record: No data returned")
            except Exception as create_error:
                print(f"Error creating new Supabase record: {create_error}")
    except Exception as db_find_error:
        print(f"Error finding Supabase record: {db_find_error}")
    # -----------------------------------------------------------------

    # 5. Run the analysis pipeline
    try:
        print("Starting analysis pipeline execution...")
        analysis_result: MeetingAnalysisJSON = run_full_analysis_pipeline(
            file_path=transcript_file_path,
            file_type=file_type,
            chat_file_path=chat_file_path,
            output_dir=output_dir_absolute, 
            meeting_id=logical_meeting_id 
        )
        print("Analysis pipeline finished successfully.")

        # --- ADDED: Update Supabase record --- 
        if supabase_record_id:
            print(f"Attempting to update Supabase record ID: {supabase_record_id}")
            try:
                current_time = datetime.utcnow().isoformat()
                
                update_response = supabase.table("meetings")\
                    .update({
                        "analysis_json": analysis_result.model_dump(exclude_unset=True),
                        "updated_at": current_time,
                        "status": "COMPLETE", # Set status to COMPLETE
                        "version": current_version,
                        "previous_versions": previous_versions,
                        "is_current": True
                    })\
                    .eq("id", supabase_record_id)\
                    .execute()
                
                # Check if update was successful (PostgREST might return data or just count)
                if update_response.data: # Check if data is returned upon success
                    print(f"Successfully updated Supabase record ID: {supabase_record_id}")
                else:
                    # Check if error exists, otherwise assume success based on no error
                    if hasattr(update_response, 'error') and update_response.error:
                         print(f"Supabase update error for ID {supabase_record_id}: {update_response.error}")
                         # Log error but maybe don't fail the whole request?
                    else:
                        # If no data and no error, it might have succeeded (check PostgREST docs)
                         print(f"Supabase update for ID {supabase_record_id} completed (no data returned, assumed success).")

            except Exception as db_update_error:
                print(f"Error updating Supabase record {supabase_record_id}: {db_update_error}")
                # Log the error but proceed to return success as files were saved
        else:
            print("Skipping Supabase update because no record ID was found.")
        # --------------------------------------

        # Respond with success and the location of the main analysis file
        # Frontend can then fetch this file via a simple GET request or read it directly
        main_analysis_file = os.path.join(output_dir_relative, f"meeting-analysis-{logical_meeting_id}.json")
        return JSONResponse(content={
            "success": True,
            "message": f"Analysis complete for {logical_meeting_id}. Results saved.",
            "output_directory": output_dir_relative,
            "main_analysis_file": main_analysis_file
        }, status_code=200)

    except Exception as e:
        # ... (existing error handling) ...
        # --- ADDED: Update Supabase with error status --- 
        if supabase_record_id:
             print(f"Attempting to update Supabase record {supabase_record_id} with error status.")
             try:
                 supabase.table("meetings")\
                     .update({"status": "FAILED", "error_detail": str(e)[:500]})\
                     .eq("id", supabase_record_id)\
                     .execute()
                 print(f"Updated Supabase record {supabase_record_id} to FAILED status.")
             except Exception as db_fail_error:
                 print(f"Failed to update Supabase record {supabase_record_id} with error status: {db_fail_error}")
        # ---------------------------------------------
        print(f"Error during analysis pipeline execution: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing dataset: {e}") 