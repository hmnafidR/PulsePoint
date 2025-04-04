import { DatasetService } from '../src/lib/dataset-service';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

async function downloadAndProcessDataset() {
  try {
    // Initialize services
    const datasetService = new DatasetService();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    // Create demo directory if it doesn't exist
    const demoDir = path.join(process.cwd(), 'data', 'meeting_recordings', 'demo');
    await fs.mkdir(demoDir, { recursive: true });

    // Download AMI dataset using Hugging Face datasets
    console.log('Downloading AMI dataset...');
    const response = await fetch('https://huggingface.co/api/datasets/edinburghcstr/ami/raw/main/README.md');
    const datasetInfo = await response.json();

    // Process and save demo meetings
    const demoMeetings = [
      {
        id: 'ami-meeting-1',
        name: 'AMI Meeting 1',
        date: new Date().toISOString(),
        duration: 3600,
        participants: ['Speaker 1', 'Speaker 2', 'Speaker 3'],
        topics: ['Project Planning', 'Technical Discussion', 'Resource Allocation']
      },
      {
        id: 'ami-meeting-2',
        name: 'AMI Meeting 2',
        date: new Date(Date.now() - 86400000).toISOString(),
        duration: 2700,
        participants: ['Speaker 4', 'Speaker 5', 'Speaker 6'],
        topics: ['Product Review', 'Team Updates', 'Next Steps']
      }
    ];

    // Save demo metadata
    await fs.writeFile(
      path.join(demoDir, 'meetings-metadata.json'),
      JSON.stringify({ meetings: demoMeetings }, null, 2)
    );

    // Create placeholder files for each meeting
    for (const meeting of demoMeetings) {
      const filePath = path.join(demoDir, `${meeting.id}.txt`);
      await fs.writeFile(
        filePath,
        `This is a placeholder for the ${meeting.name} audio recording.\n` +
        `Duration: ${Math.floor(meeting.duration / 60)} minutes\n` +
        `Participants: ${meeting.participants.join(', ')}\n` +
        `Topics: ${meeting.topics.join(', ')}`
      );
    }

    console.log('Demo dataset created successfully!');
  } catch (error) {
    console.error('Error creating demo dataset:', error);
    process.exit(1);
  }
}

downloadAndProcessDataset(); 