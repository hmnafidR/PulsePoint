"use client"

import Link from "next/link"
import { BarChart3, Download, LinkIcon, MessageSquare, Settings, LogOut, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MeetingSentimentOverview } from "@/components/dashboard/meeting-sentiment-overview"
import { LiveSentimentAnalysis } from "@/components/analysis/live-sentiment-analysis"
import { MeetingParticipationStats } from "@/components/meetings/meeting-participation-stats"
import { Progress } from "@/components/ui/progress"
import { MeetingEndModal } from "@/components/modals/meeting-end-modal"
import { ConnectMeetingModal } from "@/components/modals/connect-meeting-modal"
import { ReactionAnalysis } from "@/components/analysis/reaction-analysis"
import { LiveSpeakerAnalysis } from "@/components/analysis/live-speaker-analysis"
import { LiveTopicAnalysis } from "@/components/analysis/live-topic-analysis"
import { StaticReactionAnalysisChart } from "@/components/analysis/static-reaction-chart"

// Define types for reaction data
interface ReactionItem {
  name: string;
  count: number;
  sentiment: number;
}

interface SpeakerReactionItem {
  name: string;
  count: number;
}

interface SpeakerReactionData {
  [speaker: string]: SpeakerReactionItem[];
}

// Mapping from logical ID to directory ID (consistent with API)
const meetingIdToDirectoryMap: { [key: string]: string } = {
    "zoom-dataset-1": "GMT20250327-000123", 
    "w3ml-dataset-1": "GMT20250325-000008", 
    "demo-dataset-1": "demo-dataset-1"
  };

// Function to fetch analysis results for a meeting
const fetchAnalysisResults = async (meetingId: string) => {
  try {
    const response = await fetch(`/api/meetings/${meetingId}/analyze`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      processed: data.success,
      analysisData: data.analysis
    };
  } catch (error) {
    console.error('Error fetching analysis results:', error);
    return {
      processed: false,
      analysisData: null
    };
  }
};

