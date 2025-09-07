'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Globe, DollarSign, BarChart3, Target, ArrowUpRight, ArrowDownRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TariffComparisonChart from '@/components/TariffComparisonChart';
import HistoricalPriceChart from '@/components/HistoricalPriceChart';
import PolicyNewsPanel from '@/components/PolicyNewsPanel';
import RecommendationEngine from '@/components/RecommendationEngine';
import MarketAnalytics from '@/components/MarketAnalytics';

interface MarketData {
  region: string;
  country: string;
  code: string;
  tariffRate: number;
  averagePrice: number;
  growth: number;
  volume: number;
  marketShare: number;
  riskLevel: 'low' | 'medium' | 'high';
  opportunity: number;
}

const REGIONS_DATA: Record<string, MarketData> = {
  'European Union': {
    region: 'European Union',
    country: 'European Union',
    code: 'U918',
    tariffRate: 8.5,
    averagePrice: 3456.7,
    growth: 12.3,
    volume: 85.6,
    marketShare: 45.2,
    riskLevel: 'low',
    opportunity: 89.5
  },
  'United States': {
    region: 'United States',
    country: 'United States of America',
    code: 'C840',
    tariffRate: 15.2,
    averagePrice: 2987.1,
    growth: 8.7,
    volume: 78.3,
    marketShare: 38.1,
    riskLevel: 'medium',
    opportunity: 76.8
  },
  'Japan': {
    region: 'Japan',
    country: 'Japan',
    code: 'C392',
    tariffRate: 5.3,
    averagePrice: 357.9,
    growth: -2.1,
    volume: 23.4,
    marketShare: 16.7,
    riskLevel: 'low',
    opportunity: 64.2
  }
};

export default function MarketExplorer() {
  const router = useRouter();
  const [selectedSector, setSelectedSector] = useState<'seafood' | 'textile'>('seafood');
  const [selectedRegion, setSelectedRegion] = useState<string>('European Union');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        // Simulate API call and set hardcoded data for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMarketData(Object.values(REGIONS_DATA));
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [selectedSector]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="h-8 w-8 text-blue-600" />
              Market Explorer
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Discover new markets with comprehensive tariff analysis and price intelligence
              <br />
              <span className="text-sm text-blue-600">
                Enhanced trade analytics moved from your dashboard for better market exploration
              </span>
            </p>
          </div>
        </div>
        
        {/* Sector Selection */}
        <div className="flex gap-2">
          <Button
            variant={selectedSector === 'seafood' ? 'default' : 'outline'}
            onClick={() => setSelectedSector('seafood')}
            className="flex items-center gap-2"
          >
            🐟 Seafood
          </Button>
          <Button
            variant={selectedSector === 'textile' ? 'default' : 'outline'}
            onClick={() => setSelectedSector('textile')}
            className="flex items-center gap-2"
          >
            🧵 Textile
          </Button>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {marketData.map((market, index) => (
          <Card 
            key={market.code} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedRegion === market.region ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedRegion(market.region)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{market.region}</CardTitle>
                <Badge className={getRiskColor(market.riskLevel)}>
                  {market.riskLevel.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tariff Rate</p>
                  <p className="text-lg font-semibold text-blue-600">{market.tariffRate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Price</p>
                  <p className="text-lg font-semibold">${market.averagePrice.toFixed(1)}M</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getGrowthIcon(market.growth)}
                  <span className={`font-medium ${
                    market.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {market.growth > 0 ? '+' : ''}{market.growth.toFixed(1)}%
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Opportunity</p>
                  <p className="font-semibold text-green-600">{market.opportunity}%</p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${market.marketShare}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                {market.marketShare}% Market Share
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="comparison" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Tariff Comparison
          </TabsTrigger>
          <TabsTrigger value="historical" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Price History
          </TabsTrigger>
          <TabsTrigger value="policy" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Policy & News
          </TabsTrigger>
          <TabsTrigger value="recommendation" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-6">
          <TariffComparisonChart 
            sector={selectedSector}
            selectedRegion={selectedRegion}
            marketData={marketData}
          />
        </TabsContent>

        <TabsContent value="historical" className="space-y-6">
          <HistoricalPriceChart
            sector={selectedSector}
            selectedRegion={selectedRegion}
          />
        </TabsContent>

        <TabsContent value="policy" className="space-y-6">
          <PolicyNewsPanel
            sector={selectedSector}
            selectedRegion={selectedRegion}
          />
        </TabsContent>

        <TabsContent value="recommendation" className="space-y-6">
          <RecommendationEngine
            sector={selectedSector}
            marketData={marketData}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <MarketAnalytics
            sector={selectedSector}
            selectedRegion={selectedRegion}
            marketData={marketData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
