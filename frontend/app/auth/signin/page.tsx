"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { signin } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await signin(email, password)

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      })

      // Redirect to dashboard based on role
      if (user?.isAdmin) {
        router.push("/dashboard/admin")
      } else if (user?.role === "Buyer") {
        router.push("/dashboard/buyer")
      } else if (user?.role === "Seller") {
        router.push("/dashboard/seller")
      } else {
        // Default fallback
        router.push("/dashboard/buyer")
      }
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar showAuth={false} />
      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 text-primary hover:text-primary/80">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to home</span>
            </Link>
            <div className="mt-4 mb-2">
              <h1 className="text-2xl font-bold">Welcome Back</h1>
            </div>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@company.com"
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !email || !password}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
        </div>
      </div>
    </div>
  )
}
