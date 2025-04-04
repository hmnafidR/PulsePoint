# Meeting Sentiment Analysis App - Product Requirements Document (PRD)

## 1. Overview

### 1.1 Purpose
The Meeting Sentiment Analysis App is designed to analyze Zoom and Microsoft Teams meeting recordings or transcripts to provide actionable insights. It leverages AI to perform sentiment analysis, topic modeling, engagement tracking, and generate summaries and action items, enhancing meeting productivity and follow-up efficiency.

### 1.2 Goals
- Enable users to upload meeting transcripts (.vtt, .txt) or audio (.m4a) for analysis.
- Provide sentiment analysis, topic insights, engagement metrics, and AI-generated summaries/action items.
- Store analysis results in a database and allow PDF exports.
- Build on existing React/TypeScript frontend, Supabase database, and Python backend.

### 1.3 Target Audience
- Professionals, managers, and teams using Zoom/Teams for meetings.
- Developers seeking to integrate AI-driven meeting analytics into workflows.

## 2. Features

### 2.1 File Input
- Supported Formats: .vtt (WebVTT), .txt (plain text), .m4a (audio).
- Logic:
  - Use provided transcripts if available (.vtt, .txt).
  - Convert audio (.m4a) to text if no transcript is provided.

### 2.2 Speech-to-Text Conversion
- Functionality: Convert .m4a audio files to text when transcripts are unavailable.
- Output: Plain text transcript with speaker segmentation (if possible).

### 2.3 Sentiment Analysis
- Functionality: Analyze sentiment (positive, negative, neutral) across the meeting.
- Granularity: Sentence-level sentiment, aggregated for the entire meeting.
- Output: Sentiment scores, live sentiment chart (e.g., every 5 minutes).

### 2.4 Topic Modeling
- Functionality: Identify key topics discussed in the meeting.
- Output: List of topics with prevalence (e.g., "project updates: 40%").

### 2.5 Engagement & Reaction Analysis
- Metrics:
  - Total participants.
  - Active speaker/last speaker.
  - Total meeting duration.
  - Engagement level (based on speaking frequency, silence gaps, sentiment trends).
  - Reaction counts (e.g., "thumbs up" if present in transcript).
- Output: Engagement chart, reaction analysis chart.

### 2.6 AI Insights
- Functionality: Generate a summary, action items, and engagement insights.
- Output: Text-based summary (e.g., "Meeting focused on budget; team disengaged during tech talk"), actionable next steps (e.g., "Follow up on budget approval").

### 2.7 Data Storage
- Functionality: Store analysis results in Supabase database.
- Output: JSON object containing metadata, transcript, sentiments, topics, metrics, and insights.

### 2.8 PDF Export
- Functionality: Export analysis as a downloadable PDF report.
- Content: Summary, action items, charts (sentiment, engagement, reactions).

### 2.9 User Interface
- Frontend: Display analysis results (charts, summaries) and provide PDF download option.
- Interaction: Upload files via a form, view results in real-time.

## 3. Technical Requirements

### 3.1 Frontend
- Framework: React with TypeScript (existing).
- Features:
  - File upload component for .vtt, .txt, .m4a.
  - Display JSON analysis results (charts via react-chartjs-2 or similar).
  - PDF download button triggering backend API.

### 3.2 Backend
- Framework: FastAPI (Python).
- Responsibilities:
  - Handle file uploads via POST endpoint.
  - Process files and run AI pipeline.
  - Store results in Supabase.
  - Generate and serve PDF reports.
- Dependencies:
  - fastapi, uvicorn, python-multipart, supabase-py, pydantic.

### 3.3 Database
- Platform: Supabase (existing).
- Schema:
  - Table: meetings
    - id (UUID, primary key).
    - user_id (foreign key to auth table).
    - file_name (string).
    - duration (integer, seconds).
    - participants (integer).
    - transcript (text).
    - analysis_json (JSONB).

### 3.4 AI Pipeline

#### 3.4.1 Speech-to-Text
- Model: OpenAI Whisper (self-hosted, small variant).
- Why: Free, open-source, lightweight (~244M parameters), CPU-friendly.
- Setup: pip install git+https://github.com/openai/whisper.git.
- Input: .m4a files.
- Output: Text transcript.

