"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Shield,
  DollarSign,
  TrendingUp,
  Globe,
  Settings,
  FileText,
  Upload,
  BarChart3,
  UserCheck,
  AlertCircle,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

// Sample admin data
const adminData = {
  platformMetrics: {
    totalUsers: 1247,
    totalBuyers: 586,
    totalSellers: 661,
    activeUsers: 892,
    totalTransactions: 2341,
    totalRevenue: "$450K",
  },
  recentUsers: [
    { name: "Sarah Johnson", company: "Global Seafood LLC", role: "Buyer", country: "USA", status: "Active" },
    { name: "Rajesh Kumar", company: "Chennai Spices Ltd.", role: "Seller", country: "India", status: "Pending" },
    { name: "Ahmed Hassan", company: "Dubai Traders", role: "Buyer", country: "UAE", status: "Active" },
  ],
  systemAlerts: [
    { type: "warning", message: "High server load detected", time: "2 hours ago" },
    { type: "info", message: "Weekly backup completed", time: "1 day ago" },
    { type: "error", message: "Payment gateway timeout", time: "3 hours ago" },
  ],
  revenueByRegion: [
    { region: "North America", revenue: "$180K", users: 245 },
    { region: "Europe", revenue: "$125K", users: 186 },
    { region: "Asia", revenue: "$95K", users: 412 },
    { region: "Others", revenue: "$50K", users: 104 },
  ],
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform management and analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="destructive" className="px-3 py-1">
              <Shield className="mr-1 h-3 w-3" />
              Administrator
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminData.platformMetrics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminData.platformMetrics.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">71.5% of total users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminData.platformMetrics.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminData.platformMetrics.totalTransactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* User Distribution */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Breakdown of buyers vs sellers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Buyers</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{adminData.platformMetrics.totalBuyers}</p>
                    <p className="text-xs text-muted-foreground">47% of users</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Sellers</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{adminData.platformMetrics.totalSellers}</p>
                    <p className="text-xs text-muted-foreground">53% of users</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adminData.systemAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <AlertCircle className={`h-4 w-4 ${
                      alert.type === 'error' ? 'text-red-500' : 
                      alert.type === 'warning' ? 'text-yellow-500' : 
                      'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Registrations</CardTitle>
                <CardDescription>Latest users who joined the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData.recentUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.company}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{user.country}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                          {user.status}
                        </Badge>
                        <div className="space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Data Upload</CardTitle>
                  <CardDescription>Upload tariff rates and trade data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Tariff Data (CSV)
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Price Trends (CSV)
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Trade Documents
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Sources</CardTitle>
                  <CardDescription>Manage external data integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">UN Comtrade API</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">WTO Tariff Database</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">News API</span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Region</CardTitle>
                <CardDescription>Platform revenue breakdown by geographic region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData.revenueByRegion.map((region, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{region.region}</p>
                        <p className="text-sm text-muted-foreground">{region.users} users</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{region.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>General platform configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    General Settings
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Shield className="mr-2 h-4 w-4" />
                    Security Settings
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Globe className="mr-2 h-4 w-4" />
                    Localization Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Maintenance</CardTitle>
                  <CardDescription>System maintenance and monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    System Health
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    System Logs
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Database Management
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
