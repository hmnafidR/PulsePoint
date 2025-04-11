"use client"

import Link from "next/link"
import { BarChart3, Download, LinkIcon, MessageSquare, Settings, LogOut, RefreshCw, Upload } from "lucide-react"
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

// Define types for speaker analysis data
interface SpeakerAnalysisDataItem {
  name: string;
  speakingTime: number;
  sentiment: number; // Assuming sentiment is 0-1, will be scaled in component if needed
  // Add other relevant speaker fields if available from API
}

// Define types for topic analysis data
interface TopicAnalysisDataItem {
  name: string;
  percentage: number;
  sentiment: "positive" | "neutral" | "negative";
  duration?: string; // Duration might be calculated or provided
  keywords?: string[];
  // Add other relevant topic fields if available from API
}

interface TopicAnalysisData {
  topics: TopicAnalysisDataItem[];
}

// Interface for Sentiment Timeline Item (ensure this matches usage if imported)
interface SentimentTimelineItem {
    timestamp: number | string; // Or appropriate type based on data
    sentiment: number; // Assuming 0-1
}

// Structure matching the 'analysis' part of the API response from POST /analyze
interface BackendAnalysisData {
    metadata?: { [key: string]: any };
    transcript?: string;
    duration?: number; // seconds
    sentiment?: { overall?: number; timeline?: SentimentTimelineItem[] }; // Simplified from model for UI needs
    speakers?: SpeakerAnalysisDataItem[]; // Using the existing interface
    topics?: TopicAnalysisData; // Using the existing interface
    reactions?: { reactions?: ReactionItem[]; speakerReactions?: SpeakerReactionData }; // Simplified
    participants?: { 
        totalParticipants?: number; 
        activeParticipants?: number; 
        speakingParticipants?: number; 
        reactingParticipants?: number 
    }; 
    summary?: string;
    action_items?: string[];
    insights?: string;
    last_speaker?: string; // Add last speaker field
}

// Structure for the current meeting state
interface CurrentMeetingState {
    id: string; // This will now be the Supabase meeting ID (UUID)
    title: string;
    type: string; // e.g., "Zoom", "Teams", "Dataset"
    fileName?: string; // Original uploaded filename
    // Other fields like link, dataset path can be added if needed
}

// Restore dataset options if needed for mapping, although backend should handle it
// const datasetOptions: DatasetOption[] = [ ... ];

// Define the mapping from Dataset ID (e.g., "zoom-dataset-1") to display info if needed
// This might be fetched from an API later or configured elsewhere
const datasetDisplayInfo: { [key: string]: { title: string } } = {
    "zoom-dataset-1": { title: "Vibecamp Bootcamp Q&A Session" },
    "w3ml-dataset-1": { title: "W3ML Project Discussion" },
    // Add more mappings
};

