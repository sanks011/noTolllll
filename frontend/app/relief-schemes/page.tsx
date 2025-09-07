"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calculator,
  Download,
  CheckCircle,
  Clock,
  Building2,
  IndianRupee,
  Calendar,
  FileText,
  Target,
  Loader2,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

// Sample relief schemes data
const reliefSchemes = [
  {
    id: "1",
    name: "Export Promotion Capital Goods (EPCG) Scheme",
    authority: "Directorate General of Foreign Trade (DGFT)",
    benefit: "₹15,00,000",
    benefitType: "Duty Exemption",
    deadline: "2024-03-31",
    description: "Allows import of capital goods for export production at zero customs duty",
    eligibility: ["Minimum export obligation of 6 times the duty saved", "Valid IEC", "Established exporter"],
    documents: ["IEC Certificate", "Export Performance Certificate", "Bank Certificate"],
    status: "Available",
    applied: false,
    category: "Capital Investment",
  },
  {
    id: "2",
    name: "Market Development Assistance (MDA) Scheme",
    authority: "Marine Products Export Development Authority (MPEDA)",
    benefit: "₹8,50,000",
    benefitType: "Financial Assistance",
    deadline: "2024-04-15",
    description: "Financial assistance for market development activities and export promotion",
    eligibility: ["Registered with MPEDA", "Minimum 3 years export experience", "Annual turnover > ₹5 crores"],
    documents: ["MPEDA Registration", "Export Performance Report", "Audited Financial Statements"],
    status: "Available",
    applied: false,
    category: "Market Development",
  },
  {
    id: "3",
    name: "Technology Upgradation Fund Scheme (TUFS)",
    authority: "Ministry of Textiles",
    benefit: "₹25,00,000",
    benefitType: "Credit Linked Subsidy",
    deadline: "2024-05-20",
    description: "Credit linked capital investment subsidy for technology upgradation",
    eligibility: ["Textile/Apparel manufacturer", "Investment in approved machinery", "Employment generation"],
    documents: ["Project Report", "Machinery Quotations", "Environmental Clearance"],
    status: "Available",
    applied: true,
    category: "Technology",
  },
  {
    id: "4",
    name: "Interest Equalization Scheme on Pre/Post Shipment Credit",
    authority: "Reserve Bank of India (RBI)",
    benefit: "₹12,00,000",
    benefitType: "Interest Subsidy",
    deadline: "2024-06-30",
    description: "Interest equalization on rupee export credit to boost competitiveness",
    eligibility: ["MSME exporter", "Specified product categories", "Valid export credit"],
    documents: ["MSME Certificate", "Export Credit Sanction Letter", "Interest Payment Receipts"],
    status: "Available",
    applied: false,
    category: "Credit Support",
  },
  {
    id: "5",
    name: "Merchandise Exports from India Scheme (MEIS)",
    authority: "Directorate General of Foreign Trade (DGFT)",
    benefit: "₹6,75,000",
    benefitType: "Duty Credit Scrip",
    deadline: "2024-07-31",
    description: "Duty credit scrip as percentage of FOB value of exports",
    eligibility: ["Exporter of notified products", "Minimum export value", "Compliance with quality standards"],
    documents: ["Shipping Bills", "Export Invoices", "Quality Certificates"],
    status: "Limited",
    applied: false,
    category: "Export Incentive",
  },
]

