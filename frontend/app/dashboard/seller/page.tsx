"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import ProfileCompletionModal from "@/components/ProfileCompletionModal"
import { useAuth } from "@/contexts/AuthContext"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  TrendingUp,
  Users,
  Shield,
  Gift,
  DollarSign,
  ArrowUpRight,
  Globe,
  Target,
  Award,
  MapPin,
  Package,
  Ship,
  Edit,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

// Sample data for seller - would come from API
const sampleData = {
  user: {
    name: "Rajesh Kumar",
    company: "Chennai Spices Export Ltd.",
    role: "Seller",
    sector: "Spices",
    country: "India",
  },
  buyerMatches: {
    newMatches: 8,
    totalMatches: 45,
    recentBuyers: [
      { name: "Global Spice Imports", location: "New York, USA", product: "Turmeric", rating: 4.9 },
      { name: "European Spice Co.", location: "Amsterdam, Netherlands", product: "Cardamom", rating: 4.7 },
      { name: "Asian Flavors Ltd.", location: "Tokyo, Japan", product: "Black Pepper", rating: 4.8 },
    ],
  },
  exportMetrics: [
    { product: "Turmeric", hsCode: "091030", volume: "25 MT", value: "$45K", destination: "USA" },
    { product: "Cardamom", hsCode: "090830", volume: "15 MT", value: "$120K", destination: "EU" },
    { product: "Black Pepper", hsCode: "090411", volume: "20 MT", value: "$80K", destination: "Japan" },
  ],
  compliance: {
    overall: 88,
    byCategory: [
      { category: "Export Documentation", percentage: 92 },
      { category: "Quality Certifications", percentage: 90 },
      { category: "Packaging Standards", percentage: 85 },
      { category: "Shipping Requirements", percentage: 85 },
    ],
  },
  marketOpportunities: [
    { market: "USA", opportunity: "High demand for organic turmeric", potential: "$2.5M", growth: "+15%" },
    { market: "EU", opportunity: "Premium cardamom market", potential: "$1.8M", growth: "+12%" },
    { market: "Japan", opportunity: "Black pepper for food industry", potential: "$1.2M", growth: "+8%" },
  ],
  recentOrders: [
    { id: "EXP-001", buyer: "Global Spice Imports", product: "Turmeric", status: "Shipped", value: "$45,000" },
    { id: "EXP-002", buyer: "European Spice Co.", product: "Cardamom", status: "Processing", value: "$120,000" },
    { id: "EXP-003", buyer: "Asian Flavors Ltd.", product: "Black Pepper", status: "Confirmed", value: "$80,000" },
  ],
}

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileCompleted, setProfileCompleted] = useState(false)
  const { user, updateUser } = useAuth()
  const { toast } = useToast()

  // Check if profile is completed
  useEffect(() => {
    if (user) {
      // Use the backend's profileCompleted flag first, with fallback logic
      const backendCompleted = user.profileCompleted === true
      const fallbackCompleted = !!(user.sector && user.sector !== 'Not specified' && 
                                user.hsCode && 
                                user.targetCountries && user.targetCountries.length > 0)
      
      setProfileCompleted(backendCompleted || fallbackCompleted)
    }
  }, [user])

  const handleProfileUpdate = async (profileData: any) => {
    try {
      const response = await apiService.updateProfile(profileData)
      
      // Update the user state in AuthContext with the response data
      if (response.user) {
        updateUser(response.user)
      }
      
      setProfileCompleted(true)
      toast({
        title: "Profile updated successfully!",
        description: "Your business profile has been completed.",
      })
    } catch (error) {
      console.error("Profile update failed:", error)
      toast({
        title: "Error updating profile",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout userType="seller">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {sampleData.user.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Globe className="mr-1 h-3 w-3" />
              {sampleData.user.role} - {sampleData.user.sector}
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Buyers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleData.buyerMatches.newMatches}</div>
              <p className="text-xs text-muted-foreground">+3 from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleData.buyerMatches.totalMatches}</div>
              <p className="text-xs text-muted-foreground">Verified buyers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Export Compliance</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleData.compliance.overall}%</div>
              <p className="text-xs text-muted-foreground">Export readiness</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleData.recentOrders.length}</div>
              <p className="text-xs text-muted-foreground">Export orders</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Buyers */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Buyer Matches</CardTitle>
              <CardDescription>New buyers interested in your products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleData.buyerMatches.recentBuyers.map((buyer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{buyer.name}</p>
                      <p className="text-sm text-muted-foreground">{buyer.location}</p>
                      <p className="text-sm">{buyer.product}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-1">
                        <Award className="h-3 w-3 text-yellow-500" />
                        <span className="text-sm font-medium">{buyer.rating}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Contact Buyer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/buyers">
                  <Button className="w-full">
                    View All Buyers <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Market Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Market Opportunities</CardTitle>
              <CardDescription>Export opportunities by market</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleData.marketOpportunities.map((opportunity, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{opportunity.market}</p>
                      <span className="text-sm font-medium text-green-600">{opportunity.growth}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{opportunity.opportunity}</p>
                    <p className="text-sm font-medium">{opportunity.potential}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Metrics & Compliance */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Export Performance</CardTitle>
              <CardDescription>Your recent export activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleData.exportMetrics.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.product}</p>
                      <p className="text-sm text-muted-foreground">HS Code: {item.hsCode}</p>
                      <p className="text-sm text-muted-foreground">To: {item.destination}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.value}</p>
                      <p className="text-sm text-muted-foreground">{item.volume}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Compliance</CardTitle>
              <CardDescription>Compliance status by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleData.compliance.byCategory.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm">{item.percentage}%</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Export Orders</CardTitle>
            <CardDescription>Your latest export orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleData.recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.buyer}</p>
                    <p className="text-sm">{order.product}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={order.status === "Shipped" ? "default" : order.status === "Processing" ? "secondary" : "outline"}>
                      {order.status}
                    </Badge>
                    <p className="text-sm font-medium">{order.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Complete Profile</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add business sector, HS codes and target markets
            </p>
            <Button onClick={() => setShowProfileModal(true)}>Complete Profile</Button>
          </Card>

          <Card className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Find New Buyers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with verified international buyers
            </p>
            <Link href="/buyers">
              <Button variant="outline">Explore Buyers</Button>
            </Link>
          </Card>

          <Card className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Export Compliance</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage export documentation and certifications
            </p>
            <Link href="/compliance">
              <Button variant="outline">Manage Compliance</Button>
            </Link>
          </Card>

          <Card className="p-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Market Intelligence</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get insights on export opportunities and pricing
            </p>
            <Link href="/market-intelligence">
              <Button variant="outline">View Insights</Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userRole="Seller"
        onProfileUpdate={handleProfileUpdate}
        existingUserData={user}
      />
    </DashboardLayout>
  )
}
