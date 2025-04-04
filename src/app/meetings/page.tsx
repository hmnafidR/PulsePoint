"use client"

import Link from "next/link"
import { Settings, Plus, Calendar, LogOut } from "lucide-react"
import { useState } from "react"
import { signOut } from "next-auth/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import MeetingList from "@/components/MeetingList"

export default function MeetingsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">PulsePoint</h1>
          <span className="hidden text-sm text-muted-foreground md:inline-block">Where data meets emotion</span>
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
              <h1 className="text-2xl font-bold tracking-tight">Meeting Archive</h1>
              <p className="text-muted-foreground">View past meetings, recordings, and analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild>
                <Link href="/live-analysis">
                  <Plus className="mr-2 h-4 w-4" />
                  New Meeting
                </Link>
              </Button>
            </div>
          </div>

          <MeetingList />
        </div>
      </main>
    </div>
  )
}