export default function ReliefSchemesPage() {
  const [schemes, setSchemes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null)
  const [filterCategory, setFilterCategory] = useState("All Categories")
  const [filterStatus, setFilterStatus] = useState("All Status")
  const [calculatorData, setCalculatorData] = useState({
    annualTurnover: "",
    exportValue: "",
    employeeCount: "",
    investmentAmount: "",
    category: "",
  })
  const [calculatedBenefit, setCalculatedBenefit] = useState<number | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchSchemes = async () => {
      // Don't fetch if user is not authenticated
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await apiService.getReliefSchemes()
        
        // Handle the structured API response
        if (response?.success && response?.data?.schemes) {
          setSchemes(response.data.schemes.map((scheme: any) => ({
            ...scheme,
            id: scheme.id || scheme._id,
            applied: scheme.applicationStatus !== 'Eligible',
            status: scheme.applicationStatus || "Available",
            benefit: scheme.benefitAmount ? `₹${scheme.benefitAmount.toLocaleString()}` : `₹${scheme.maxBenefit || '10,00,000'}`,
            benefitType: scheme.benefitType || "Financial Assistance",
            deadline: scheme.deadline || "2024-12-31",
            eligibility: scheme.eligibilityCriteria || ["Registered exporter", "Minimum export experience"],
            documents: scheme.documentsRequired || ["IEC Certificate", "Export Performance Report"],
            category: scheme.category || "Export Support",
          })))
        } else {
          console.warn('Unexpected API response structure:', response)
          setSchemes(reliefSchemes) // Fall back to sample data
        }
      } catch (error: any) {
        console.error('Error fetching relief schemes:', error)
        toast({
          title: "Error loading schemes",
          description: "Using sample data. Please check your connection.",
          variant: "destructive",
        })
        // Fall back to sample data
        setSchemes(reliefSchemes)
      } finally {
        setLoading(false)
      }
    }

    fetchSchemes()
  }, [toast, user])

  if (loading) {
    return (
      <DashboardLayout userType="indian">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading relief schemes...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesCategory = filterCategory === "All Categories" || scheme.category === filterCategory
    const matchesStatus = filterStatus === "All Status" || scheme.status === filterStatus
    return matchesCategory && matchesStatus
  })

  const applyForScheme = (schemeId: string) => {
    setSchemes((prev) => prev.map((scheme) => (scheme.id === schemeId ? { ...scheme, applied: true } : scheme)))

    const scheme = schemes.find((s) => s.id === schemeId)
    toast({
      title: "Application submitted",
      description: `Your application for ${scheme?.name} has been submitted successfully.`,
    })
  }

  const calculateBenefit = () => {
    const turnover = Number.parseFloat(calculatorData.annualTurnover) || 0
    const exportValue = Number.parseFloat(calculatorData.exportValue) || 0
    const investment = Number.parseFloat(calculatorData.investmentAmount) || 0

    // Simple benefit calculation logic (would be more complex in real implementation)
    let benefit = 0

    if (calculatorData.category === "Export Incentive") {
      benefit = exportValue * 0.02 // 2% of export value
    } else if (calculatorData.category === "Capital Investment") {
      benefit = investment * 0.15 // 15% of investment
    } else if (calculatorData.category === "Market Development") {
      benefit = Math.min(turnover * 0.05, 1000000) // 5% of turnover, max 10L
    } else if (calculatorData.category === "Credit Support") {
      benefit = exportValue * 0.03 // 3% of export value
    }

    setCalculatedBenefit(Math.round(benefit))
  }

  const downloadTemplate = (schemeName: string) => {
    toast({
      title: "Template downloaded",
      description: `Application template for ${schemeName} has been downloaded.`,
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      Available: "bg-green-100 text-green-800",
      Limited: "bg-yellow-100 text-yellow-800",
      Closed: "bg-red-100 text-red-800",
    }
    return <Badge className={variants[status as keyof typeof variants] || variants.Available}>{status}</Badge>
  }

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

    if (daysLeft < 0) return { color: "text-red-600", text: "Expired" }
    if (daysLeft <= 30) return { color: "text-yellow-600", text: `${daysLeft} days left` }
    return { color: "text-green-600", text: `${daysLeft} days left` }
  }

  const categories = [...new Set(schemes.map((scheme) => scheme.category))]

  return (
    <DashboardLayout userType="indian">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Relief Navigator</h1>
            <p className="text-muted-foreground">
              Discover and apply for government relief schemes and financial assistance
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">₹67.25L</p>
            <p className="text-sm text-muted-foreground">Total Potential Benefit</p>
          </div>
        </div>

        <Tabs defaultValue="schemes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schemes">Available Schemes</TabsTrigger>
            <TabsTrigger value="calculator">Benefit Calculator</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>

          {/* Available Schemes Tab */}
          <TabsContent value="schemes" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Schemes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Categories">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Status">All Status</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Limited">Limited</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="benefit">Minimum Benefit</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Amount</SelectItem>
                        <SelectItem value="5l">₹5 Lakhs+</SelectItem>
                        <SelectItem value="10l">₹10 Lakhs+</SelectItem>
                        <SelectItem value="20l">₹20 Lakhs+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schemes List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredSchemes.map((scheme) => {
                const deadlineStatus = getDeadlineStatus(scheme.deadline)
                return (
                  <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{scheme.name}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{scheme.authority}</span>
                          </div>
                        </div>
                        {getStatusBadge(scheme.status)}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <IndianRupee className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">{scheme.benefit}</span>
                          </div>
                          <Badge variant="outline">{scheme.benefitType}</Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className={`text-sm ${deadlineStatus.color}`}>
                            Deadline: {scheme.deadline} ({deadlineStatus.text})
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground">{scheme.description}</p>

                        <div>
                          <Badge variant="secondary" className="text-xs">
                            {scheme.category}
                          </Badge>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent"
                                onClick={() => setSelectedScheme(scheme)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{selectedScheme?.name}</DialogTitle>
                                <DialogDescription>{selectedScheme?.authority}</DialogDescription>
                              </DialogHeader>
                              {selectedScheme && (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Description</h4>
                                    <p className="text-sm text-muted-foreground">{selectedScheme.description}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Eligibility Criteria</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      {selectedScheme.eligibility.map((criteria: any, index: number) => (
                                        <li key={index}>• {criteria}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Required Documents</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {selectedScheme.documents.map((doc: any) => (
                                        <Badge key={doc} variant="outline">
                                          {doc}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex space-x-2 pt-4">
                                    <Button
                                      className="flex-1"
                                      onClick={() => applyForScheme(selectedScheme.id)}
                                      disabled={selectedScheme.applied}
                                    >
                                      {selectedScheme.applied ? (
                                        <>
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Applied
                                        </>
                                      ) : (
                                        <>
                                          <Target className="mr-2 h-4 w-4" />
                                          Apply Now
                                        </>
                                      )}
                                    </Button>
                                    <Button variant="outline" onClick={() => downloadTemplate(selectedScheme.name)}>
                                      <Download className="mr-2 h-4 w-4" />
                                      Template
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            onClick={() => applyForScheme(scheme.id)}
                            disabled={scheme.applied}
                            className="flex-1"
                          >
                            {scheme.applied ? (
                              <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Applied
                              </>
                            ) : (
                              <>
                                <Target className="mr-1 h-3 w-3" />
                                Apply
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Benefit Calculator Tab */}
          <TabsContent value="calculator" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Benefit Calculator</span>
                  </CardTitle>
                  <CardDescription>Calculate potential benefits based on your business profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="turnover">Annual Turnover (₹)</Label>
                    <Input
                      id="turnover"
                      placeholder="e.g., 50000000"
                      value={calculatorData.annualTurnover}
                      onChange={(e) => setCalculatorData((prev) => ({ ...prev, annualTurnover: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="export">Annual Export Value (₹)</Label>
                    <Input
                      id="export"
                      placeholder="e.g., 30000000"
                      value={calculatorData.exportValue}
                      onChange={(e) => setCalculatorData((prev) => ({ ...prev, exportValue: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employees">Number of Employees</Label>
                    <Input
                      id="employees"
                      placeholder="e.g., 50"
                      value={calculatorData.employeeCount}
                      onChange={(e) => setCalculatorData((prev) => ({ ...prev, employeeCount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="investment">Planned Investment (₹)</Label>
                    <Input
                      id="investment"
                      placeholder="e.g., 10000000"
                      value={calculatorData.investmentAmount}
                      onChange={(e) => setCalculatorData((prev) => ({ ...prev, investmentAmount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calc-category">Scheme Category</Label>
                    <Select
                      value={calculatorData.category}
                      onValueChange={(value) => setCalculatorData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={calculateBenefit} className="w-full">
                    Calculate Benefit
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Calculated Benefits</CardTitle>
                  <CardDescription>Estimated benefits based on your inputs</CardDescription>
                </CardHeader>
                <CardContent>
                  {calculatedBenefit !== null ? (
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-primary/5 rounded-lg">
                        <p className="text-3xl font-bold text-primary">₹{calculatedBenefit.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-2">Estimated Benefit</p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Recommended Schemes:</h4>
                        {filteredSchemes
                          .filter((scheme) => scheme.category === calculatorData.category)
                          .slice(0, 3)
                          .map((scheme) => (
                            <div key={scheme.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{scheme.name}</p>
                                <Badge variant="outline">{scheme.benefit}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{scheme.benefitType}</p>
                            </div>
                          ))}
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> These are estimated calculations. Actual benefits may vary based on
                          detailed eligibility criteria and government policies.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Enter your business details to calculate potential benefits</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track the status of your scheme applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schemes
                    .filter((scheme) => scheme.applied)
                    .map((scheme) => (
                      <div key={scheme.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{scheme.name}</p>
                          <p className="text-sm text-muted-foreground">{scheme.authority}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">{scheme.benefit}</Badge>
                            <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Applied 5 days ago</span>
                        </div>
                      </div>
                    ))}

                  {schemes.filter((scheme) => scheme.applied).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No applications submitted yet</p>
                      <p className="text-sm">Apply for schemes to track them here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
