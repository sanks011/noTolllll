"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { signup } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
    role: "",
    companyName: "",
    contactPerson: "",
  })

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await signup({
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        userType: formData.userType,
        role: formData.role,
        sector: "Not specified", // Default value
        targetCountries: [], // Default empty array
      })

      toast({
        title: "Account created successfully!",
        description: "Welcome to TradeNavigator. Complete your profile in the dashboard.",
      })

      // Redirect to dashboard based on role
      if (formData.role === "Buyer") {
        router.push("/dashboard/buyer")
      } else {
        router.push("/dashboard/seller")
      }
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message || "Please try again later.",
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
            <h1 className="text-2xl font-bold">Create Account</h1>
          </div>
          <p className="text-muted-foreground">Create your trade account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up - Step {step} of 2</CardTitle>
            <CardDescription>
              {step === 1 && "Enter your basic information"}
              {step === 2 && "Select your profile type"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    placeholder="Your Company Ltd."
                    value={formData.companyName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Person</Label>
                  <Input
                    id="contact"
                    placeholder="Your Name"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Choose a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => setStep(2)}
                  disabled={!formData.email || !formData.companyName || !formData.contactPerson || !formData.password || !formData.confirmPassword}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-3">
                  <Label>Are you Indian or International?</Label>
                  <RadioGroup
                    value={formData.userType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, userType: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Indian" id="indian" />
                      <Label htmlFor="indian">Indian</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="International" id="international" />
                      <Label htmlFor="international">International</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Your Role</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Buyer" id="buyer" />
                      <Label htmlFor="buyer">Buyer - I want to source products</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Seller" id="seller" />
                      <Label htmlFor="seller">Seller - I want to export products</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={loading || !formData.userType || !formData.role}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
        </div>
      </div>
    </div>
  )
}
