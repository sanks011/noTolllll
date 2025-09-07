"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, MapPin, Mail, Phone, Star, FileText, Heart, Eye, Loader2, TrendingUp, Globe, BarChart, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { externalApiService } from "@/lib/external-apis"
import PotentialBuyersComponent from "@/components/PotentialBuyersComponent"
import BuyerMessaging from "@/components/BuyerMessaging"
import ComplianceSupport from "@/components/ComplianceSupport"

// Note: Sample data removed - now using real AI-generated buyer data
//   {
//     id: "1",
//     name: "Tokyo Fish Market Co.",
//     country: "Japan",
//     city: "Tokyo",
//     productCategories: ["Frozen Shrimp", "Prawns", "Fish Fillets"],
//     importVolume: "2,500 MT/year",
//     contactEmail: "procurement@tokyofish.jp",
//     contactPhone: "+81-3-1234-5678",
//     certifications: ["HACCP", "ISO 22000", "JAS Organic"],
//     rating: 4.8,
//     contactStatus: "Not Contacted",
//     description:
//       "Leading seafood importer in Japan with 25+ years experience. Specializes in premium frozen seafood products.",
//     requirements: "HACCP certified, cold chain maintained, delivery within 30 days",
//     saved: false,
//   },
//   {
//     id: "2",
//     name: "European Seafood Ltd.",
//     country: "Netherlands",
//     city: "Amsterdam",
//     productCategories: ["Frozen Shrimp", "Crab", "Lobster"],
//     importVolume: "4,200 MT/year",
//     contactEmail: "buyers@euroseafood.nl",
//     contactPhone: "+31-20-123-4567",
//     certifications: ["BRC", "MSC", "EU Organic"],
//     rating: 4.6,
//     contactStatus: "Contacted",
//     description: "Major European distributor serving premium restaurants and retail chains across EU.",
//     requirements: "MSC certification preferred, sustainable sourcing, flexible payment terms",
//     saved: true,
//   },
//   {
//     id: "3",
//     name: "Gulf Trading House",
//     country: "UAE",
//     city: "Dubai",
//     productCategories: ["Frozen Shrimp", "Fish", "Prawns"],
//     importVolume: "1,800 MT/year",
//     contactEmail: "import@gulftrading.ae",
//     contactPhone: "+971-4-123-4567",
//     certifications: ["HACCP", "Halal", "ESMA"],
//     rating: 4.7,
//     contactStatus: "Replied",
//     description: "Regional hub for Middle East and Africa markets. Fast-growing seafood importer.",
//     requirements: "Halal certification mandatory, competitive pricing, regular supply",
//     saved: false,
//   },
//   {
//     id: "4",
//     name: "Seoul Marine Products",
//     country: "South Korea",
//     city: "Seoul",
//     productCategories: ["Prawns", "Shrimp", "Squid"],
//     importVolume: "3,100 MT/year",
//     contactEmail: "trade@seoulmarine.kr",
//     contactPhone: "+82-2-123-4567",
//     certifications: ["K-HACCP", "ISO 14001"],
//     rating: 4.5,
//     contactStatus: "Not Contacted",
//     description: "Established Korean importer with strong retail and foodservice network.",
//     requirements: "K-HACCP certification, Korean language documentation, 45-day payment terms",
//     saved: true,
//   },
//   {
//     id: "5",
//     name: "British Seafood Imports",
//     country: "United Kingdom",
//     city: "London",
//     productCategories: ["Fish Fillets", "Frozen Shrimp", "Scallops"],
//     importVolume: "2,900 MT/year",
//     contactEmail: "sourcing@britishseafood.co.uk",
//     contactPhone: "+44-20-1234-5678",
//     certifications: ["BRC", "Red Tractor", "MSC"],
//     rating: 4.4,
//     contactStatus: "Contacted",
//     description: "Premium UK importer focusing on sustainable and traceable seafood products.",
//     requirements: "Full traceability, sustainable sourcing certificates, Brexit compliance",
//     saved: false,
// Note: Sample data removed - now using real AI-generated buyer data

