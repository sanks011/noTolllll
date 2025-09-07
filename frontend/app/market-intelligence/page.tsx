"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Filter, Download, Star, Globe, Package, Target, Loader2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

// Sample market intelligence data
const tariffData = [
  {
    country: "Japan",
    hsCode: "030617",
    product: "Frozen Shrimp",
    currentTariff: "2.5%",
    trend: "down",
    importVolume: "45,000 MT",
    avgPrice: "$12.50/kg",
    competitiveness: 85,
    opportunity: "High",
  },
  {
    country: "European Union",
    hsCode: "030617",
    product: "Frozen Shrimp",
    currentTariff: "4.1%",
    trend: "stable",
    importVolume: "120,000 MT",
    avgPrice: "$11.80/kg",
    competitiveness: 78,
    opportunity: "Medium",
  },
  {
    country: "UAE",
    hsCode: "030617",
    product: "Frozen Shrimp",
    currentTariff: "0%",
    trend: "up",
    importVolume: "25,000 MT",
    avgPrice: "$13.20/kg",
    competitiveness: 92,
    opportunity: "High",
  },
  {
    country: "South Korea",
    hsCode: "030617",
    product: "Frozen Shrimp",
    currentTariff: "3.2%",
    trend: "down",
    importVolume: "32,000 MT",
    avgPrice: "$12.10/kg",
    competitiveness: 81,
    opportunity: "High",
  },
  {
    country: "United Kingdom",
    hsCode: "030617",
    product: "Frozen Shrimp",
    currentTariff: "2.8%",
    trend: "stable",
    importVolume: "18,000 MT",
    avgPrice: "$13.50/kg",
    competitiveness: 75,
    opportunity: "Medium",
  },
]

const pricingTrendsData = [
  { month: "Jan 2024", japan: 12.2, eu: 11.5, uae: 13.0, korea: 11.8 },
  { month: "Feb 2024", japan: 12.4, eu: 11.6, uae: 13.1, korea: 12.0 },
  { month: "Mar 2024", japan: 12.1, eu: 11.8, uae: 13.3, korea: 12.2 },
  { month: "Apr 2024", japan: 12.5, eu: 11.7, uae: 13.2, korea: 12.1 },
  { month: "May 2024", japan: 12.3, eu: 11.9, uae: 13.4, korea: 12.3 },
  { month: "Jun 2024", japan: 12.6, eu: 12.0, uae: 13.1, korea: 12.0 },
]

const demandVolumeData = [
  { country: "Japan", volume: 45000, growth: 8.5 },
  { country: "EU", volume: 120000, growth: 12.3 },
  { country: "UAE", volume: 25000, growth: 15.2 },
  { country: "Korea", volume: 32000, growth: 6.8 },
  { country: "UK", volume: 18000, growth: 4.2 },
]

const competitivenessData = [
  { name: "Your Price", value: 65, color: "#2C7BE5" },
  { name: "Market Average", value: 35, color: "#E5E7EB" },
]

