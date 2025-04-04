"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lightbulb, Smile, Users, Mail } from "lucide-react"
import { signIn } from "next-auth/react"
import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("signin")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailSignIn = async (e: React.FormEvent) => {
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
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      setError("An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Create user in public.users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])

        if (insertError) {
          console.error('Error creating user:', insertError)
          setError('Error creating user account')
        } else {
          setError('Please check your email for the confirmation link')
        }
      }
    } catch (error) {
      console.error('Error in sign up:', error)
      setError('An error occurred during sign up')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn(provider, {
        callbackUrl: "/dashboard",
      })
    } catch (error) {
      setError("An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
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
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Signing in...
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                    {error && (
                      <div className="text-sm text-red-500">
                        {error}
                      </div>
                    )}
                  </form>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleSocialSignIn("google")} disabled={isLoading}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" onClick={() => handleSocialSignIn("github")} disabled={isLoading}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                        <path
                          fill="currentColor"
                          d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                        />
                      </svg>
                      GitHub
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setActiveTab("signup")}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Sign up
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <button className="text-primary underline-offset-4 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === "signup" && (
            <div className="flex justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Sign Up</CardTitle>
                  <CardDescription>Create your PulsePoint account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Signing up...
                        </div>
                      ) : (
                        "Sign Up"
                      )}
                    </Button>
                    {error && (
                      <div className="text-sm text-red-500">
                        {error}
                      </div>
                    )}
                  </form>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      onClick={() => setActiveTab("signin")}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Sign in
                    </button>
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
                  <p className="text-sm text-muted-foreground">
                    Monitor participant engagement and interaction patterns
                  </p>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium">Actionable Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Get data-driven recommendations to improve meeting effectiveness
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

