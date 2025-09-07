'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, RefreshCw, Clock, TrendingUp } from 'lucide-react';
import { apiService, NewsArticle, NewsResponse } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface NewsSectionProps {
  className?: string;
}

export default function NewsSection({ className }: NewsSectionProps) {
  const [newsData, setNewsData] = useState<{
    tariff: NewsArticle[];
    trade: NewsArticle[];
    economy: NewsArticle[];
  }>({
    tariff: [],
    trade: [],
    economy: []
  });
  
  const [loading, setLoading] = useState<{
    tariff: boolean;
    trade: boolean;
    economy: boolean;
  }>({
    tariff: false,
    trade: false,
    economy: false
  });

  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tariff' | 'trade' | 'economy'>('tariff');

  useEffect(() => {
    loadNews('tariff');
  }, []);

  const loadNews = async (category: 'tariff' | 'trade' | 'economy') => {
    setLoading(prev => ({ ...prev, [category]: true }));
    
    try {
      const response: NewsResponse = await apiService.getNewsByCategory(category);
      
      if (response.success) {
        setNewsData(prev => ({
          ...prev,
          [category]: response.data
        }));
        setLastUpdated(response.meta.lastUpdated);
      }
    } catch (error: any) {
      console.error(`Error loading ${category} news:`, error);
      toast({
        title: 'Error',
        description: `Failed to load ${category} news. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }));
    }
  };

  const refreshNews = async () => {
    setRefreshing(true);
    
    try {
      const response: NewsResponse = await apiService.refreshNews(activeTab);
      
      if (response.success) {
        setNewsData(prev => ({
          ...prev,
          [activeTab]: response.data
        }));
        setLastUpdated(response.meta.lastUpdated);
        
        toast({
          title: 'Success',
          description: `${activeTab} news refreshed successfully`,
        });
      }
    } catch (error: any) {
      console.error('Error refreshing news:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh news. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabChange = (value: string) => {
    const tab = value as 'tariff' | 'trade' | 'economy';
    setActiveTab(tab);
    
    // Load data if not already loaded
    if (newsData[tab].length === 0) {
      loadNews(tab);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Tariffs & Duties':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Import/Export':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Trade Policy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Economic News':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderNewsCard = (article: NewsArticle, index: number) => (
    <Card key={index} className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${getCategoryColor(article.category)}`}
              >
                {article.category}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(article.publishedAt)}
              </span>
            </div>
            
            <h4 className="font-medium text-sm mb-2 leading-tight line-clamp-2">
              {article.title}
            </h4>
            
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {article.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {article.source.name}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
                onClick={() => window.open(article.url, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Read
              </Button>
            </div>
          </div>
          
          {article.image && (
            <div className="flex-shrink-0">
              <img
                src={article.image}
                alt={article.title}
                className="w-16 h-16 rounded object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Trade News Updates
            </CardTitle>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: {formatDate(lastUpdated)}
              </p>
            )}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={refreshNews}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="tariff" className="text-xs">
              Tariff News
            </TabsTrigger>
            <TabsTrigger value="trade" className="text-xs">
              Trade News
            </TabsTrigger>
            <TabsTrigger value="economy" className="text-xs">
              Economic News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tariff">
            {loading.tariff ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {newsData.tariff.length > 0 ? (
                  newsData.tariff.map((article, index) => renderNewsCard(article, index))
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center text-muted-foreground">
                      No tariff news available. Click refresh to load latest news.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trade">
            {loading.trade ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {newsData.trade.length > 0 ? (
                  newsData.trade.map((article, index) => renderNewsCard(article, index))
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center text-muted-foreground">
                      No trade news available. Click refresh to load latest news.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="economy">
            {loading.economy ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {newsData.economy.length > 0 ? (
                  newsData.economy.map((article, index) => renderNewsCard(article, index))
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center text-muted-foreground">
                      No economic news available. Click refresh to load latest news.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