export default function Dashboard() {
  const [isEndModalOpen, setIsEndModalOpen] = useState(false)
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [currentMeeting, setCurrentMeeting] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  // Initialize all metrics with zero or empty values
  const [currentSentiment, setCurrentSentiment] = useState(0)
  const [currentEngagement, setCurrentEngagement] = useState(0)
  const [currentSpeaker, setCurrentSpeaker] = useState("")
  const [speakerSentiment, setSpeakerSentiment] = useState(0)
  const [meetingDuration, setMeetingDuration] = useState("00:00")
  const [meetingDurationPercentage, setMeetingDurationPercentage] = useState(0)
  const [meetingTitle, setMeetingTitle] = useState("Weekly All-Hands Meeting")
  const [meetingStatus, setMeetingStatus] = useState("Not Connected")
  const [analysisCompleted, setAnalysisCompleted] = useState(false)
  const [reactionData, setReactionData] = useState<ReactionItem[]>([]);
  const [speakerReactionData, setSpeakerReactionData] = useState<SpeakerReactionData>({});
  const [currentMeetingDirectoryId, setCurrentMeetingDirectoryId] = useState<string | null>(null);
  
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  // Handle connecting to a meeting or analyzing a dataset
  const handleConnectOrAnalyze = async (platform: string, connectionData: any) => {
    setIsAnalyzing(true);
    setCurrentMeetingDirectoryId(null); // Reset directory ID initially
    
    try {
      if (platform === "dataset") {
        // Extract dataset type from the path
        const datasetPath = connectionData.datasetPath;
        const isZoomDataset = datasetPath.includes("zoom");
        const isW3MLDataset = datasetPath.includes("ZoomW3ML");
        
        // Determine logical meetingId
        let logicalMeetingId;
        if (isW3MLDataset) {
            logicalMeetingId = "w3ml-dataset-1"; // Use consistent logical ID
        } else if (isZoomDataset) {
            logicalMeetingId = "zoom-dataset-1"; // Use consistent logical ID
        } else {
            logicalMeetingId = "demo-dataset-1"; // Use consistent logical ID
        }
        
        // **NEW**: Determine and set the actual directory ID for the static chart
        const directoryId = meetingIdToDirectoryMap[logicalMeetingId] || logicalMeetingId;
        setCurrentMeetingDirectoryId(directoryId); 
        console.log(`[Dashboard] Set directory ID for static chart: ${directoryId}`);

        // Check if analysis exists for this *logical* meeting ID
        // Note: fetchAnalysisResults uses the logical ID to call the general /analyze endpoint
        const analysisStatus = await fetchAnalysisResults(logicalMeetingId);
        
        // Set the meeting data
        if (isW3MLDataset) {
          // Set default values immediately for W3ML dataset
          setCurrentSentiment(71); // Default last sentiment
          setCurrentEngagement(82); // Default engagement
          setCurrentSpeaker("Frederick Z"); // Default last speaker
          setSpeakerSentiment(68); // Default speaker sentiment
          setMeetingDuration("02:14:19"); // Default duration
          setMeetingDurationPercentage(100); // Default percentage
          
          setCurrentMeeting({
            id: logicalMeetingId, // Use logical ID here
            title: "W3ML Project Discussion",
            type: "Zoom",
            dataset: datasetPath,
            totalParticipants: 17,
            activeParticipants: 14,
            speakingParticipants: 9,
            reactingParticipants: 16
          });
          setMeetingTitle("W3ML Project Discussion");
          setMeetingStatus("Analysis Complete");
        } else if (isZoomDataset) {
          // Set default values immediately for Zoom dataset
          setCurrentSentiment(73); // Default last sentiment
          setCurrentEngagement(86); // Default engagement
          setCurrentSpeaker("Tamilarasee S"); // Default last speaker
          setSpeakerSentiment(70); // Default speaker sentiment
          setMeetingDuration("01:15:36"); // Default duration
          setMeetingDurationPercentage(100); // Default percentage
          
          setCurrentMeeting({
            id: logicalMeetingId, // Use logical ID here
            title: "Vibecamp Bootcamp Q&A Session",
            type: "Zoom",
            dataset: datasetPath,
            totalParticipants: 14,
            activeParticipants: 12,
            speakingParticipants: 8,
            reactingParticipants: 14
          });
          setMeetingTitle("Vibecamp Bootcamp Q&A Session");
          setMeetingStatus("Analysis Complete");
        } else {
          // Set default values immediately for other datasets
          setCurrentSentiment(68);
          setCurrentEngagement(75);
          setCurrentSpeaker("Alex Johnson");
          setSpeakerSentiment(65);
          setMeetingDuration("00:43:21");
          setMeetingDurationPercentage(85);
          
          setCurrentMeeting({
            id: logicalMeetingId, // Use logical ID here
            title: "Team Discussion",
            type: "Demo",
            dataset: datasetPath,
            totalParticipants: 12,
            activeParticipants: 9,
            speakingParticipants: 7,
            reactingParticipants: 8
          });
          setMeetingTitle("Team Discussion");
          setMeetingStatus("Analysis Complete");
        }
        
        // Set analysis status based on general analysis endpoint result
        if (analysisStatus && analysisStatus.processed) {
          setAnalysisCompleted(true);
          setMeetingStatus("Analysis Complete");
          
          // If analysis data is available, use it
          if (analysisStatus.analysisData) {
            const analysis = analysisStatus.analysisData;
            
            // Update UI with analysis results
            console.log("Analysis data loaded:", analysis); // Debug log
            
            // Sentiment - For datasets, use the last sentiment value from the timeline
            let sentimentValue = 75; // Default value
            if (analysis.sentiment?.timeline && analysis.sentiment.timeline.length > 0) {
              // Get the last sentiment value from the timeline
              const lastSentiment = analysis.sentiment.timeline[analysis.sentiment.timeline.length - 1];
              sentimentValue = Math.round(lastSentiment.sentiment * 100);
            } else if (typeof analysis.sentiment?.overall === 'number') {
              sentimentValue = Math.round(analysis.sentiment.overall * 100);
            } else if (typeof analysis.overallSentiment === 'number') {
              sentimentValue = Math.round(analysis.overallSentiment * 100);
            }
            setCurrentSentiment(sentimentValue);
            
            // Engagement - For datasets, calculate based on active vs total participants
            const totalParticipants = analysis.participants?.totalParticipants || 
                                      analysis.totalParticipants || 0;
            const activeParticipants = analysis.participants?.activeParticipants || 
                                       analysis.activeParticipants || 0;
            
            const engagementRate = totalParticipants > 0 
              ? Math.round((activeParticipants / totalParticipants) * 100)
              : 65;
            setCurrentEngagement(engagementRate);
            
            // Speaker - For datasets, use the last speaker (or speaker with most recent contribution)
            // For our implementation, we'll use the last speaker in the speakers array
            if (analysis.speakers && analysis.speakers.length > 0) {
              // Get the last speaker in the array (assuming speakers are in order of appearance)
              const lastSpeaker = analysis.speakers[analysis.speakers.length - 1];
              setCurrentSpeaker(lastSpeaker.name);
              
              // Calculate sentiment value for this speaker
              let speakerSentimentValue = 75; // Default value
              if (typeof lastSpeaker.sentiment === 'number') {
                // Check if sentiment is in [0,1] range or [0,100] range
                speakerSentimentValue = lastSpeaker.sentiment <= 1 
                  ? Math.round(lastSpeaker.sentiment * 100)
                  : Math.round(lastSpeaker.sentiment);
              }
              setSpeakerSentiment(speakerSentimentValue);
            } else {
              setCurrentSpeaker("No speakers detected");
              setSpeakerSentiment(75);
            }
            
            // Duration
            const durationSecs = analysis.duration || 0;
            const hours = Math.floor(durationSecs / 3600);
            const minutes = Math.floor((durationSecs % 3600) / 60);
            const seconds = Math.floor(durationSecs % 60);
            
            setMeetingDuration(
              `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
            
            // Calculate duration percentage based on meeting length
            const meetingLengthInSeconds = 4536; // 1 hour 15 minutes and 36 seconds
            const durationPercentage = Math.min(100, Math.round((durationSecs / meetingLengthInSeconds) * 100));
            setMeetingDurationPercentage(durationPercentage);
            
            // Set reaction data - ensure the structure matches what the ReactionAnalysis component expects
            if (analysis.reactions) {
              console.log("Reaction data:", analysis.reactions); // Debug log
              
              if (analysis.reactions.reactions && Array.isArray(analysis.reactions.reactions)) {
                setReactionData(analysis.reactions.reactions);
              } else {
                setReactionData([]); // Set empty array if no reactions data
              }
              
              if (analysis.reactions.speakerReactions && typeof analysis.reactions.speakerReactions === 'object') {
                setSpeakerReactionData(analysis.reactions.speakerReactions);
              } else {
                setSpeakerReactionData({}); // Set empty object if no speaker reactions data
              }
            }
          }
          
          toast.success("Dataset loaded with existing analysis");
        } else {
          // No existing analysis - run analysis immediately (using logical ID)
          setMeetingStatus("Analyzing...");
          setTimeout(() => {
            // handleRunAnalysis will use currentMeeting.id (which is the logical ID)
            handleRunAnalysis(); 
          }, 100);
        }
      } else {
        // For live meetings (Zoom/Teams)
        // Reset directory ID for live meetings as static chart isn't applicable
        setCurrentMeetingDirectoryId(null); 
        setCurrentMeeting({
          id: "live-meeting-1",
          title: "Weekly All-Hands Meeting",
          type: platform,
          link: connectionData.link,
          totalParticipants: 14,
          activeParticipants: 11,
          speakingParticipants: 8,
          reactingParticipants: 10
        });
        
        setMeetingStatus("In Progress");
        setAnalysisCompleted(false);
        toast.success(`Connected to ${platform} meeting`);
      }
    } catch (error) {
      console.error("Error in handleConnectOrAnalyze:", error);
      toast.error("Failed to load meeting data");
      setCurrentMeetingDirectoryId(null); // Reset on error
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Handle running analysis on a meeting
  const handleRunAnalysis = async () => {
    // This function uses currentMeeting.id (the logical ID) to call the general /analyze POST endpoint
    // It updates the main state variables including reactionData/speakerReactionData
    // It does NOT need to interact with the static chart or its directory ID.
    
    if (!currentMeeting?.id) {
      toast.error("No meeting selected for analysis.");
      return;
    }
    
    setIsAnalyzing(true);
    setMeetingStatus("Analyzing..."); // Set status to analyzing
    setAnalysisCompleted(false); // Reset completion status
    
    // Clear previous potentially stale data while analysis runs
    setCurrentSentiment(0)
    setCurrentEngagement(0)
    setCurrentSpeaker("")
    setSpeakerSentiment(0)
    setMeetingDuration("00:00")
    setMeetingDurationPercentage(0)
    setReactionData([]);
    setSpeakerReactionData({});
    // TODO: Consider clearing data for other analysis components like topics, detailed sentiment charts etc.

    try {
      // Make a request to our API route to invoke the analysis pipeline
      const response = await fetch(`/api/meetings/${currentMeeting.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the specific dataset path to the backend
        body: JSON.stringify({
          datasetPath: currentMeeting.dataset 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process meeting');
      }
      
      // Get the analysis data from the response
      const data = await response.json();
      
      if (!data.success || !data.analysis) {
        throw new Error('No analysis data returned from API');
      }
      
      const analysis = data.analysis;
      
      // Update UI with analysis results
      console.log("Analysis data received after POST:", analysis); // Debug log
      
      // --- Update ALL relevant states based on the new analysis data --- 
      
      // Sentiment
      let sentimentValue = 75; // Default value
      if (analysis.sentiment?.timeline && analysis.sentiment.timeline.length > 0) {
        const lastSentiment = analysis.sentiment.timeline[analysis.sentiment.timeline.length - 1];
        sentimentValue = Math.round(lastSentiment.sentiment * 100);
      } else if (typeof analysis.sentiment?.overall === 'number') {
        sentimentValue = Math.round(analysis.sentiment.overall * 100);
      } else if (typeof analysis.overallSentiment === 'number') {
        sentimentValue = Math.round(analysis.overallSentiment * 100);
      }
      setCurrentSentiment(sentimentValue);
      
      // Engagement
      const totalParticipants = analysis.participants?.totalParticipants || 
                                analysis.totalParticipants || currentMeeting?.totalParticipants || 0;
      const activeParticipants = analysis.participants?.activeParticipants || 
                                 analysis.activeParticipants || currentMeeting?.activeParticipants || 0;
      const engagementRate = totalParticipants > 0 
        ? Math.round((activeParticipants / totalParticipants) * 100)
        : 65;
      setCurrentEngagement(engagementRate);
      
      // Speaker
      if (analysis.speakers && analysis.speakers.length > 0) {
        const lastSpeaker = analysis.speakers[analysis.speakers.length - 1];
        setCurrentSpeaker(lastSpeaker.name);
        let speakerSentimentValue = 75; // Default value
        if (typeof lastSpeaker.sentiment === 'number') {
          speakerSentimentValue = lastSpeaker.sentiment <= 1 
            ? Math.round(lastSpeaker.sentiment * 100)
            : Math.round(lastSpeaker.sentiment);
        }
        setSpeakerSentiment(speakerSentimentValue);
      } else {
        setCurrentSpeaker("No speakers detected");
        setSpeakerSentiment(75);
      }
      
      // Duration
      const durationSecs = analysis.duration || 0;
      const hours = Math.floor(durationSecs / 3600);
      const minutes = Math.floor((durationSecs % 3600) / 60);
      const seconds = Math.floor(durationSecs % 60);
      setMeetingDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      
      // Update meeting duration percentage (use a reasonable estimate if total length isn't known)
      // Example: assume a standard meeting length if not provided by analysis
      const estimatedTotalMeetingLength = analysis.totalDuration || 3600; // Default to 1 hour
      const durationPercentage = Math.min(100, Math.round((durationSecs / estimatedTotalMeetingLength) * 100));
      setMeetingDurationPercentage(durationPercentage);

      // --- ADDED: Update Reaction Data --- 
      if (analysis.reactions) {
        console.log("Setting Reaction data from POST analysis:", analysis.reactions); // Debug log
        if (analysis.reactions.reactions && Array.isArray(analysis.reactions.reactions)) {
          setReactionData(analysis.reactions.reactions);
        } else {
          setReactionData([]); 
        }
        if (analysis.reactions.speakerReactions && typeof analysis.reactions.speakerReactions === 'object') {
          setSpeakerReactionData(analysis.reactions.speakerReactions);
        } else {
          setSpeakerReactionData({}); 
        }
      } else {
         console.log("No reaction data found in POST analysis results.");
         setReactionData([]); 
         setSpeakerReactionData({}); 
      }
      
      // --- TODO: Update other states needed for charts/analysis if necessary ---
      // e.g., set data specifically for LiveTopicAnalysis, MeetingSentimentOverview based on analysis object structure

      // Set status and completion *after* processing results
      setMeetingStatus("Analysis Complete");
      setAnalysisCompleted(true);
      toast.success("Meeting analysis completed successfully!");

    } catch (error) {
      console.error("Error running analysis:", error);
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
      setMeetingStatus("Analysis Failed"); // Update status on error
      setAnalysisCompleted(false); // Ensure completion is false on error
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Handle ending the meeting
  const handleEndMeeting = () => {
    // Set as processing
    setIsAnalyzing(true);
    
    // Simulate saving to Supabase
    setTimeout(() => {
      // Reset meeting state
      setCurrentMeeting(null);
      setIsEndModalOpen(false);
      setMeetingTitle("Weekly All-Hands Meeting");
      setMeetingStatus("Not Connected");
      setIsAnalyzing(false);
      setAnalysisCompleted(false);
      
      // Reset all metric values to zero
      setCurrentSentiment(0);
      setCurrentEngagement(0);
      setCurrentSpeaker("");
      setSpeakerSentiment(0);
      setMeetingDuration("00:00");
      setMeetingDurationPercentage(0);
      setReactionData([]);
      setSpeakerReactionData({});
      
      // Navigate to archive page or show success message
      toast.success("Meeting analysis saved and archived successfully");
      router.push('/meetings');
    }, 1500);
  }

  const closeDataset = () => {
    setCurrentMeeting(null);
    setMeetingStatus("Not Connected");
    setAnalysisCompleted(false);
    // Reset all metric values
    setCurrentSentiment(0);
    setCurrentEngagement(0);
    setCurrentSpeaker("");
    setSpeakerSentiment(0);
    setMeetingDuration("00:00");
    setMeetingDurationPercentage(0);
    setReactionData([]);
    setSpeakerReactionData({});
    setCurrentMeetingDirectoryId(null); // Reset directory ID
  }

  // Update the buttons in the dashboard UI
  const renderActionButtons = () => {
    if (!currentMeeting) {
      return (
        <>
          <Button 
            variant="outline" 
            onClick={() => setIsConnectModalOpen(true)}
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            Connect to Meeting
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </>
      );
    }
    
    if (meetingStatus === "In Progress") {
      return (
        <>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setIsEndModalOpen(true)}
          >
            End Meeting
          </Button>
        </>
      );
    }
    
    // Only two states: analysis completed or analyzing
    if (isAnalyzing) {
      return (
        <Button disabled className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Processing...
        </Button>
      );
    }
    
    // Analysis complete - always show these buttons
    return (
      <>
        <Button 
          variant="secondary"
          onClick={() => router.push(`/meetings/${currentMeeting.id}`)}
        >
          View Full Report
        </Button>
        <Button 
          variant="outline" 
          onClick={closeDataset}
        >
          Close Dataset
        </Button>
      </>
    );
  };

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">PulsePoint</h1>
          <span className="hidden text-sm italic text-muted-foreground md:inline-block">Where data meets emotion</span>
        </div>
        <nav className="ml-auto flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/live-analysis">Live Analysis</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/meetings">Archive</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Open settings menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  General Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>
      <main className="flex-1 p-6">
        <div className="grid gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-1">
              <h1 className="text-2xl font-bold tracking-tight">Current Meeting</h1>
              <p className="text-muted-foreground">{meetingTitle} • {meetingStatus}</p>
            </div>
            <div id="analysis-buttons-container" data-analyzed={analysisCompleted} className="flex items-center gap-2">
              {renderActionButtons()}
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-500/90 to-indigo-600/90 shadow-md dark:from-blue-600 dark:to-indigo-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white">Current Sentiment</CardTitle>
                <div className="rounded-full bg-white/20 p-1.5">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-2xl font-bold text-white">{currentSentiment}%</div>
                <div className="mt-1 flex items-center gap-2">
                  <Progress value={currentSentiment} className="h-2" />
                  <span className="text-xs font-medium text-white">{currentSentiment > 0 ? "+2%" : ""}</span>
                </div>
                <p className="mt-2 text-xs text-white/80">{currentSentiment > 0 ? "from 15 minutes ago" : ""}</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-none bg-gradient-to-br from-cyan-500/90 to-blue-600/90 shadow-md dark:from-cyan-600 dark:to-blue-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white">Current Engagement</CardTitle>
                <div className="rounded-full bg-white/20 p-1.5">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-2xl font-bold text-white">{currentEngagement}%</div>
                <div className="mt-1 flex items-center gap-2">
                  <Progress value={currentEngagement} className="h-2" />
                  <span className="text-xs font-medium text-red-200">{currentEngagement > 0 ? "-3%" : ""}</span>
                </div>
                <p className="mt-2 text-xs text-white/80">{currentEngagement > 0 ? "from 15 minutes ago" : ""}</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-none bg-gradient-to-br from-indigo-500/90 to-purple-600/90 shadow-md dark:from-indigo-600 dark:to-purple-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white">Current Speaker</CardTitle>
                <div className="rounded-full bg-white/20 p-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-white"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-2xl font-bold text-white">{currentSpeaker || "None"}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Progress value={speakerSentiment} className="h-2" />
                  <span className="text-xs font-medium text-white">{speakerSentiment > 0 ? `${speakerSentiment}%` : ""}</span>
                </div>
                <p className="mt-2 text-xs text-white/80">{speakerSentiment > 0 ? "sentiment score" : ""}</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-500/90 to-sky-600/90 shadow-md dark:from-blue-600 dark:to-sky-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white">Meeting Duration</CardTitle>
                <div className="rounded-full bg-white/20 p-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-white"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-2xl font-bold text-white">{meetingDuration}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Progress value={meetingDurationPercentage} className="h-2" />
                  <span className="text-xs font-medium text-white">{meetingDurationPercentage > 0 ? `${meetingDurationPercentage}%` : ""}</span>
                </div>
                <p className="mt-2 text-xs text-white/80">{meetingDurationPercentage > 0 ? "of scheduled time" : ""}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-6">
            <Card className="col-span-6 md:col-span-4 overflow-hidden border-none bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 shadow-md dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-blue-950/40">
              <CardHeader className="border-b border-blue-100/50 dark:border-blue-800/20 pb-3">
                <CardTitle className="text-blue-700 dark:text-blue-300">Live Meeting Sentiment & Engagement</CardTitle>
                <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
                  Real-time sentiment and engagement analysis for the current meeting
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <MeetingSentimentOverview />
              </CardContent>
            </Card>
            <Card className="col-span-6 md:col-span-2 overflow-hidden border-none bg-gradient-to-br from-cyan-50 to-blue-50 shadow-md dark:from-cyan-950/40 dark:to-blue-950/40">
              <CardHeader className="border-b border-cyan-100/50 dark:border-cyan-800/20 pb-3">
                <CardTitle className="text-cyan-700 dark:text-cyan-300">Live Sentiment</CardTitle>
                <CardDescription className="text-cyan-600/70 dark:text-cyan-400/70">
                  Current meeting sentiment
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <LiveSentimentAnalysis isLive={meetingStatus === "In Progress"} />
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-none bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md dark:from-blue-950/40 dark:to-indigo-950/40">
            <CardHeader className="border-b border-blue-100/50 dark:border-blue-800/20 pb-3">
              <CardTitle className="text-blue-700 dark:text-blue-300">Meeting Participation</CardTitle>
              <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
                {meetingTitle} • {new Date().toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <MeetingParticipationStats meeting={currentMeeting} />
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-6">
            <Card className="col-span-6 md:col-span-3 overflow-hidden border-none bg-gradient-to-br from-indigo-50 to-blue-50 shadow-md dark:from-indigo-950/40 dark:to-blue-950/40">
              <CardHeader className="border-b border-indigo-100/50 dark:border-indigo-800/20 pb-3">
                <CardTitle className="text-indigo-700 dark:text-indigo-300">Live Speaker Analysis</CardTitle>
                <CardDescription className="text-indigo-600/70 dark:text-indigo-400/70">
                  Real-time speaker sentiment and engagement
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <LiveSpeakerAnalysis isLive={meetingStatus === "In Progress"} />
              </CardContent>
            </Card>
            <Card className="col-span-6 md:col-span-3 overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md dark:from-blue-950/40 dark:to-indigo-950/40">
              <CardHeader className="border-b border-blue-100/50 dark:border-blue-800/20 pb-3">
                <CardTitle className="text-blue-700 dark:text-blue-300">Live Topic Analysis</CardTitle>
                <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
                  Topics being discussed in the current meeting
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <LiveTopicAnalysis isLive={meetingStatus === "In Progress"} />
              </CardContent>
            </Card>
          </div>
          
          <StaticReactionAnalysisChart meetingDirectoryId={currentMeetingDirectoryId} />
        </div>
      </main>
      
      <ConnectMeetingModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnectOrAnalyze={handleConnectOrAnalyze}
        isProcessing={isAnalyzing}
      />
      
      <MeetingEndModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onEndMeeting={handleEndMeeting}
        isProcessing={isAnalyzing}
        meetingTitle={meetingTitle}
        meetingDate={new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
      />
    </div>
  )
}

