# Meeting Sentiment Analysis App - Development To-Do List

## Phase 1: Backend Setup

### 1. Set Up FastAPI Backend
- Install FastAPI and dependencies:
```bash
pip install fastapi uvicorn python-multipart sqlalchemy psycopg2-binary supabase-py pydantic requests
```

- Create a basic FastAPI app structure:
```python
# main.py
from fastapi import FastAPI
app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Meeting Analysis Backend"}
```

- Test the server locally:
```bash
uvicorn main:app --reload
```

### 2. Integrate Supabase
- Verify Supabase Python client installation:
```bash
pip install supabase-py
```

- Configure Supabase client with your credentials:
```python
from supabase import create_client
supabase = create_client("YOUR_SUPABASE_URL", "YOUR_SUPABASE_KEY")
```

- Test Supabase connection by querying the auth table.

### 3. Define Supabase Schema for Meetings
- Create a meetings table in Supabase:
  - Columns:
    - id (UUID, primary key, auto-generated)
    - user_id (UUID, foreign key to auth.users)
    - file_name (text)
    - duration (integer, seconds)
    - participants (integer)
    - transcript (text)
    - analysis_json (JSONB)

- Test inserting a sample row:
```python
data = {"user_id": "sample-user-id", "file_name": "test.vtt", "analysis_json": {"test": "data"}}
supabase.table("meetings").insert(data).execute()
```

## Phase 2: File Processing & Existing Scripts Integration

### 4. Create File Upload Endpoint
- Add a POST endpoint in FastAPI to handle file uploads:
```python
from fastapi import UploadFile, File

@app.post("/analyze-meeting/")
async def analyze_meeting(file: UploadFile = File(...)):
    content = await file.read()
    return {"filename": file.filename}
```

- Test uploading a .vtt, .txt, or .m4a file via Postman or frontend.

### 5. Integrate Existing Scripts
- Adapt .vtt/.txt parsing scripts to work with uploaded files:
  - Input: content from UploadFile
  - Output: .json with metadata, transcript, reactions, comments, AI insights

- Handle .m4a files as a fallback:
  - Save uploaded .m4a temporarily:
```python
with open("temp.m4a", "wb") as f:
    f.write(content)
```
  - Return a placeholder JSON for now (to be updated with Whisper later)

## Phase 3: AI Pipeline Implementation

### 6. Set Up Speech-to-Text (Self-Hosted Whisper)
- Install Whisper:
```bash
pip install git+https://github.com/openai/whisper.git
```

- Load the small model and test transcription:
```python
import whisper
model = whisper.load_model("small")  # ~244M parameters, ~1-2GB RAM
result = model.transcribe("temp.m4a")
transcript = result["text"]
```

- Integrate into the endpoint:
```python
if file.filename.endswith(".m4a"):
    with open("temp.m4a", "wb") as f:
        f.write(content)
    result = model.transcribe("temp.m4a")
    transcript = result["text"]
```

### 7. Implement Sentiment Analysis (DistilBERT)
- Install Hugging Face Transformers:
```bash
pip install transformers torch
```

- Load DistilBERT and test:
```python
from transformers import pipeline
sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
sentiments = sentiment_analyzer("Sample meeting text.")
```

- Add to endpoint:
  - Run on transcript from scripts or Whisper
  - Append sentiment scores to analysis_json

### 8. Implement Topic Modeling (BERTopic)
- Install BERTopic:
```bash
pip install bertopic
```

- Test topic modeling:
```python
from bertopic import BERTopic
topic_model = BERTopic(min_topic_size=3, low_memory=True)
topics, probs = topic_model.fit_transform(["Sample meeting text."])
topic_info = topic_model.get_topic_info()
```

- Integrate into endpoint:
  - Run on transcript
  - Add topics to analysis_json

### 9. Implement AI Insights (Mistral 7B via Ollama)
- Install Ollama:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

- Pull Mistral 7B Instruct model:
```bash
ollama pull mistral:7b-instruct
```

- Test Mistral locally:
```bash
ollama run mistral:7b-instruct
# Type: "Summarize: Sample meeting text." and verify output
```

- Create a function to call Ollama API:
```python
import requests

def generate_insights(transcript):
    response = requests.post("http://localhost:11434/api/generate", json={
        "model": "mistral:7b-instruct",
        "prompt": f"Summarize this meeting transcript and suggest action items:\n{transcript}",
        "stream": False
    })
    return response.json()["response"]
```

- Integrate into endpoint:
  - Run on transcript
  - Add summary and action items to analysis_json

## Phase 4: Metrics & Visualization

