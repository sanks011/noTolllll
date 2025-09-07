import { Suspense } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Target, Users, Building2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

function ImpactTrackerContent() {
  const impactMetrics = [
    {
      title: "Revenue Recovery",
      value: "₹2.4Cr",
      change: "+12.5%",
      trend: "up",
      description: "Total revenue recovered through market diversification",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "New Markets Entered",
      value: "23",
      change: "+8",
      trend: "up",
      description: "Markets successfully penetrated this quarter",
      icon: Target,
      color: "text-blue-600",
    },
    {
      title: "Jobs Retained",
      value: "1,245",
      change: "+156",
      trend: "up",
      description: "Employment preserved through diversification",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Export Volume",
      value: "45,678 MT",
      change: "-2.3%",
      trend: "down",
      description: "Total export volume across all markets",
      icon: Building2,
      color: "text-orange-600",
    },
  ]

  const milestones = [
    {
      title: "First EU Market Entry",
      date: "March 2024",
      description: "Successfully entered German seafood market",
      status: "completed",
      impact: "₹45L revenue",
    },
    {
      title: "Japan Certification",
      date: "April 2024",
      description: "Obtained HACCP certification for Japanese exports",
      status: "completed",
      impact: "₹78L potential",
    },
    {
      title: "UAE Partnership",
      date: "May 2024",
      description: "Established distribution partnership in Dubai",
      status: "in-progress",
      impact: "₹1.2Cr projected",
    },
    {
      title: "Korea Market Research",
      date: "June 2024",
      description: "Conducting feasibility study for Korean market",
      status: "planned",
      impact: "₹2.5Cr potential",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Impact Tracker</h1>
          <p className="text-muted-foreground">
            Monitor your market diversification progress and measure success metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {impactMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span className={`flex items-center ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {metric.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {metric.change}
                    </span>
                    <span>from last month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Progress Tracking */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Market Diversification Progress</CardTitle>
              <CardDescription>Track your progress across different market entry goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>EU Markets</span>
                  <span>3/5 countries</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Asian Markets</span>
                  <span>4/6 countries</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Middle East</span>
                  <span>2/4 countries</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Compliance Certifications</span>
                  <span>8/12 completed</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Impact Timeline</CardTitle>
              <CardDescription>Monthly revenue recovery through diversification efforts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, index) => {
                  const values = [15, 28, 45, 62, 78, 95]
                  return (
                    <div key={month} className="flex items-center space-x-4">
                      <div className="w-8 text-sm text-muted-foreground">{month}</div>
                      <div className="flex-1">
                        <Progress value={values[index]} className="h-2" />
                      </div>
                      <div className="w-16 text-sm font-medium">₹{values[index]}L</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Key Milestones</CardTitle>
            <CardDescription>Track major achievements in your market diversification journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${
                        milestone.status === "completed"
                          ? "bg-green-500"
                          : milestone.status === "in-progress"
                            ? "bg-blue-500"
                            : "bg-gray-300"
                      }`}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <Badge
                        variant={
                          milestone.status === "completed"
                            ? "default"
                            : milestone.status === "in-progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {milestone.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{milestone.date}</span>
                      <span className="font-medium text-green-600">{milestone.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function ImpactTrackerSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function ImpactTrackerPage() {
  return (
    <Suspense fallback={<ImpactTrackerSkeleton />}>
      <ImpactTrackerContent />
    </Suspense>
  )
}
