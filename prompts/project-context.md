# PulsePoint Project Context

## PDF Generation System

### Overview
The application provides PDF download functionality that captures the dashboard view containing meeting analysis data. This feature was designed to match the UI styling and content layout, providing users with a comprehensive report of their meeting analysis.

### Implementation Details
- A single "Download PDF" button in the dashboard view generates a comprehensive report
- PDF generation happens server-side in `backend/services/pdf_generator.py`
- The main functions are:
  - `generate_pdf_report()`: Handles generation from Pydantic model data
  - `generate_pdf_from_file()`: Handles generation from JSON file data 

### PDF Content Structure
The PDF matches the dashboard view with these sections:
1. **Metric Cards** - Four colorful cards showing:
   - Overall Sentiment (percentage)
   - Average Engagement (percentage)
   - Current Speaker (name and sentiment)
   - Meeting Duration (formatted time)
2. **Meeting Summary** - Text overview of the meeting
3. **Sentiment Overview** - Timeline chart of sentiment during the meeting
4. **Participation Statistics** - Breakdown of participant engagement
5. **Speaker Analysis** - Table of speakers with speaking time and sentiment
6. **Topic Analysis** - Detected topics with percentages and keywords
7. **Action Items** - Bulleted list of follow-up tasks
8. **AI Insights** - Additional AI-generated observations

## Versioning System

### Database Schema
The application uses Supabase with a meeting versioning system:

1. **Meeting Records in Supabase**:
   - Primary fields: `id`, `file_name`, `title`, `analysis_json`, `status`
   - Version tracking fields: `version`, `previous_versions`, `is_current`
   - Metadata field: `metadata_json` (contains `logical_id` and other metadata)

2. **Version Tracking**:
   - Each meeting has a `version` number (starting at 1)
   - When a meeting is re-analyzed, the current version is incremented
   - Previous analysis data is stored in the `previous_versions` array as compact records

3. **Previous Versions Storage**:
   - The `previous_versions` field is an array of compact version objects
   - Each compact version contains:
     ```json
     {
       "version": 1,
       "timestamp": "2023-05-01T12:00:00Z",
       "summary": "Meeting summary text...",
       "sentiment": {"overall": 0.75},
       "topics": ["topic1", "topic2", "topic3"],
       "action_items": ["Action 1", "Action 2"]
     }
     ```

### Meeting Identification
- Supabase records use UUID as primary key
- Logical IDs (e.g., "zoom-dataset-1") map to the actual records
- The `metadata_json->>'logical_id'` field stores this mapping
- This allows referencing meetings by readable IDs like "zoom-dataset-1"

### Historical PDF Generation
1. When a user requests a specific version:
   - The system searches `previous_versions` array for matching version
   - Creates a simplified version of the analysis data from stored fields
   - Generates a PDF with available historical data
   - Appends version number to filename (e.g., `meeting_name_analysis_v2.pdf`)

2. When analyzing the same dataset again:
   - Creates a compact version of current analysis
   - Adds it to the `previous_versions` array
   - Updates analysis_json with new results
   - Increments version number

## API Endpoints

### PDF Generation Endpoints
- `/api/meetings/download-pdf/{meeting_id}` - Downloads a comprehensive PDF report
  - Accepts optional `version` query parameter for historical versions
  - Works with both UUID and logical meeting IDs

### Analysis Endpoints
- `/api/meetings/analyze-dataset` - Triggers analysis of a pre-existing dataset
  - Updates existing record if logical_id is found in database
  - Creates new record if no matching record exists
  - Handles versioning by incrementing version and storing previous data

## Frontend Implementation

### Dashboard View
- `src/app/dashboard/page.tsx` contains the dashboard UI
- The dashboard displays four metric cards at the top matching the PDF output
- Additional analysis sections below show detailed information

### PDF Download Flow
1. User clicks "Download PDF" button in dashboard
2. Frontend calls `/api/meetings/download-pdf/{meeting_id}` 
3. Backend generates PDF matching dashboard format
4. PDF is streamed back to browser for download

## Key Design Decisions

1. **Single PDF Button**: Simplified UI by using a single comprehensive PDF download
   - Previously had separate buttons for metrics and full PDF

2. **Server-side PDF Generation**: Used ReportLab for PDF generation on the server
   - More reliable and consistent than client-side rendering
   - Handles complex layout requirements better

3. **Matching Dashboard Design**: PDF closely mirrors dashboard UI styling
   - Same four colored metric cards at the top
   - Consistent section ordering and visual hierarchy

4. **Versioning with Compact Storage**: 
   - Full analysis data only for current version
   - Compact summary for historical versions
   - Tradeoff between storage space and historical detail

5. **Flexible Meeting ID Handling**:
   - Support for both UUID and logical IDs
   - Multiple lookup methods for better reliability

## Known Issues and Workarounds

1. **PDF Rendering Challenges**:
   - Some fonts and styling limitations in PDFs vs web
   - Used tables and colored backgrounds to approximate web UI

2. **Data Type Handling**:
   - Various handling needed for dict vs Pydantic objects
   - Fallback mechanisms when data is missing or malformed

3. **Versioning Edge Cases**:
   - Record creation vs update logic complexity
   - Multiple queries to ensure matching record is found

## Future Improvements

1. **Enhanced Historical Versioning**:
   - Store more comprehensive data in previous versions
   - Provide version comparison features

2. **Improved PDF Visual Design**:
   - Add more charts and visualizations
   - Better handling of large datasets

3. **Client-side PDF Fallback**:
   - Use client-side rendering as backup if server fails
   - Implement jsPDF for simple cases 