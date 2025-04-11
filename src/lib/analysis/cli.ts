#!/usr/bin/env node
/**
 * Command-line tool for analyzing meeting recordings
 * 
 * This script provides a CLI interface to the meeting analysis pipeline.
 * It processes Zoom meeting recordings and generates analysis files.
 * 
 * Example usage:
 * ts-node cli.ts --meeting-id abc123 --data-path ./meeting_recordings/zoom --output ./output
 */

import path from 'path';
import fs from 'fs';
import { analyzeMeeting, saveAnalysisResults } from './meeting-analyzer';

// Parse command line arguments
const args = process.argv.slice(2);
const options: Record<string, string> = {};

// Simple argument parser
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg.startsWith('--')) {
    const key = arg.slice(2);
    const value = args[i + 1];
    
    if (value && !value.startsWith('--')) {
      options[key] = value;
      i++; // Skip the next argument as it's a value
    } else {
      options[key] = 'true'; // Flag without value
    }
  }
}

// Define required options
const requiredOptions = ['meeting-id', 'data-path'];
const missingOptions = requiredOptions.filter(option => !options[option]);

if (missingOptions.length > 0) {
  console.error('Error: Missing required options:', missingOptions.map(o => `--${o}`).join(', '));
  printHelp();
  process.exit(1);
}

// Help command
if (options.help) {
  printHelp();
  process.exit(0);
}

// Get option values
const meetingId = options['meeting-id'];
const dataPath = path.resolve(options['data-path']);
const outputPath = options.output ? path.resolve(options.output) : path.join(dataPath, 'analysis');

// Check if data path exists
if (!fs.existsSync(dataPath)) {
  console.error(`Error: Data path does not exist: ${dataPath}`);
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Main function
async function main() {
  try {
    console.log(`Processing meeting ${meetingId} from ${dataPath}`);
    console.log(`Output will be saved to ${outputPath}`);
    
    // Analyze the meeting
    const analysis = await analyzeMeeting(meetingId, dataPath);
    
    // Save the results
    const outputFile = path.join(outputPath, `meeting-analysis-${meetingId}.json`);
    saveAnalysisResults(analysis, outputFile);
    
    // Generate component-specific files
    // Speakers file
    saveAnalysisResults({ 
      speakers: analysis.speakers,
      meetingId: analysis.meetingId,
      meetingTitle: analysis.meetingTitle,
      date: analysis.date,
      duration: analysis.duration
    }, path.join(outputPath, `speakers-analysis-${meetingId}.json`));
    
    // Sentiment file
    saveAnalysisResults({
      overallSentiment: analysis.overallSentiment,
      sentimentTrend: analysis.sentimentTrend,
      meetingId: analysis.meetingId,
      meetingTitle: analysis.meetingTitle,
      date: analysis.date
    }, path.join(outputPath, `sentiment-analysis-${meetingId}.json`));
    
    // Topics file
    saveAnalysisResults({
      topics: analysis.topics,
      keyPhrases: analysis.keyPhrases,
      meetingId: analysis.meetingId,
      meetingTitle: analysis.meetingTitle,
      date: analysis.date
    }, path.join(outputPath, `topics-analysis-${meetingId}.json`));
    
    // Timeline file
    saveAnalysisResults({
      timeline: analysis.timeline,
      meetingId: analysis.meetingId,
      meetingTitle: analysis.meetingTitle,
      date: analysis.date,
      duration: analysis.duration
    }, path.join(outputPath, `timeline-${meetingId}.json`));
    
    // Metadata file with participant stats
    saveAnalysisResults({
      meetingId: analysis.meetingId,
      meetingTitle: analysis.meetingTitle,
      date: analysis.date,
      duration: analysis.duration,
      totalParticipants: analysis.totalParticipants,
      activeParticipants: analysis.activeParticipants,
      inactiveParticipants: analysis.inactiveParticipants
    }, path.join(outputPath, `participants-analysis-${meetingId}.json`));
    
    console.log('Analysis completed successfully!');
    console.log(`Results saved to ${outputFile}`);
    
  } catch (error) {
    console.error('Error processing meeting:', error);
    process.exit(1);
  }
}

// Print help message
function printHelp() {
  console.log(`
Meeting Analysis CLI

Usage:
  ts-node cli.ts --meeting-id <id> --data-path <path> [options]

Required options:
  --meeting-id     ID of the meeting to analyze
  --data-path      Path to the directory containing meeting data files

Optional options:
  --output         Path to save analysis results (default: <data-path>/analysis)
  --help           Print this help message
  `);
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 