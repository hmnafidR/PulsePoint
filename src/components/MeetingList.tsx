import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Play, Download } from "lucide-react";

interface Meeting {
  id: string;
  name: string;
  path?: string;
  dateRecorded?: string;
  duration?: number;
  participants?: string[];
}

export default function MeetingList() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/meetings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch meetings');
        }
        
        const data = await response.json();
        setMeetings(data.meetings || []);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to load meetings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeetings();
  }, []);
  
  // Format duration from seconds to MM:SS or HH:MM:SS
  const formatDuration = (seconds: number = 0) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Format date to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading meetings...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-6 dark:bg-red-900/20">
          <p className="text-center text-red-800 dark:text-red-200">{error}</p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="rounded-md bg-muted p-6">
          <p className="text-center text-muted-foreground">No meetings found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardHeader>
                <CardTitle className="line-clamp-1">{meeting.name}</CardTitle>
                <CardDescription>{formatDate(meeting.dateRecorded)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Duration: {formatDuration(meeting.duration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Participants: {meeting.participants?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Date: {formatDate(meeting.dateRecorded)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="secondary" size="sm" className="gap-1">
                      <Play className="h-4 w-4" />
                      Play
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 