export default function MarketIntelligencePage() {
  const [selectedHsCode, setSelectedHsCode] = useState("030617")
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [shortlistedMarkets, setShortlistedMarkets] = useState<string[]>([])
  const [marketData, setMarketData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchMarketData = async () => {
      // Don't fetch if user is not authenticated
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await apiService.getMarketIntelligence()
        
        // Handle the structured API response
        if (response?.success && response?.data?.tariffs) {
          setMarketData(response.data.tariffs.map((item: any) => ({
            ...item,
            country: item.country,
            hsCode: item.hsCode || "030617",
            product: item.product || "Seafood Product",
            currentTariff: item.tariffRate || "N/A",
            trend: item.trend || "stable",
            importVolume: item.importVolume || "N/A",
            avgPrice: item.avgPrice || "N/A",
            competitiveness: item.competitiveness || Math.round(Math.random() * 40 + 60),
            opportunity: item.marketPotential || "Medium",
          })))
        } else {
          console.warn('Unexpected API response structure:', response)
          setMarketData(tariffData) // Fall back to sample data
        }
      } catch (error: any) {
        console.error('Error fetching market intelligence:', error)
        toast({
          title: "Error loading market data",
          description: "Using sample data. Please check your connection.",
          variant: "destructive",
        })
        // Fall back to sample data
        setMarketData(tariffData)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
  }, [toast, user])

  const toggleCountrySelection = (country: string) => {
    setSelectedCountries((prev) => (prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]))
  }

  const addToShortlist = (country: string) => {
    if (!shortlistedMarkets.includes(country)) {
      setShortlistedMarkets((prev) => [...prev, country])
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  const getOpportunityBadge = (opportunity: string) => {
    const variants = {
      High: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-red-100 text-red-800",
    }
    return <Badge className={variants[opportunity as keyof typeof variants] || variants.Low}>{opportunity}</Badge>
  }

  // Use real data if available, otherwise fallback to sample data
  const displayData = marketData.length > 0 ? marketData : tariffData

  if (loading) {
    return (
      <DashboardLayout userType="indian">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading market intelligence...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="indian">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Market Intelligence</h1>
            <p className="text-muted-foreground">
              Analyze global markets, tariffs, and opportunities for your products
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button>
              <Star className="mr-2 h-4 w-4" />
              Shortlist ({shortlistedMarkets.length})
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Market Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hs-code">HS Code</Label>
                <Select value={selectedHsCode} onValueChange={setSelectedHsCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select HS Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="030617">030617 - Frozen Shrimp</SelectItem>
                    <SelectItem value="030616">030616 - Prawns</SelectItem>
                    <SelectItem value="520100">520100 - Cotton</SelectItem>
                    <SelectItem value="630790">630790 - Textiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seafood">Seafood</SelectItem>
                    <SelectItem value="textile">Textile</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asia">Asia Pacific</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="americas">Americas</SelectItem>
                    <SelectItem value="middle-east">Middle East</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="opportunity">Opportunity Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tariffs" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tariffs">Tariff Analysis</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Trends</TabsTrigger>
            <TabsTrigger value="demand">Demand Volume</TabsTrigger>
            <TabsTrigger value="competitiveness">Competitiveness</TabsTrigger>
          </TabsList>

          {/* Tariff Analysis Tab */}
          <TabsContent value="tariffs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tariff Comparison Table</CardTitle>
                <CardDescription>
                  Compare tariff rates across different markets for HS Code {selectedHsCode}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Tariff</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Import Volume</TableHead>
                      <TableHead>Avg Price</TableHead>
                      <TableHead>Competitiveness</TableHead>
                      <TableHead>Opportunity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayData.map((row) => (
                      <TableRow key={row.country}>
                        <TableCell className="font-medium">{row.country}</TableCell>
                        <TableCell>{row.product}</TableCell>
                        <TableCell>{row.currentTariff}</TableCell>
                        <TableCell>{getTrendIcon(row.trend)}</TableCell>
                        <TableCell>{row.importVolume}</TableCell>
                        <TableCell>{row.avgPrice}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${row.competitiveness}%` }}
                              />
                            </div>
                            <span className="text-sm">{row.competitiveness}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getOpportunityBadge(row.opportunity)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToShortlist(row.country)}
                            disabled={shortlistedMarkets.includes(row.country)}
                          >
                            {shortlistedMarkets.includes(row.country) ? "Added" : "Shortlist"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Trends Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Price Trends Analysis</CardTitle>
                <CardDescription>Historical pricing trends across key markets (USD per kg)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pricingTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="japan" stroke="#2C7BE5" strokeWidth={2} name="Japan" />
                      <Line type="monotone" dataKey="eu" stroke="#10B981" strokeWidth={2} name="European Union" />
                      <Line type="monotone" dataKey="uae" stroke="#F59E0B" strokeWidth={2} name="UAE" />
                      <Line type="monotone" dataKey="korea" stroke="#EF4444" strokeWidth={2} name="South Korea" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Price Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Highest Price Market</p>
                    <p className="text-lg font-bold text-green-900">UAE - $13.40/kg</p>
                    <p className="text-xs text-green-700">+2.3% from last month</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Most Stable Market</p>
                    <p className="text-lg font-bold text-blue-900">European Union</p>
                    <p className="text-xs text-blue-700">Low volatility, steady demand</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Growth Opportunity</p>
                    <p className="text-lg font-bold text-yellow-900">South Korea</p>
                    <p className="text-xs text-yellow-700">Emerging demand, competitive pricing</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Price Forecast</CardTitle>
                  <CardDescription>Expected price movements (next 3 months)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">Japan</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">+3.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">European Union</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">+1.8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">UAE</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-gray-400 rounded-full" />
                      <span className="text-sm font-medium">Stable</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">South Korea</span>
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">-1.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Demand Volume Tab */}
          <TabsContent value="demand" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import Demand by Market</CardTitle>
                <CardDescription>Annual import volumes and growth rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demandVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="volume" fill="#2C7BE5" name="Import Volume (MT)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Package className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">240,000 MT</p>
                      <p className="text-sm text-muted-foreground">Total Market Size</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">9.4%</p>
                      <p className="text-sm text-muted-foreground">Average Growth Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Target className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">15%</p>
                      <p className="text-sm text-muted-foreground">Market Share Potential</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Competitiveness Tab */}
          <TabsContent value="competitiveness" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Competitiveness Score</CardTitle>
                  <CardDescription>How your pricing compares to market average</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={competitivenessData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {competitivenessData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">82/100</p>
                    <p className="text-sm text-muted-foreground">Competitiveness Score</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Competitive Analysis</CardTitle>
                  <CardDescription>Key factors affecting your market position</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Price Competitiveness</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }} />
                        </div>
                        <span className="text-sm">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Quality Standards</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "92%" }} />
                        </div>
                        <span className="text-sm">92%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Delivery Speed</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "78%" }} />
                        </div>
                        <span className="text-sm">78%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Certification</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "88%" }} />
                        </div>
                        <span className="text-sm">88%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Improve delivery speed to match UAE standards</li>
                      <li>• Consider premium pricing in Japan market</li>
                      <li>• Leverage quality advantage in EU market</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Market Shortlist</CardTitle>
                <CardDescription>
                  {shortlistedMarkets.length > 0
                    ? `You have shortlisted ${shortlistedMarkets.length} markets`
                    : "Add markets to your shortlist for detailed analysis"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shortlistedMarkets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shortlistedMarkets.map((market) => {
                      const marketInfo = displayData.find((d) => d.country === market)
                      return (
                        <div key={market} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{market}</h4>
                            {getOpportunityBadge(marketInfo?.opportunity || "Medium")}
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Tariff: {marketInfo?.currentTariff}</p>
                            <p>Volume: {marketInfo?.importVolume}</p>
                            <p>Price: {marketInfo?.avgPrice}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No markets shortlisted yet</p>
                    <p className="text-sm">Go to Tariff Analysis tab to add markets to your shortlist</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
