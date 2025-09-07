'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, AlertTriangle, Globe, DollarSign, BarChart3, Zap, Brain, Activity } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { getTariffRates, getCommodityRates, getMarketDemand, calculateCompetitiveness, getMarketSentiment } from '@/lib/external-apis'

interface TariffData {
  country: string
  product_code: string
  tariff_rate: number
  preferential_rate?: number
  currency: string
  last_updated: string
}

interface CommodityData {
  commodity: string
  price: number
  currency: string
  unit: string
  change_24h: number
  market: string
}

interface MarketDemand {
  product: string
  demand_score: number
  trend: 'increasing' | 'decreasing' | 'stable'
  key_markets: string[]
  opportunities: string[]
}

interface CompetitivenessData {
  overall_score: number
  factors: {
    price_competitiveness: number
    quality_perception: number
    market_access: number
    trade_barriers: number
  }
  recommendations: string[]
}

interface MarketSentimentData {
  current_sentiment: string
  sentiment_score: number
  safe_haven_demand: number
  trade_recommendation: string
  last_updated: string
  market_factors: {
    volatility: string
    risk_appetite: string
    demand_for_safe_assets: string
  }
}

export default function MarketIntelligencePage() {
  const [tariffData, setTariffData] = useState<TariffData[]>([])
  const [commodityData, setCommodityData] = useState<CommodityData[]>([])
  const [marketDemand, setMarketDemand] = useState<MarketDemand[]>([])
  const [competitiveness, setCompetitiveness] = useState<CompetitivenessData | null>(null)
  const [marketSentiment, setMarketSentiment] = useState<MarketSentimentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState('textile')

  useEffect(() => {
    loadMarketData()
  }, [selectedProduct])

  const loadMarketData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load data in parallel including market sentiment
      const [tariffs, commodities, demand, competitivenessData, sentimentData] = await Promise.all([
        getTariffRates(selectedProduct, ['US', 'EU', 'UK', 'Japan', 'Canada']),
        getCommodityRates(['cotton', 'rice', 'tea', 'spices', 'gold']),
        getMarketDemand(selectedProduct),
        calculateCompetitiveness(selectedProduct, 'India'),
        getMarketSentiment()
      ])

      setTariffData(tariffs)
      setCommodityData(commodities)
      setMarketDemand(demand)
      setCompetitiveness(competitivenessData)
      setMarketSentiment(sentimentData)
    } catch (error) {
      console.error('Error loading market data:', error)
      setError('Failed to load market intelligence data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <BarChart3 className="h-4 w-4 text-yellow-500" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Extreme Fear':
        return 'text-red-700 bg-red-100'
      case 'Fear':
        return 'text-red-600 bg-red-50'
      case 'Neutral':
        return 'text-gray-600 bg-gray-100'
      case 'Greed':
        return 'text-green-600 bg-green-50'
      case 'Extreme Greed':
        return 'text-green-700 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (error) {
    return (
      <DashboardLayout userType="indian">
        <div className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadMarketData} className="mt-4">
            Retry
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="indian">
      <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Market Intelligence</h1>
          <p className="text-muted-foreground">
            Real-time market data, tariff rates, and competitive analysis
          </p>
        </div>
        <div className="flex gap-2">
          {['textile', 'agriculture', 'manufacturing', 'services'].map((product) => (
            <Button
              key={product}
              variant={selectedProduct === product ? 'default' : 'outline'}
              onClick={() => setSelectedProduct(product)}
              className="capitalize"
            >
              {product}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tariffs">Tariff Rates</TabsTrigger>
          <TabsTrigger value="commodities">Commodity Prices</TabsTrigger>
          <TabsTrigger value="competitiveness">Competitiveness</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    {competitiveness?.overall_score || 0}/100
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Overall competitiveness</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Tariff</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {tariffData.length > 0 
                      ? `${(tariffData.reduce((acc, t) => acc + t.tariff_rate, 0) / tariffData.length).toFixed(1)}%`
                      : '0%'
                    }
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Across major markets</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Price Trend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-green-600">+12.5%</div>
                )}
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Sentiment</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : marketSentiment ? (
                  <div className="space-y-1">
                    <div className={`text-lg font-bold px-2 py-1 rounded text-center ${getSentimentColor(marketSentiment.current_sentiment)}`}>
                      {marketSentiment.current_sentiment}
                    </div>
                    <div className="text-sm text-center text-muted-foreground">
                      Score: {marketSentiment.sentiment_score}/100
                    </div>
                  </div>
                ) : (
                  <div className="text-lg font-bold text-gray-600">N/A</div>
                )}
                <p className="text-xs text-muted-foreground">Fear & Greed Index</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Demand Analysis</CardTitle>
                <CardDescription>
                  Demand trends and opportunities for {selectedProduct}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {marketDemand.map((demand, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{demand.product}</h4>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(demand.trend)}
                            <Badge variant="outline">{demand.trend}</Badge>
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Demand Score</span>
                            <span>{demand.demand_score}/100</span>
                          </div>
                          <Progress value={demand.demand_score} className="h-2" />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p><strong>Key Markets:</strong> {demand.key_markets.join(', ')}</p>
                          <p><strong>Opportunities:</strong> {demand.opportunities.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Sentiment Analysis</CardTitle>
                <CardDescription>
                  Real-time market psychology and risk indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : marketSentiment ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold px-3 py-2 rounded ${getSentimentColor(marketSentiment.current_sentiment)}`}>
                          {marketSentiment.current_sentiment}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Current Sentiment</p>
                        <p className="text-xs text-muted-foreground">Score: {marketSentiment.sentiment_score}/100</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {marketSentiment.safe_haven_demand.toFixed(0)}%
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Safe Haven Demand</p>
                        <p className="text-xs text-muted-foreground">Risk Appetite Indicator</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Market Factors
                      </h5>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="font-medium">{marketSentiment.market_factors.volatility}</div>
                          <div className="text-xs text-muted-foreground">Volatility</div>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="font-medium">{marketSentiment.market_factors.risk_appetite}</div>
                          <div className="text-xs text-muted-foreground">Risk Appetite</div>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="font-medium">{marketSentiment.market_factors.demand_for_safe_assets}</div>
                          <div className="text-xs text-muted-foreground">Safe Assets</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3">
                      <h5 className="font-semibold mb-2">Trade Recommendation:</h5>
                      <p className="text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                        {marketSentiment.trade_recommendation}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {new Date(marketSentiment.last_updated).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No sentiment data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tariffs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Tariff Rates</CardTitle>
              <CardDescription>
                Current tariff rates for {selectedProduct} across major markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {tariffData.map((tariff, index) => (
                    <div key={index} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{tariff.country}</h4>
                        <p className="text-sm text-muted-foreground">
                          Product Code: {tariff.product_code}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Updated: {new Date(tariff.last_updated).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {tariff.tariff_rate}%
                        </div>
                        {tariff.preferential_rate && (
                          <div className="text-sm text-green-600">
                            Preferential: {tariff.preferential_rate}%
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {tariff.currency}
                        </div>
                      </div>
                    </div>
                  ))}
                  {tariffData.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No tariff data available. Check your RapidAPI configuration.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commodities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Commodity Prices</CardTitle>
              <CardDescription>
                Real-time commodity pricing data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {commodityData.map((commodity, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg capitalize">{commodity.commodity}</CardTitle>
                        <CardDescription>{commodity.market}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {commodity.currency} {commodity.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          per {commodity.unit}
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${
                          commodity.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {commodity.change_24h >= 0 ? 
                            <TrendingUp className="h-3 w-3" /> : 
                            <TrendingDown className="h-3 w-3" />
                          }
                          {commodity.change_24h >= 0 ? '+' : ''}{commodity.change_24h.toFixed(2)}% (24h)
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {commodityData.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                      No commodity data available. Check your RapidAPI configuration.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitiveness" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Competitiveness Score</CardTitle>
                <CardDescription>
                  AI-powered analysis of your market position
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-48 w-full" />
                ) : competitiveness ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getScoreColor(competitiveness.overall_score)}`}>
                        {competitiveness.overall_score}
                      </div>
                      <p className="text-muted-foreground">Overall Competitiveness</p>
                    </div>
                    
                    <div className="space-y-4">
                      {Object.entries(competitiveness.factors).map(([factor, score]) => (
                        <div key={factor} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="capitalize font-medium">
                              {factor.replace('_', ' ')}
                            </span>
                            <span className={`font-bold ${getScoreColor(score)}`}>
                              {score}/100
                            </span>
                          </div>
                          <Progress value={score} className="h-3" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No competitiveness data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strategic Recommendations</CardTitle>
                <CardDescription>
                  AI-generated insights to improve your market position
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : competitiveness?.recommendations ? (
                  <div className="space-y-4">
                    {competitiveness.recommendations.map((recommendation, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recommendations available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  )
}
