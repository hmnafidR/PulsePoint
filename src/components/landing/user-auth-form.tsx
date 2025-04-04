"use client"

import * as React from "react"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export function UserAuthForm() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  async function handleGoogleSignIn() {
    setIsLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  async function handleGithubSignIn() {
    setIsLoading(true)
    await signIn("github", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="grid gap-6">
      <Button 
        variant="default" 
        onClick={handleGoogleSignIn} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Sign in with Google
      </Button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        onClick={handleGithubSignIn} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.github className="mr-2 h-4 w-4" />
        )}
        Sign in with GitHub
      </Button>
    </div>
  )
} 