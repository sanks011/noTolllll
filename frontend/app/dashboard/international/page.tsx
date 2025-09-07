"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

// Sample data for international trader - would come from API
const sampleData = {
  user: {
    name: "Sarah Johnson",
    company: "Global Seafood Imports LLC",
    role: "International Trader",
    sector: "Seafood",
    country: "United States",
  },
  supplierMatches: {
    newMatches: 5,
    totalMatches: 32,
    recentSuppliers: [
      { name: "Odisha Seafood Exports Ltd.", location: "Bhubaneswar, India", product: "Frozen Shrimp", rating: 4.8 },
      { name: "Bengal Prawn Co.", location: "Kolkata, India", product: "Tiger Prawns", rating: 4.6 },
      { name: "Coastal Fisheries Ltd.", location: "Chennai, India", product: "Fish Fillets", rating: 4.7 },
    ],
  },
  tariffOverview: [
    { product: "Frozen Shrimp", hsCode: "030617", currentTariff: "25%", normalTariff: "2.5%", savings: "$45K" },
    { product: "Prawns", hsCode: "030616", currentTariff: "25%", normalTariff: "4.1%", savings: "$32K" },
    { product: "Fish Fillets", hsCode: "030484", currentTariff: "15%", normalTariff: "0%", savings: "$28K" },
  ],
  compliance: {
    overall: 82,
    byCategory: [
      { category: "Import Documentation", percentage: 90 },
      { category: "Quality Standards", percentage: 78 },
      { category: "Customs Clearance", percentage: 85 },
    ],
  },
  collaborationSchemes: {
    available: 3,
    applied: 1,
    totalBenefit: "$125K",
    schemes: [
      { name: "India-US Trade Partnership", benefit: "$50K", deadline: "2024-04-15", type: "Credit" },
      { name: "Seafood Import Incentive", benefit: "$35K", deadline: "2024-05-20", type: "Rebate" },
      { name: "Quality Certification Support", benefit: "$40K", deadline: "2024-03-30", type: "Grant" },
    ],
  },
  impact: {
    dealsClosed: 18,
    costSavings: "$340K",
    volumeImported: "2,450 MT",
    supplierPartners: 12,
  },
}

