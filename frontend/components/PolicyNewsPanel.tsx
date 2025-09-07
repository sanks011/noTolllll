'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Newspaper, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  ExternalLink,
  Info,
  Clock,
  Globe
} from 'lucide-react';

interface PolicyNewsPanelProps {
  sector: 'seafood' | 'textile';
  selectedRegion: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  category: 'policy' | 'trade' | 'regulation' | 'market';
  impact: 'positive' | 'negative' | 'neutral';
  region: string;
  url?: string;
  relevanceScore: number;
}

interface PolicyUpdate {
  id: string;
  title: string;
  description: string;
  effectiveDate: string;
  type: 'tariff' | 'regulation' | 'agreement' | 'sanction';
  impact: 'high' | 'medium' | 'low';
  region: string;
  sector: string;
}

// Hardcoded news and policy data
const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'EU Proposes New Sustainability Standards for Seafood Imports',
    summary: 'The European Union is introducing stricter sustainability certifications for seafood imports, potentially affecting Indian exporters starting January 2025.',
    source: 'EU Trade Commission',
    date: '2024-12-15',
    category: 'regulation',
    impact: 'negative',
    region: 'European Union',
    relevanceScore: 95
  },
  {
    id: '2',
    title: 'US Reduces Textile Tariffs Under New Trade Framework',
    summary: 'The United States announces a 20% reduction in textile tariffs for developing countries as part of its new inclusive trade framework.',
    source: 'US Trade Representative',
    date: '2024-12-10',
    category: 'policy',
    impact: 'positive',
    region: 'United States',
    relevanceScore: 88
  },
  {
    id: '3',
    title: 'Japan-India Economic Partnership Agreement Updates',
    summary: 'Japan and India have signed amendments to their economic partnership agreement, reducing barriers for agricultural and textile products.',
    source: 'Ministry of External Affairs',
    date: '2024-12-05',
    category: 'trade',
    impact: 'positive',
    region: 'Japan',
    relevanceScore: 92
  },
  {
    id: '4',
    title: 'Global Seafood Prices Surge Due to Climate Change Impact',
    summary: 'Rising ocean temperatures and overfishing concerns drive up global seafood prices, creating opportunities for sustainable producers.',
    source: 'FAO Market Report',
    date: '2024-12-01',
    category: 'market',
    impact: 'positive',
    region: 'Global',
    relevanceScore: 78
  },
  {
    id: '5',
    title: 'EU Digital Product Passport Requirement for Textiles',
    summary: 'New EU regulations require digital product passports for textile imports, including information on sustainability and supply chain transparency.',
    source: 'European Commission',
    date: '2024-11-28',
    category: 'regulation',
    impact: 'negative',
    region: 'European Union',
    relevanceScore: 85
  },
  {
    id: '6',
    title: 'US-India Strategic Trade Initiative Expansion',
    summary: 'The US-India Strategic Trade Initiative expands to include preferential treatment for certain textile and agricultural products.',
    source: 'USTR Office',
    date: '2024-11-25',
    category: 'policy',
    impact: 'positive',
    region: 'United States',
    relevanceScore: 91
  }
];

const POLICY_UPDATES: PolicyUpdate[] = [
  {
    id: '1',
    title: 'EU Deforestation Regulation (EUDR)',
    description: 'Requires proof that imported products do not contribute to deforestation. Affects packaging materials in seafood exports.',
    effectiveDate: '2024-12-30',
    type: 'regulation',
    impact: 'high',
    region: 'European Union',
    sector: 'seafood'
  },
  {
    id: '2',
    title: 'US Uyghur Forced Labor Prevention Act',
    description: 'Expanded scope includes textile products from specific regions. Enhanced due diligence required for textile supply chains.',
    effectiveDate: '2024-01-01',
    type: 'regulation',
    impact: 'high',
    region: 'United States',
    sector: 'textile'
  },
  {
    id: '3',
    title: 'Japan-India CEPA Textile Protocol',
    description: 'Reduced tariffs on specific textile categories under the updated Comprehensive Economic Partnership Agreement.',
    effectiveDate: '2025-04-01',
    type: 'agreement',
    impact: 'medium',
    region: 'Japan',
    sector: 'textile'
  },
  {
    id: '4',
    title: 'EU Carbon Border Adjustment Mechanism',
    description: 'CBAM implementation affects energy-intensive textile production. Carbon certificates required for imports.',
    effectiveDate: '2026-01-01',
    type: 'tariff',
    impact: 'high',
    region: 'European Union',
    sector: 'textile'
  }
];

