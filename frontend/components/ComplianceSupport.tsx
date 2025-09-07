'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Package, 
  Users, 
  CreditCard,
  ArrowRight,
  Globe
} from 'lucide-react';

interface ComplianceSupportProps {
  selectedCountry: string;
  sector: string;
}

const COMPLIANCE_DATA = {
  'United States': {
    requirements: [
      { name: 'FDA Registration', status: 'required', description: 'Food facility registration required' },
      { name: 'HACCP Certification', status: 'required', description: 'Hazard Analysis Critical Control Points' },
      { name: 'Nutritional Labeling', status: 'required', description: 'FDA nutrition facts panel' },
      { name: 'Country of Origin', status: 'required', description: 'COOL labeling requirements' },
    ],
    packagingProviders: [
      { name: 'US Packaging Solutions', location: 'New York', specialty: 'FDA Compliant Packaging' },
      { name: 'Marine Pack USA', location: 'California', specialty: 'Seafood Cold Chain' },
    ],
    documents: ['FDA Form 3537', 'HACCP Plan Template', 'Nutritional Analysis Form'],
  },
  'European Union': {
    requirements: [
      { name: 'CE Marking', status: 'required', description: 'European Conformity marking' },
      { name: 'HACCP Certification', status: 'required', description: 'EU food safety standards' },
      { name: 'Organic Certification', status: 'recommended', description: 'EU Organic regulation' },
      { name: 'Allergen Labeling', status: 'required', description: 'EU allergen information requirements' },
    ],
    packagingProviders: [
      { name: 'EuroPack Solutions', location: 'Amsterdam', specialty: 'EU Standards Compliance' },
      { name: 'Nordic Cold Chain', location: 'Copenhagen', specialty: 'Temperature Controlled' },
    ],
    documents: ['EU Health Certificate', 'HACCP Documentation', 'Allergen Declaration'],
  },
  'Japan': {
    requirements: [
      { name: 'JAS Certification', status: 'required', description: 'Japanese Agricultural Standards' },
      { name: 'Radioactivity Testing', status: 'required', description: 'Post-Fukushima requirements' },
      { name: 'Japanese Labeling', status: 'required', description: 'Local language requirements' },
      { name: 'Import License', status: 'required', description: 'Japanese import permit' },
    ],
    packagingProviders: [
      { name: 'Tokyo Marine Pack', location: 'Tokyo', specialty: 'JAS Compliant Packaging' },
      { name: 'Osaka Cold Solutions', location: 'Osaka', specialty: 'Japanese Standards' },
    ],
    documents: ['JAS Certificate', 'Radioactivity Test Report', 'Japanese Label Template'],
  },
};

export default function ComplianceSupport({ selectedCountry, sector }: ComplianceSupportProps) {
  const [activeTab, setActiveTab] = useState('requirements');
  const [completedRequirements, setCompletedRequirements] = useState<string[]>([]);

  const countryData = COMPLIANCE_DATA[selectedCountry as keyof typeof COMPLIANCE_DATA] || COMPLIANCE_DATA['United States'];
  const completionPercentage = (completedRequirements.length / countryData.requirements.length) * 100;

  const toggleRequirement = (reqName: string) => {
    setCompletedRequirements(prev => 
      prev.includes(reqName) 
        ? prev.filter(r => r !== reqName)
        : [...prev, reqName]
    );
  };

  const initiatePayment = () => {
    // Simulate payment process
    alert('Payment simulation: $50,000 advance payment initiated by buyer');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance & Certification Guide - {selectedCountry}
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Compliance Progress</span>
                <span className="text-sm font-medium">{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
            <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
              {completionPercentage === 100 ? "Ready to Export" : "In Progress"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="packaging">Packaging</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
            </TabsList>

            <TabsContent value="requirements" className="space-y-4">
              <div className="space-y-3">
                {countryData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleRequirement(req.name)}>
                        {completedRequirements.includes(req.name) ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                      </button>
                      <div>
                        <h4 className="font-medium">{req.name}</h4>
                        <p className="text-sm text-muted-foreground">{req.description}</p>
                      </div>
                    </div>
                    <Badge variant={req.status === 'required' ? 'destructive' : 'secondary'}>
                      {req.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="packaging" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {countryData.packagingProviders.map((provider, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {provider.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{provider.location}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                        <Button size="sm" className="w-full">
                          <Users className="h-3 w-3 mr-2" />
                          Connect with Provider
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {countryData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{doc}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-2" />
                      Download Template
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Deal Ready for Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Order Value:</span>
                      <span className="font-bold text-lg">$125,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Advance Payment (40%):</span>
                      <span className="font-bold text-green-600">$50,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Payment on Delivery (60%):</span>
                      <span className="font-bold">$75,000</span>
                    </div>
                    <Button 
                      onClick={initiatePayment}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Simulate Buyer Payment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Simulated payment from buyer side for demonstration
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
