"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"

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

interface MeetingEndModalProps {
  isOpen: boolean
  onClose: () => void
  onEndMeeting: () => void
  isProcessing?: boolean
  meetingTitle?: string
  meetingDate?: string
  duration?: string
  sentiment?: number
  engagement?: number
  participants?: number
}

export function MeetingEndModal({ 
  isOpen, 
  onClose, 
  onEndMeeting, 
  isProcessing = false, 
  meetingTitle = "Weekly All-Hands Meeting",
  meetingDate = "March 28, 2025",
  duration = "54 minutes",
  sentiment = 76,
  engagement = 68,
  participants = 24 
}: MeetingEndModalProps) {
  const [title, setTitle] = useState(meetingTitle)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // Update title when meetingTitle prop changes
  useEffect(() => {
    setTitle(meetingTitle);
  }, [meetingTitle]);

  const handleSave = () => {
    setIsSaving(true)
    // Simulate saving process
    setTimeout(() => {
      setIsSaving(false)
      router.push("/meetings")
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>End Meeting</DialogTitle>
          <DialogDescription>
            Are you sure you want to end this meeting? This will save the analysis data and close the connection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meeting-title" className="col-span-4">
              Meeting Title
            </Label>
            <Input
              id="meeting-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-4"
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Meeting Summary</h4>
            <div className="rounded-md bg-muted p-3">
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Date: {meetingDate}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Duration: {duration}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Participants: {participants}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Average Sentiment: {sentiment}%</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Average Engagement: {engagement}%</span>
                </li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This meeting data will be saved to the archive and can be accessed later.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onEndMeeting}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "End & Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

