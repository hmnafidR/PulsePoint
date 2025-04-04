import os
import numpy as np
import soundfile as sf

def generate_sample_audio(duration_seconds, sample_rate=16000):
    """Generate a sample audio signal (sine wave)"""
    t = np.linspace(0, duration_seconds, int(sample_rate * duration_seconds))
    frequencies = [440, 880]  # A4 and A5 notes
    audio = np.zeros_like(t)
    for f in frequencies:
        audio += 0.5 * np.sin(2 * np.pi * f * t)
    return audio

def download_audio_samples():
    # Set the output directory
    output_dir = os.path.join('data', 'meeting_recordings', 'demo')
    os.makedirs(output_dir, exist_ok=True)

    # Generate two sample audio files
    sample_rate = 16000
    
    print("Generating sample audio files...")
    
    # Generate first sample (3 minutes)
    audio1 = generate_sample_audio(180, sample_rate)
    output_path1 = os.path.join(output_dir, 'demo-meeting-1.wav')
    sf.write(output_path1, audio1, sample_rate)
    print(f"Generated demo meeting 1 audio: {output_path1}")
    
    # Generate second sample (2 minutes)
    audio2 = generate_sample_audio(120, sample_rate)
    output_path2 = os.path.join(output_dir, 'demo-meeting-2.wav')
    sf.write(output_path2, audio2, sample_rate)
    print(f"Generated demo meeting 2 audio: {output_path2}")
    
    print("Sample audio files generated successfully!")

if __name__ == "__main__":
    download_audio_samples() 