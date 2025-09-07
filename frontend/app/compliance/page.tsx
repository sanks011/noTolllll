"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Upload, CheckCircle, AlertCircle, MapPin, Phone, Mail, ExternalLink, FileText } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

// Sample compliance data
const complianceRequirements = {
  Japan: {
    requirements: [
      { id: "labeling", name: "Japanese Labeling Requirements", completed: true, required: true },
      { id: "traceability", name: "Full Traceability Documentation", completed: true, required: true },
      { id: "cold-chain", name: "Cold Chain Certification", completed: false, required: true },
      { id: "haccp", name: "HACCP Certification", completed: true, required: true },
      { id: "jas", name: "JAS Organic (if applicable)", completed: false, required: false },
      { id: "radiation", name: "Radiation Testing Certificate", completed: true, required: true },
    ],
    documents: [
      { name: "Product Label Design", uploaded: true, type: "image" },
      { name: "Traceability Report", uploaded: true, type: "pdf" },
      { name: "Cold Chain Certificate", uploaded: false, type: "pdf" },
      { name: "Lab Test Results", uploaded: true, type: "pdf" },
    ],
  },
  "European Union": {
    requirements: [
      { id: "eu-labeling", name: "EU Labeling Regulations", completed: true, required: true },
      { id: "traceability", name: "Traceability System", completed: true, required: true },
      { id: "brc", name: "BRC Certification", completed: false, required: true },
      { id: "msc", name: "MSC Sustainability Certificate", completed: true, required: false },
      { id: "allergen", name: "Allergen Declaration", completed: true, required: true },
      { id: "nutritional", name: "Nutritional Information", completed: false, required: true },
    ],
    documents: [
      { name: "EU Compliant Labels", uploaded: true, type: "image" },
      { name: "BRC Certificate", uploaded: false, type: "pdf" },
      { name: "MSC Certificate", uploaded: true, type: "pdf" },
      { name: "Allergen Test Report", uploaded: true, type: "pdf" },
    ],
  },
  UAE: {
    requirements: [
      { id: "halal", name: "Halal Certification", completed: true, required: true },
      { id: "esma", name: "ESMA Approval", completed: true, required: true },
      { id: "arabic-labeling", name: "Arabic Labeling", completed: false, required: true },
      { id: "shelf-life", name: "Shelf Life Studies", completed: true, required: true },
      { id: "coo", name: "Certificate of Origin", completed: true, required: true },
    ],
    documents: [
      { name: "Halal Certificate", uploaded: true, type: "pdf" },
      { name: "ESMA Approval Letter", uploaded: true, type: "pdf" },
      { name: "Arabic Labels", uploaded: false, type: "image" },
      { name: "Shelf Life Study", uploaded: true, type: "pdf" },
    ],
  },
  "South Korea": {
    requirements: [
      { id: "korea-labeling", name: "Korean Labeling Requirements", completed: false, required: true },
      { id: "korea-traceability", name: "Korean Traceability Documentation", completed: false, required: true },
      { id: "korea-haccp", name: "Korea HACCP Certification", completed: false, required: true },
      { id: "korea-organic", name: "Korea Organic Certification", completed: false, required: false },
      { id: "korea-radiation", name: "Korea Radiation Testing Certificate", completed: false, required: true },
    ],
    documents: [
      { name: "Korean Product Label Design", uploaded: false, type: "image" },
      { name: "Korean Traceability Report", uploaded: false, type: "pdf" },
      { name: "Korean Cold Chain Certificate", uploaded: false, type: "pdf" },
      { name: "Korean Lab Test Results", uploaded: false, type: "pdf" },
    ],
  },
  "United Kingdom": {
    requirements: [
      { id: "uk-labeling", name: "UK Labeling Regulations", completed: false, required: true },
      { id: "uk-traceability", name: "UK Traceability System", completed: false, required: true },
      { id: "uk-brc", name: "UK BRC Certification", completed: false, required: true },
      { id: "uk-msc", name: "UK MSC Sustainability Certificate", completed: false, required: false },
      { id: "uk-allergen", name: "UK Allergen Declaration", completed: false, required: true },
      { id: "uk-nutritional", name: "UK Nutritional Information", completed: false, required: true },
    ],
    documents: [
      { name: "UK Compliant Labels", uploaded: false, type: "image" },
      { name: "UK BRC Certificate", uploaded: false, type: "pdf" },
      { name: "UK MSC Certificate", uploaded: false, type: "pdf" },
      { name: "UK Allergen Test Report", uploaded: false, type: "pdf" },
    ],
  },
}

