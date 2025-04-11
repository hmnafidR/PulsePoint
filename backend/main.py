from fastapi import FastAPI
from contextlib import asynccontextmanager
from api.routes import meetings # Import the meetings router
from api.routes import datasets # Import the datasets router
from services.transcription import load_whisper_model # Import model loader
from services.sentiment import load_sentiment_model # Import sentiment model loader
from services.topic_modeling import load_topic_model # Import topic model compatibility layer
from services.diarization import load_diarization_model # Import diarization model loader

# Lifespan context manager for loading models on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model
    print("Application startup: Loading models...")
    try:
        load_whisper_model("small") # Load the desired model size
        load_sentiment_model() # Load the default sentiment model
        
        # We maintain compatibility with the topic_modeling module,
        # but now use Mistral 7B LLM for topic extraction instead of BERTopic
        load_topic_model() # Initialize topic modeling compatibility layer
        
        load_diarization_model() # Load pyannote diarization model
        # TODO: Load other models here (e.g., potentially Mistral if not using Ollama API externally)
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Fatal error during model loading: {e}")
        # Depending on severity, you might want to prevent app startup
    yield
    # Clean up the ML models and release the resources
    print("Application shutdown: Cleaning up resources...")
    # Add cleanup logic if needed

app = FastAPI(
    title="PulsePoint Meeting Analysis API",
    description="API for analyzing meeting transcripts and audio using AI.",
    version="0.1.0",
    lifespan=lifespan # Add lifespan manager
)

# Include API routers
app.include_router(meetings.router)
app.include_router(datasets.router) # Include the new datasets router

@app.get("/", tags=["Root"], summary="Root endpoint for API health check")
async def read_root():
    """Returns a welcome message indicating the API is running."""
    return {"message": "PulsePoint Meeting Analysis Backend is running"}

# Placeholder for running the app with uvicorn (for local development)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) # Added reload=True 