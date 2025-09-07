'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Leaf, DollarSign, Truck, Shield, Users, Factory } from 'lucide-react';

interface Scheme {
  id: string;
  title: string;
  ministry: string;
  category: string;
  description: string;
  benefits: string[];
  eligibility: string;
  applicationProcess: string;
  url: string;
  icon: React.ReactNode;
  amount?: string;
  duration?: string;
}

export default function SchemesSection() {
  // Hardcoded schemes from myscheme.gov.in based on Agriculture, Rural & Environment category
  const schemes: Scheme[] = [
    {
      id: 'pmksy',
      title: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Agriculture',
      description: 'Comprehensive scheme to enhance water use efficiency in agriculture through micro-irrigation and watershed development.',
      benefits: [
        'Subsidy up to 55% for micro-irrigation systems',
        'Water conservation and improved crop yield',
        'Reduced cultivation cost and enhanced income'
      ],
      eligibility: 'All farmers including small and marginal farmers, SHGs, cooperatives',
      applicationProcess: 'Apply through District Collector office or online portal',
      url: 'https://www.myscheme.gov.in/schemes/pmksy',
      icon: <Leaf className="h-6 w-6 text-green-600" />,
      amount: '₹50,000 - ₹5 Lakh',
      duration: '5 years'
    },
    {
      id: 'pmfby',
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Insurance',
      description: 'Crop insurance scheme providing financial support to farmers in case of crop failure due to natural calamities.',
      benefits: [
        'Premium subsidy up to 95%',
        'Comprehensive risk coverage',
        'Quick settlement of claims'
      ],
      eligibility: 'All farmers growing notified crops in notified areas',
      applicationProcess: 'Apply through banks, CSCs, or insurance company agents',
      url: 'https://www.myscheme.gov.in/schemes/pmfby',
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      amount: 'Based on crop value',
      duration: 'Seasonal'
    },
    {
      id: 'mksp',
      title: 'Market Intervention Scheme and Price Support Scheme',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Price Support',
      description: 'Provides price support to farmers for agricultural commodities when market prices fall below minimum support price.',
      benefits: [
        'Guaranteed minimum price for crops',
        'Protection from price volatility',
        'Direct benefit transfer to farmers'
      ],
      eligibility: 'Farmers producing eligible agricultural commodities',
      applicationProcess: 'Register with designated procurement agencies',
      url: 'https://www.myscheme.gov.in/schemes/mksp',
      icon: <DollarSign className="h-6 w-6 text-yellow-600" />,
      amount: 'MSP rates',
      duration: 'Ongoing'
    },
    {
      id: 'pmkisan',
      title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Direct Benefit Transfer',
      description: 'Direct income support to small and marginal farmers providing ₹6,000 per year in three installments.',
      benefits: [
        '₹6,000 per year direct cash transfer',
        'No paperwork or documentation required',
        'Direct transfer to bank account'
      ],
      eligibility: 'Small and marginal farmers with cultivable land up to 2 hectares',
      applicationProcess: 'Register online at pmkisan.gov.in or through CSCs',
      url: 'https://www.myscheme.gov.in/schemes/pm-kisan',
      icon: <Users className="h-6 w-6 text-green-500" />,
      amount: '₹6,000 per year',
      duration: 'Ongoing'
    },
    {
      id: 'pmfme',
      title: 'PM Formalization of Micro Food Processing Enterprises (PM FME)',
      ministry: 'Ministry of Food Processing Industries',
      category: 'Food Processing',
      description: 'Scheme to enhance competitiveness of individual micro-enterprises in food processing sector and promote formalization.',
      benefits: [
        'Credit linked subsidy up to ₹10 lakh',
        'Support for equipment and working capital',
        'Training and skill development'
      ],
      eligibility: 'Existing individual micro-enterprises engaged in food processing',
      applicationProcess: 'Apply through designated banks or online portal',
      url: 'https://www.myscheme.gov.in/schemes/pmfme',
      icon: <Factory className="h-6 w-6 text-purple-600" />,
      amount: 'Up to ₹10 Lakh',
      duration: '2025-26'
    },
    {
      id: 'rkvy',
      title: 'Rashtriya Krishi Vikas Yojana (RKVY-RAFTAAR)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Infrastructure Development',
      description: 'Comprehensive scheme to strengthen agriculture infrastructure and promote sustainable agricultural development.',
      benefits: [
        'Infrastructure development support',
        'Technology adoption assistance',
        'Market linkage facilitation'
      ],
      eligibility: 'State governments, farmer groups, cooperatives, private companies',
      applicationProcess: 'Apply through state agriculture departments',
      url: 'https://www.myscheme.gov.in/schemes/rkvy',
      icon: <Truck className="h-6 w-6 text-orange-600" />,
      amount: 'Project-based',
      duration: '2021-26'
    }
  ];

  const handleSchemeClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Agriculture': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Insurance': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Price Support': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Direct Benefit Transfer': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Food Processing': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Infrastructure Development': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Government Schemes</h2>
          <p className="text-muted-foreground">
            Discover and apply for government schemes to boost your agricultural business
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.open('https://www.myscheme.gov.in/search/category/Agriculture,Rural%20&%20Environment', '_blank')}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          View All Schemes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {schemes.map((scheme) => (
          <Card key={scheme.id} className="relative hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {scheme.icon}
                  <div>
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {scheme.title}
                    </CardTitle>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={getCategoryColor(scheme.category)}>
                  {scheme.category}
                </Badge>
                {scheme.amount && (
                  <Badge variant="outline" className="text-xs">
                    {scheme.amount}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {scheme.description}
              </p>

              <div>
                <h4 className="text-sm font-semibold mb-2">Key Benefits:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {scheme.benefits.slice(0, 2).map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="line-clamp-2">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Ministry: </span>
                  <span className="text-xs">{scheme.ministry}</span>
                </div>
                {scheme.duration && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Duration: </span>
                    <span className="text-xs">{scheme.duration}</span>
                  </div>
                )}
              </div>

              <Button 
                className="w-full"
                onClick={() => handleSchemeClick(scheme.url)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Need Help with Applications?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Get assistance with scheme applications, documentation, and eligibility verification
              </p>
            </div>
            <Button>
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