const vendors = [
  {
    id: "1",
    name: "Global Certification Services",
    services: ["HACCP", "BRC", "ISO 22000"],
    location: "Mumbai, India",
    contact: "+91-22-1234-5678",
    email: "info@globalcert.in",
    rating: 4.8,
    experience: "15+ years",
  },
  {
    id: "2",
    name: "Marine Testing Laboratory",
    services: ["Lab Testing", "Microbiological Analysis", "Chemical Testing"],
    location: "Chennai, India",
    contact: "+91-44-1234-5678",
    email: "lab@marinetesting.com",
    rating: 4.6,
    experience: "12+ years",
  },
  {
    id: "3",
    name: "Cold Chain Solutions",
    services: ["Cold Storage", "Refrigerated Transport", "Temperature Monitoring"],
    location: "Kolkata, India",
    contact: "+91-33-1234-5678",
    email: "ops@coldchain.in",
    rating: 4.7,
    experience: "10+ years",
  },
  {
    id: "4",
    name: "Halal Certification Board",
    services: ["Halal Certification", "Islamic Compliance", "Audit Services"],
    location: "Delhi, India",
    contact: "+91-11-1234-5678",
    email: "certification@halalboard.in",
    rating: 4.9,
    experience: "20+ years",
  },
  {
    id: "5",
    name: "Traceability Tech Solutions",
    services: ["Blockchain Traceability", "QR Code Systems", "Supply Chain Tracking"],
    location: "Bangalore, India",
    contact: "+91-80-1234-5678",
    email: "support@tracetech.in",
    rating: 4.5,
    experience: "8+ years",
  },
]

export default function CompliancePage() {
  const [selectedMarket, setSelectedMarket] = useState("Japan")
  const [requirements, setRequirements] = useState(
    complianceRequirements[selectedMarket as keyof typeof complianceRequirements],
  )
  const [uploadingFile, setUploadingFile] = useState<string | null>(null)
  const { toast } = useToast()

  const handleMarketChange = (market: string) => {
    setSelectedMarket(market)
    setRequirements(complianceRequirements[market as keyof typeof complianceRequirements])
  }

  const toggleRequirement = (requirementId: string) => {
    setRequirements((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req) =>
        req.id === requirementId ? { ...req, completed: !req.completed } : req,
      ),
    }))

    toast({
      title: "Requirement updated",
      description: "Compliance status has been updated successfully.",
    })
  }

  const handleFileUpload = async (documentName: string) => {
    setUploadingFile(documentName)
    try {
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setRequirements((prev) => ({
        ...prev,
        documents: prev.documents.map((doc) => (doc.name === documentName ? { ...doc, uploaded: true } : doc)),
      }))

      toast({
        title: "File uploaded successfully",
        description: `${documentName} has been uploaded and verified.`,
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setUploadingFile(null)
    }
  }

  const calculateCompletionPercentage = () => {
    const requiredItems = requirements.requirements.filter((req) => req.required)
    const completedRequired = requiredItems.filter((req) => req.completed)
    const uploadedDocs = requirements.documents.filter((doc) => doc.uploaded)

    const reqPercentage = (completedRequired.length / requiredItems.length) * 70
    const docPercentage = (uploadedDocs.length / requirements.documents.length) * 30

    return Math.round(reqPercentage + docPercentage)
  }

  const completionPercentage = calculateCompletionPercentage()

  return (
    <DashboardLayout userType="indian">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compliance Center</h1>
            <p className="text-muted-foreground">Manage regulatory compliance for international markets</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{completionPercentage}%</p>
            <p className="text-sm text-muted-foreground">Overall Compliance</p>
          </div>
        </div>

        {/* Market Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Select Target Market</span>
            </CardTitle>
            <CardDescription>Choose the market to view specific compliance requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedMarket} onValueChange={handleMarketChange}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="European Union">European Union</SelectItem>
                <SelectItem value="UAE">United Arab Emirates</SelectItem>
                <SelectItem value="South Korea">South Korea</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Tabs defaultValue="requirements" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </TabsList>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Requirements for {selectedMarket}</CardTitle>
                <CardDescription>Complete all required items to ensure regulatory compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Completion Progress</span>
                    <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-3" />
                </div>

                <div className="space-y-3 mt-6">
                  {requirements.requirements.map((requirement) => (
                    <div key={requirement.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={requirement.completed}
                          onCheckedChange={() => toggleRequirement(requirement.id)}
                        />
                        <div>
                          <p className="font-medium">{requirement.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {requirement.required ? (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Optional
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {requirement.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
                <CardDescription>Upload evidence and supporting documents for compliance verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requirements.documents.map((document) => (
                    <div key={document.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{document.name}</p>
                          <p className="text-sm text-muted-foreground">{document.type.toUpperCase()} file</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {document.uploaded ? (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <Badge variant="outline" className="text-green-600">
                              Uploaded
                            </Badge>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleFileUpload(document.name)}
                            disabled={uploadingFile === document.name}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {uploadingFile === document.name ? "Uploading..." : "Upload"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Upload Guidelines</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Maximum file size: 10MB</li>
                    <li>• Supported formats: PDF, JPG, PNG</li>
                    <li>• Ensure documents are clear and legible</li>
                    <li>• All documents must be in English or with certified translations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Vendors</CardTitle>
                <CardDescription>Trusted service providers to help you meet compliance requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendors.map((vendor) => (
                    <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{vendor.name}</h3>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{vendor.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium">{vendor.rating}</span>
                            <span className="text-yellow-400">★</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium">Services</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {vendor.services.map((service) => (
                                <Badge key={service} variant="secondary" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium">Experience</p>
                            <p className="text-sm text-muted-foreground">{vendor.experience}</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-3 w-3" />
                              <span>{vendor.contact}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="h-3 w-3" />
                              <span>{vendor.email}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                              <Phone className="mr-1 h-3 w-3" />
                              Contact
                            </Button>
                            <Button size="sm" className="flex-1">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
