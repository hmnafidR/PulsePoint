const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Helper function to run Python script
function runPythonScript(script) {
  return new Promise((resolve, reject) => {
    const pythonProcess = exec(`python -c "${script}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

async function downloadAndProcessDataset() {
  try {
    // Create demo directory if it doesn't exist
    const demoDir = path.join(process.cwd(), 'data', 'meeting_recordings', 'demo');
    if (!fs.existsSync(demoDir)) {
      fs.mkdirSync(demoDir, { recursive: true });
    }

    // Python script to download and save audio samples
    const pythonScript = `
import os
from datasets import load_dataset
import soundfile as sf
import numpy as np

# Set the output directory
output_dir = '${demoDir.replace(/\\/g, '/')}'

# Load the AMI dataset
print("Loading AMI dataset...")
dataset = load_dataset("edinburghcstr/ami", "ihm", trust_remote_code=True)

# Get the first two samples from the training set
samples = dataset['train'].select(range(2))

# Save audio files
for idx, sample in enumerate(samples):
    audio_data = sample['audio']['array']
    sample_rate = sample['audio']['sampling_rate']
    output_path = os.path.join(output_dir, f'demo-meeting-{idx + 1}.wav')
    sf.write(output_path, audio_data, sample_rate)
    print(f"Saved audio sample {idx + 1}")
`;

    console.log('Downloading audio samples using Python...');
    await runPythonScript(pythonScript);

    // Create metadata
    const metadata = {
      meetings: [
        {
          id: 'demo-meeting-1',
          name: 'Weekly Team Sync',
          date: new Date().toISOString(),
          duration: 180,
          participants: ['John Smith', 'Sarah Johnson', 'Mike Wilson'],
          topics: ['Project Planning', 'Technical Discussion', 'Resource Allocation']
        },
        {
          id: 'demo-meeting-2',
          name: 'Product Review',
          date: new Date(Date.now() - 86400000).toISOString(),
          duration: 120,
          participants: ['Emma Davis', 'David Brown', 'Lisa Anderson'],
          topics: ['Product Review', 'Team Updates', 'Next Steps']
        }
      ]
    };

    // Save metadata
    fs.writeFileSync(
      path.join(demoDir, 'meetings-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log('Demo dataset created successfully!');
  } catch (error) {
    console.error('Error creating demo dataset:', error);
    process.exit(1);
  }
}

downloadAndProcessDataset(); 