#### 3.4.2 Sentiment Analysis
- Model: DistilBERT (distilbert-base-uncased-finetuned-sst-2-english) from Hugging Face Transformers.
- Why: Faster and lighter (66M parameters) than RoBERTa, free, high accuracy.
- Setup: pip install transformers torch.
- Input: Transcript text.
- Output: Sentiment scores per sentence.

#### 3.4.3 Topic Modeling
- Model: BERTopic.
- Why: Lightweight, free, effective for small datasets.
- Setup: pip install bertopic.
- Input: Transcript text.
- Output: Topics and prevalence.

#### 3.4.4 AI Insights
- Model: Mistral 7B (mistralai/Mixtral-7B-Instruct-v0.1).
- Why: Free, lightweight (7B parameters), strong reasoning, CPU-compatible with quantization.
- Setup: pip install transformers torch (use 4-bit quantization).
- Input: Transcript text.
- Output: Summary, action items, insights.

### 3.5 File Processing
- Libraries:
  - webvtt-py for .vtt parsing.
  - mutagen for .m4a metadata (duration).
- Logic: Parse transcripts or transcribe audio, then feed into AI models.

### 3.6 PDF Generation
- Library: reportlab.
- Setup: pip install reportlab.
- Output: PDF with text (summary, action items) and embedded charts.

### 3.7 Optimization
- Use CPU unless GPU is available.
- Quantize Mistral 7B (4-bit) for lower memory usage.
- Process in batches for large meetings.

## 4. User Flow
1. Upload: User logs in (via Supabase auth), uploads a meeting file (.vtt, .txt, .m4a) via React frontend.
2. Processing:
   - Backend receives file via FastAPI.
   - If .m4a, Whisper transcribes it to text.
   - DistilBERT analyzes sentiment, BERTopic extracts topics, Mistral 7B generates insights.
   - Metrics (participants, duration, etc.) and charts are computed.
3. Storage: Results saved to Supabase as JSON.
4. Display: Frontend fetches JSON, renders charts and text.
5. Export: User clicks "Download PDF," triggering backend to generate and serve a PDF.

## 5. Deliverables
- Frontend: Updated React app with upload form, analysis display, and PDF download.
- Backend: FastAPI server with endpoints:
  - POST /analyze-meeting/ (file upload → JSON response).
  - GET /download-pdf/{meeting_id} (PDF generation).
- Database: Supabase schema and integration.
- AI Models: Self-hosted Whisper, DistilBERT, BERTopic, Mistral 7B.
- Documentation: Setup guide for self-hosting models and running the app.

## 6. Success Metrics
- Performance: Process a 1-hour meeting in <5 minutes on modest hardware (e.g., 16GB RAM, CPU).
- Accuracy: Sentiment analysis aligns with human perception (e.g., 85%+ accuracy on labeled datasets).
- User Satisfaction: Positive feedback on summaries and action items.
- Adoption: 100+ meeting analyses within 3 months of launch.

## 7. Risks & Mitigations
- Risk: High computational load slows processing.
  - Mitigation: Use lightweight models (DistilBERT, Whisper-small), quantization, and async tasks (e.g., Celery).
- Risk: Audio transcription fails for noisy recordings.
  - Mitigation: Allow manual transcript upload as fallback.
- Risk: Supabase storage limits exceeded.
  - Mitigation: Compress JSON data, offload large files to local storage if needed.

## 8. Timeline
- Week 1: Set up FastAPI backend, integrate Supabase, and file parsing.
- Week 2: Implement Whisper and DistilBERT pipelines.
- Week 3: Add BERTopic and Mistral 7B, generate charts.
- Week 4: Finalize PDF export, frontend integration, testing.

## 9. Appendix

### 9.1 Sample Backend Code
```python
from fastapi import FastAPI, UploadFile, File
from supabase import create_client
import whisper
from transformers import pipeline

app = FastAPI()
supabase = create_client("SUPABASE_URL", "SUPABASE_KEY")
model = whisper.load_model("small")
sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

@app.post("/analyze-meeting/")
async def analyze_meeting(file: UploadFile = File(...)):
    content = await file.read()
    if file.filename.endswith(".m4a"):
        with open("temp.m4a", "wb") as f:
            f.write(content)
        result = model.transcribe("temp.m4a")
        transcript = result["text"]
    else:
        transcript = content.decode("utf-8")
    
    sentiments = sentiment_analyzer(transcript.split(". "))
    analysis = {"transcript": transcript, "sentiments": sentiments}
    supabase.table("meetings").insert({"analysis_json": analysis}).execute()
    return analysis
``` 