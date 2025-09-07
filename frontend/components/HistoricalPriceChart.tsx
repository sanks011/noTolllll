'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar
} from 'recharts';

interface HistoricalPriceChartProps {
  sector: 'seafood' | 'textile';
  selectedRegion: string;
}

// Hardcoded historical data based on our CSV files
const HISTORICAL_DATA = {
  seafood: {
    'European Union': [
      { year: 2015, value: 2619.9, growth: 0, volume: 850, unitPrice: 3.08 },
      { year: 2016, value: 2633.0, growth: 0.5, volume: 870, unitPrice: 3.03 },
      { year: 2017, value: 3247.7, growth: 23.3, volume: 920, unitPrice: 3.53 },
      { year: 2018, value: 3004.0, growth: -7.5, volume: 880, unitPrice: 3.41 },
      { year: 2019, value: 2870.9, growth: -4.4, volume: 860, unitPrice: 3.34 },
      { year: 2020, value: 2777.9, growth: -3.2, volume: 810, unitPrice: 3.43 },
      { year: 2021, value: 3347.1, growth: 20.5, volume: 890, unitPrice: 3.76 },
      { year: 2022, value: 3528.1, growth: 5.4, volume: 910, unitPrice: 3.88 },
      { year: 2023, value: 3560.8, growth: 0.9, volume: 920, unitPrice: 3.87 },
      { year: 2024, value: 4070.3, growth: 14.3, volume: 980, unitPrice: 4.15 }
    ],
    'United States': [
      { year: 2015, value: 2405.7, growth: 0, volume: 780, unitPrice: 3.08 },
      { year: 2016, value: 2113.5, growth: -12.1, volume: 720, unitPrice: 2.94 },
      { year: 2017, value: 2572.4, growth: 21.7, volume: 820, unitPrice: 3.14 },
      { year: 2018, value: 2584.6, growth: 0.5, volume: 830, unitPrice: 3.11 },
      { year: 2019, value: 2527.4, growth: -2.2, volume: 810, unitPrice: 3.12 },
      { year: 2020, value: 2720.8, growth: 7.6, volume: 850, unitPrice: 3.20 },
      { year: 2021, value: 2895.2, growth: 6.4, volume: 880, unitPrice: 3.29 },
      { year: 2022, value: 3206.5, growth: 10.7, volume: 920, unitPrice: 3.49 },
      { year: 2023, value: 2987.1, growth: -6.8, volume: 880, unitPrice: 3.39 },
      { year: 2024, value: 3186.4, growth: 6.7, volume: 910, unitPrice: 3.50 }
    ],
    'Japan': [
      { year: 2015, value: 389.9, growth: 0, volume: 120, unitPrice: 3.25 },
      { year: 2016, value: 350.0, growth: -10.2, volume: 110, unitPrice: 3.18 },
      { year: 2017, value: 419.2, growth: 19.8, volume: 125, unitPrice: 3.35 },
      { year: 2018, value: 396.5, growth: -5.4, volume: 118, unitPrice: 3.36 },
      { year: 2019, value: 352.5, growth: -11.1, volume: 108, unitPrice: 3.26 },
      { year: 2020, value: 310.3, growth: -12.0, volume: 98, unitPrice: 3.17 },
      { year: 2021, value: 352.5, growth: 13.6, volume: 105, unitPrice: 3.36 },
      { year: 2022, value: 377.1, growth: 7.0, volume: 110, unitPrice: 3.43 },
      { year: 2023, value: 358.0, growth: -5.1, volume: 106, unitPrice: 3.38 },
      { year: 2024, value: 317.9, growth: -11.2, volume: 95, unitPrice: 3.35 }
    ]
  },
  textile: {
    'European Union': [
      { year: 2015, value: 33043.9, growth: 0, volume: 2100, unitPrice: 15.73 },
      { year: 2016, value: 34479.7, growth: 4.3, volume: 2200, unitPrice: 15.67 },
      { year: 2017, value: 38845.2, growth: 12.7, volume: 2400, unitPrice: 16.19 },
      { year: 2018, value: 44588.5, growth: 14.8, volume: 2650, unitPrice: 16.83 },
      { year: 2019, value: 44333.1, growth: -0.6, volume: 2600, unitPrice: 17.05 },
      { year: 2020, value: 35654.3, growth: -19.6, volume: 2150, unitPrice: 16.58 },
      { year: 2021, value: 55646.9, growth: 56.1, volume: 3200, unitPrice: 17.39 },
      { year: 2022, value: 69323.1, growth: 24.6, volume: 3800, unitPrice: 18.24 },
      { year: 2023, value: 71678.9, growth: 3.4, volume: 3900, unitPrice: 18.38 },
      { year: 2024, value: 68278.2, growth: -4.7, volume: 3700, unitPrice: 18.46 }
    ],
    'United States': [
      { year: 2015, value: 37755.2, growth: 0, volume: 2250, unitPrice: 16.78 },
      { year: 2016, value: 39806.9, growth: 5.4, volume: 2350, unitPrice: 16.94 },
      { year: 2017, value: 43306.1, growth: 8.8, volume: 2500, unitPrice: 17.32 },
      { year: 2018, value: 49071.6, growth: 13.3, volume: 2750, unitPrice: 17.84 },
      { year: 2019, value: 51757.7, growth: 5.5, volume: 2850, unitPrice: 18.16 },
      { year: 2020, value: 46598.8, growth: -10.0, volume: 2600, unitPrice: 17.92 },
      { year: 2021, value: 68611.7, growth: 47.2, volume: 3650, unitPrice: 18.80 },
      { year: 2022, value: 76439.0, growth: 11.4, volume: 3950, unitPrice: 19.35 },
      { year: 2023, value: 72816.5, growth: -4.7, volume: 3750, unitPrice: 19.42 },
      { year: 2024, value: 70467.5, growth: -3.2, volume: 3600, unitPrice: 19.57 }
    ],
    'Japan': [
      { year: 2015, value: 4046.1, growth: 0, volume: 320, unitPrice: 12.64 },
      { year: 2016, value: 3446.4, growth: -14.8, volume: 285, unitPrice: 12.09 },
      { year: 2017, value: 4057.4, growth: 17.7, volume: 325, unitPrice: 12.48 },
      { year: 2018, value: 4344.1, growth: 7.1, volume: 340, unitPrice: 12.78 },
      { year: 2019, value: 4461.2, growth: 2.7, volume: 345, unitPrice: 12.93 },
      { year: 2020, value: 3733.0, growth: -16.3, volume: 295, unitPrice: 12.65 },
      { year: 2021, value: 5724.6, growth: 53.4, volume: 425, unitPrice: 13.47 },
      { year: 2022, value: 5218.7, growth: -8.8, volume: 385, unitPrice: 13.55 },
      { year: 2023, value: 4725.6, growth: -9.4, volume: 348, unitPrice: 13.58 },
      { year: 2024, value: 5015.6, growth: 6.1, volume: 365, unitPrice: 13.74 }
    ]
  }
};