### 10. Compute Engagement Metrics
- Extract metrics from scripts or audio:
  - Total participants: From speaker tags or manual input
  - Active/last speaker: From Whisper segmentation or script data
  - Duration: Use mutagen for .m4a:
```bash
pip install mutagen
```
```python
from mutagen.mp4 import MP4
audio = MP4("temp.m4a")
duration = int(audio.info.length)
```
  - Engagement: Calculate speaking frequency, silence gaps (from Whisper timestamps)
- Add metrics to analysis_json

### 11. Generate Charts
- Install matplotlib or plotly:
```bash
pip install matplotlib
```

- Create sentiment and engagement charts:
```python
import matplotlib.pyplot as plt
plt.plot(sentiment_timestamps, sentiment_scores)
plt.savefig("sentiment_chart.png")
```

- Convert charts to base64 or save as files for frontend

## Phase 5: Storage & Export

### 12. Store Results in Supabase
- Update endpoint to save full analysis:
```python
analysis = {
    "metadata": metadata,
    "transcript": transcript,
    "sentiments": sentiments,
    "topics": topic_info.to_dict(),
    "insights": generate_insights(transcript),
    "metrics": {"duration": duration, "participants": participants}
}
supabase.table("meetings").insert({
    "user_id": "user-id-from-auth",
    "file_name": file.filename,
    "transcript": transcript,
    "analysis_json": analysis
}).execute()
```

### 13. Implement PDF Export
- Install reportlab:
```bash
pip install reportlab
```

- Create a PDF generation function:
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph

def generate_pdf(analysis, filename="report.pdf"):
    doc = SimpleDocTemplate(filename, pagesize=letter)
    story = [Paragraph(f"Summary: {analysis['insights']}")]
    doc.build(story)
```

- Add a GET endpoint:
```python
@app.get("/download-pdf/{meeting_id}")
async def download_pdf(meeting_id: str):
    result = supabase.table("meetings").select("*").eq("id", meeting_id).execute()
    analysis = result.data[0]["analysis_json"]
    generate_pdf(analysis)
    return FileResponse("report.pdf")
```

## Phase 6: Frontend Integration

### 14. Update Frontend to Call Backend
- Add file upload API call:
```typescript
const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("http://localhost:8000/analyze-meeting/", {
        method: "POST",
        body: formData,
    });
    return response.json();
};
```

- Display analysis results (e.g., charts, summary)

### 15. Add PDF Download Button
- Add a button to fetch PDF:
```typescript
const downloadPDF = async (meetingId: string) => {
    const response = await fetch(`http://localhost:8000/download-pdf/${meetingId}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "meeting_report.pdf";
    link.click();
};
```

## Phase 7: Testing & Optimization

### 16. Test End-to-End
- Upload a .vtt file, verify JSON output and Supabase storage
- Upload an .m4a file, verify Whisper transcription and analysis
- Test Mistral 7B insights via Ollama API (ensure Ollama is running)
- Download a PDF and check contents

### 17. Optimize Performance
- Profile processing time; if slow, add async tasks with Celery:
```bash
pip install celery
```
- Test on modest hardware (e.g., 16GB RAM, CPU) to ensure Whisper (small) and Mistral 7B (quantized) run efficiently

## Phase 8: Deployment

### 18. Deploy Backend
- Containerize with Docker (include Whisper and Ollama):
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://ollama.com/install.sh | sh
RUN ollama pull mistral:7b-instruct
COPY . .
CMD ["sh", "-c", "ollama run mistral:7b-instruct & uvicorn main:app --host 0.0.0.0 --port 8000"]
```

- Deploy to a server (e.g., AWS EC2, Heroku)

### 19. Finalize Documentation
- Write a README with setup instructions:
  - Installing Whisper (`pip install git+https://github.com/openai/whisper.git`)
  - Installing and running Ollama (`ollama pull mistral:7b-instruct` and `ollama run mistral:7b-instruct`)
  - Running the backend

## Key Updates
- Step 6 (Speech-to-Text): Updated to use self-hosted Whisper (small) directly, with specific installation and integration steps
- Step 9 (AI Insights): Replaced with Mistral 7B via Ollama, including installation, API setup, and integration
- Step 18 (Deployment): Adjusted Docker setup to include Ollama and Mistral 7B
- Dependencies: Added requests for Ollama API calls

This to-do list integrates your existing scripts with the new self-hosted Whisper and Mistral 7B (Ollama) setup. Start with the backend and Supabase, then layer in Whisper and Ollama. Test thoroughly with .m4a files to ensure transcription works smoothly. 