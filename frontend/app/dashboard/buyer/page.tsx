"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import ProfileCompletionModal from "@/components/ProfileCompletionModal"
import NewsSection from "@/components/NewsSection"
import TradeDataChart from "@/components/TradeDataChart"
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
  Edit,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

export default function BuyerDashboard() {
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
    <DashboardLayout userType="buyer">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Buyer Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.contactPerson || 'User'}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Globe className="mr-1 h-3 w-3" />
              {user?.role || 'Buyer'} - {user?.userType || 'User'}
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Suppliers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Complete profile to see matches</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Verified suppliers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Import compliance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Status */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
              <CardDescription>Complete your profile to unlock personalized features</CardDescription>
            </CardHeader>
            <CardContent>
              {profileCompleted ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Profile Completed</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Great! Your profile is complete. You can now access all features and get personalized supplier recommendations.
                  </p>
                  <Button variant="outline" onClick={() => setShowProfileModal(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Profile Completion</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Complete your profile to get personalized supplier matches and market insights.
                  </p>
                  <Button onClick={() => setShowProfileModal(true)} className="w-full">
                    Complete Profile Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Quick actions to get you started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${profileCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Complete Profile</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="text-sm">Find Suppliers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="text-sm">Send First Inquiry</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* News Section */}
        <NewsSection className="mb-6" />

        {/* Trade Analytics Section */}
        {profileCompleted && (
          <div className="mb-6">
            <TradeDataChart userSector={user?.sector === 'Seafood' ? 'seafood' : user?.sector === 'Textile' ? 'textile' : null} />
          </div>
        )}

        {/* Information Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Market Intelligence</CardTitle>
              <CardDescription>Get insights when you complete your profile</CardDescription>
            </CardHeader>
            <CardContent>
              {profileCompleted ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Market data and insights will appear here based on your target markets and products.
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Complete your profile to see market trends and insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Import requirements and compliance</CardDescription>
            </CardHeader>
            <CardContent>
              {profileCompleted ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Compliance requirements will appear here based on your target markets.
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Complete your profile to see compliance requirements
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your sourcing activities and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">No Activity Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by completing your profile and exploring suppliers
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 text-center">
            {profileCompleted ? (
              <>
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">Profile Complete</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your profile is complete and ready
                </p>
                <Button variant="outline" onClick={() => setShowProfileModal(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </>
            ) : (
              <>
                <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Complete Profile</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add business sector, HS codes and target markets
                </p>
                <Button onClick={() => setShowProfileModal(true)}>Complete Profile</Button>
              </>
            )}
          </Card>

          <Card className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Find Suppliers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Discover verified suppliers matching your requirements
            </p>
            <Link href="/buyers">
              <Button variant={profileCompleted ? "default" : "outline"} disabled={!profileCompleted}>
                Explore Suppliers
              </Button>
            </Link>
          </Card>

          <Card className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Compliance Center</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage import documentation and requirements
            </p>
            <Link href="/compliance">
              <Button variant="outline">Manage Compliance</Button>
            </Link>
          </Card>

          <Card className="p-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Market Intelligence</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get insights on pricing trends and market opportunities
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
        userRole="Buyer"
        onProfileUpdate={handleProfileUpdate}
        existingUserData={user}
      />
    </DashboardLayout>
  )
}