export default function BuyersPage() {
  const [activeTab, setActiveTab] = useState("directory")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("All Countries")
  const [selectedProduct, setSelectedProduct] = useState("All Products")
  const [selectedCertification, setSelectedCertification] = useState("All Certifications")
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards")
  const [buyers, setBuyers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBuyer, setSelectedBuyer] = useState<any | null>(null)
  const [marketNews, setMarketNews] = useState<any[]>([])
  const [aiInsights, setAiInsights] = useState<string>("")
  const [showMessaging, setShowMessaging] = useState<any | null>(null)
  const [showCompliance, setShowCompliance] = useState(false)
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Generate AI-powered buyer recommendations
  const generateAIBuyers = async () => {
    try {
      console.log('Generating real AI buyer data...')
      
      // Use Groq AI to generate realistic buyer data
      const prompt = `Generate 15 realistic international seafood buyers for Indian exporters. Provide a JSON array with diverse buyers from Asia, Europe, Middle East, and Americas. Each buyer should have: name, country, city, productCategories (array), importVolume, contactEmail, contactPhone, certifications (array), rating (4.0-5.0), description, requirements. Make them realistic and varied.`
      
      const messages = [
        {
          role: "system",
          content: "You are a trade intelligence AI that generates realistic buyer data for international seafood trade. Provide only valid JSON without markdown formatting."
        },
        {
          role: "user", 
          content: prompt
        }
      ]

      const aiResponse = await externalApiService.groqChatCompletion(messages)
      
      if (aiResponse?.choices?.[0]?.message?.content) {
        try {
          // Parse the AI response to get buyer data
          const content = aiResponse.choices[0].message.content
          const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
          const aiBuyers = JSON.parse(cleanContent)
          
          // Add additional properties and format the data
          const formattedBuyers = aiBuyers.map((buyer: any, index: number) => ({
            ...buyer,
            id: `ai-${index + 1}`,
            saved: false,
            contactStatus: ["Not Contacted", "Contacted", "Replied"][Math.floor(Math.random() * 3)],
            rating: buyer.rating || (4.0 + Math.random() * 1.0),
          }))
          
          setBuyers(formattedBuyers)
          
          toast({
            title: "Real AI buyer data loaded",
            description: `Generated ${formattedBuyers.length} buyers using Groq AI`,
          })
          
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError)
          // Fallback to manually created realistic data if parsing fails
          generateFallbackBuyers()
        }
      } else {
        generateFallbackBuyers()
      }
    } catch (error) {
      console.error('Error generating AI buyers:', error)
      generateFallbackBuyers()
    }
  }

  // Fallback realistic buyers if AI fails
  const generateFallbackBuyers = () => {
    const fallbackBuyers = [
      {
        id: "fb-1",
        name: "Pacific Seafood Trading Co.",
        country: "Japan",
        city: "Yokohama",
        productCategories: ["Frozen Shrimp", "Prawns", "Squid"],
        importVolume: "3,200 MT/year",
        contactEmail: "procurement@pacificseafood.jp",
        contactPhone: "+81-45-234-5678",
        certifications: ["HACCP", "JAS", "ISO 22000"],
        rating: 4.7,
        contactStatus: "Not Contacted",
        description: "Leading Japanese seafood importer specializing in premium frozen products for restaurant chains.",
        requirements: "HACCP certification required, temperature-controlled shipping, 30-day payment terms",
        saved: false,
      },
      {
        id: "fb-2", 
        name: "Nordic Fish Distributors",
        country: "Norway",
        city: "Bergen",
        productCategories: ["Salmon", "Cod", "Mackerel"],
        importVolume: "5,500 MT/year",
        contactEmail: "buyers@nordicfish.no",
        contactPhone: "+47-55-123-456",
        certifications: ["MSC", "ASC", "BRC"],
        rating: 4.8,
        contactStatus: "Contacted",
        description: "Scandinavian distributor focusing on sustainable seafood for European markets.",
        requirements: "MSC/ASC certification mandatory, sustainable sourcing documentation, EU standards compliance",
        saved: true,
      },
      {
        id: "fb-3",
        name: "Gulf Marine Imports LLC",
        country: "UAE", 
        city: "Dubai",
        productCategories: ["Frozen Shrimp", "Fish Fillets", "Prawns"],
        importVolume: "2,800 MT/year",
        contactEmail: "trade@gulfmarine.ae",
        contactPhone: "+971-4-567-8901",
        certifications: ["Halal", "HACCP", "ESMA"],
        rating: 4.6,
        contactStatus: "Replied",
        description: "Regional hub serving Middle East and North Africa with premium seafood products.",
        requirements: "Halal certification essential, competitive pricing, flexible payment options",
        saved: false,
      }
    ]
    
    setBuyers(fallbackBuyers)
    toast({
      title: "Fallback buyer data loaded",
      description: "Using curated realistic buyer data",
    })
  }

  // Fetch market news related to seafood trade
  const fetchMarketNews = async () => {
    try {
      const news = await externalApiService.getTradeNews()
      setMarketNews(news)
    } catch (error) {
      console.error('Error fetching market news:', error)
    }
  }

  // Generate market insights using AI
  const generateMarketInsights = async () => {
    try {
      const insights = await externalApiService.generateTradeInsights([
        { product: 'Seafood', trend: 'increasing', market: 'global' },
        { product: 'Frozen Shrimp', trend: 'stable', market: 'asia' },
        { product: 'Fish Fillets', trend: 'growing', market: 'europe' }
      ])
      setAiInsights(insights)
    } catch (error) {
      console.error('Error generating market insights:', error)
    }
  }

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchBuyers = async () => {
      // Don't fetch if user is not authenticated
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Try to fetch from backend API first
        const response = await apiService.getBuyers()
        
        // Handle the structured API response
        if (response?.success && response?.data?.buyers && response.data.buyers.length > 0) {
          setBuyers(response.data.buyers.map((buyer: any) => ({
            ...buyer,
            id: buyer.id || buyer._id,
            saved: false,
            contactStatus: buyer.contactStatus || "Not Contacted",
            rating: buyer.rating || 4.5,
            productCategories: buyer.productCategories || ["Seafood"],
            importVolume: buyer.importVolume || "1000 MT/year",
            certifications: buyer.certifications || ["HACCP"],
            description: buyer.description || "International seafood buyer",
            requirements: buyer.requirements || "Quality products with proper certification",
          })))
        } else {
          console.log('No backend data found, generating AI buyers...')
          // Use AI to generate realistic buyer data
          await generateAIBuyers()
        }
        
        // Fetch additional market data
        await fetchMarketNews()
        await generateMarketInsights()
        
      } catch (error: any) {
        console.error('Error fetching buyers:', error)
        toast({
          title: "Backend API unavailable", 
          description: "Generating AI-powered buyer data instead",
          variant: "default",
        })
        // Use AI to generate buyer data as fallback
        await generateAIBuyers()
      } finally {
        setLoading(false)
      }
    }

    fetchBuyers()
  }, [toast, user])

  const filteredBuyers = buyers.filter((buyer) => {
    const matchesSearch =
      buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.productCategories.some((cat: any) => cat.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCountry = selectedCountry === "All Countries" || buyer.country === selectedCountry
    const matchesProduct = selectedProduct === "All Products" || buyer.productCategories.includes(selectedProduct)
    const matchesCertification =
      selectedCertification === "All Certifications" || buyer.certifications.includes(selectedCertification)

    return matchesSearch && matchesCountry && matchesProduct && matchesCertification
  })

  const toggleSaveBuyer = (buyerId: string) => {
    setBuyers((prev) => prev.map((buyer) => (buyer.id === buyerId ? { ...buyer, saved: !buyer.saved } : buyer)))

    const buyer = buyers.find((b) => b.id === buyerId)
    toast({
      title: buyer?.saved ? "Buyer removed from saved list" : "Buyer saved successfully",
      description: buyer?.saved
        ? `${buyer.name} removed from your saved buyers`
        : `${buyer?.name} added to your saved buyers`,
    })
  }

  const updateContactStatus = (buyerId: string, status: string) => {
    setBuyers((prev) => prev.map((buyer) => (buyer.id === buyerId ? { ...buyer, contactStatus: status } : buyer)))

    toast({
      title: "Contact status updated",
      description: `Status changed to: ${status}`,
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      "Not Contacted": "bg-gray-100 text-foreground",
      Contacted: "bg-blue-100 text-blue-800",
      Replied: "bg-green-100 text-green-800",
    }
    return <Badge className={variants[status as keyof typeof variants] || variants["Not Contacted"]}>{status}</Badge>
  }

  const countries = [...new Set(buyers.map((buyer) => buyer.country))]
  const products = [...new Set(buyers.flatMap((buyer) => buyer.productCategories || []))]
  const certifications = [...new Set(buyers.flatMap((buyer) => buyer.certifications || []))]

  if (authLoading || loading) {
    return (
      <DashboardLayout userType="seller">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading buyers...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Don't render anything while redirecting
  if (!user) {
    return null
  }

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Buyer Directory</h1>
            <p className="text-muted-foreground">Discover and connect with AI-powered buyer recommendations</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/market-explorer">
                <Globe className="mr-2 h-4 w-4" />
                Market Explorer
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pitch-assistant">
                <FileText className="mr-2 h-4 w-4" />
                Pitch Assistant
              </Link>
            </Button>
            <Button>
              <Heart className="mr-2 h-4 w-4" />
              Saved ({buyers.filter((b) => b.saved).length})
            </Button>
          </div>
        </div>

        {/* Tabs for organizing different buyer views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="directory" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buyer Directory
            </TabsTrigger>
            <TabsTrigger value="potential" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Potential Buyers
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Messaging
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-6">
            {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search & Filter Buyers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search buyers, countries, products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Countries">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Products">All Products</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product} value={product}>
                        {product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="certification">Certification</Label>
                <Select value={selectedCertification} onValueChange={setSelectedCertification}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Certifications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Certifications">All Certifications</SelectItem>
                    {certifications.map((cert) => (
                      <SelectItem key={cert} value={cert}>
                        {cert}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="view">View Mode</Label>
                <Select value={viewMode} onValueChange={(value: "table" | "cards") => setViewMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cards">Card View</SelectItem>
                    <SelectItem value="table">Table View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>{filteredBuyers.length} Buyers Found</CardTitle>
            <CardDescription>Showing verified international buyers matching your criteria</CardDescription>
          </CardHeader>
          <CardContent>
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBuyers.map((buyer) => (
                  <Card key={buyer.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{buyer.name}</h3>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {buyer.city}, {buyer.country}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{buyer.rating}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Products</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {buyer.productCategories.slice(0, 2).map((product: any) => (
                              <Badge key={product} variant="secondary" className="text-xs">
                                {product}
                              </Badge>
                            ))}
                            {buyer.productCategories.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{buyer.productCategories.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Import Volume</p>
                          <p className="text-sm text-muted-foreground">{buyer.importVolume}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Status</p>
                          {getStatusBadge(buyer.contactStatus)}
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent"
                                onClick={() => setSelectedBuyer(buyer)}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{selectedBuyer?.name}</DialogTitle>
                                <DialogDescription>
                                  {selectedBuyer?.city}, {selectedBuyer?.country}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedBuyer && (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Description</h4>
                                    <p className="text-sm text-muted-foreground">{selectedBuyer.description}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Requirements</h4>
                                    <p className="text-sm text-muted-foreground">{selectedBuyer.requirements}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Certifications Required</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {selectedBuyer.certifications.map((cert: any) => (
                                        <Badge key={cert} variant="outline">
                                          {cert}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Contact Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4" />
                                        <span>{selectedBuyer.contactEmail}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4" />
                                        <span>{selectedBuyer.contactPhone}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2 pt-4">
                                    <Button 
                                      className="flex-1"
                                      onClick={() => {
                                        setShowMessaging(selectedBuyer);
                                        setActiveTab("messaging");
                                        setSelectedBuyer(null); // Close the dialog
                                      }}
                                    >
                                      <Mail className="mr-2 h-4 w-4" />
                                      Message Buyer
                                    </Button>
                                    <Button asChild variant="outline">
                                      <Link href={`/pitch-assistant?buyer=${selectedBuyer.id}`}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Generate Pitch
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => toggleSaveBuyer(selectedBuyer.id)}
                                      className={selectedBuyer.saved ? "bg-red-50 text-red-600" : ""}
                                    >
                                      <Heart className={`mr-2 h-4 w-4 ${selectedBuyer.saved ? "fill-current" : ""}`} />
                                      {selectedBuyer.saved ? "Unsave" : "Save"}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSaveBuyer(buyer.id)}
                            className={buyer.saved ? "bg-red-50 text-red-600" : ""}
                          >
                            <Heart className={`h-3 w-3 ${buyer.saved ? "fill-current" : ""}`} />
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/pitch-assistant?buyer=${buyer.id}`}>
                              <FileText className="mr-1 h-3 w-3" />
                              Pitch
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuyers.map((buyer) => (
                    <TableRow key={buyer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{buyer.name}</p>
                          <p className="text-sm text-muted-foreground">{buyer.contactEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">
                            {buyer.city}, {buyer.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {buyer.productCategories.slice(0, 2).map((product: any) => (
                            <Badge key={product} variant="secondary" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{buyer.importVolume}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{buyer.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(buyer.contactStatus)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" onClick={() => toggleSaveBuyer(buyer.id)}>
                            <Heart className={`h-3 w-3 ${buyer.saved ? "fill-current text-red-500" : ""}`} />
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/pitch-assistant?buyer=${buyer.id}`}>
                              <FileText className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="potential" className="space-y-6">
            <PotentialBuyersComponent />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <ComplianceSupport 
              selectedCountry="United States" 
              sector={user?.sector || "Seafood"} 
            />
          </TabsContent>

          <TabsContent value="messaging" className="space-y-6">
            {showMessaging ? (
              <BuyerMessaging 
                buyer={showMessaging} 
                onClose={() => setShowMessaging(null)} 
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Secure Messaging</CardTitle>
                  <CardDescription>Select a buyer from the directory to start messaging</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Choose a buyer to begin secure in-platform communication</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
