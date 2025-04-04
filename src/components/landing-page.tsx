"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lightbulb, Linkedin, Smile, Users, Mail } from "lucide-react"
import { signIn } from "next-auth/react"

import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { UserAuthForm } from "@/components/landing/user-auth-form"
import { Icons } from "@/components/icons"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("signin")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError(result.error)
        return
      }
      router.push("/dashboard")
    } catch (error) {
      setError("An error occurred during sign in")
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await signIn("email", {
        email,
        redirect: false,
      })
      if (result?.error) {
        setError(result.error)
        return
      }
      // Show success message
      setError("Check your email for the sign-in link")
    } catch (error) {
      setError("An error occurred while sending the sign-in link")
      console.error("Email sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await signIn(provider, { callbackUrl: "/dashboard" })
    } catch (error) {
      setError(`Error signing in with ${provider}`)
      console.error(`${provider} sign in error:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  async function signInWithGoogle() {
    setIsLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">PulsePoint</h1>
          <span className="hidden text-sm italic text-muted-foreground md:inline-block">Where data meets emotion</span>
        </div>
        <nav className="ml-auto flex gap-2">
          <Button
            variant="ghost"
            className={activeTab === "signin" ? "bg-accent" : ""}
            onClick={() => setActiveTab("signin")}
          >
            Sign In
          </Button>
          <Button
            variant="ghost"
            className={activeTab === "about" ? "bg-accent" : ""}
            onClick={() => setActiveTab("about")}
          >
            About
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <section className="relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
        <div className="container relative mx-auto py-20">
          {activeTab === "signin" && (
            <div className="flex justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>Sign in to your PulsePoint account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <UserAuthForm />
                  {error && (
                    <div className="text-sm text-red-500 mt-2">
                      {error}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col items-start space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="#" className="text-primary underline-offset-4 hover:underline">
                      Sign up
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === "about" && (
            <div className="bg-background rounded-lg p-6 space-y-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Transforming Meeting Intelligence</h3>
                <p className="text-muted-foreground">
                  PulsePoint is an AI-powered meeting analytics platform that helps teams understand the emotional
                  dynamics of their meetings, providing real-time insights into participant sentiment, engagement
                  levels, and communication patterns.
                </p>
                <p className="text-muted-foreground">
                  In today's hybrid work environment, effective communication is more critical than ever. PulsePoint
                  bridges the gap between what's said and what's felt, giving leaders and teams the tools they need to
                  foster more productive, inclusive, and emotionally intelligent meetings.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Smile className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium">Sentiment Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Understand the emotional tone of your meetings in real-time
                  </p>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium">Engagement Tracking</h4>
                  <p className="text-sm text-muted-foreground">Monitor participation and identify engagement gaps</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium">Actionable Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered recommendations to improve communication
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold">How PulsePoint Works</h3>
                <div className="space-y-6">
                  <div className="relative pl-8 border-l-2 border-primary/30 pb-6">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary"></div>
                    <h4 className="font-medium">Connect Your Meeting Platforms</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Integrate with Zoom, Microsoft Teams, Google Meet, and other popular meeting platforms.
                    </p>
                  </div>
                  <div className="relative pl-8 border-l-2 border-primary/30">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary"></div>
                    <h4 className="font-medium">AI-Powered Analysis</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our advanced AI analyzes speech patterns, facial expressions, and meeting interactions in
                      real-time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-2xl font-bold mb-4">What Our Customers Say</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <p className="italic text-muted-foreground">
                          "PulsePoint has transformed how we conduct our leadership meetings. The sentiment analysis has
                          helped us identify when team members are disengaged and address concerns in real-time."
                        </p>
                        <div>
                          <p className="font-medium">Sarah Johnson</p>
                          <p className="text-sm text-muted-foreground">Chief People Officer, TechCorp</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <p className="italic text-muted-foreground">
                          "The insights from PulsePoint have helped our sales team improve their presentation skills
                          dramatically. We've seen a 30% increase in client engagement since implementing the platform."
                        </p>
                        <div>
                          <p className="font-medium">Michael Chen</p>
                          <p className="text-sm text-muted-foreground">VP of Sales, GrowthPartners</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-6">
        <div className="container mx-auto">
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">© 2025 PulsePoint. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

