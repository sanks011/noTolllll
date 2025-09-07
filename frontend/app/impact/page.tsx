'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, DollarSign, Globe, Users, Award, Target, Share2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import dynamic from 'next/dynamic'

// Import charts dynamically to avoid SSR issues
const ProgressChart = dynamic(() => import('@/components/ImpactCharts').then(mod => ({ default: mod.ProgressChart })), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 animate-pulse rounded"></div>
});

const MarketChart = dynamic(() => import('@/components/ImpactCharts').then(mod => ({ default: mod.MarketChart })), { 
  ssr: false,
  loading: () => <div className="h-[200px] bg-gray-100 animate-pulse rounded"></div>
});

const personalMetrics = [
  {
    label: "Revenue Recovered",
    value: "₹2.4M",
    change: "+45%",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    label: "New Markets Entered",
    value: "5",
    change: "+2",
    icon: Globe,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    label: "Orders Secured",
    value: "23",
    change: "+12",
    icon: Target,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    label: "Buyers Connected",
    value: "18",
    change: "+8",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
]

const communityImpact = [
  { label: "Total Revenue Recovered", value: "₹156M", members: "2,847 exporters" },
  { label: "Markets Diversified", value: "23", members: "across 15 countries" },
  { label: "Success Stories", value: "156", members: "shared experiences" },
  { label: "Relief Schemes Applied", value: "89", members: "₹45M in benefits" },
]

const monthlyProgress = [
  { month: "Jan", revenue: 0.2, orders: 2, buyers: 1 },
  { month: "Feb", revenue: 0.5, orders: 4, buyers: 3 },
  { month: "Mar", revenue: 0.8, orders: 7, buyers: 5 },
  { month: "Apr", revenue: 1.2, orders: 12, buyers: 8 },
  { month: "May", revenue: 1.8, orders: 18, buyers: 14 },
  { month: "Jun", revenue: 2.4, orders: 23, buyers: 18 },
]

const marketDistribution = [
  { name: "Japan", value: 35, color: "#2C7BE5" },
  { name: "EU", value: 28, color: "#00D2FF" },
  { name: "Korea", value: 20, color: "#7C3AED" },
  { name: "UAE", value: 12, color: "#F59E0B" },
  { name: "Others", value: 5, color: "#EF4444" },
]

const milestones = [
  {
    title: "First International Order",
    description: "Secured ₹2.5L order from Japanese buyer",
    date: "March 15, 2024",
    achieved: true,
  },
  {
    title: "EU Market Entry",
    description: "Completed compliance for European markets",
    date: "April 22, 2024",
    achieved: true,
  },
  {
    title: "₹5M Revenue Target",
    description: "On track to achieve annual revenue goal",
    date: "December 31, 2024",
    achieved: false,
    progress: 48,
  },
]

export default function ImpactPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Impact Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your journey and celebrate achievements</p>
          </div>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share Success Story
          </Button>
        </div>

        {/* Personal Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {personalMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-green-700 bg-green-50">
                    {metric.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart data={monthlyProgress} />
            </CardContent>
          </Card>

          {/* Market Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Market Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <MarketChart data={marketDistribution} />
              <div className="mt-4 space-y-2">
                {marketDistribution.map((market, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: market.color }} />
                      <span>{market.name}</span>
                    </div>
                    <span className="font-medium">{market.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Milestones & Community Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary" />
                <span>Milestones</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border">
                  <div className={`w-4 h-4 rounded-full mt-1 ${milestone.achieved ? "bg-green-500" : "bg-gray-300"}`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{milestone.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{milestone.date}</span>
                      {milestone.progress && (
                        <div className="flex items-center space-x-2">
                          <Progress value={milestone.progress} className="w-20" />
                          <span className="text-xs text-muted-foreground">{milestone.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Community Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Community Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {communityImpact.map((impact, index) => (
                <div key={index} className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">{impact.value}</p>
                      <p className="text-sm font-medium text-foreground">{impact.label}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{impact.members}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Success Story Prompt */}
        <Card className="bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Share Your Success Story</h3>
                <p className="text-muted-foreground mt-1">
                  Inspire other exporters by sharing how noToll helped you overcome challenges
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <Share2 className="h-4 w-4 mr-2" />
                Share Story
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
