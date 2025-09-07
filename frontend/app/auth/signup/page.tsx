"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Globe, ArrowLeft, ArrowRight } from "lucide-react"
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
    role: "",
    sector: "",
    hsCode: "",
    targetCountries: [] as string[],
    companyName: "",
    contactPerson: "",
  })

  const handleCountryChange = (country: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      targetCountries: checked ? [...prev.targetCountries, country] : prev.targetCountries.filter((c) => c !== country),
    }))
  }

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
        role: formData.role,
        sector: formData.sector,
        hsCode: formData.hsCode,
        targetCountries: formData.targetCountries,
      })

      toast({
        title: "Account created successfully!",
        description: "Welcome to TradeNavigator.",
      })

      // Redirect to dashboard based on role
      if (formData.role === "International Trader") {
        router.push("/dashboard/international")
      } else {
        router.push("/dashboard/indian")
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-primary hover:text-primary/80">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to home</span>
          </Link>
          <div className="flex items-center justify-center space-x-2 mt-4 mb-2">
            <Globe className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">TradeNavigator</span>
          </div>
          <p className="text-muted-foreground">Create your export business account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up - Step {step} of 3</CardTitle>
            <CardDescription>
              {step === 1 && "Enter your email to get started"}
              {step === 2 && "Tell us about your business"}
              {step === 3 && "Select your target markets"}
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
                  <Label>Your Role</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Exporter" id="exporter" />
                      <Label htmlFor="exporter">Exporter</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Processor" id="processor" />
                      <Label htmlFor="processor">Processor (Factory Owner)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Farmer Group" id="farmer" />
                      <Label htmlFor="farmer">Farmer Cooperative</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="International Trader" id="international" />
                      <Label htmlFor="international">International Trader</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Business Sector</Label>
                  <RadioGroup
                    value={formData.sector}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, sector: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Seafood" id="seafood" />
                      <Label htmlFor="seafood">Seafood (Shrimp, Prawn, Fish)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Textile" id="textile" />
                      <Label htmlFor="textile">Textile & Apparel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Both" id="both" />
                      <Label htmlFor="both">Both Sectors</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hscode">Primary HS Code</Label>
                  <Input
                    id="hscode"
                    placeholder="e.g., 030617 (Frozen Shrimp)"
                    value={formData.hsCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hsCode: e.target.value }))}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1" disabled={!formData.role || !formData.sector}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-3">
                  <Label>Target Export Markets (Select all that apply)</Label>
                  <div className="space-y-2">
                    {["European Union", "Japan", "South Korea", "UAE", "United Kingdom"].map((country) => (
                      <div key={country} className="flex items-center space-x-2">
                        <Checkbox
                          id={country}
                          checked={formData.targetCountries.includes(country)}
                          onCheckedChange={(checked) => handleCountryChange(country, checked as boolean)}
                        />
                        <Label htmlFor={country}>{country}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={loading || formData.targetCountries.length === 0}
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
  )
}
