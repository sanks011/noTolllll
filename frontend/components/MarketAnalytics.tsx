'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Activity,
  Zap,
  Target,
  Globe
} from 'lucide-react';

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

interface MarketAnalyticsProps {
  sector: 'seafood' | 'textile';
  selectedRegion: string;
  marketData: MarketData[];
}

// Enhanced analytics data
const ADVANCED_ANALYTICS = {
  seafood: {
    competitiveLandscape: [
      { country: 'Vietnam', marketShare: 28.5, growth: 15.2, threat: 'high' },
      { country: 'Thailand', marketShare: 22.1, growth: 8.7, threat: 'medium' },
      { country: 'India', marketShare: 18.3, growth: 12.4, threat: 'opportunity' },
      { country: 'Indonesia', marketShare: 16.8, growth: 6.9, threat: 'medium' },
      { country: 'Bangladesh', marketShare: 8.2, growth: 22.1, threat: 'high' },
      { country: 'Others', marketShare: 6.1, growth: 5.4, threat: 'low' }
    ],
    priceCorrelation: [
      { factor: 'Oil Prices', correlation: 0.68, impact: 'Cost of transportation' },
      { factor: 'Currency Rate', correlation: -0.72, impact: 'Export competitiveness' },
      { factor: 'Weather Patterns', correlation: 0.45, impact: 'Supply availability' },
      { factor: 'Trade Policies', correlation: -0.58, impact: 'Market access' },
      { factor: 'Consumer Demand', correlation: 0.82, impact: 'Price premiums' }
    ]
  },
  textile: {
    competitiveLandscape: [
      { country: 'China', marketShare: 42.3, growth: 3.2, threat: 'high' },
      { country: 'Bangladesh', marketShare: 18.7, growth: 18.9, threat: 'high' },
      { country: 'India', marketShare: 14.2, growth: 11.8, threat: 'opportunity' },
      { country: 'Vietnam', marketShare: 12.4, growth: 24.6, threat: 'high' },
      { country: 'Turkey', marketShare: 7.8, growth: -2.1, threat: 'medium' },
      { country: 'Others', marketShare: 4.6, growth: 6.7, threat: 'low' }
    ],
    priceCorrelation: [
      { factor: 'Cotton Prices', correlation: 0.78, impact: 'Raw material costs' },
      { factor: 'Labor Costs', correlation: 0.65, impact: 'Manufacturing expenses' },
      { factor: 'Energy Prices', correlation: 0.52, impact: 'Production costs' },
      { factor: 'Trade Wars', correlation: -0.71, impact: 'Market disruption' },
      { factor: 'Fashion Trends', correlation: 0.43, impact: 'Demand patterns' }
    ]
  }
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

export default function MarketAnalytics({ 
  sector, 
  selectedRegion, 
  marketData 
}: MarketAnalyticsProps) {
  
  const [activeAnalysis, setActiveAnalysis] = useState<'performance' | 'competitive' | 'risk'>('performance');

  const analyticsData = (ADVANCED_ANALYTICS as any)[sector];

  // Performance metrics for the selected region
  const selectedMarket = marketData.find(m => m.region === selectedRegion);
  
  const performanceData = marketData.map(market => ({
    region: market.region,
    opportunity: market.opportunity,
    tariffRate: market.tariffRate,
    growth: Math.max(0, market.growth + 50), // Normalize for better visualization
    marketShare: market.marketShare,
    riskScore: market.riskLevel === 'low' ? 20 : market.riskLevel === 'medium' ? 50 : 80
  }));

  const competitiveData = analyticsData?.competitiveLandscape || [];
  
  const riskData = [
    { metric: 'Tariff Risk', value: selectedMarket ? Math.min(100, selectedMarket.tariffRate * 5) : 0 },
    { metric: 'Political Risk', value: selectedMarket?.riskLevel === 'low' ? 20 : selectedMarket?.riskLevel === 'medium' ? 50 : 80 },
    { metric: 'Currency Risk', value: Math.random() * 40 + 30 },
    { metric: 'Competition Risk', value: selectedMarket ? selectedMarket.marketShare * 2 : 0 },
    { metric: 'Regulatory Risk', value: Math.random() * 30 + 25 },
    { metric: 'Supply Chain Risk', value: Math.random() * 35 + 20 }
  ];

  const funnelData = [
    { name: 'Total Market Size', value: 1000, fill: '#3B82F6' },
    { name: 'Addressable Market', value: 650, fill: '#10B981' },
    { name: 'Target Segment', value: 400, fill: '#F59E0B' },
    { name: 'Realistic Opportunity', value: 180, fill: '#EF4444' }
  ];

  const correlationData = analyticsData?.priceCorrelation?.map((item: any) => ({
    factor: item.factor,
    correlation: Math.abs(item.correlation) * 100,
    impact: item.impact,
    positive: item.correlation > 0
  })) || [];

  const getTheatColor = (threat: string) => {
    switch (threat) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'opportunity': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-7 w-7 text-blue-600" />
            Advanced Market Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Deep market insights and competitive intelligence for {selectedRegion}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={activeAnalysis === 'performance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveAnalysis('performance')}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Performance
          </Button>
          <Button
            variant={activeAnalysis === 'competitive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveAnalysis('competitive')}
          >
            <Target className="h-4 w-4 mr-1" />
            Competition
          </Button>
          <Button
            variant={activeAnalysis === 'risk' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveAnalysis('risk')}
          >
            <Zap className="h-4 w-4 mr-1" />
            Risk Analysis
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {selectedMarket && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Market Opportunity</p>
                  <p className="text-xl font-bold text-green-600">{selectedMarket.opportunity}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Trade Value</p>
                  <p className="text-xl font-bold text-blue-600">${(selectedMarket.averagePrice / 1000).toFixed(1)}B</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Market Share</p>
                  <p className="text-xl font-bold text-purple-600">{selectedMarket.marketShare}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
                  <p className={`text-xl font-bold ${selectedMarket.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedMarket.growth > 0 ? '+' : ''}{selectedMarket.growth.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Tabs */}
      <div className="space-y-6">
        {activeAnalysis === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Performance Scatter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Opportunity vs Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="riskScore" name="Risk Score" />
                    <YAxis dataKey="opportunity" name="Opportunity" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => [
                        `${value}${name === 'opportunity' ? '%' : ''}`, 
                        name === 'opportunity' ? 'Opportunity Score' : 'Risk Score'
                      ]}
                    />
                    <Scatter dataKey="opportunity" fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Market Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Market Opportunity Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <FunnelChart>
                    <Tooltip />
                    <Funnel
                      dataKey="value"
                      data={funnelData}
                      isAnimationActive
                    >
                      <LabelList position="center" fill="#fff" stroke="none" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Correlation Analysis */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔗 Price Correlation Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={correlationData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="factor" type="category" width={100} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Correlation']} />
                      <Bar dataKey="correlation" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-3">
                    {correlationData.map((item: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{item.factor}</h4>
                          <Badge className={item.positive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {item.positive ? 'Positive' : 'Negative'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{item.impact}</p>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${item.positive ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${item.correlation}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeAnalysis === 'competitive' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Competitive Landscape */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏆 Competitive Landscape
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={competitiveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="marketShare" fill="#3B82F6" name="Market Share %" />
                    <Bar dataKey="growth" fill="#10B981" name="Growth %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Threat Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚠️ Competitive Threats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {competitiveData.map((competitor: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{competitor.country}</h4>
                          <Badge className={getTheatColor(competitor.threat)}>
                            {competitor.threat.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>Share: {competitor.marketShare}%</span>
                          <span>Growth: {competitor.growth}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${
                              competitor.threat === 'high' ? 'bg-red-500' :
                              competitor.threat === 'medium' ? 'bg-yellow-500' :
                              competitor.threat === 'opportunity' ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${Math.min(100, competitor.marketShare * 3)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeAnalysis === 'risk' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Risk Assessment Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={riskData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Risk Level"
                      dataKey="value"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📋 Risk Factor Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskData.map((risk, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{risk.metric}</span>
                        <Badge 
                          className={
                            risk.value < 30 ? 'bg-green-100 text-green-800' :
                            risk.value < 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {risk.value.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            risk.value < 30 ? 'bg-green-500' :
                            risk.value < 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${risk.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-medium mb-2">Overall Risk Assessment</h4>
                  <p className="text-sm text-gray-600">
                    {selectedRegion} shows a{' '}
                    {riskData.reduce((sum, r) => sum + r.value, 0) / riskData.length < 40 ? 'LOW' :
                     riskData.reduce((sum, r) => sum + r.value, 0) / riskData.length < 60 ? 'MEDIUM' : 'HIGH'}
                    {' '}risk profile with key concerns in{' '}
                    {riskData.sort((a, b) => b.value - a.value)[0].metric.toLowerCase()}.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
