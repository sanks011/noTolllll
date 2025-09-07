'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Globe, 
  DollarSign, 
  Users, 
  BarChart3,
  Search,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { tradeApi, TradeBuyer, ExportPerformance, TradingPartner, MarketOpportunity } from '@/lib/trade-api';

interface TradeIntelligenceState {
  loading: boolean;
  error: string | null;
  exportPerformance: ExportPerformance[];
  tradingPartners: TradingPartner[];
  marketOpportunities: MarketOpportunity[];
  potentialBuyers: TradeBuyer[];
  selectedCommodity: string;
  selectedSector: string;
}

export default function TradeIntelligencePanel() {
  const [state, setState] = useState<TradeIntelligenceState>({
    loading: true,
    error: null,
    exportPerformance: [],
    tradingPartners: [],
    marketOpportunities: [],
    potentialBuyers: [],
    selectedCommodity: '',
    selectedSector: ''
  });

  const [commoditySearch, setCommoditySearch] = useState('');

  // Common commodity codes for quick access
  const commonCommodities = [
    { code: '52', name: 'Cotton' },
    { code: '61', name: 'Knitted Apparel' },
    { code: '62', name: 'Woven Apparel' },
    { code: '03', name: 'Fish & Seafood' },
    { code: '07', name: 'Vegetables' },
    { code: '08', name: 'Fruits & Nuts' },
    { code: '09', name: 'Coffee, Tea, Spices' },
    { code: '71', name: 'Gems & Jewelry' },
    { code: '29', name: 'Organic Chemicals' },
    { code: '84', name: 'Machinery' }
  ];

  const sectors = [
    'textiles', 'agriculture', 'seafood', 'chemicals', 
    'machinery', 'automotive', 'leather', 'gems', 'pharmaceuticals'
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (state.selectedSector) {
      loadMarketOpportunities();
    }
  }, [state.selectedSector]);

  useEffect(() => {
    if (state.selectedCommodity) {
      loadCommodityData();
    }
  }, [state.selectedCommodity]);

  const loadInitialData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [exportResp, partnersResp] = await Promise.all([
        tradeApi.getExportPerformance(),
        tradeApi.getTradingPartners()
      ]);

      setState(prev => ({
        ...prev,
        exportPerformance: exportResp.data.commodities,
        tradingPartners: partnersResp.data.partners,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load trade data',
        loading: false
      }));
    }
  };

  const loadMarketOpportunities = async () => {
    try {
      const response = await tradeApi.getMarketOpportunities(state.selectedSector);
      setState(prev => ({
        ...prev,
        marketOpportunities: response.data.opportunities
      }));
    } catch (error) {
      console.error('Failed to load market opportunities:', error);
    }
  };

  const loadCommodityData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const buyersResp = await tradeApi.getPotentialBuyers(state.selectedCommodity);
      
      setState(prev => ({
        ...prev,
        potentialBuyers: buyersResp.data.buyers,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load commodity data',
        loading: false
      }));
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getTrendIcon = (trend: string, growthRate: number) => {
    if (trend === 'growing' || growthRate > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend === 'declining' || growthRate < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getPotentialBadge = (potential: string) => {
    const variants = {
      'High': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-red-100 text-red-800'
    };
    return variants[potential as keyof typeof variants] || variants.Low;
  };

  if (state.loading && state.exportPerformance.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Trade Intelligence</h2>
          <p className="text-muted-foreground">
            Real-time trade data from UN Comtrade
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => tradeApi.clearCache()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={state.selectedSector} onValueChange={(value) => setState(prev => ({ ...prev, selectedSector: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select Sector" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map(sector => (
              <SelectItem key={sector} value={sector}>
                {sector.charAt(0).toUpperCase() + sector.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={state.selectedCommodity} onValueChange={(value) => setState(prev => ({ ...prev, selectedCommodity: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select Commodity" />
          </SelectTrigger>
          <SelectContent>
            {commonCommodities.map(commodity => (
              <SelectItem key={commodity.code} value={commodity.code}>
                {commodity.code} - {commodity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search commodity code..."
            value={commoditySearch}
            onChange={(e) => setCommoditySearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Export Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Export Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(state.exportPerformance.reduce((sum, item) => sum + item.totalValue, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {state.exportPerformance.length} commodities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trading Partners</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.tradingPartners.length}</div>
            <p className="text-xs text-muted-foreground">
              Active export destinations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Opportunities</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.marketOpportunities.length}</div>
            <p className="text-xs text-muted-foreground">
              Identified opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Buyers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.potentialBuyers.length}</div>
            <p className="text-xs text-muted-foreground">
              For selected commodity
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Export Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.exportPerformance.slice(0, 5).map((item) => (
                <div key={item.code} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTrendIcon(item.trend, item.growthRate)}
                    <div>
                      <p className="font-medium">{item.code}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.totalValue)}</p>
                    <p className={`text-sm ${item.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.growthRate >= 0 ? '+' : ''}{item.growthRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Trading Partners */}
        <Card>
          <CardHeader>
            <CardTitle>Top Export Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.tradingPartners.slice(0, 5).map((partner) => (
                <div key={partner.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">
                        {partner.country.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{partner.country}</p>
                      <p className="text-sm text-muted-foreground">
                        {partner.records} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(partner.exportValue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Opportunities */}
        {state.marketOpportunities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Market Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.marketOpportunities.slice(0, 3).map((opportunity, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{opportunity.commodity.code}</h4>
                      <Badge variant="secondary">
                        {formatCurrency(opportunity.marketSize)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {opportunity.commodity.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Top Markets:</p>
                      {opportunity.topBuyers.slice(0, 3).map((buyer, bidx) => (
                        <div key={bidx} className="flex items-center justify-between text-sm">
                          <span>{buyer.country}</span>
                          <Badge className={getPotentialBadge(buyer.potential)}>
                            {buyer.potential}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Potential Buyers */}
        {state.potentialBuyers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Potential Buyers - {state.selectedCommodity}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.potentialBuyers.slice(0, 6).map((buyer) => (
                  <div key={buyer.country} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-green-600">
                          {buyer.country.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{buyer.country}</p>
                        <p className="text-sm text-muted-foreground">
                          {buyer.records} import records
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(buyer.importValue)}</p>
                      <Badge className={getPotentialBadge(buyer.marketPotential)}>
                        {buyer.marketPotential}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data Source Attribution */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Data powered by UN Comtrade API</span>
            <Button variant="ghost" size="sm" asChild>
              <a 
                href="https://comtradeapi.un.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                Learn more <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
