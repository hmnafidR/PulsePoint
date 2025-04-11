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
  onConfirm?: () => void
  meetingTitle?: string
}

export function MeetingEndModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  meetingTitle = "Weekly All-Hands Meeting"
}: MeetingEndModalProps) {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>End Analysis Session</DialogTitle>
          <DialogDescription>
            Are you sure you want to end the analysis session for "{meetingTitle || 'this meeting'}"?
            You can analyze the file again later if needed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
          >
            Confirm & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