export default function PolicyNewsPanel({ sector, selectedRegion }: PolicyNewsPanelProps) {
  const [activeTab, setActiveTab] = useState<'news' | 'policy'>('news');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredNews = MOCK_NEWS.filter(item => {
    const regionMatch = selectedRegion === 'Global' || item.region === selectedRegion || item.region === 'Global';
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    return regionMatch && categoryMatch;
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);

  const filteredPolicies = POLICY_UPDATES.filter(policy => {
    const regionMatch = policy.region === selectedRegion;
    const sectorMatch = policy.sector === sector;
    return regionMatch && sectorMatch;
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-600" />;
      case 'low': return <TrendingUp className="h-4 w-4 text-green-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'policy': return 'bg-blue-100 text-blue-800';
      case 'trade': return 'bg-green-100 text-green-800';
      case 'regulation': return 'bg-orange-100 text-orange-800';
      case 'market': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Newspaper className="h-7 w-7 text-blue-600" />
            Policy & Market Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Latest updates for {sector} exports to {selectedRegion}
          </p>
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          <Button
            variant={selectedCategory === 'policy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('policy')}
          >
            Policy
          </Button>
          <Button
            variant={selectedCategory === 'trade' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('trade')}
          >
            Trade
          </Button>
          <Button
            variant={selectedCategory === 'regulation' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('regulation')}
          >
            Regulations
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            Latest News ({filteredNews.length})
          </TabsTrigger>
          <TabsTrigger value="policy" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Policy Updates ({filteredPolicies.length})
          </TabsTrigger>
        </TabsList>

        {/* News Tab */}
        <TabsContent value="news" className="space-y-4">
          {filteredNews.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No news available for the selected filters</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredNews.map((news) => (
                <Card key={news.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(news.category)}>
                            {news.category.toUpperCase()}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`border ${getImpactColor(news.impact)}`}
                          >
                            <span className="flex items-center gap-1">
                              {getImpactIcon(news.impact)}
                              {news.impact.toUpperCase()}
                            </span>
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(news.date)}
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2">{news.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {news.summary}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-blue-600">
                              {news.source}
                            </span>
                            <span className="text-sm text-gray-500">
                              Relevance: {news.relevanceScore}%
                            </span>
                          </div>
                          
                          {news.url && (
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              Read More
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Policy Updates Tab */}
        <TabsContent value="policy" className="space-y-4">
          {filteredPolicies.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No policy updates for {selectedRegion} - {sector}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPolicies.map((policy) => (
                <Card key={policy.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getImpactColor(policy.impact)}>
                          <span className="flex items-center gap-1">
                            {getImpactIcon(policy.impact)}
                            {policy.impact.toUpperCase()} IMPACT
                          </span>
                        </Badge>
                        <Badge variant="secondary">
                          {policy.type.toUpperCase()}
                        </Badge>
                        {isUpcoming(policy.effectiveDate) && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Clock className="h-3 w-3 mr-1" />
                            UPCOMING
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{policy.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {policy.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          Effective: {formatDate(policy.effectiveDate)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {policy.region} • {policy.sector}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Quick Intelligence Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {filteredNews.filter(n => n.impact === 'positive').length}
              </p>
              <p className="text-sm text-gray-600">Positive Updates</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {filteredNews.filter(n => n.impact === 'negative').length}
              </p>
              <p className="text-sm text-gray-600">Risk Alerts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {filteredPolicies.filter(p => isUpcoming(p.effectiveDate)).length}
              </p>
              <p className="text-sm text-gray-600">Upcoming Changes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
