"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface DatasetOption {
  label: string;
  value: string;
  description: string;
  path: string;
}

const datasetOptions: DatasetOption[] = [
  {
    label: "Zoom Meeting: Bootcamp Q&A Session",
    value: "zoom-bootcamp",
    description: "A Q&A session about an upcoming bootcamp with hosts and participants discussing logistics and expectations.",
    path: "data/meeting_recordings/zoom"
  },
  {
    label: "Zoom W3ML Meeting: Project Discussion",
    value: "zoom-w3ml",
    description: "A project discussion about AI tools and implementations with participants sharing techniques and resources.",
    path: "data/meeting_recordings/ZoomW3ML"
  },
  {
    label: "Teams Meeting: Product Demo",
    value: "teams-demo",
    description: "A product demonstration meeting with team members discussing features and gathering feedback.",
    path: "data/meeting_recordings/teams"
  }
];

interface ConnectMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  onConnectOrAnalyze: (platform: string, connectionData: any) => void
  isProcessing?: boolean
}

export function ConnectMeetingModal({
  isOpen,
  onClose,
  onConnectOrAnalyze,
  isProcessing = false
}: ConnectMeetingModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("zoom")
  const [meetingLink, setMeetingLink] = useState<string>("")
  const [meetingId, setMeetingId] = useState<string>("")
  const [selectedDataset, setSelectedDataset] = useState<string>(datasetOptions[0].value)
  const [currentTab, setCurrentTab] = useState("live")

  const handleConnectLiveMeeting = () => {
    if (!selectedPlatform) {
      return;
    }
    
    onConnectOrAnalyze(selectedPlatform, {
      link: meetingLink,
      id: meetingId
    });
    
    onClose();
  }

  const handleSelectDataset = () => {
    if (!selectedDataset) {
      return;
    }
    
    const dataset = datasetOptions.find(option => option.value === selectedDataset);
    
    if (dataset) {
      onConnectOrAnalyze("dataset", {
        datasetType: dataset.value,
        datasetPath: dataset.path
      });
    }
    
    onClose();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form based on selected platform
    if (selectedPlatform === '') {
      toast.error('Please select a platform');
      return;
    }
    
    if (selectedPlatform === 'dataset') {
      if (!selectedDataset) {
        toast.error('Please select a dataset');
        return;
      }
      
      // For datasets, call connect function immediately with dataset info
      onConnectOrAnalyze(selectedPlatform, {
        datasetPath: selectedDataset,
        analysisCompleted: true
      });
      
      onClose();
      return;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[485px]">
        <DialogHeader>
          <DialogTitle>Connect to Meeting</DialogTitle>
          <DialogDescription>
            Connect to a live meeting or analyze a pre-recorded dataset.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live">Live Meeting</TabsTrigger>
            <TabsTrigger value="dataset">Dataset</TabsTrigger>
          </TabsList>
          
          <TabsContent value="live" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={selectedPlatform}
                  onValueChange={setSelectedPlatform}
                >
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="gmeet">Google Meet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meeting-link">Meeting Link</Label>
                <Input
                  id="meeting-link"
                  placeholder="https://zoom.us/j/123456789"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meeting-id">Meeting ID (optional)</Label>
                <Input
                  id="meeting-id"
                  placeholder="123 456 789"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dataset" className="mt-4 space-y-4">
            <div className="space-y-4">
              <Label>Select a dataset to analyze</Label>
              <RadioGroup
                value={selectedDataset}
                onValueChange={setSelectedDataset}
                className="space-y-3"
              >
                {datasetOptions.map((dataset) => (
                  <Card key={dataset.value} className={`border ${selectedDataset === dataset.value ? 'border-primary' : 'border-input'}`}>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value={dataset.value} id={dataset.value} className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor={dataset.value} className="text-base font-medium cursor-pointer">
                            {dataset.label}
                          </Label>
                          <CardDescription>{dataset.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={currentTab === "live" ? handleConnectLiveMeeting : handleSelectDataset}
            disabled={isProcessing || (currentTab === "live" && !meetingLink)}
          >
            {isProcessing 
              ? "Processing..." 
              : currentTab === "live" 
                ? "Connect" 
                : "Analyze Dataset"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

