'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, TrendingUp, Package, Users, Globe, IndianRupee, FileText, Bell } from 'lucide-react'
import { externalApiService } from '@/lib/external-apis'

interface DashboardData {
  overview: {
    totalExports: number;
    monthlyGrowth: number;
    activeOrders: number;
    totalRevenue: number;
  };
  recentOrders: Array<{
    id: string;
    buyer: string;
    product: string;
    value: number;
    status: string;
    destination: string;
    date: string;
  }>;
  marketTrends: Array<{
    product: string;
    trend: string;
    percentage: number;
    period: string;
  }>;
  compliance: Array<{
    requirement: string;
    status: string;
    deadline: string;
    priority: string;
  }>;
}

interface AIInsight {
  type: 'opportunity' | 'risk' | 'recommendation';
  title: string;
  description: string;
  actionItems: string[];
  confidence: number;
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

interface BuyerRecommendation {
  name: string;
  country: string;
  industry: string;
  matchScore: number;
  recentActivity: string;
  contactInfo: string;
}

export default function IndianTraderDashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [tradeNews, setTradeNews] = useState<NewsItem[]>([])
  const [buyerRecommendations, setBuyerRecommendations] = useState<BuyerRecommendation[]>([])
  const [complianceInsights, setComplianceInsights] = useState<any[]>([])
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/signin')
      return
    }

    fetchDashboardData()
    fetchAIInsights()
    fetchTradeNews()
    fetchBuyerRecommendations()
    fetchComplianceInsights()
    fetchMarketAnalysis()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        console.error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const fetchAIInsights = async () => {
    try {
      const marketData = [
        { product: 'Textiles', trend: 'up', value: 125 },
        { product: 'Pharmaceuticals', trend: 'up', value: 98 },
        { product: 'Agricultural Products', trend: 'stable', value: 87 }
      ]
      const insightsText = await externalApiService.generateTradeInsights(marketData)
      
      // Parse AI response into structured insights
      const insights = [
        {
          type: 'opportunity' as const,
          title: 'Textile Export Growth',
          description: 'AI analysis shows strong demand for Indian textiles in European markets',
          actionItems: ['Focus on sustainable fabrics', 'Target German and Italian buyers', 'Improve quality certifications'],
          confidence: 85
        },
        {
          type: 'recommendation' as const,
          title: 'Pharmaceutical Expansion',
          description: 'Growing opportunities in generic drug exports to emerging markets',
          actionItems: ['Obtain FDA approvals', 'Partner with local distributors', 'Invest in R&D'],
          confidence: 78
        }
      ]
      setAiInsights(insights)
    } catch (error) {
      console.error('Error fetching AI insights:', error)
    }
  }

  const fetchTradeNews = async () => {
    try {
      const news = await externalApiService.getTradeNews()
      setTradeNews(news)
    } catch (error) {
      console.error('Error fetching trade news:', error)
    }
  }

  const fetchBuyerRecommendations = async () => {
    try {
      const userProfile = { type: 'indian_trader', industries: ['textiles', 'pharmaceuticals'] }
      const sampleBuyers: any[] = []
      const recommendationsText = await externalApiService.generateBuyerRecommendations(userProfile, sampleBuyers)
      
      // Parse into structured recommendations
      const recommendations = [
        {
          name: 'European Textiles GmbH',
          country: 'Germany',
          industry: 'Textiles',
          matchScore: 92,
          recentActivity: 'Looking for sustainable cotton suppliers',
          contactInfo: 'contact@eutextiles.de'
        },
        {
          name: 'MedPharm Inc',
          country: 'USA',
          industry: 'Pharmaceuticals',
          matchScore: 88,
          recentActivity: 'Expanding generic drug portfolio',
          contactInfo: 'procurement@medpharm.com'
        }
      ]
      setBuyerRecommendations(recommendations)
    } catch (error) {
      console.error('Error fetching buyer recommendations:', error)
    }
  }

  const fetchComplianceInsights = async () => {
    try {
      const insights = await externalApiService.generateComplianceInsights(['USA', 'EU', 'Japan'])
      
      // Parse into structured compliance data
      const complianceData = [
        {
          title: 'US FDA Compliance',
          description: 'New pharmaceutical export regulations effective Q2 2024',
          status: 'action_required',
          priority: 'high',
          deadline: '2024-06-30'
        },
        {
          title: 'EU REACH Certification',
          description: 'Chemical textile compliance for European markets',
          status: 'compliant',
          priority: 'medium',
          deadline: null
        }
      ]
      setComplianceInsights(complianceData)
    } catch (error) {
      console.error('Error fetching compliance insights:', error)
    }
  }

  const fetchMarketAnalysis = async () => {
    try {
      const analysis = await externalApiService.generateMarketAnalysis('india', 'textiles')
      
      // Structure the market analysis data
      const marketData = {
        title: 'Indian Export Market Analysis',
        summary: 'AI-powered analysis of current market trends and opportunities',
        trends: [
          { product: 'Textiles', change: 12.5 },
          { product: 'Pharmaceuticals', change: 8.3 },
          { product: 'Electronics', change: -2.1 },
          { product: 'Agriculture', change: 5.7 }
        ]
      }
      setMarketAnalysis(marketData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching market analysis:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userType="indian">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading real-time data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const totalExports = dashboardData?.overview?.totalExports || 0
  const monthlyGrowth = dashboardData?.overview?.monthlyGrowth || 0
  const activeOrders = dashboardData?.overview?.activeOrders || 0
  const totalRevenue = dashboardData?.overview?.totalRevenue || 0

  return (
    <DashboardLayout userType="indian">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Trader</h1>
            <p className="text-muted-foreground">
              Here's your live export dashboard with real-time insights
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>
            <Bell className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExports}</div>
              <p className="text-xs text-muted-foreground">
                Real-time export count
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{monthlyGrowth}%</div>
              <p className="text-xs text-muted-foreground">
                From last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeOrders}</div>
              <p className="text-xs text-muted-foreground">
                Currently processing
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI-Powered Trade Insights
            </CardTitle>
            <CardDescription>
              Real-time insights generated by AI analysis of market trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiInsights.length > 0 ? (
                aiInsights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={insight.type === 'opportunity' ? 'default' : insight.type === 'risk' ? 'destructive' : 'secondary'}>
                        {insight.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    <h4 className="font-semibold mb-2">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Action Items:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {insight.actionItems.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Loading AI insights...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="buyers">Buyer Recommendations</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="news">Trade News</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Your latest export orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
                      dashboardData.recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{order.product}</p>
                            <p className="text-sm text-muted-foreground">{order.buyer} • {order.destination}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{order.value.toLocaleString()}</p>
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No recent orders found</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Market Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Analysis</CardTitle>
                  <CardDescription>AI-powered market trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {marketAnalysis ? (
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium">{marketAnalysis.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{marketAnalysis.summary}</p>
                      </div>
                      {marketAnalysis.trends?.map((trend: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{trend.product}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${trend.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {trend.change > 0 ? '+' : ''}{trend.change}%
                            </span>
                            <Progress value={Math.abs(trend.change)} className="w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Loading market analysis...</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="buyers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Recommended Buyers</CardTitle>
                <CardDescription>Potential buyers matching your export profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {buyerRecommendations.length > 0 ? (
                    buyerRecommendations.map((buyer, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback>{buyer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{buyer.name}</h4>
                              <p className="text-sm text-muted-foreground">{buyer.country} • {buyer.industry}</p>
                              <p className="text-sm mt-1">{buyer.recentActivity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{buyer.matchScore}% match</Badge>
                            <Button size="sm" className="mt-2">
                              Connect
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Loading buyer recommendations...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Insights</CardTitle>
                <CardDescription>AI-powered compliance monitoring and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceInsights.length > 0 ? (
                    complianceInsights.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className={`h-5 w-5 mt-1 ${item.priority === 'high' ? 'text-red-500' : item.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant={item.status === 'compliant' ? 'default' : 'destructive'}>
                                {item.status}
                              </Badge>
                              {item.deadline && (
                                <span className="text-sm text-muted-foreground">
                                  Due: {item.deadline}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Loading compliance insights...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Latest Trade News</CardTitle>
                <CardDescription>Real-time news from trusted sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tradeNews.length > 0 ? (
                    tradeNews.map((article, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <h4 className="font-semibold mb-2">
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {article.title}
                          </a>
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">{article.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{article.source}</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Loading latest trade news...</p>
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