"use client"

import { useState, useEffect } from "react"
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
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface DatasetOption {
  label: string;
  value: string;
  description: string;
}

const datasetOptions: DatasetOption[] = [
  {
    label: "Zoom Meeting: Bootcamp Q&A Session",
    value: "zoom-dataset-1",
    description: "A Q&A session about an upcoming bootcamp.",
  },
  {
    label: "Zoom W3ML Meeting: Project Discussion",
    value: "w3ml-dataset-1",
    description: "A project discussion about AI tools and implementations.",
  }
];

interface ConnectMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectLive?: (platform: string, data: { link: string, id?: string }) => void;
  onAnalyzeDataset?: (datasetId: string) => void;
  isProcessing?: boolean;
}

export function ConnectMeetingModal({ 
  isOpen, 
  onClose, 
  onConnectLive,
  onAnalyzeDataset,
  isProcessing = false 
}: ConnectMeetingModalProps) {
  const [currentTab, setCurrentTab] = useState("live");
  const [selectedPlatform, setSelectedPlatform] = useState("zoom");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<string>(datasetOptions[0]?.value || "");

  const handleConnectLiveMeeting = () => {
    if (!selectedPlatform || !meetingLink) {
      toast.error("Please select a platform and enter a meeting link.");
      return;
    }
    if (onConnectLive) {
      onConnectLive(selectedPlatform, {
        link: meetingLink,
        id: meetingId || undefined
      });
      onClose();
    }
  };

  const handleDatasetAnalyzeClick = () => {
    if (!selectedDataset) {
      toast.error("Please select a dataset to analyze.");
      return;
    }
    if (onAnalyzeDataset) {
      onAnalyzeDataset(selectedDataset);
      onClose();
    }
  };

  useEffect(() => {
      if (!isOpen) {
          setCurrentTab("live");
          setSelectedPlatform("zoom");
          setMeetingLink("");
          setMeetingId("");
          setSelectedDataset(datasetOptions[0]?.value || "");
      }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={selectedPlatform}
                    onValueChange={setSelectedPlatform}
                    disabled={isProcessing}
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
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meeting-id">Meeting ID (optional)</Label>
                  <Input
                    id="meeting-id"
                    placeholder="123 456 789"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
            </TabsContent>
            
            <TabsContent value="dataset" className="mt-4 space-y-4">
              <div className="space-y-4">
                <Label>Select a dataset to analyze</Label>
                <RadioGroup
                  value={selectedDataset}
                  onValueChange={setSelectedDataset}
                  className="space-y-3"
                  disabled={isProcessing}
                >
                  {datasetOptions.map((dataset) => (
                    <Card key={dataset.value} className={`border ${selectedDataset === dataset.value ? 'border-primary' : 'border-input'} ${isProcessing ? 'opacity-50' : ''}`}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value={dataset.value} id={dataset.value} className="mt-1" disabled={isProcessing}/>
                          <div className="space-y-1">
                            <Label htmlFor={dataset.value} className={`text-base font-medium ${isProcessing ? 'cursor-default' : 'cursor-pointer'}`}>
                              {dataset.label}
                            </Label>
                            <CardDescription>{dataset.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  {datasetOptions.length === 0 && (
                      <p className="text-sm text-muted-foreground">No datasets configured.</p>
                  )}
                </RadioGroup>
              </div>
            </TabsContent>
        </Tabs>
        <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
            <Button 
              onClick={currentTab === 'live' ? handleConnectLiveMeeting : handleDatasetAnalyzeClick}
              disabled={isProcessing || (currentTab === 'live' && !meetingLink) || (currentTab === 'dataset' && !selectedDataset)}
            >
              {isProcessing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isProcessing ? 'Processing...' : (currentTab === 'live' ? 'Connect' : 'Analyze Dataset')}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

