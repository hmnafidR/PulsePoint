/**
 * Process Meeting Script
 * 
 * This script processes a Zoom meeting recording and generates analysis files.
 * It serves as an example of how to use the analysis pipeline.
 * 
 * Usage:
 *   npm run process-meeting <meeting-id> <data-path> [output-path]
 * 
 * Example:
 *   npm run process-meeting zoom123 ./meeting_recordings/zoom ./analyzed-data
 */

import path from 'path';
import { processZoomMeeting } from '../lib/analysis';

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Error: Insufficient arguments');
  console.log('Usage: npm run process-meeting <meeting-id> <data-path> [output-path]');
  process.exit(1);
}

const meetingId = args[0];
const dataPath = path.resolve(args[1]);
const outputPath = args[2] ? path.resolve(args[2]) : undefined;

console.log(`
=========================================
Processing Meeting: ${meetingId}
Data path: ${dataPath}
Output path: ${outputPath || 'default'}
=========================================
`);

// Process the meeting
processZoomMeeting(meetingId, dataPath, outputPath)
  .then(success => {
    if (success) {
      console.log('✅ Meeting processing completed successfully');
      process.exit(0);
    } else {
      console.error('❌ Meeting processing failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Error processing meeting:', error);
    process.exit(1);
  }); 