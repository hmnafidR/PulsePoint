# PulsePoint - Meeting Sentiment Analysis Platform

PulsePoint is an AI-powered platform designed to analyze meeting recordings from platforms like Zoom and Microsoft Teams, providing valuable insights into sentiment, engagement, topics, and more.

![PulsePoint Dashboard]()

## What PulsePoint Does

PulsePoint transforms your meeting recordings into actionable insights by:

- Analyzing the sentiment of participants throughout the meeting
- Tracking speaker participation and engagement levels
- Identifying key topics discussed
- Generating AI-powered summaries and action items
- Visualizing meeting dynamics through interactive charts
- Creating comprehensive PDF reports for sharing and review

## Why PulsePoint Exists

Meetings are essential for collaboration, but often lack proper documentation and follow-up. PulsePoint solves this by:

- **Capturing valuable meeting content** that might otherwise be lost
- **Identifying sentiment trends** to improve team dynamics
- **Highlighting participation patterns** to ensure all voices are heard
- **Extracting key topics and action items** for better accountability
- **Providing objective metrics** for meeting effectiveness

## Who PulsePoint Is For

- **Team Leaders** who want to improve meeting effectiveness
- **Project Managers** tracking action items and follow-ups
- **HR Professionals** analyzing team dynamics and engagement
- **Executives** seeking insights into organizational communication
- **Individual Contributors** who want better meeting documentation

## How PulsePoint Works

1. **Upload Meeting Data**: Provide a transcript file (.vtt, .txt) or audio recording (.m4a)
2. **AI Analysis Pipeline**: The system processes the input through multiple AI models
3. **Dashboard Visualization**: View comprehensive insights in an intuitive dashboard
4. **PDF Export**: Generate shareable, professional reports with all key insights

### Data Flow

```
Input (Transcript/Audio) → FastAPI Backend → AI Models → Analysis Results → Next.js Frontend → Interactive Dashboard/PDF
```

![Workflow Diagram](workflow.png)
*Figure 1: PulsePoint System Workflow Diagram*

### Key Components

- **Transcription**: Converts audio to text if not already provided (using Whisper)
- **Sentiment Analysis**: Analyzes emotional tone throughout the meeting
- **Topic Modeling**: Identifies key discussion topics
- **Speaker Recognition**: Tracks who spoke and for how long
- **Engagement Metrics**: Measures overall participation and interaction
- **AI Insights**: Generates summaries and action items using advanced language models

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Geist UI
- **Charting**: Chart.js, React-ChartJS-2, Recharts
- **PDF Generation**: @react-pdf/renderer
- **Authentication**: NextAuth.js, Supabase Auth

### Backend
- **Framework**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage

### AI Models
- **Transcription**: OpenAI Whisper (self-hosted)
- **Sentiment Analysis**: DistilBERT (HuggingFace Transformers)
- **Topic Modeling**: Mistral 7B (via Ollama)
- **Speaker Diarization**: Pyannote.audio
- **Insights Generation**: Mistral 7B (via Ollama)

### Other Tools
- **File Processing**: webvtt-py, mutagen, ffmpeg-python
- **PDF Generation**: ReportLab (server-side fallback)
- **Versioning**: Custom implementation with Supabase

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- FFmpeg (for audio processing)
- Supabase account

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sentiment-analysis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   # Install Whisper separately
   pip install git+https://github.com/openai/whisper.git
   ```

4. Install and set up Ollama (for Mistral 7B):
   ```bash
   # On macOS/Linux
   curl -fsSL https://ollama.com/install.sh | sh
   # On Windows: Download from https://ollama.com
   
   # Pull the Mistral model
   ollama pull mistral:7b-instruct
   ```

5. Create a `.env` file in the backend directory:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_key
   OLLAMA_URL=http://localhost:11434
   ```

### Database Setup

1. Create the necessary tables in Supabase:
   ```sql
   -- Run the SQL from create_schema.sql in your Supabase SQL editor
   ```

### Running the Application

1. Start the frontend development server:
   ```bash
   # From the root directory
   npm run dev
   ```

