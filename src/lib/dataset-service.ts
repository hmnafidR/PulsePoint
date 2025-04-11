import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

interface MeetingFile {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  duration?: number;
  participants?: string[];
  dateRecorded?: string;
}

export class DatasetService {
  private baseDir: string;
  private meetingRecordingsDir: string;
  private demoDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'data');
    this.meetingRecordingsDir = path.join(this.baseDir, 'meeting_recordings');
    this.demoDir = path.join(this.meetingRecordingsDir, 'demo');
    this.ensureDirectories();
  }

  private ensureDirectories() {
    try {
      if (!fs.existsSync(this.baseDir)) fs.mkdirSync(this.baseDir, { recursive: true });
      if (!fs.existsSync(this.meetingRecordingsDir)) fs.mkdirSync(this.meetingRecordingsDir, { recursive: true });
      if (!fs.existsSync(this.demoDir)) fs.mkdirSync(this.demoDir, { recursive: true });
    } catch (error) {
      console.error('Error ensuring directories:', error);
    }
  }

  async getMeetingRecordings(): Promise<MeetingFile[]> {
    try {
      // Check if directory exists
      if (!fs.existsSync(this.meetingRecordingsDir)) {
        return [];
      }

      // Read all subdirectories in the meeting_recordings directory
      const subdirs = await fsPromises.readdir(this.meetingRecordingsDir, { withFileTypes: true });
      const directories = subdirs.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

      // Initialize result array
      const recordings: MeetingFile[] = [];

      // Process each subdirectory
      for (const dir of directories) {
        const dirPath = path.join(this.meetingRecordingsDir, dir);
        const files = await fsPromises.readdir(dirPath, { withFileTypes: true });
        const audioFiles = files
          .filter(file => !file.isDirectory() && this.isAudioFile(file.name))
          .map(file => {
            const filePath = path.join(dirPath, file.name);
            const stats = fs.statSync(filePath);
            
            return {
              id: `${dir}-${file.name}`,
              name: file.name,
              path: filePath,
              type: path.extname(file.name).substring(1),
              size: stats.size,
              dateRecorded: stats.mtime.toISOString(),
              // We would need to parse real metadata from the files for these values
              duration: Math.floor(Math.random() * 3600) + 600, // Random duration between 10-70 minutes
              participants: this.generateRandomParticipants()
            };
          });
        
        recordings.push(...audioFiles);
      }

      return recordings;
    } catch (error) {
      console.error('Error getting meeting recordings:', error);
      return [];
    }
  }

  async createDemoFiles() {
    try {
      // Create demo metadata JSON file
      const demoMetadata = {
        meetings: [
          {
            id: 'demo-quarterly-review',
            name: 'Quarterly Review Meeting',
            date: new Date().toISOString(),
            duration: 3600, // 1 hour
            participants: ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Wilson'],
            topics: ['Sales Performance', 'Marketing Strategy', 'Product Roadmap', 'Resource Allocation']
          },
          {
            id: 'demo-product-planning',
            name: 'Product Planning Session',
            date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            duration: 2700, // 45 minutes
            participants: ['Emily Rodriguez', 'David Wilson', 'James Taylor', 'Lisa Wang'],
            topics: ['Feature Prioritization', 'Technical Debt', 'Release Schedule', 'User Feedback']
          },
          {
            id: 'demo-team-standup',
            name: 'Daily Team Standup',
            date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            duration: 900, // 15 minutes
            participants: ['John Smith', 'Sarah Johnson', 'Lisa Wang', 'James Taylor'],
            topics: ['Progress Updates', 'Blockers', 'Daily Goals']
          }
        ]
      };

      // Write metadata file
      await fsPromises.writeFile(
        path.join(this.demoDir, 'meetings-metadata.json'), 
        JSON.stringify(demoMetadata, null, 2)
      );

      // Create dummy text files as placeholders for audio files
      for (const meeting of demoMetadata.meetings) {
        const filePath = path.join(this.demoDir, `${meeting.id}.txt`);
        await fsPromises.writeFile(
          filePath,
          `This is a placeholder for the ${meeting.name} audio recording.\n` +
          `Duration: ${Math.floor(meeting.duration / 60)} minutes\n` +
          `Participants: ${meeting.participants.join(', ')}\n` +
          `Topics: ${meeting.topics.join(', ')}`
        );
      }

      return demoMetadata.meetings;
    } catch (error) {
      console.error('Error creating demo files:', error);
      return [];
    }
  }

  private isAudioFile(filename: string): boolean {
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.txt']; // Including .txt for our demo files
    const extension = path.extname(filename).toLowerCase();
    return audioExtensions.includes(extension);
  }

  private generateRandomParticipants(): string[] {
    const allParticipants = [
      'John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 
      'David Wilson', 'Lisa Wang', 'James Taylor', 'Emma Brown', 
      'Robert Martinez', 'Olivia Garcia', 'William Lee', 'Sophia Kim'
    ];
    
    const count = Math.floor(Math.random() * 5) + 3; // Random number between 3-7 participants
    const shuffled = [...allParticipants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
} 