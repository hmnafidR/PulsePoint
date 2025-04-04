'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ConnectMeetingModal } from "@/components/modals/connect-meeting-modal";

export default function ConnectMeeting() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Connect to Meeting
      </Button>
      <ConnectMeetingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
} 