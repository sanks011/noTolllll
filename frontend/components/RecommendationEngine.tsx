'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2,
  Star,
  ArrowRight,
  BarChart3,
  Globe,
  Clock
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

interface RecommendationEngineProps {
  sector: 'seafood' | 'textile';
  marketData: MarketData[];
}

interface Recommendation {
  rank: number;
  region: string;
  score: number;
  reasoning: string[];
  pros: string[];
  cons: string[];
  timeline: string;
  investmentRequired: 'low' | 'medium' | 'high';
  potentialROI: number;
  riskFactors: string[];
  actionItems: string[];
}

interface MarketMetrics {
  accessibility: number;  // Based on tariff rates (lower is better)
  profitability: number;  // Based on average price and volume
  growth: number;         // Based on historical growth
  stability: number;      // Based on risk level
  competition: number;    // Based on market share and saturation
}

export default function RecommendationEngine({ sector, marketData }: RecommendationEngineProps) {
  const [selectedRecommendation, setSelectedRecommendation] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    generateRecommendations();
  }, [sector, marketData]);

  const calculateMetrics = (market: MarketData): MarketMetrics => {
    // Normalize scores to 0-100 scale
    const maxTariff = Math.max(...marketData.map(m => m.tariffRate));
    const maxPrice = Math.max(...marketData.map(m => m.averagePrice));
    const maxVolume = Math.max(...marketData.map(m => m.volume));
    
    return {
      accessibility: ((maxTariff - market.tariffRate) / maxTariff) * 100,
      profitability: ((market.averagePrice / maxPrice) + (market.volume / maxVolume)) * 50,
      growth: Math.max(0, Math.min(100, market.growth * 10 + 50)),
      stability: market.riskLevel === 'low' ? 90 : market.riskLevel === 'medium' ? 60 : 30,
      competition: 100 - market.marketShare // Lower market share = less competition
    };
  };

  const generateRecommendations = () => {
    const recs: Recommendation[] = marketData.map((market, index) => {
      const metrics = calculateMetrics(market);
      
      // Calculate overall score (weighted average)
      const weights = {
        accessibility: 0.25,
        profitability: 0.30,
        growth: 0.20,
        stability: 0.15,
        competition: 0.10
      };
      
      const score = Math.round(
        metrics.accessibility * weights.accessibility +
        metrics.profitability * weights.profitability +
        metrics.growth * weights.growth +
        metrics.stability * weights.stability +
        metrics.competition * weights.competition
      );

      // Generate context-specific reasoning
      const reasoning: string[] = [];
      const pros: string[] = [];
      const cons: string[] = [];
      const riskFactors: string[] = [];
      const actionItems: string[] = [];

      // Accessibility analysis
      if (market.tariffRate < 10) {
        reasoning.push(`Low tariff barrier (${market.tariffRate}%) provides cost advantage`);
        pros.push('Favorable tariff environment');
      } else if (market.tariffRate > 15) {
        reasoning.push(`High tariff rate (${market.tariffRate}%) increases cost burden`);
        cons.push('Significant tariff barriers');
        riskFactors.push('High import duties');
      }

      // Profitability analysis
      if (market.averagePrice > marketData.reduce((sum, m) => sum + m.averagePrice, 0) / marketData.length) {
        reasoning.push('Above-average pricing indicates premium market positioning');
        pros.push('High-value market with premium pricing');
      }

      // Growth analysis
      if (market.growth > 5) {
        reasoning.push(`Strong growth trajectory (${market.growth.toFixed(1)}% annually)`);
        pros.push('Expanding market with growth potential');
      } else if (market.growth < 0) {
        reasoning.push(`Declining market (${market.growth.toFixed(1)}% annually)`);
        cons.push('Shrinking market conditions');
        riskFactors.push('Market contraction risk');
      }

      // Risk analysis
      if (market.riskLevel === 'low') {
        pros.push('Stable regulatory and political environment');
      } else if (market.riskLevel === 'high') {
        cons.push('High regulatory and market volatility');
        riskFactors.push('Regulatory uncertainty');
      }

      // Market share analysis
      if (market.marketShare > 40) {
        cons.push('Highly competitive market with dominant players');
        riskFactors.push('Intense competition from established players');
      } else if (market.marketShare < 20) {
        pros.push('Less saturated market with growth opportunities');
      }

      // Generate action items based on region
      switch (market.region) {
        case 'European Union':
          actionItems.push('Obtain required sustainability certifications');
          actionItems.push('Ensure compliance with EUDR regulations');
          actionItems.push('Develop relationships with EU distributors');
          break;
        case 'United States':
          actionItems.push('Navigate complex regulatory requirements');
          actionItems.push('Establish FDA/USDA compliance protocols');
          actionItems.push('Build partnerships with US importers');
          break;
        case 'Japan':
          actionItems.push('Adapt products to Japanese quality standards');
          actionItems.push('Understand consumer preferences and culture');
          actionItems.push('Leverage Japan-India CEPA benefits');
          break;
      }

      const timeline = score > 80 ? '6-12 months' : score > 60 ? '12-18 months' : '18-24 months';
      const investmentRequired = market.tariffRate < 8 ? 'low' : market.tariffRate < 15 ? 'medium' : 'high';
      const potentialROI = Math.round(score * 0.8 + Math.random() * 20);

      return {
        rank: index + 1,
        region: market.region,
        score,
        reasoning,
        pros,
        cons,
        timeline,
        investmentRequired,
        potentialROI,
        riskFactors,
        actionItems
      };
    });

    // Sort by score and assign ranks
    const sortedRecs = recs.sort((a, b) => b.score - a.score);
    sortedRecs.forEach((rec, index) => {
      rec.rank = index + 1;
    });

    setRecommendations(sortedRecs);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return <Badge className="bg-gold text-gold-foreground">🥇 #1 RECOMMENDED</Badge>;
      case 2: return <Badge className="bg-gray-200 text-gray-800">🥈 #2 ALTERNATIVE</Badge>;
      case 3: return <Badge className="bg-amber-100 text-amber-800">🥉 #3 OPTION</Badge>;
      default: return <Badge variant="outline">#{rank}</Badge>;
    }
  };

  const getInvestmentColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (recommendations.length === 0) {
    return <div className="animate-pulse">Generating recommendations...</div>;
  }

  const topRecommendation = recommendations[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-7 w-7 text-blue-600" />
            Market Recommendations
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            AI-powered market selection for {sector} exports
          </p>
        </div>
        
        <Badge className="text-sm px-3 py-1" variant="outline">
          <Star className="h-4 w-4 mr-1" />
          Smart Analysis
        </Badge>
      </div>

      {/* Top Recommendation Highlight */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getScoreBg(topRecommendation.score)}`}>
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Best Market Opportunity</CardTitle>
                <p className="text-gray-600 dark:text-gray-300">{topRecommendation.region}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${getScoreColor(topRecommendation.score)}`}>
                {topRecommendation.score}
              </p>
              <p className="text-sm text-gray-500">Opportunity Score</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">
                <strong>Timeline:</strong> {topRecommendation.timeline}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                <strong>ROI:</strong> {topRecommendation.potentialROI}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <Badge className={getInvestmentColor(topRecommendation.investmentRequired)}>
                {topRecommendation.investmentRequired.toUpperCase()} Investment
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {topRecommendation.reasoning.slice(0, 2).map((reason, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {reason}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <Card 
            key={rec.region}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedRecommendation === index ? 'ring-2 ring-blue-500' : ''
            } ${index === 0 ? 'border-2 border-blue-200' : ''}`}
            onClick={() => setSelectedRecommendation(index)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                {getRankBadge(rec.rank)}
                <span className={`text-2xl font-bold ${getScoreColor(rec.score)}`}>
                  {rec.score}
                </span>
              </div>
              <CardTitle className="text-lg">{rec.region}</CardTitle>
              <Progress value={rec.score} className="h-2" />
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Key Advantages
                </h4>
                <ul className="text-sm space-y-1">
                  {rec.pros.slice(0, 2).map((pro, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              {rec.cons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Considerations
                  </h4>
                  <ul className="text-sm space-y-1">
                    {rec.cons.slice(0, 1).map((con, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Timeline</p>
                    <p className="font-medium">{rec.timeline}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Expected ROI</p>
                    <p className="font-medium text-green-600">{rec.potentialROI}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Detailed Analysis: {recommendations[selectedRecommendation]?.region}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {recommendations[selectedRecommendation] && (
            <>
              {/* Strategic Reasoning */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Strategic Analysis
                </h4>
                <div className="space-y-2">
                  {recommendations[selectedRecommendation].reasoning.map((reason, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                      <p className="text-sm">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Plan */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Recommended Action Plan
                </h4>
                <div className="grid gap-3">
                  {recommendations[selectedRecommendation].actionItems.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm">{action}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Assessment */}
              {recommendations[selectedRecommendation].riskFactors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Risk Assessment
                  </h4>
                  <div className="space-y-2">
                    {recommendations[selectedRecommendation].riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        <p className="text-sm">{risk}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
