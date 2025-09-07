'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

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

interface TariffComparisonChartProps {
  sector: 'seafood' | 'textile';
  selectedRegion: string;
  marketData: MarketData[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

// Hardcoded detailed tariff data for different product categories
const DETAILED_TARIFF_DATA = {
  seafood: {
    'European Union': [
      { category: 'Fresh Fish', currentRate: 8.5, mfnRate: 12.0, preferentialRate: 0.0 },
      { category: 'Frozen Shrimp', currentRate: 6.2, mfnRate: 10.5, preferentialRate: 0.0 },
      { category: 'Canned Tuna', currentRate: 12.8, mfnRate: 18.0, preferentialRate: 2.5 },
      { category: 'Fish Fillets', currentRate: 7.1, mfnRate: 15.2, preferentialRate: 0.0 },
    ],
    'United States': [
      { category: 'Fresh Fish', currentRate: 15.2, mfnRate: 15.2, preferentialRate: 10.8 },
      { category: 'Frozen Shrimp', currentRate: 18.5, mfnRate: 18.5, preferentialRate: 12.3 },
      { category: 'Canned Tuna', currentRate: 22.1, mfnRate: 22.1, preferentialRate: 16.7 },
      { category: 'Fish Fillets', currentRate: 12.9, mfnRate: 12.9, preferentialRate: 8.4 },
    ],
    'Japan': [
      { category: 'Fresh Fish', currentRate: 5.3, mfnRate: 8.2, preferentialRate: 0.0 },
      { category: 'Frozen Shrimp', currentRate: 3.1, mfnRate: 6.5, preferentialRate: 0.0 },
      { category: 'Canned Tuna', currentRate: 9.8, mfnRate: 12.0, preferentialRate: 4.2 },
      { category: 'Fish Fillets', currentRate: 4.7, mfnRate: 7.8, preferentialRate: 0.0 },
    ]
  },
  textile: {
    'European Union': [
      { category: 'Cotton Fabrics', currentRate: 8.0, mfnRate: 12.0, preferentialRate: 0.0 },
      { category: 'Synthetic Yarns', currentRate: 6.5, mfnRate: 10.2, preferentialRate: 0.0 },
      { category: 'Garments', currentRate: 12.0, mfnRate: 18.5, preferentialRate: 3.2 },
      { category: 'Home Textiles', currentRate: 9.2, mfnRate: 14.8, preferentialRate: 1.5 },
    ],
    'United States': [
      { category: 'Cotton Fabrics', currentRate: 16.8, mfnRate: 16.8, preferentialRate: 12.1 },
      { category: 'Synthetic Yarns', currentRate: 14.2, mfnRate: 14.2, preferentialRate: 9.8 },
      { category: 'Garments', currentRate: 32.0, mfnRate: 32.0, preferentialRate: 24.5 },
      { category: 'Home Textiles', currentRate: 18.7, mfnRate: 18.7, preferentialRate: 13.9 },
    ],
    'Japan': [
      { category: 'Cotton Fabrics', currentRate: 4.8, mfnRate: 7.2, preferentialRate: 0.0 },
      { category: 'Synthetic Yarns', currentRate: 3.5, mfnRate: 6.1, preferentialRate: 0.0 },
      { category: 'Garments', currentRate: 10.9, mfnRate: 14.5, preferentialRate: 5.2 },
      { category: 'Home Textiles', currentRate: 6.7, mfnRate: 9.8, preferentialRate: 2.1 },
    ]
  }
};

export default function TariffComparisonChart({ 
  sector, 
  selectedRegion, 
  marketData 
}: TariffComparisonChartProps) {
  
  const barChartData = marketData.map(market => ({
    region: market.region,
    tariffRate: market.tariffRate,
    averagePrice: market.averagePrice / 1000, // Convert to billions for better display
    opportunity: market.opportunity,
    volume: market.volume
  }));

  const pieChartData = marketData.map((market, index) => ({
    name: market.region,
    value: market.marketShare,
    color: COLORS[index]
  }));

  const radarData = (DETAILED_TARIFF_DATA[sector] as any)[selectedRegion] || [];
  const radarChartData = radarData.map((item: any) => ({
    category: item.category,
    current: item.currentRate,
    mfn: item.mfnRate,
    preferential: item.preferentialRate
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tariff Analysis - {sector.charAt(0).toUpperCase() + sector.slice(1)}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Comprehensive tariff comparison across major markets
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Focus: {selectedRegion}
        </Badge>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tariff Rates Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Tariff Rates Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}${name === 'tariffRate' ? '%' : name === 'averagePrice' ? 'B USD' : '%'}`, 
                    name === 'tariffRate' ? 'Tariff Rate' : 
                    name === 'averagePrice' ? 'Avg Price' : 
                    'Opportunity Score'
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="tariffRate" 
                  fill="#EF4444" 
                  name="Tariff Rate (%)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="opportunity" 
                  fill="#10B981" 
                  name="Opportunity (%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Market Share Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🥧 Market Share Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Market Share']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Tariff Categories - Radar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Product Category Analysis - {selectedRegion}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarChartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 35]} />
                  <Radar
                    name="Current Rate"
                    dataKey="current"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name="MFN Rate"
                    dataKey="mfn"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Preferential Rate"
                    dataKey="preferential"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Category Breakdown</h4>
                {radarData.map((item: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{item.category}</h5>
                      <Badge 
                        variant={item.currentRate < 10 ? "default" : item.currentRate < 20 ? "secondary" : "destructive"}
                      >
                        {item.currentRate}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">Current</p>
                        <p className="font-medium text-blue-600">{item.currentRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">MFN</p>
                        <p className="font-medium text-red-600">{item.mfnRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Preferential</p>
                        <p className="font-medium text-green-600">{item.preferentialRate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {marketData.map((market, index) => (
          <Card key={market.code} className={selectedRegion === market.region ? 'ring-2 ring-blue-500' : ''}>
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">
                  {market.region}
                </h4>
                <div className="space-y-1">
                  <p className="text-2xl font-bold" style={{color: COLORS[index]}}>
                    {market.tariffRate}%
                  </p>
                  <p className="text-xs text-gray-500">Average Tariff</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">
                    ${market.averagePrice.toFixed(1)}M
                  </p>
                  <p className="text-xs text-gray-500">Trade Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
