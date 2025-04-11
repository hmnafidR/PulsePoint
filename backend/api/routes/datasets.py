from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing_extensions import Annotated
from typing import Dict, Union, Optional
import os
import uuid
from datetime import datetime

from models.meeting import MeetingAnalysisJSON
from services.analysis_pipeline import run_full_analysis_pipeline # Import shared pipeline
from db.supabase_client import get_supabase_client
from supabase import Client

router = APIRouter(
    prefix="/api/datasets",
    tags=["Datasets"],
)

# --- Dataset Configuration ---
# Define the mapping from dataset ID to the primary file path
# This should ideally be configurable or based on a discovery mechanism
# Ensure these paths are accessible from where the backend server is running
# Use relative paths from the project root or absolute paths
DATASET_FILE_MAP: Dict[str, str] = {
    # Updated filename and path convention (using forward slashes)
    "zoom-dataset-1": "data/meeting_recordings/Zoom/GMT20250327-000123_Recording.transcript.vtt", 
    # Updated filename and path convention
    "w3ml-dataset-1": "data/meeting_recordings/ZoomW3ML/GMT20250325-000008_Recording.cutfile.20250325053526279.transcript.vtt", 
    # Add more datasets and their corresponding file paths
    # "demo-dataset-1": "data/meeting_recordings/demo/demo_meeting.txt",
}

def get_file_paths_for_dataset(dataset_id: str) -> Dict[str, Optional[str]]:
    """Retrieves the primary transcript/audio path and chat file path for a given dataset ID.
    Returns a dict: {'main': path_to_main_file, 'chat': path_to_chat_file_or_None}
    """
    if dataset_id not in DATASET_FILE_MAP:
        raise HTTPException(status_code=404, detail=f"Dataset ID '{dataset_id}' not found or not configured.")
    
    main_file_relative_path = DATASET_FILE_MAP[dataset_id]
    
    # IMPORTANT: Check if the file actually exists
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')) 
    main_full_path = os.path.join(project_root, main_file_relative_path)

    print(f"Looking for main dataset file at resolved path: {main_full_path}")
    if not os.path.exists(main_full_path):
        print(f"Error: Main file not found for dataset '{dataset_id}' at path: {main_full_path}")
        raise HTTPException(status_code=404, detail=f"Configured file for dataset '{dataset_id}' not found on server.")
        
    # --- Find corresponding chat file --- 
    chat_full_path = None
    try:
        main_dir = os.path.dirname(main_full_path)
        main_filename_base = os.path.basename(main_full_path)
        # Derive potential chat filename based on common patterns
        # Pattern 1: Replace extension(s) with newChat.txt
        if '.transcript.vtt' in main_filename_base:
            chat_filename = main_filename_base.replace('.transcript.vtt', 'newChat.txt')
        elif '.cc.vtt' in main_filename_base:
            chat_filename = main_filename_base.replace('.cc.vtt', 'newChat.txt')
        elif '.m4a' in main_filename_base:
            # Handle complex m4a names like ...cutfile.timestamp.m4a -> ...newChat.txt
            # Find the base part before potential suffixes
            base_parts = main_filename_base.split('_') # GMT..., Recording
            if len(base_parts) >= 2:
                # Assume GMT..._Recording is the base we need
                chat_filename = f"{base_parts[0]}_{base_parts[1]}newChat.txt" 
            else:
                chat_filename = os.path.splitext(main_filename_base)[0] + 'newChat.txt' # Fallback
        else:
            chat_filename = os.path.splitext(main_filename_base)[0] + 'newChat.txt' # General fallback

        potential_chat_path = os.path.join(main_dir, chat_filename)
        print(f"Looking for chat file at: {potential_chat_path}")
        if os.path.exists(potential_chat_path):
            chat_full_path = potential_chat_path
            print("Chat file found.")
        else:
            print("Chat file not found at expected location.")
    except Exception as e:
        print(f"Error trying to locate chat file: {e}")
        # Continue without chat file if there's an error finding it
    # ----------------------------------

    return {"main": main_full_path, "chat": chat_full_path}

