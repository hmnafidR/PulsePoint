"use client"

import * as React from "react"
import { Users, MessageSquare, ThumbsUp, MicOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface MeetingParticipationStatsProps {
  meeting?: {
    totalParticipants?: number;
    activeParticipants?: number;
    speakingParticipants?: number;
    reactingParticipants?: number;
    title?: string;
    date?: string;
  };
  totalParticipants?: number;
  activeParticipants?: number;
  speakingParticipants?: number;
  reactingParticipants?: number;
  meetingTitle?: string;
  meetingDate?: string;
}

export function MeetingParticipationStats({
  meeting,
  totalParticipants: propTotalParticipants,
  activeParticipants: propActiveParticipants,
  speakingParticipants: propSpeakingParticipants,
  reactingParticipants: propReactingParticipants,
  meetingTitle: propMeetingTitle,
  meetingDate: propMeetingDate,
}: MeetingParticipationStatsProps) {
  // Use meeting object props if available, otherwise use individual props
  const totalParticipants = meeting?.totalParticipants || propTotalParticipants || 0;
  const activeParticipants = meeting?.activeParticipants || propActiveParticipants || 0;
  const speakingParticipants = meeting?.speakingParticipants || propSpeakingParticipants || 0;
  const reactingParticipants = meeting?.reactingParticipants || propReactingParticipants || 0;
  const meetingTitle = meeting?.title || propMeetingTitle || "Weekly Team Meeting";
  const meetingDate = meeting?.date || propMeetingDate || "March 13, 2025";

  // Calculate participation rates
  const participationRate = Math.round((activeParticipants / totalParticipants) * 100)
  const speakingRate = Math.round((speakingParticipants / totalParticipants) * 100)
  const reactionRate = Math.round((reactingParticipants / totalParticipants) * 100)
  const silentParticipants = totalParticipants - activeParticipants

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Participation</CardTitle>
        <CardDescription>
          {meetingTitle} • {meetingDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main participation stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex flex-col items-center justify-center rounded-lg border p-4 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Total Participants</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border p-4 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900">
              <MessageSquare className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
            </div>
            <div className="text-2xl font-bold">{activeParticipants}</div>
            <p className="text-xs text-muted-foreground">Active Participants</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border p-4 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
              <ThumbsUp className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div className="text-2xl font-bold">{reactingParticipants}</div>
            <p className="text-xs text-muted-foreground">Reacting Participants</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border p-4 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <MicOff className="h-6 w-6 text-red-600 dark:text-red-300" />
            </div>
            <div className="text-2xl font-bold">{silentParticipants}</div>
            <p className="text-xs text-muted-foreground">Silent Participants</p>
          </div>
        </div>

        {/* Participation visualization */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary"></div>
                <span className="text-sm font-medium">Overall Participation</span>
              </div>
              <span className="text-sm font-medium">{participationRate}%</span>
            </div>
            <Progress value={participationRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {activeParticipants} out of {totalParticipants} participants engaged in the meeting
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Speaking Participation</span>
              </div>
              <span className="text-sm font-medium">{speakingRate}%</span>
            </div>
            <Progress value={speakingRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {speakingParticipants} participants spoke during the meeting
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium">Reaction Participation</span>
              </div>
              <span className="text-sm font-medium">{reactionRate}%</span>
            </div>
            <Progress value={reactionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {reactingParticipants} participants used reactions during the meeting
            </p>
          </div>
        </div>

        {/* Participation breakdown */}
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 text-sm font-medium">Participation Breakdown</h3>
          <div className="relative h-40">
            <div className="absolute inset-0">
              <div className="flex h-full">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${(speakingParticipants / totalParticipants) * 100}%` }}
                  title={`Speaking: ${speakingParticipants} participants`}
                />
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${((reactingParticipants - speakingParticipants) / totalParticipants) * 100}%` }}
                  title={`Reacting only: ${reactingParticipants - speakingParticipants} participants`}
                />
                <div
                  className="bg-amber-200 h-full"
                  style={{ width: `${((activeParticipants - reactingParticipants) / totalParticipants) * 100}%` }}
                  title={`Other activity: ${activeParticipants - reactingParticipants} participants`}
                />
                <div
                  className="bg-gray-200 h-full"
                  style={{ width: `${(silentParticipants / totalParticipants) * 100}%` }}
                  title={`Silent: ${silentParticipants} participants`}
                />
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold">{participationRate}%</div>
              <p className="text-sm text-muted-foreground">Participation Rate</p>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="mb-2 text-xs font-medium">Legend</h4>
            <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                <span>Speaking ({speakingRate}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <span>Reactions Only ({Math.round(((reactingParticipants - speakingParticipants) / totalParticipants) * 100)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300"></div>
                <span>Other Activity ({Math.round(((activeParticipants - reactingParticipants) / totalParticipants) * 100)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-slate-300 to-blue-200"></div>
                <span>Silent ({Math.round((silentParticipants / totalParticipants) * 100)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="rounded-lg border p-4 bg-muted/50">
          <h3 className="mb-2 text-sm font-medium">Insights</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              • {participationRate >= 75 ? "Excellent" : participationRate >= 50 ? "Good" : "Low"} overall participation
              rate of {participationRate}%
            </li>
            <li>
              • {silentParticipants} participants ({Math.round((silentParticipants / totalParticipants) * 100)}%) were
              present but didn't engage
            </li>
            <li>
              • {speakingParticipants} participants ({speakingRate}%) contributed verbally to the discussion
            </li>
            {reactingParticipants > 0 && (
              <li>
                • {reactingParticipants} participants ({reactionRate}%) used reactions to provide feedback
              </li>
            )}
            {participationRate < 50 && (
              <li className="text-amber-600">• Consider more interactive meeting formats to increase engagement</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
