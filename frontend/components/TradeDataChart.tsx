'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrendingUp, TrendingDown, BarChart3, Globe, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TradeAnalytics {
  yearlyAnalytics: Array<{
    _id: number
    partners: Array<{
      partner: string
      category: string
      value: number
    }>
    totalYearValue: number
  }>
  topPartners: Array<{
    _id: string
    totalValue: number
    avgValue: number
    years: number[]
  }>
}

interface TradeDataChartProps {
  userSector?: 'seafood' | 'textile' | null
}

export default function TradeDataChart({ userSector }: TradeDataChartProps) {
  const { toast } = useToast()
  const [analytics, setAnalytics] = useState<TradeAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSector, setSelectedSector] = useState<string>(userSector || 'all')
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = async (sector = selectedSector) => {
    try {
      const sectorParam = sector === 'all' ? '' : `?sector=${sector}`
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/trade-data/analytics${sectorParam}`)
      
      const result = await response.json()
      if (result.success) {
        setAnalytics(result.data)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch trade analytics',
        variant: 'destructive'
      })
      console.error('Analytics fetch error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [selectedSector])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
  }

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector)
    setLoading(true)
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`
    }
    return `$${value.toFixed(2)}`
  }

  const calculateYearOverYearChange = () => {
    if (!analytics?.yearlyAnalytics || analytics.yearlyAnalytics.length < 2) {
      return null
    }

    const currentYear = analytics.yearlyAnalytics[0]
    const previousYear = analytics.yearlyAnalytics[1]
    
    if (currentYear && previousYear) {
      const change = ((currentYear.totalYearValue - previousYear.totalYearValue) / previousYear.totalYearValue) * 100
      return {
        percentage: change,
        isPositive: change > 0,
        currentValue: currentYear.totalYearValue,
        previousValue: previousYear.totalYearValue,
        currentYearLabel: currentYear._id,
        previousYearLabel: previousYear._id
      }
    }

    return null
  }

  if (loading && !refreshing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Trade Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading trade data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Trade Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No trade data available. Please contact your administrator to upload trade data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const yearOverYearChange = calculateYearOverYearChange()

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Trade Analytics
              </CardTitle>
              <CardDescription>
                Real-time trade data analysis and trends
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedSector} onValueChange={handleSectorChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="seafood">Seafood</SelectItem>
                  <SelectItem value="textile">Textile</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Year-over-Year Change */}
        {yearOverYearChange && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Year-over-Year Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {yearOverYearChange.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-2xl font-bold ${
                  yearOverYearChange.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {yearOverYearChange.percentage > 0 ? '+' : ''}{yearOverYearChange.percentage.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {yearOverYearChange.currentYearLabel} vs {yearOverYearChange.previousYearLabel}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Latest Year Trade Value */}
        {analytics.yearlyAnalytics.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {analytics.yearlyAnalytics[0]._id} Trade Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.yearlyAnalytics[0].totalYearValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total trade value for latest year
              </p>
            </CardContent>
          </Card>
        )}

        {/* Top Trading Partners Count */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trading Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.topPartners.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active trading partners
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Partners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Top Trading Partners
          </CardTitle>
          <CardDescription>
            Leading trade partners by total value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topPartners.slice(0, 5).map((partner, index) => (
              <div key={partner._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{partner._id}</div>
                    <div className="text-sm text-muted-foreground">
                      Active in {partner.years.length} years
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(partner.totalValue)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg: {formatCurrency(partner.avgValue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Years Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Yearly Trade Performance</CardTitle>
          <CardDescription>
            Trade values over recent years
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.yearlyAnalytics.slice(0, 5).map((yearData) => (
              <div key={yearData._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-semibold">{yearData._id}</div>
                  <div className="text-sm text-muted-foreground">
                    {yearData.partners?.length || 0} trade partners
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(yearData.totalYearValue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
