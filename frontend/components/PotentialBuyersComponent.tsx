'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Globe, TrendingUp, DollarSign, Users, BarChart3 } from 'lucide-react';
import { apiService } from '@/lib/api';

interface BuyerData {
  country: string;
  countryCode: string;
  countryISO: string;
  importValue?: number;
  purchaseValue?: number;
  marketPotential?: string;
  marketShare?: number;
  frequency?: number;
  records: number;
  growthRate: number;
  consistency: number;
  trend?: string;
  reliability?: string;
  avgUnitPrice: number;
  yearlyData: Record<string, number>;
  marketRank?: number;
}

const PotentialBuyersComponent: React.FC = () => {
  const [potentialBuyers, setPotentialBuyers] = useState<BuyerData[]>([]);
  const [frequentBuyers, setFrequentBuyers] = useState<BuyerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('potential');

  const commodities = [
    { code: '090111', name: 'Coffee, not roasted, not decaffeinated' },
    { code: '030613', name: 'Frozen shrimps and prawns' },
    { code: '100630', name: 'Semi-milled or wholly milled rice' },
    { code: '090240', name: 'Black tea (fermented) and partly fermented tea' },
    { code: '520100', name: 'Cotton, not carded or combed' },
    { code: '071333', name: 'Dried kidney beans' },
    { code: '100590', name: 'Maize (corn)' },
    { code: '090411', name: 'Pepper of the genus Piper; dried or crushed' },
    { code: '720712', name: 'Semi-finished products of iron/non-alloy steel' },
    { code: '230400', name: 'Oilcake and other solid residues' }
  ];

  const fetchPotentialBuyers = async () => {
    try {
      setLoading(true);
      const commodityCode = selectedCommodity === 'all' ? '090111' : selectedCommodity;
      const response = await apiService.getTradePotentialBuyers(commodityCode, 15);
      if (response.success) {
        setPotentialBuyers(response.data.buyers || []);
      }
    } catch (error) {
      console.error('Error fetching potential buyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFrequentBuyers = async () => {
    try {
      setLoading(true);
      const commodityCode = selectedCommodity === 'all' ? '090111' : selectedCommodity;
      const response = await apiService.getTradeFrequentBuyersFromIndia(commodityCode, 15);
      if (response.success) {
        setFrequentBuyers(response.data.buyers || []);
      }
    } catch (error) {
      console.error('Error fetching frequent buyers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'potential') {
      fetchPotentialBuyers();
    } else {
      fetchFrequentBuyers();
    }
  }, [selectedCommodity, activeTab]);

  const filteredBuyers = (activeTab === 'potential' ? potentialBuyers : frequentBuyers).filter(buyer =>
    buyer.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getMarketPotentialColor = (potential: string) => {
    switch (potential) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'High': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (growthRate: number) => {
    if (growthRate > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growthRate > 0) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select commodity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Commodities</SelectItem>
            {commodities.map((commodity) => (
              <SelectItem key={commodity.code} value={commodity.code}>
                {commodity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="potential" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Potential Buyers
          </TabsTrigger>
          <TabsTrigger value="frequent" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Frequent Buyers from India
          </TabsTrigger>
        </TabsList>

        <TabsContent value="potential" className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Global Market Opportunities</h3>
            <p className="text-sm text-gray-600">
              Discover countries with high import demand for your products based on UN Comtrade data
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBuyers.map((buyer, index) => (
                <Card key={`${buyer.countryCode}-${index}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{buyer.country}</CardTitle>
                      <Badge className={getMarketPotentialColor(buyer.marketPotential || 'Medium')}>
                        {buyer.marketPotential || 'Medium'}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-gray-500">
                      Market Rank: #{buyer.marketRank || 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Import Value
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(buyer.importValue || 0)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-1">
                        {getTrendIcon(buyer.growthRate)}
                        Growth Rate
                      </span>
                      <span className={`text-sm font-semibold ${buyer.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {buyer.growthRate > 0 ? '+' : ''}{buyer.growthRate.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        Consistency
                      </span>
                      <span className="text-sm">
                        {buyer.consistency.toFixed(1)}/5.0
                      </span>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="frequent" className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Frequent Buyers from India</h3>
            <p className="text-sm text-gray-600">
              Countries that consistently import from India with established trade relationships
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBuyers.map((buyer, index) => (
                <Card key={`${buyer.countryCode}-${index}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{buyer.country}</CardTitle>
                      <Badge className={getReliabilityColor(buyer.reliability || 'Medium')}>
                        {buyer.reliability || 'Medium'}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-gray-500">
                      Trade Frequency: {buyer.frequency || 0} years
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Purchase Value
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(buyer.purchaseValue || 0)}
                      </span>
                    </div>
                    
                    {buyer.marketShare && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Market Share</span>
                        <span className="text-sm font-semibold">
                          {buyer.marketShare.toFixed(1)}%
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-1">
                        {getTrendIcon(buyer.growthRate)}
                        Growth Rate
                      </span>
                      <span className={`text-sm font-semibold ${buyer.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {buyer.growthRate > 0 ? '+' : ''}{buyer.growthRate.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Avg Unit Price</span>
                      <span className="text-sm">
                        ${buyer.avgUnitPrice.toFixed(2)}/kg
                      </span>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Trade History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {filteredBuyers.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Globe className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No buyers found</h3>
            <p className="text-gray-600 text-center">
              Try adjusting your search criteria or select a different commodity
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PotentialBuyersComponent;
