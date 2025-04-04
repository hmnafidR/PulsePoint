"use client"

import Link from "next/link"
import { Settings, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
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
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and configure data sources</p>
          </div>
          <Separator />
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure general platform settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" defaultValue="Acme Inc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input id="admin-email" type="email" defaultValue="admin@example.com" />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <Switch id="dark-mode" />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="notifications">Email Notifications</Label>
                    <Switch id="notifications" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Data Retention</CardTitle>
                  <CardDescription>Configure how long data is stored in the system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="survey-retention">Survey Data Retention (months)</Label>
                    <Input id="survey-retention" type="number" defaultValue="24" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meeting-retention">Meeting Data Retention (months)</Label>
                    <Input id="meeting-retention" type="number" defaultValue="12" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="integrations" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Survey Integrations</CardTitle>
                  <CardDescription>Connect to survey platforms to import data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label>Google Forms</Label>
                      <p className="text-sm text-muted-foreground">Import survey data from Google Forms</p>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label>SurveyMonkey</Label>
                      <p className="text-sm text-muted-foreground">Import survey data from SurveyMonkey</p>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label>Typeform</Label>
                      <p className="text-sm text-muted-foreground">Import survey data from Typeform</p>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Integrations</CardTitle>
                  <CardDescription>Connect to meeting platforms to import data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label>Zoom</Label>
                      <p className="text-sm text-muted-foreground">Import meeting data from Zoom</p>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label>Microsoft Teams</Label>
                      <p className="text-sm text-muted-foreground">Import meeting data from Microsoft Teams</p>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label>Google Meet</Label>
                      <p className="text-sm text-muted-foreground">Import meeting data from Google Meet</p>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="alerts" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Settings</CardTitle>
                  <CardDescription>Configure when alerts are triggered</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sentiment-threshold">Sentiment Alert Threshold (%)</Label>
                    <Input id="sentiment-threshold" type="number" defaultValue="65" />
                    <p className="text-sm text-muted-foreground">
                      Alerts will be triggered when sentiment drops below this threshold
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engagement-threshold">Engagement Alert Threshold (%)</Label>
                    <Input id="engagement-threshold" type="number" defaultValue="60" />
                    <p className="text-sm text-muted-foreground">
                      Alerts will be triggered when engagement drops below this threshold
                    </p>
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="email-alerts">Email Alerts</Label>
                    <Switch id="email-alerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="dashboard-alerts">Dashboard Alerts</Label>
                    <Switch id="dashboard-alerts" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Alert Recipients</CardTitle>
                  <CardDescription>Configure who receives alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-emails">Email Recipients</Label>
                    <Input id="alert-emails" defaultValue="admin@example.com, hr@example.com" />
                    <p className="text-sm text-muted-foreground">Comma-separated list of email addresses</p>
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="alert-managers">Alert Department Managers</Label>
                    <Switch id="alert-managers" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