export default function Dashboard() {
  const [isEndModalOpen, setIsEndModalOpen] = useState(false)
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [currentMeeting, setCurrentMeeting] = useState<CurrentMeetingState | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentSentiment, setCurrentSentiment] = useState(0)
  const [currentEngagement, setCurrentEngagement] = useState(0)
  const [currentSpeaker, setCurrentSpeaker] = useState("")
  const [speakerSentiment, setSpeakerSentiment] = useState(0)
  const [meetingDuration, setMeetingDuration] = useState("00:00")
  const [meetingDurationPercentage, setMeetingDurationPercentage] = useState(0)
  const [meetingTitle, setMeetingTitle] = useState("Meeting Dashboard") // Default title
  const [meetingStatus, setMeetingStatus] = useState("Not Connected")
  const [analysisCompleted, setAnalysisCompleted] = useState(false)
  const [reactionData, setReactionData] = useState<ReactionItem[]>([]);
  const [speakerReactionData, setSpeakerReactionData] = useState<SpeakerReactionData>({});
  const [speakerAnalysisData, setSpeakerAnalysisData] = useState<SpeakerAnalysisDataItem[]>([]);
  const [topicAnalysisData, setTopicAnalysisData] = useState<TopicAnalysisData>({ topics: [] });
  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(0);
  const [pollingMeetingId, setPollingMeetingId] = useState<string | null>(null);
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [sentimentTimelineData, setSentimentTimelineData] = useState<SentimentTimelineItem[]>([]);
  const [insightsText, setInsightsText] = useState<string | null>(null);
  const [meetingSummary, setMeetingSummary] = useState<string>("");
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [participantStats, setParticipantStats] = useState({
      total: 0,
      speaking: 0,
      active: 0,
      reacting: 0
  });
  
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  // Handler for Live Meeting connection (placeholder - implement if needed)
  const handleConnectLive = (platform: string, data: { link: string, id?: string }) => {
      console.log("Connect Live Meeting Triggered:", platform, data);
      toast.info(`Connecting to ${platform} meeting... (Not Implemented)`);
      // TODO: Implement live connection logic (e.g., WebSocket, backend API call)
      // Reset state while attempting connection?
      // resetAnalysisState();
      // setMeetingStatus("Connecting...");
      // setIsAnalyzing(true);
  }

  // Handler for Analyzing a selected Dataset ID
  const handleAnalyzeDatasetRequest = async (datasetId: string) => {
      console.log(`Analyze Dataset Request Triggered: ${datasetId}`);
      resetAnalysisState();
      setIsAnalyzing(true);
      setMeetingStatus("Triggering Analysis...");
      setMeetingTitle(datasetDisplayInfo[datasetId]?.title || `Analyzing ${datasetId}`); 
      if (pollingIntervalId) clearInterval(pollingIntervalId);
      setPollingMeetingId(null);

      try {
          // Call the FRONTEND API route to trigger analysis
          // The frontend route will then call the backend
          const frontendApiUrl = `/api/meetings/${datasetId}/analyze`;
          console.log("Calling frontend API POST route:", frontendApiUrl); 
          
          const response = await fetch(frontendApiUrl, {
              method: "POST",
              // Body might be needed if frontend POST expects it, even if empty
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({}) // Send empty body or required data
          });

          const result = await response.json();

          if (!response.ok) {
             let errorDetail = result.error || "Failed to trigger analysis.";
             if (result.details) errorDetail += `: ${result.details}`;
             throw new Error(errorDetail);
          }
          
          console.log(`Analysis triggered for meeting ID: ${datasetId}. Backend response:`, result);
          toast.info(result.message || "Analysis started. Results will appear when ready.");
          
          // Update status and set polling ID (use datasetId as the ID to poll)
          setMeetingStatus("Processing Analysis...");
          setPollingMeetingId(datasetId); // Trigger polling for the *logical* ID
          
          // Set current meeting basic info while processing
          setCurrentMeeting({ 
              id: datasetId, // Use logical ID for now, update later if needed
              title: datasetDisplayInfo[datasetId]?.title || datasetId, 
              type: "Dataset"
          });

      } catch (error) {
          console.error("Error triggering dataset analysis:", error);
          toast.error(`Analysis trigger failed: ${error instanceof Error ? error.message : String(error)}`);
          resetAnalysisState(); 
      } 
  }

  // --- Modified: Helper function to update UI states --- 
  // Note: Pass meetingId explicitly if needed, as analysis object might not have it
  const updateUIMetrics = async (logicalMeetingId: string, analysis: BackendAnalysisData) => {
      console.log("[updateUIMetrics] Updating UI with analysis data for ID:", logicalMeetingId, analysis);
      // Sentiment
      const sentimentValue = analysis.sentiment?.overall !== undefined 
          ? Math.round(analysis.sentiment.overall * 100) 
          : 0; // Default if missing
      setCurrentSentiment(sentimentValue);
      
      // Engagement Score - Calculate average from timeline if available
      let engagementScore = 0;
      try {
        if (analysis.sentiment?.timeline && analysis.sentiment.timeline.length > 0) {
          console.log(`Attempting to fetch timeline for ${logicalMeetingId}`);
          // Calculate average engagement from timeline data
          const timelineData = await fetch(`/analysis-data/${logicalMeetingId}/timeline-${logicalMeetingId}.json`)
            .then(res => {
              if (!res.ok) {
                console.warn(`Timeline fetch failed with status: ${res.status}`);
                return null;
              }
              return res.json();
            })
            .catch(err => {
              console.error(`Error fetching timeline: ${err.message}`);
              return null;
            });
          
          if (timelineData && timelineData.timeline && timelineData.timeline.length > 0) {
            // Calculate average engagement from all timeline points
            const sum = timelineData.timeline.reduce((acc: number, point: any) => 
              acc + (point.engagement || 0), 0);
            engagementScore = Math.round((sum / timelineData.timeline.length) * 100);
            console.log(`Calculated average engagement from timeline (${timelineData.timeline.length} points): ${engagementScore}%`);
          } else {
            console.log(`No timeline data available, falling back to metadata engagement score`);
            // Fall back to metadata engagement score if timeline isn't available
            engagementScore = analysis.metadata?.engagement_score !== undefined
              ? Math.round(analysis.metadata.engagement_score)
              : 0;
          }
        } else {
          console.log(`No timeline in analysis data, falling back to metadata engagement score`);
          // Fall back to metadata engagement score if timeline isn't available
          engagementScore = analysis.metadata?.engagement_score !== undefined
            ? Math.round(analysis.metadata.engagement_score)
            : 0;
        }
      } catch (error) {
        console.error(`Error calculating engagement score: ${error}`);
        // Fall back to metadata engagement score on error
        engagementScore = analysis.metadata?.engagement_score !== undefined
          ? Math.round(analysis.metadata.engagement_score)
          : 0;
      }
      console.log(`Final engagement score: ${engagementScore}%`);
      setCurrentEngagement(engagementScore); 
      
      // Last Speaker
      setCurrentSpeaker(analysis.last_speaker || ""); 
      const lastSpeakerObject = analysis.speakers?.find(s => s.name === analysis.last_speaker);
      const lastSpeakerSentiment = lastSpeakerObject?.sentiment !== undefined
          ? Math.round(lastSpeakerObject.sentiment * 100)
          : 0;
      setSpeakerSentiment(lastSpeakerSentiment);
      
      // Duration
      const durationSecs = analysis.duration || 0;
      const hours = Math.floor(durationSecs / 3600);
      const minutes = Math.floor((durationSecs % 3600) / 60);
      const seconds = Math.floor(durationSecs % 60);
      setMeetingDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      setTotalDurationSeconds(durationSecs); 
      setMeetingDurationPercentage(100); // Placeholder
      
      // --- Update Data for Child Components --- 
      setReactionData(analysis.reactions?.reactions || []);
      setSpeakerReactionData(analysis.reactions?.speakerReactions || {});
      setSpeakerAnalysisData(analysis.speakers || []);
      setTopicAnalysisData(analysis.topics || { topics: [] });
      setSentimentTimelineData(analysis.sentiment?.timeline || []);
      setInsightsText(analysis.insights || null);
      
      // Set summary and action items
      setMeetingSummary(analysis.summary || "");
      setActionItems(analysis.action_items || []);
      
      // Update meeting title shown on dashboard
      // Use logicalMeetingId passed to the function
      const titleToSet = currentMeeting?.title || analysis.metadata?.source_file || logicalMeetingId || "Analyzed Meeting";
      setMeetingTitle(titleToSet);
      
      // Log the participant data received before setting state
      console.log("[updateUIMetrics] Participant data from analysis:", analysis.participants);
      
      // Set participant stats directly from the analysis.participants object
      setParticipantStats({
          total: analysis.participants?.totalParticipants ?? 0,
          speaking: analysis.participants?.speakingParticipants ?? 0,
          active: analysis.participants?.activeParticipants ?? 0, 
          reacting: analysis.participants?.reactingParticipants ?? 0
      });

      console.log("[updateUIMetrics] UI states updated.");
  }
  
  // Helper function to reset analysis state
  const resetAnalysisState = () => {
      setCurrentMeeting(null);
      setMeetingStatus("Not Connected");
      setAnalysisCompleted(false);
      setMeetingTitle("Meeting Dashboard"); // Reset title
      // Reset metrics
      setCurrentSentiment(0);
      setCurrentEngagement(0);
      setCurrentSpeaker("");
      setSpeakerSentiment(0);
      setMeetingDuration("00:00");
      setMeetingDurationPercentage(0);
      setTotalDurationSeconds(0);
      // Reset data for children
      setReactionData([]);
      setSpeakerReactionData({});
      setSpeakerAnalysisData([]);
      setTopicAnalysisData({ topics: [] });
      // REMOVE: Resetting removed state
      // setCurrentMeetingDirectoryId(null); 
      setIsAnalyzing(false);
      setSentimentTimelineData([]);
      setInsightsText(null);
      setMeetingSummary("");
      setActionItems([]);
      // Reset participant stats
      setParticipantStats({ total: 0, speaking: 0, active: 0, reacting: 0 });
      // Clear polling state
      if (pollingIntervalId) clearInterval(pollingIntervalId);
      setPollingMeetingId(null);
      setPollingIntervalId(null);
  }

  // Handle ending the meeting / closing the analysis view
  const handleEndMeetingOrClose = () => {
    // If it was a live meeting (not currently implemented fully with backend)
    // you might have different logic (e.g., saving final state).
    // For analyzed files, just reset the view.
    setIsAnalyzing(true); // Show temp processing state
    setTimeout(() => {
        resetAnalysisState();
        toast.success("Analysis closed.");
        // Optional: Navigate away? router.push('/meetings');
        setIsEndModalOpen(false); // Close modal if open
        setIsAnalyzing(false);
    }, 500); // Short delay for visual feedback
  }

  // --- PDF Download Handler ---
  const handleDownloadPdf = async (version?: number) => {
    if (!currentMeeting?.id) {
      toast.error("No meeting analysis is loaded to download.");
      return;
    }

    const meetingId = currentMeeting.id;
    
    try {
      toast.info(`Generating PDF report${version ? ` (version ${version})` : ''}...`);
      
      // Import PDF renderer dynamically
      const { pdf } = await import('@react-pdf/renderer');
      // Import the MeetingPDF component dynamically
      const MeetingPDFModule = await import('@/components/pdf/MeetingPDF');
      const MeetingPDF = MeetingPDFModule.default;
      
      // Format date for the PDF
      const formattedDate = format(new Date(), 'PPP');
      
      // Create the PDF document with our data
      const document = (
        <MeetingPDF
          meetingId={meetingId}
          meetingTitle={meetingTitle}
          recordedOn={formattedDate}
          summary={meetingSummary}
          sentimentOverall={currentSentiment}
          engagementScore={currentEngagement}
          currentSpeaker={currentSpeaker}
          speakerSentiment={speakerSentiment}
          meetingDuration={meetingDuration}
          sentimentTimeline={sentimentTimelineData}
          speakerAnalysis={speakerAnalysisData}
          topicAnalysis={topicAnalysisData.topics}
          participantStats={participantStats}
          actionItems={actionItems}
          reactions={reactionData}
          insights={insightsText || ''}
        />
      );
      
      // Use a simpler approach with jsPDF as fallback if react-pdf fails
      try {
        // Try react-pdf first
        const blob = await pdf(document).toBlob();
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Create a download link and trigger it
        const link = window.document.createElement('a');
        link.href = url;
        const filename = `meeting_${meetingId}_analysis${version ? `_v${version}` : ''}.pdf`;
        link.download = filename;
        link.click();
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        toast.success(`PDF report${version ? ` (version ${version})` : ''} downloaded.`);
      } catch (pdfError) {
        // If react-pdf fails, fall back to jsPDF
        console.error("Error with @react-pdf/renderer, falling back to jsPDF:", pdfError);
        toast.warning("Having trouble with advanced PDF generation, using simplified version...");
        
        // Import jsPDF as fallback
        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.default;
        const autoTable = (await import('jspdf-autotable')).default;
        
        // Create a simpler PDF with jsPDF
        const pdf = new jsPDF();
        
        // Set metadata
        pdf.setProperties({
          title: `Meeting Analysis: ${meetingTitle}`,
          subject: 'Meeting Analysis Report',
          creator: 'PulsePoint Analytics'
        });
        
        // Add basic content
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text(`Meeting Analysis: ${meetingTitle}`, 15, 20);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.text(`Generated on ${formattedDate}`, 15, 30);
        
        // Add metrics table
        autoTable(pdf, {
          startY: 40,
          head: [["Metric", "Value"]],
          body: [
            ["Overall Sentiment", `${currentSentiment}%`],
            ["Average Engagement", `${currentEngagement}%`],
            ["Current Speaker", currentSpeaker || "None"],
            ["Meeting Duration", meetingDuration]
          ]
        });
        
        // Add participation table
        let yPosition = 100; // Default position if lastAutoTable is not available
        if ((pdf as any).lastAutoTable && (pdf as any).lastAutoTable.finalY) {
          yPosition = (pdf as any).lastAutoTable.finalY + 20;
        }

        autoTable(pdf, {
          startY: yPosition,
          head: [["Participants", "Speaking", "Active", "Reacting"]],
          body: [[
            participantStats.total,
            participantStats.speaking,
            participantStats.active,
            participantStats.reacting
          ]]
        });
        
        // Save the PDF
        const filename = `meeting_${meetingId}_analysis${version ? `_v${version}` : ''}.pdf`;
        pdf.save(filename);
        
        toast.success(`Basic PDF report${version ? ` (version ${version})` : ''} downloaded.`);
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error(`PDF download failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Update the buttons in the dashboard UI
  const renderActionButtons = () => {
    if (!currentMeeting) {
      return (
        <>
          {/* Button to open the connection/dataset modal */}
          <Button 
            variant="outline" 
            onClick={() => setIsConnectModalOpen(true)}
          >
            {/* Keep Link icon or change? Let's use LinkIcon for connecting concept */}
            <LinkIcon className="mr-2 h-4 w-4" />
            Connect / Analyze Dataset
          </Button>
        </>
      );
    }
    
    // If currently analyzing
    if (isAnalyzing) {
      return (
        <Button disabled className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          {meetingStatus}...
        </Button>
      );
    }
    
    // Analysis complete
    if (analysisCompleted) {
    return (
      <>
        {/* Single Download PDF Button */}
        <Button 
          variant="outline"
          onClick={() => handleDownloadPdf()} 
          disabled={!currentMeeting?.id} 
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        {/* Close Button */}
        <Button 
          variant="outline" 
          onClick={handleEndMeetingOrClose} 
        >
          Close Analysis
        </Button>
      </>
    );
    }
    
    return null; // Default case
  };

  // --- Modified: Polling Logic --- 
  useEffect(() => {
    console.log("[Polling Effect] Running effect. pollingMeetingId:", pollingMeetingId);
    if (!pollingMeetingId) {
      if (pollingIntervalId) {
        console.log("[Polling Effect] Clearing existing interval due to null pollingMeetingId.");
        clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
      }
      return;
    }

    // Function to poll the FRONTEND GET route
    const pollForResult = async () => {
      const logicalMeetingId = pollingMeetingId; // Use the ID we are polling
      console.log(`[pollForResult] Polling frontend GET route for: ${logicalMeetingId}`); 
      try {
          // Poll the frontend API GET route
          const response = await fetch(`/api/meetings/${logicalMeetingId}/analyze`);
          console.log("[pollForResult] Fetch response status:", response.status);
          
          if (!response.ok) {
              // Handle errors from the GET route itself
              let errorDetail = `Polling failed with status: ${response.status}`;
              try {
                  const errorData = await response.json();
                  errorDetail = errorData.error || errorDetail;
                  if(errorData.details) errorDetail += `: ${errorData.details}`;
              } catch(e) {} 
              throw new Error(errorDetail);
          }

          const result = await response.json();
          console.log("[pollForResult] Received result from GET route:", result);

          if (result.success && result.processed && result.analysis) {
              console.log("Polling complete, analysis successful:", result);
              toast.success("Analysis completed successfully!");
              
              setCurrentMeeting(prev => ({
                  ...(prev || { title: result.analysis.meetingTitle || logicalMeetingId, type: 'Dataset' }),
                  // Use logicalMeetingId here as the primary ID reference during polling
                  id: logicalMeetingId 
              }));
              
              // Pass logicalMeetingId to updateUIMetrics
              await updateUIMetrics(logicalMeetingId, result.analysis as BackendAnalysisData);
              setAnalysisCompleted(true);
              setMeetingStatus("Analysis Complete");
              setIsAnalyzing(false); 
              
              // Stop polling
              if (pollingIntervalId) clearInterval(pollingIntervalId);
              setPollingMeetingId(null); 
              setPollingIntervalId(null);

          } else if (result.success && !result.processed) {
              console.log("Analysis still processing (file not found yet)...");
              setMeetingStatus(`Processing Analysis... (${(Math.random()*100).toFixed(0)}%)`); // Optional fake progress
              // Continue polling
          } else {
              // Handle unexpected success=false or other scenarios from GET route
              console.error("Polling received unexpected response:", result);
              throw new Error(result.error || "Unexpected polling response");
          }
      } catch (error) {
          console.error("Error during polling:", error);
          toast.error(`Polling error: ${error instanceof Error ? error.message : 'Network error'}`);
          // Stop polling on error
          if (pollingIntervalId) clearInterval(pollingIntervalId);
          setPollingMeetingId(null);
          setPollingIntervalId(null);
          resetAnalysisState(); // Reset UI on polling error
          setMeetingStatus("Polling Error");
          setIsAnalyzing(false);
      }
  };

    // Clear previous interval just in case before starting a new one
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
    }

    console.log("[Polling Effect] Setting up polling interval for:", pollingMeetingId);
    // Initial poll immediately, then set interval
    pollForResult(); 
    const intervalId = setInterval(pollForResult, 5000); // Poll every 5 seconds
    setPollingIntervalId(intervalId);

    // Cleanup function
    return () => {
        if (intervalId) {
            clearInterval(intervalId);
            setPollingIntervalId(null);
        }
    };

  }, [pollingMeetingId]); // Rerun only when pollingMeetingId changes

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
        {/* Top Row: Meeting Title & Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 dashboard-header">
          <div className="grid gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Current Meeting</h1>
            <p className="text-muted-foreground">{meetingTitle} • {meetingStatus}</p>
          </div>
          <div id="analysis-buttons-container" data-analyzed={analysisCompleted} className="flex items-center gap-2">
            {renderActionButtons()}
          </div>
        </div>

        {/* Top 4 Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 metrics-cards-container">
          {/* Overall Sentiment Card */}
          <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-500/90 to-indigo-600/90 shadow-md dark:from-blue-600 dark:to-indigo-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Overall Sentiment</CardTitle>
              <div className="rounded-full bg-white/20 p-1.5"><BarChart3 className="h-4 w-4 text-white" /></div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-white">{currentSentiment}%</div>
              <div className="mt-1 flex items-center gap-2"><Progress value={currentSentiment} className="h-2" /></div>
            </CardContent>
          </Card>
          {/* Average Engagement Card */}
          <Card className="overflow-hidden border-none bg-gradient-to-br from-cyan-500/90 to-blue-600/90 shadow-md dark:from-cyan-600 dark:to-blue-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Average Engagement</CardTitle>
              <div className="rounded-full bg-white/20 p-1.5"><MessageSquare className="h-4 w-4 text-white" /></div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-white">{currentEngagement}%</div>
              <div className="mt-1 flex items-center gap-2"><Progress value={currentEngagement} className="h-2" /></div>
            </CardContent>
          </Card>
          {/* Current Speaker Card */}
          <Card className="overflow-hidden border-none bg-gradient-to-br from-indigo-500/90 to-purple-600/90 shadow-md dark:from-indigo-600 dark:to-purple-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Current Speaker</CardTitle>
              <div className="rounded-full bg-white/20 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-white">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-white truncate" title={currentSpeaker || "None"}>{currentSpeaker || "None"}</div>
              <div className="mt-1 flex items-center gap-2">
                <Progress value={speakerSentiment} className="h-2" />
                <span className="text-xs font-medium text-white">{speakerSentiment > 0 ? `${speakerSentiment}%` : ""}</span>
              </div>
              <p className="mt-2 text-xs text-white/80">{speakerSentiment > 0 ? "sentiment score" : ""}</p>
            </CardContent>
          </Card>
          {/* Meeting Duration Card */}
          <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-500/90 to-sky-600/90 shadow-md dark:from-blue-600 dark:to-sky-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Meeting Duration</CardTitle>
              <div className="rounded-full bg-white/20 p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-white">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-white">{meetingDuration}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analysis Cards Grid - Restore structure closer to original */}
        <div className="grid gap-6 md:grid-cols-5 lg:grid-cols-6 mb-6"> 
           {/* Sentiment Overview Card (Takes more space) */}
           <Card className="col-span-6 md:col-span-3 lg:col-span-4 overflow-hidden border-none bg-gradient-to-r from-green-50 via-teal-50 to-green-50 shadow-md dark:from-green-950/40 dark:via-teal-950/40 dark:to-green-950/40 sentiment-overview-container">
             <CardHeader className="border-b border-green-100/50 dark:border-green-800/20 pb-3">
               <CardTitle className="text-green-700 dark:text-green-300">Meeting Sentiment Overview</CardTitle>
               <CardDescription className="text-green-600/70 dark:text-green-400/70">
                 Sentiment trend over time.
               </CardDescription>
             </CardHeader>
             <CardContent className="pt-6">
               {/* Ensure props match MeetingSentimentOverview */}
               <MeetingSentimentOverview data={sentimentTimelineData.length > 0 ? { timeline: sentimentTimelineData } : undefined} /> 
             </CardContent>
           </Card>
           {/* Participation Stats Card (Takes less space) */}
           <Card className="col-span-6 md:col-span-2 lg:col-span-2 overflow-hidden border-none bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 shadow-md dark:from-yellow-950/40 dark:via-amber-950/40 dark:to-yellow-950/40 participation-container">
             <CardHeader className="border-b border-yellow-100/50 dark:border-yellow-800/20 pb-3">
               <CardTitle className="text-yellow-700 dark:text-yellow-300">Meeting Participation</CardTitle>
               <CardDescription className="text-yellow-600/70 dark:text-yellow-400/70">
                 Participation breakdown.
               </CardDescription>
             </CardHeader>
             <CardContent className="pt-6">
               {/* Ensure props match MeetingParticipationStats */}
               <MeetingParticipationStats 
                  totalParticipants={participantStats.total}
                  activeParticipants={participantStats.active} 
                  reactingParticipants={participantStats.reacting}
                  speakingParticipants={participantStats.speaking} 
               />
             </CardContent>
           </Card>
        </div>

        {/* Fifth Row: Speaker Analysis and Topic Analysis */}
        <div className="grid gap-6 md:grid-cols-6 mb-6">
           {/* Speaker Analysis Card */}
           <Card className="col-span-6 md:col-span-3 overflow-hidden border-none bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 shadow-md dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 speaker-analysis-container">
             <CardHeader className="border-b border-blue-100/50 dark:border-blue-800/20 pb-3">
               <CardTitle className="text-blue-700 dark:text-blue-300">Speaker Analysis</CardTitle>
               <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
                 Speaking time and sentiment per participant.
               </CardDescription>
             </CardHeader>
             <CardContent className="pt-6">
               {/* Use correct 'speakersData' prop */}
               <LiveSpeakerAnalysis isLive={false} speakersData={speakerAnalysisData} />
             </CardContent>
           </Card>
           {/* AI Topic Analysis Card */}
           <Card className="col-span-6 md:col-span-3 overflow-hidden border-none bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 shadow-md dark:from-purple-950/40 dark:via-pink-950/40 dark:to-purple-950/40 topic-analysis-container">
             <CardHeader className="border-b border-purple-100/50 dark:border-purple-800/20 pb-3">
               <CardTitle className="text-purple-700 dark:text-purple-300">AI-Powered Topic Analysis</CardTitle>
               <CardDescription className="text-purple-600/70 dark:text-purple-400/70">
                 Key discussion themes and AI insights.
               </CardDescription>
             </CardHeader>
             <CardContent className="pt-6">
               {/* Use correct 'data' prop for topics object and pass insights */}
               <LiveTopicAnalysis 
                 data={topicAnalysisData} 
                 insightsText={insightsText}
                 totalDurationSeconds={totalDurationSeconds} 
                 isLive={false} 
                 actionItems={actionItems}
                 summary={meetingSummary}
               />
             </CardContent>
           </Card>
        </div>

        {/* Reaction Analysis Chart Card (Full width) */}
        {/* Only render if analysis is complete and data exists */}
        {analysisCompleted && reactionData.length > 0 && (
          <Card className="mb-6 overflow-hidden border-none bg-gradient-to-br from-green-50 to-teal-50 shadow-md dark:from-green-950/40 dark:to-teal-950/40 reaction-analysis-container">
            <CardHeader className="border-b border-green-100/50 dark:border-green-800/20 pb-3">
              <CardTitle className="text-green-700 dark:text-green-300">Meeting Reaction Analysis</CardTitle> 
              <CardDescription className="text-green-600/70 dark:text-green-400/70">Reaction counts during the meeting.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Check ReactionAnalysis props */}
              <ReactionAnalysis 
                  reactions={reactionData} 
                  speakerReactions={speakerReactionData} 
                  isLoading={!analysisCompleted} 
              />
            </CardContent>
          </Card>
        )}

        {/* Removed AI Insights Card as content is now in Topic Analysis */}

        {/* Modals remain outside the main grid */}
        <ConnectMeetingModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
            onConnectLive={handleConnectLive} 
            onAnalyzeDataset={handleAnalyzeDatasetRequest} 
          isProcessing={isAnalyzing}
        />
        <MeetingEndModal
          isOpen={isEndModalOpen}
          onClose={() => setIsEndModalOpen(false)}
            onConfirm={handleEndMeetingOrClose} 
            meetingTitle={currentMeeting?.title || "Meeting"} 
        />
      </main>
    </div>
  )
}