export default function HistoricalPriceChart({ sector, selectedRegion }: HistoricalPriceChartProps) {
  const [timeRange, setTimeRange] = useState<'5y' | '10y'>('10y');
  const [selectedMetric, setSelectedMetric] = useState<'value' | 'unitPrice' | 'volume'>('value');

  const regionData = (HISTORICAL_DATA[sector] as any)[selectedRegion] || [];
  const filteredData = timeRange === '5y' ? regionData.slice(-5) : regionData;

  const allRegionsData = Object.keys(HISTORICAL_DATA[sector]).map(region => {
    const data = (HISTORICAL_DATA[sector] as any)[region] || [];
    const latestData = data[data.length - 1];
    const previousData = data[data.length - 2];
    
    return {
      region,
      current: latestData?.value || 0,
      previous: previousData?.value || 0,
      growth: latestData?.growth || 0,
      trend: (latestData?.value || 0) > (previousData?.value || 0)
    };
  });

  const getLatestStats = () => {
    const latest = regionData[regionData.length - 1];
    const previous = regionData[regionData.length - 2];
    
    if (!latest || !previous) return null;
    
    return {
      currentValue: latest.value,
      previousValue: previous.value,
      growth: latest.growth,
      volume: latest.volume,
      unitPrice: latest.unitPrice,
      yearOverYear: ((latest.value - previous.value) / previous.value * 100)
    };
  };

  const stats = getLatestStats();

  const formatValue = (value: number) => {
    if (selectedMetric === 'value') {
      return `$${(value / 1000).toFixed(1)}B`;
    } else if (selectedMetric === 'unitPrice') {
      return `$${value.toFixed(2)}`;
    } else {
      return `${value.toFixed(0)}K tons`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Historical Price Analysis - {selectedRegion}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {sector.charAt(0).toUpperCase() + sector.slice(1)} market trends and price evolution
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={timeRange === '5y' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('5y')}
          >
            5 Years
          </Button>
          <Button
            variant={timeRange === '10y' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('10y')}
          >
            10 Years
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                  <p className="text-xl font-bold">${(stats.currentValue / 1000).toFixed(1)}B</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {stats.yearOverYear >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">YoY Growth</p>
                  <p className={`text-xl font-bold ${stats.yearOverYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.yearOverYear > 0 ? '+' : ''}{stats.yearOverYear.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unit Price</p>
                  <p className="text-xl font-bold">${stats.unitPrice.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Volume</p>
                  <p className="text-xl font-bold">{stats.volume}K tons</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              📈 Price Trend Analysis
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedMetric === 'value' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('value')}
              >
                Trade Value
              </Button>
              <Button
                variant={selectedMetric === 'unitPrice' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('unitPrice')}
              >
                Unit Price
              </Button>
              <Button
                variant={selectedMetric === 'volume' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('volume')}
              >
                Volume
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  formatValue(value), 
                  name === 'value' ? 'Trade Value' : 
                  name === 'unitPrice' ? 'Unit Price' : 
                  name === 'volume' ? 'Volume' : 'Growth Rate'
                ]}
              />
              <Legend />
              
              <Area
                yAxisId="left"
                type="monotone"
                dataKey={selectedMetric}
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                strokeWidth={3}
              />
              
              <Bar
                yAxisId="right"
                dataKey="growth"
                fill="#10B981"
                opacity={0.6}
                name="Growth Rate (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Regional Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌍 Regional Performance Comparison (2024)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allRegionsData.map((region, index) => (
              <div
                key={region.region}
                className={`p-4 rounded-lg border ${
                  region.region === selectedRegion ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{region.region}</h4>
                  {region.trend ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      ${(region.current / 1000).toFixed(1)}B
                    </p>
                    <p className="text-xs text-gray-500">Trade Value 2024</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={region.growth >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {region.growth > 0 ? '+' : ''}{region.growth.toFixed(1)}%
                    </Badge>
                    <p className="text-xs text-gray-500">vs 2023</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