# --- Analysis Task (to run in background) ---
# NOTE: Needs to be synchronous to work easily with BackgroundTasks unless run_in_threadpool is used
# If pipeline functions were truly async, would need a different background execution method (e.g., Celery)
def run_analysis_and_save(
    file_path: str, 
    file_type: str, 
    chat_file_path: Optional[str], # Add chat file path
    meeting_id: uuid.UUID, # Pass meeting ID to update the record
    supabase_dep: Client # Pass Supabase client dependency
):
    """The actual analysis and saving logic, run as a background task."""
    print(f"[Background Task {meeting_id}] Starting analysis for file: {file_path}")
    analysis_result = None
    analysis_status = "FAILED"
    error_detail = None
    try:
        # Run the pipeline (ensure it's callable synchronously or handle async appropriately)
        # Assuming run_full_analysis_pipeline can be awaited if needed, but BackgroundTasks expects sync funcs
        # For simplicity, let's assume pipeline functions are effectively sync or handle their own async execution within.
        # If run_full_analysis_pipeline itself needs `await`, BackgroundTasks isn't the ideal tool.
        # Call the actual (now synchronous) pipeline function
        analysis_result: MeetingAnalysisJSON = run_full_analysis_pipeline(file_path, file_type, chat_file_path)
        print(f"[Background Task {meeting_id}] Analysis finished. Result snippet: {str(analysis_result.model_dump(exclude_unset=True))[:200]}...")
        analysis_status = "COMPLETE"
        
    except Exception as pipeline_error:
        print(f"[Background Task {meeting_id}] Pipeline error: {pipeline_error}")
        error_detail = str(pipeline_error)
        # analysis_result remains None

    # Update Supabase record
    update_payload = {
        "analysis_json": analysis_result.model_dump(exclude_unset=True) if analysis_result else None,
        "status": analysis_status, # Add a status column to your meetings table
        "error_detail": error_detail # Add an error_detail column to your meetings table
    }
    try:
        print(f"[Background Task {meeting_id}] Updating Supabase record...")
        update_response = supabase_dep.table("meetings").update(update_payload).eq("id", str(meeting_id)).execute()
        if update_response.data:
            print(f"[Background Task {meeting_id}] Supabase record updated successfully.")
        else:
             print(f"[Background Task {meeting_id}] Failed to update Supabase record. Error: {update_response.error}")
             # Log error, but task completion is noted
    except Exception as db_error:
        print(f"[Background Task {meeting_id}] DB update error: {db_error}")
        # Log error

@router.post("/{dataset_id}/analyze", 
              summary="Analyze a predefined dataset (Async)", 
              status_code=202 # Return 202 Accepted
             )
async def analyze_dataset_async(
    dataset_id: str,
    background_tasks: BackgroundTasks, # Inject BackgroundTasks
    supabase: Annotated[Union[Client, None], Depends(get_supabase_client)]
):
    """Accepts dataset analysis request, starts background task, returns meeting ID."""
    if supabase is None:
        raise HTTPException(status_code=503, detail="Supabase client not available")

    try:
        # 1. Get the file paths
        file_paths = get_file_paths_for_dataset(dataset_id)
        main_file_path = file_paths["main"]
        chat_file_path = file_paths["chat"]
        main_file_extension = os.path.splitext(main_file_path)[1].lower()
        main_file_type = main_file_extension[1:]
        original_filename = os.path.basename(main_file_path)
        
        # 2. Create Placeholder Record in Supabase
        # TODO: Get actual user email
        user_email_placeholder = "test@example.com"
        meeting_id = uuid.uuid4() # Generate ID beforehand or get from insert
        
        initial_meeting_data = {
            "id": str(meeting_id),
            "created_by": user_email_placeholder,
            "file_name": original_filename,
            "title": f"Dataset: {dataset_id}",
            "date": datetime.utcnow().isoformat(),
            "status": "PROCESSING", # Add a status column to your table
            # analysis_json is initially null
        }
        print(f"Creating initial meeting record for dataset {dataset_id} with ID {meeting_id}")
        insert_response = supabase.table("meetings").insert(initial_meeting_data).execute()

        if not insert_response.data:
            print(f"Failed to create initial meeting record: {insert_response.error}")
            raise HTTPException(status_code=500, detail="Failed to initialize analysis process.")
            
        # Retrieve the actual ID in case default was used (though we set it)
        meeting_id = insert_response.data[0].get('id', meeting_id) 
        print(f"Initial record created with ID: {meeting_id}")

        # 3. Add the long-running task to BackgroundTasks
        # WARNING: run_analysis_and_save MUST be synchronous or use workarounds.
        # Pass the necessary arguments, including the Supabase client.
        background_tasks.add_task(
            run_analysis_and_save, 
            main_file_path,     # Pass main file path
            main_file_type,     # Pass main file type
            chat_file_path,     # Pass chat file path (can be None)
            meeting_id, 
            supabase # Pass the dependency
        )
        print(f"Background task added for meeting ID: {meeting_id}")

        # 4. Return 202 Accepted with the meeting ID
        return JSONResponse(
            content={
                "message": "Analysis started in background.", 
                "meeting_id": str(meeting_id)
            },
            status_code=202
        )

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error initiating dataset analysis for '{dataset_id}': {e}")
        raise HTTPException(status_code=500, detail=f"Error initiating analysis: {e}") 