2. Start the backend server:
   ```bash
   # From the backend directory
   uvicorn main:app --reload --port 8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## How to Use PulsePoint

### 1. Analyzing a Meeting

1. **Log in** to the application
2. Navigate to the **Dashboard**
3. Click **Analyze Meeting**
4. **Upload** a meeting transcript (.vtt, .txt) or audio recording (.m4a)
5. Wait for the analysis to complete (processing time depends on file size)
6. View your analysis results in the interactive dashboard

### 2. Exploring Insights

The dashboard provides several sections:

- **Metric Cards**: Quick overview of key metrics
  - Overall Sentiment (positive/negative)
  - Average Engagement
  - Active Speaker
  - Meeting Duration

- **Sentiment Timeline**: How sentiment changed throughout the meeting

- **Participation Statistics**: Who participated and how much

- **Speaker Analysis**: Detailed breakdown of each speaker's time and sentiment

- **Topic Analysis**: Key topics discussed with relevance percentages

- **Action Items**: AI-generated list of tasks to follow up on

### 3. Generating Reports

1. From the dashboard, click **Download PDF**
2. The system will generate a comprehensive report matching the dashboard layout
3. Save the PDF to your device for sharing or archiving

## Project Structure

```
/
├── backend/                  # FastAPI backend code
│   ├── api/                  # API routes
│   ├── models/               # Pydantic models
│   ├── services/             # Business logic, AI models
│   │   ├── pdf_generator.py  # PDF generation
│   │   ├── sentiment.py      # Sentiment analysis
│   │   ├── transcription.py  # Whisper integration
│   │   └── ...
│   └── main.py               # FastAPI app entry point
├── src/                      # Next.js frontend
│   ├── app/                  # Pages and routes
│   │   ├── dashboard/        # Analysis dashboard
│   │   ├── api/              # API routes
│   │   └── ...
│   ├── components/           # Reusable UI components
│   ├── utils/                # Helper functions
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
│   └── analysis-data/        # Generated analysis files
├── data/                     # Sample datasets
└── scripts/                  # Utility scripts
```

## Deployment

### Frontend Deployment

The Next.js application can be deployed to Vercel:

1. Connect your GitHub repository to Vercel
2. Set the environment variables in the Vercel dashboard
3. Deploy the application

### Backend Deployment

The FastAPI backend can be deployed to a service like Render, Railway, or a custom server:

1. Build a Docker container:
   ```dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   RUN pip install git+https://github.com/openai/whisper.git
   COPY . .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. Deploy to your preferred hosting provider with the necessary environment variables

### Considerations
- Ensure your server has sufficient CPU/RAM for running AI models
- Configure appropriate storage for meeting recordings
- Set up proper authentication and secure API access

## Limitations & Considerations

### Model Limitations
- **Processing Time**: Large audio files may take longer to process
- **Language Support**: Best results with English, but supports multiple languages
- **Speaker Recognition**: May struggle with similar voices or overlapping speech
- **Context Understanding**: May miss subtle context in technical discussions

### Technical Considerations
- **Storage Requirements**: Analysis files and transcripts can grow large over time
- **Memory Usage**: AI models require significant RAM (8GB+ recommended)
- **API Rate Limits**: Supabase has query limits on the free tier
- **Zoom API Integration Costs**: Connecting to Zoom APIs for live meeting data may involve additional costs based on usage volume
- **Recording Limitations**: Meeting recordings often don't capture complete data such as total participants, activity levels, and other meeting metadata

## Future Enhancements

- **Real-time Analysis**: Process meetings as they happen
- **Integration with Meeting Platforms**: Direct Zoom/Teams integration
- **Comparative Analysis**: Compare meeting metrics over time
- **Custom AI Models**: Fine-tuned models for specific industries
- **Team Insights**: Aggregate analytics across multiple meetings
- **Multi-language Support**: Enhanced support for non-English meetings
- **Meeting Archive System**: Create a centralized archive page where all analyzed meetings can be stored and easily accessed
- **Question Analysis**: Analyze the sentiment behind questions asked during meetings to gauge participant concerns
- **Question Categorization**: Use AI to categorize questions by topic, urgency, and relevance
- **Speaker Coaching**: Provide feedback to presenters based on audience sentiment and engagement, with specific suggestions for improvement
- **Model Fine-tuning**: Customize AI models to better capture nuanced sentiment and engagement levels specific to your organization
- **Enhanced PDF Reports**: Improve PDF generation to perfectly mirror the web interface format, ensuring consistent reporting across all mediums

## Versioning System

The application uses a sophisticated versioning system for meeting analysis data:

- Each meeting analysis has a version number starting at 1
- When a meeting is re-analyzed, a new version is created
- Previous versions are stored in a compact format for historical reference
- The system allows generating PDF reports for any version of the analysis
- Logical IDs (e.g., "zoom-dataset-1") provide human-readable references to meetings

## PDF Generation System

PulsePoint offers two methods for generating comprehensive PDF reports:

1. **Client-side Generation** (Primary method):
   - Uses `@react-pdf/renderer` in the browser
   - Perfectly matches the dashboard UI styling
   - Handles all data types including charts and emojis
   - Automatically handles page breaks for long reports

2. **Server-side Generation** (Fallback method):
   - Uses ReportLab in the Python backend
   - More reliable for complex datasets
   - Optimized for server resources

The PDF reports include:
- Metric cards showing key statistics
- Meeting summary
- Sentiment timeline
- Participation breakdown
- Speaker analysis with speaking time and sentiment
- Topic analysis with keywords
- Action items for follow-up
- AI-generated insights

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[License Information]

---

Built with 💖 by [Your Team/Name] 