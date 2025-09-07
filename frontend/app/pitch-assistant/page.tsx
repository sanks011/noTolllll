"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Eye, Languages, Package, Truck, Send } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"

// Sample buyer data (would come from API)
const buyersData = {
  "1": {
    name: "Tokyo Fish Market Co.",
    country: "Japan",
    contactPerson: "Hiroshi Tanaka",
    email: "procurement@tokyofish.jp",
    productCategories: ["Frozen Shrimp", "Prawns"],
    certifications: ["HACCP", "ISO 22000", "JAS Organic"],
  },
  "2": {
    name: "European Seafood Ltd.",
    country: "Netherlands",
    contactPerson: "Jan van der Berg",
    email: "buyers@euroseafood.nl",
    productCategories: ["Frozen Shrimp", "Crab"],
    certifications: ["BRC", "MSC", "EU Organic"],
  },
}

const products = [
  { id: "frozen-shrimp", name: "Frozen Shrimp", hsCode: "030617" },
  { id: "prawns", name: "Prawns", hsCode: "030616" },
  { id: "fish-fillets", name: "Fish Fillets", hsCode: "030484" },
  { id: "crab", name: "Crab", hsCode: "030633" },
]

const incoterms = ["FOB", "CIF", "CFR", "EXW", "FCA", "CPT", "CIP", "DAP", "DPU", "DDP"]

