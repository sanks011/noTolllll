'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, CreditCard, FileText, Truck, Shield, Clock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentSimulationProps {
  buyer: any;
  onClose: () => void;
}

export default function PaymentSimulation({ buyer, onClose }: PaymentSimulationProps) {
  const [step, setStep] = useState(1);
  const [dealDetails, setDealDetails] = useState({
    product: 'Frozen Shrimp',
    quantity: '',
    unitPrice: '',
    totalAmount: '',
    paymentTerms: '30 days',
    deliveryTerms: 'FOB',
    currency: 'USD'
  });
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const steps = [
    { id: 1, name: 'Negotiate Terms', status: step >= 1 ? 'completed' : 'pending' },
    { id: 2, name: 'Agreement & Compliance', status: step >= 2 ? 'completed' : 'pending' },
    { id: 3, name: 'Payment Processing', status: step >= 3 ? 'completed' : 'pending' },
    { id: 4, name: 'Order Fulfillment', status: step >= 4 ? 'completed' : 'pending' }
  ];

  const calculateTotal = () => {
    const qty = parseFloat(dealDetails.quantity) || 0;
    const price = parseFloat(dealDetails.unitPrice) || 0;
    return (qty * price).toFixed(2);
  };

  const handleNext = async () => {
    setProcessing(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (step < 4) {
      setStep(step + 1);
      
      // Update deal details for next step
      if (step === 1) {
        setDealDetails(prev => ({ ...prev, totalAmount: calculateTotal() }));
        toast({
          title: "Terms Agreed!",
          description: "Moving to compliance verification..."
        });
      } else if (step === 2) {
        toast({
          title: "Compliance Verified!",
          description: "Processing payment authorization..."
        });
      } else if (step === 3) {
        toast({
          title: "Payment Successful!",
          description: "Order has been confirmed and will be fulfilled."
        });
      }
    } else {
      toast({
        title: "Deal Completed!",
        description: "Congratulations! Your export order has been successfully processed."
      });
      setTimeout(onClose, 2000);
    }
    
    setProcessing(false);
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Negotiate Deal Terms</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product">Product</Label>
                <Select value={dealDetails.product} onValueChange={(value) => 
                  setDealDetails(prev => ({ ...prev, product: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Frozen Shrimp">Frozen Shrimp</SelectItem>
                    <SelectItem value="Prawns">Prawns</SelectItem>
                    <SelectItem value="Fish Fillets">Fish Fillets</SelectItem>
                    <SelectItem value="Crab">Crab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity (MT)</Label>
                <Input
                  id="quantity"
                  value={dealDetails.quantity}
                  onChange={(e) => setDealDetails(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="e.g., 50"
                />
              </div>
              <div>
                <Label htmlFor="unitPrice">Unit Price ($/MT)</Label>
                <Input
                  id="unitPrice"
                  value={dealDetails.unitPrice}
                  onChange={(e) => setDealDetails(prev => ({ ...prev, unitPrice: e.target.value }))}
                  placeholder="e.g., 8500"
                />
              </div>
              <div>
                <Label>Total Amount</Label>
                <div className="text-2xl font-bold text-green-600">
                  ${calculateTotal()} {dealDetails.currency}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select value={dealDetails.paymentTerms} onValueChange={(value) => 
                  setDealDetails(prev => ({ ...prev, paymentTerms: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30 days">30 Days</SelectItem>
                    <SelectItem value="45 days">45 Days</SelectItem>
                    <SelectItem value="60 days">60 Days</SelectItem>
                    <SelectItem value="Advance payment">Advance Payment</SelectItem>
                    <SelectItem value="L/C at sight">L/C at Sight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deliveryTerms">Delivery Terms</Label>
                <Select value={dealDetails.deliveryTerms} onValueChange={(value) => 
                  setDealDetails(prev => ({ ...prev, deliveryTerms: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOB">FOB (Free on Board)</SelectItem>
                    <SelectItem value="CIF">CIF (Cost, Insurance & Freight)</SelectItem>
                    <SelectItem value="CFR">CFR (Cost & Freight)</SelectItem>
                    <SelectItem value="EXW">EXW (Ex Works)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Agreement & Compliance Verification</h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deal Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Product:</span>
                  <span className="font-medium">{dealDetails.product}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-medium">{dealDetails.quantity} MT</span>
                </div>
                <div className="flex justify-between">
                  <span>Unit Price:</span>
                  <span className="font-medium">${dealDetails.unitPrice}/MT</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-green-600">${calculateTotal()} {dealDetails.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Terms:</span>
                  <span className="font-medium">{dealDetails.paymentTerms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Terms:</span>
                  <span className="font-medium">{dealDetails.deliveryTerms}</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-3">
              <h4 className="font-medium">Compliance Checklist</h4>
              <div className="space-y-2">
                {[
                  'Export license verified',
                  'Product certifications confirmed',
                  'Packaging standards met',
                  'Documentation complete',
                  'Quality inspection passed'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Payment Processing</h3>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Authorization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${calculateTotal()} {dealDetails.currency}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Payment from {buyer.name}
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Payment Authorized</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span>Letter of Credit</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bank:</span>
                      <span>International Trade Bank</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reference:</span>
                      <span>LC-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Order Fulfillment</h3>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-medium">EXP-{Date.now().toString().slice(-6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Ship Date:</span>
                    <span className="font-medium">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Delivery:</span>
                    <span className="font-medium">{new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Line:</span>
                    <span className="font-medium">Ocean Express Shipping</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium mb-3">Next Steps</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Production scheduling initiated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Quality inspection scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Packaging and labeling</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Export documentation preparation</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deal Processing with {buyer.name}</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  stepItem.status === 'completed' 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : step === stepItem.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {stepItem.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    stepItem.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    stepItem.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            {steps.map(stepItem => (
              <div key={stepItem.id} className="text-center">
                <span className={step === stepItem.id ? 'font-medium text-blue-600' : 'text-gray-500'}>
                  {stepItem.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {getStepContent()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={processing}
            className="flex items-center gap-2"
          >
            {processing ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : step < 4 ? (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              'Complete Deal'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