export default function InternationalTraderDashboard() {
  const [loading, setLoading] = useState(false)

  return (
    <DashboardLayout userType="international">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Welcome back, {sampleData.user.name}</h1>
            <p className="text-muted-foreground">
              {sampleData.user.company} • {sampleData.user.country} • {sampleData.user.sector} Imports
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/market-intelligence">
                <TrendingUp className="mr-2 h-4 w-4" />
                Market Intel
              </Link>
            </Button>
            <Button asChild>
              <Link href="/suppliers">
                <Users className="mr-2 h-4 w-4" />
                Find Suppliers
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{sampleData.impact.costSavings}</p>
                  <p className="text-sm text-muted-foreground">Cost Savings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{sampleData.impact.dealsClosed}</p>
                  <p className="text-sm text-muted-foreground">Deals Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{sampleData.impact.volumeImported}</p>
                  <p className="text-sm text-muted-foreground">Volume Imported</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{sampleData.impact.supplierPartners}</p>
                  <p className="text-sm text-muted-foreground">Supplier Partners</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Indian Suppliers Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Top Indian Suppliers</span>
              </CardTitle>
              <CardDescription>
                {sampleData.supplierMatches.newMatches} new suppliers matched to your requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div>
                  <p className="text-2xl font-bold text-primary">{sampleData.supplierMatches.newMatches}</p>
                  <p className="text-sm text-muted-foreground">New matches</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{sampleData.supplierMatches.totalMatches}</p>
                  <p className="text-sm text-muted-foreground">Total suppliers</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Recent Matches:</p>
                {sampleData.supplierMatches.recentSuppliers.map((supplier, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{supplier.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{supplier.location}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{supplier.product}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge variant="secondary">{supplier.rating}★</Badge>
                        <Badge variant="outline">New</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full" asChild>
                <Link href="/suppliers">
                  View All Suppliers <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Tariff Overview Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Tariff Overview</span>
              </CardTitle>
              <CardDescription>Import tariffs from India vs. normal rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sampleData.tariffOverview.map((item, index) => (
                <div key={item.product} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{item.product}</p>
                      <p className="text-xs text-muted-foreground">HS Code: {item.hsCode}</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Save {item.savings}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-600">Current: {item.currentTariff}</span>
                    <span className="text-green-600">Normal: {item.normalTariff}</span>
                  </div>
                </div>
              ))}
              <Button className="w-full bg-transparent" variant="outline" asChild>
                <Link href="/market-intelligence">
                  View Full Analysis <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Compliance Status Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Import Compliance</span>
              </CardTitle>
              <CardDescription>Overall compliance: {sampleData.compliance.overall}%</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{sampleData.compliance.overall}%</span>
                </div>
                <Progress value={sampleData.compliance.overall} className="h-2" />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">By Category:</p>
                {sampleData.compliance.byCategory.map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <span className="text-sm">{category.category}</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={category.percentage} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground w-10">{category.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full bg-transparent" variant="outline" asChild>
                <Link href="/compliance">
                  Manage Compliance <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Collaboration Schemes Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-primary" />
                <span>Collaboration Schemes</span>
              </CardTitle>
              <CardDescription>
                {sampleData.collaborationSchemes.available} schemes available • Potential benefit:{" "}
                {sampleData.collaborationSchemes.totalBenefit}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{sampleData.collaborationSchemes.available}</p>
                  <p className="text-sm text-green-700">Available</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{sampleData.collaborationSchemes.applied}</p>
                  <p className="text-sm text-blue-700">Applied</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Top Opportunities:</p>
                {sampleData.collaborationSchemes.schemes.slice(0, 2).map((scheme, index) => (
                  <div key={index} className="p-2 bg-muted/30 rounded">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{scheme.name}</p>
                      <Badge variant="outline">{scheme.benefit}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">Deadline: {scheme.deadline}</p>
                      <Badge variant="secondary" className="text-xs">
                        {scheme.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full" asChild>
                <Link href="/collaboration-schemes">
                  Apply for Schemes <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to optimize your import business from India</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-auto p-4 flex-col space-y-2 bg-transparent" variant="outline" asChild>
                <Link href="/suppliers">
                  <Users className="h-6 w-6" />
                  <span>Request Trade Pitch</span>
                  <span className="text-xs text-muted-foreground">Get proposals from suppliers</span>
                </Link>
              </Button>
              <Button className="h-auto p-4 flex-col space-y-2 bg-transparent" variant="outline" asChild>
                <Link href="/opportunities">
                  <Target className="h-6 w-6" />
                  <span>Explore Opportunities</span>
                  <span className="text-xs text-muted-foreground">Find new trade deals</span>
                </Link>
              </Button>
              <Button className="h-auto p-4 flex-col space-y-2 bg-transparent" variant="outline" asChild>
                <Link href="/impact-tracker">
                  <TrendingUp className="h-6 w-6" />
                  <span>Track Savings</span>
                  <span className="text-xs text-muted-foreground">Monitor cost reductions</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Market Insights */}
        <Card>
          <CardHeader>
            <CardTitle>India Trade Insights</CardTitle>
            <CardDescription>Key information for importing from India</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Market Access</span>
                </div>
                <p className="text-sm text-blue-800">
                  India offers preferential access to 15+ product categories under current trade agreements
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Quality Assurance</span>
                </div>
                <p className="text-sm text-green-800">
                  95% of Indian suppliers meet international quality standards with proper certification
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Cost Advantage</span>
                </div>
                <p className="text-sm text-purple-800">
                  Average 20-30% cost savings compared to traditional suppliers in similar markets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