export default function PitchAssistantPage() {
  const searchParams = useSearchParams()
  const buyerId = searchParams.get("buyer")
  const selectedBuyer = buyerId ? buyersData[buyerId as keyof typeof buyersData] : null

  const [formData, setFormData] = useState({
    selectedProduct: "",
    quantity: "",
    pricePerKg: "",
    incoterm: "FOB",
    leadTime: "",
    paymentTerms: "",
    validityPeriod: "30",
    language: "english",
    customMessage: "",
  })

  const [pitchContent, setPitchContent] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (selectedBuyer && formData.selectedProduct) {
      generatePitchContent()
    }
  }, [selectedBuyer, formData.selectedProduct, formData.quantity, formData.pricePerKg])

  const generatePitchContent = () => {
    const product = products.find((p) => p.id === formData.selectedProduct)
    if (!product || !selectedBuyer) return

    const template = `Subject: Premium ${product.name} Supply Proposal - Odisha Seafood Exports Ltd.

Dear ${selectedBuyer.contactPerson || "Procurement Manager"},

I hope this email finds you well. I am writing to introduce Odisha Seafood Exports Ltd. and present our premium ${product.name} supply proposal for ${selectedBuyer.name}.

ABOUT OUR COMPANY:
Odisha Seafood Exports Ltd. is a leading seafood exporter based in Bhubaneswar, India, with over 15 years of experience in international trade. We specialize in high-quality frozen seafood products and maintain the highest standards of quality and food safety.

PRODUCT OFFERING:
• Product: ${product.name} (HS Code: ${product.hsCode})
• Quality: Premium grade, individually quick frozen (IQF)
• Packaging: 10kg master cartons, retail-ready packaging available
• Certifications: HACCP, BRC, EU Approved, ${selectedBuyer.certifications.join(", ")}

COMMERCIAL TERMS:
• Quantity: ${formData.quantity || "[Quantity]"} MT per shipment
• Price: USD ${formData.pricePerKg || "[Price]"} per kg
• Terms: ${formData.incoterm} ${selectedBuyer.country === "Japan" ? "Yokohama" : selectedBuyer.country === "Netherlands" ? "Rotterdam" : "Main Port"}
• Lead Time: ${formData.leadTime || "[Lead Time]"} days from order confirmation
• Payment: ${formData.paymentTerms || "LC at sight / 30 days credit terms"}
• Validity: ${formData.validityPeriod} days from date of offer

QUALITY ASSURANCE:
• Temperature maintained at -18°C throughout cold chain
• Full traceability from farm to fork
• Third-party inspection certificates available
• Compliance with ${selectedBuyer.country} import regulations

WHY CHOOSE US:
• Consistent quality and reliable supply
• Competitive pricing with flexible terms
• Strong logistics network and timely delivery
• Dedicated customer service and support
• Sustainable and responsible sourcing practices

${formData.customMessage ? `\nADDITIONAL MESSAGE:\n${formData.customMessage}` : ""}

We would be delighted to discuss this opportunity further and answer any questions you may have. Please feel free to contact me directly for samples, detailed specifications, or to arrange a video call.

Looking forward to building a successful partnership with ${selectedBuyer.name}.

Best regards,

Rajesh Kumar
Export Manager
Odisha Seafood Exports Ltd.
Email: rajesh@odishaseafood.com
Phone: +91-674-123-4567
Website: www.odishaseafood.com

---
This proposal is confidential and intended solely for ${selectedBuyer.name}. Please do not share without permission.`

    setPitchContent(template)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGeneratePDF = async () => {
    setLoading(true)
    try {
      // Simulate PDF generation
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "PDF Generated Successfully",
        description: "Your pitch document has been generated and is ready for download.",
      })
    } catch (error) {
      toast({
        title: "Error generating PDF",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    setLoading(true)
    try {
      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Email Sent Successfully",
        description: `Your pitch has been sent to ${selectedBuyer?.email}`,
      })
    } catch (error) {
      toast({
        title: "Error sending email",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const translatePitch = (language: string) => {
    // In a real app, this would call a translation API
    toast({
      title: "Translation Feature",
      description: `Pitch would be translated to ${language}. This feature requires API integration.`,
    })
  }

  return (
    <DashboardLayout userType="indian">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pitch Assistant</h1>
            <p className="text-muted-foreground">Generate professional pitch documents for international buyers</p>
          </div>
          {selectedBuyer && (
            <div className="text-right">
              <p className="font-medium">{selectedBuyer.name}</p>
              <p className="text-sm text-muted-foreground">{selectedBuyer.country}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Buyer Selection */}
            {!selectedBuyer && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Buyer</CardTitle>
                  <CardDescription>Choose a buyer from your directory or enter details manually</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a buyer from your directory" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(buyersData).map(([id, buyer]) => (
                        <SelectItem key={id} value={id}>
                          {buyer.name} - {buyer.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Product Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Select
                    value={formData.selectedProduct}
                    onValueChange={(value) => handleInputChange("selectedProduct", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.hsCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity (MT)</Label>
                    <Input
                      id="quantity"
                      placeholder="e.g., 25"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange("quantity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per kg (USD)</Label>
                    <Input
                      id="price"
                      placeholder="e.g., 12.50"
                      value={formData.pricePerKg}
                      onChange={(e) => handleInputChange("pricePerKg", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipment Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Shipment Specifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incoterm">Incoterms</Label>
                    <Select value={formData.incoterm} onValueChange={(value) => handleInputChange("incoterm", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {incoterms.map((term) => (
                          <SelectItem key={term} value={term}>
                            {term}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leadTime">Lead Time (days)</Label>
                    <Input
                      id="leadTime"
                      placeholder="e.g., 30"
                      value={formData.leadTime}
                      onChange={(e) => handleInputChange("leadTime", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    placeholder="e.g., LC at sight or 30 days credit"
                    value={formData.paymentTerms}
                    onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validity">Offer Validity (days)</Label>
                  <Select
                    value={formData.validityPeriod}
                    onValueChange={(value) => handleInputChange("validityPeriod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="45">45 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Language & Custom Message */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Languages className="h-5 w-5" />
                  <span>Language & Customization</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="korean">Korean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customMessage">Additional Message (Optional)</Label>
                  <Textarea
                    id="customMessage"
                    placeholder="Add any specific message or requirements..."
                    value={formData.customMessage}
                    onChange={(e) => handleInputChange("customMessage", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Pitch Preview</span>
                </CardTitle>
                <CardDescription>Preview your pitch before sending or downloading</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {pitchContent || "Select a product to generate pitch preview..."}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Generate PDF or send email directly to the buyer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={handleGeneratePDF} disabled={loading || !pitchContent} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? "Generating..." : "Generate PDF"}
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    disabled={loading || !pitchContent || !selectedBuyer}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {loading ? "Sending..." : "Send Email"}
                  </Button>
                </div>

                {formData.language !== "english" && (
                  <Button variant="outline" onClick={() => translatePitch(formData.language)} className="w-full">
                    <Languages className="mr-2 h-4 w-4" />
                    Translate to {formData.language.charAt(0).toUpperCase() + formData.language.slice(1)}
                  </Button>
                )}

                <div className="text-xs text-muted-foreground">
                  <p>• PDF will include your company letterhead and contact details</p>
                  <p>• Email will be sent from your registered email address</p>
                  <p>• All communications are tracked in your buyer interactions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
