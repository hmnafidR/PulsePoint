# Meeting Analysis Application - Context & Decisions

## Current Application State

This application is a meeting sentiment analysis tool that processes meeting transcripts and displays insights through an interactive dashboard with PDF export capabilities. The application analyzes meeting data using AI models and presents results including sentiment analysis, speaker metrics, topic detection, and engagement scores.

## Components Overview

1. **Backend API** (`backend/api/routes/meetings.py`)
   - Handles dataset analysis via `/api/meetings/analyze-dataset`
   - Manages Supabase database integration for storing meeting records
   - Provides endpoints for PDF generation

2. **Dashboard UI** (`src/app/dashboard/page.tsx`)
   - Main interface showing meeting metrics and visualizations
   - Includes charts for sentiment and engagement over time
   - Provides PDF export functionality

3. **Live Analysis UI** (`src/app/live-analysis/page.tsx`)
   - Displays real-time analysis for ongoing meetings
   - Contains placeholder components for when no data is available

4. **PDF Generation** (`src/components/pdf/MeetingPDF.tsx`)
   - Creates PDF reports matching the dashboard UI
   - Uses @react-pdf/renderer for PDF creation

## Recent Issues & Fixes

### 1. Supabase Record Storage
- **Issue**: Supabase queries were failing with JSON syntax errors:
  ```
  Error finding Supabase record: {'code': '22P02', 'details': 'Token "\'" is invalid.', 'hint': None, 'message': 'invalid input syntax for type json'}
  ```
- **Fix**: 
  - Replaced problematic JSON contains (`cs`) operator with direct property filter
  - Added proper escaping for values to prevent SQL injection
  - Implemented multiple fallback mechanisms when primary query fails
  - Added Python-side filtering as a last resort

### 2. UI Data Placeholders
- **Issue**: Hardcoded sample data was appearing in the UI instead of "no data" messages
- **Fix**:
  - Updated `QuestionAnalysis` component to use empty arrays instead of sample data
  - Added proper "No data available" messages for all components
  - Ensured all numeric values default to 0 when no data is present

### 3. PDF Chart Visualization
- **Issue**: The Meeting Sentiment Overview chart in PDFs wasn't matching the UI version
- **Fix**:
  - Redesigned chart visualization in `MeetingPDF.tsx` to match the UI
  - Used compatible @react-pdf/renderer components to create smooth line charts
  - Added proper grid lines, axes, and formatting

## Key Decisions

1. **UI Data Handling**
   - All UI components should show clear "no data" messages when data is unavailable
   - Sample/dummy data should not be displayed in production

2. **Supabase Integration**
   - Multiple query approaches are used with fallbacks to improve reliability
   - Python-side filtering is used as a last resort when queries fail
   - Error handling is comprehensive with detailed logging

3. **PDF Generation**
   - PDFs should closely match the UI appearance
   - Charts should be approximated using compatible React PDF components
   - Light green background and proper grid styling should match the UI

## Implementation Notes

### Data Flow
1. Meeting data is analyzed through the backend pipeline
2. Results are stored in both the filesystem and Supabase
3. Dashboard fetches data and displays visualizations
4. PDF generation pulls from the same data source

### Error Handling Strategy
- UI components have fallbacks for missing or incomplete data
- Backend has multiple query approaches with progressive fallbacks
- Detailed error logging helps diagnose issues

## Future Development Guidance

1. **UI Components**
   - When creating new visualizations, ensure proper "no data" states are implemented
   - Follow existing patterns for data loading and error handling

2. **Supabase Integration**
   - Use the successful query patterns established in `meetings.py`
   - Always include proper error handling with fallbacks
   - Consider adding retry mechanisms for intermittent issues

3. **PDF Generation**
   - When adding new visualizations to the dashboard, update the PDF component accordingly
   - Test PDF generation with various data states (empty, partial, complete)
   - Use compatible React PDF components instead of trying to use SVG directly

4. **Testing**
   - Test with empty datasets to ensure proper "no data" handling
   - Verify Supabase integration with various query patterns
   - Ensure PDF generation works with all data conditions 