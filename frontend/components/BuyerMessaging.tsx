'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Send, MessageSquare, Globe, Zap, CheckCircle, X, FileText, Clock, DollarSign, Shield } from 'lucide-react';
import { externalApiService } from '@/lib/external-apis';
import { useToast } from '@/hooks/use-toast';
import PaymentSimulation from './PaymentSimulation';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'buyer' | 'seller';
  content: string;
  originalLanguage?: string;
  translatedContent?: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

interface BuyerMessagingProps {
  buyer: any;
  onClose?: () => void;
}

export default function BuyerMessaging({ buyer, onClose }: BuyerMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [pitchTemplate, setPitchTemplate] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showCompliance, setShowCompliance] = useState(false);
  const [complianceCompleted, setComplianceCompleted] = useState(false);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [complianceChecklist, setComplianceChecklist] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  // Language options for auto-translation
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  ];

  // Initialize conversation with buyer persona
  useEffect(() => {
    if (buyer) {
      initializeBuyerPersona();
      generatePitchTemplate();
      initializeComplianceChecklist();
    }
  }, [buyer]);

  const initializeComplianceChecklist = () => {
    // Initialize compliance checklist based on buyer's country
    const getComplianceRequirements = (country: string) => {
      const requirements: {[key: string]: {[key: string]: boolean}} = {
        'Japan': {
          'HACCP Certification': false,
          'Japanese Import License': false,
          'Food Sanitation Law Compliance': false,
          'Radioactivity Testing Certificate': false,
          'Proper Labeling in Japanese': false,
          'Cold Chain Documentation': false
        },
        'USA': {
          'FDA Registration': false,
          'HACCP Certification': false,
          'Country of Origin Labeling': false,
          'Nutritional Information Panel': false,
          'Import Permit Documentation': false,
          'Third-Party Laboratory Testing': false
        },
        'Germany': {
          'EU Import License': false,
          'HACCP Certification': false,
          'CE Marking Compliance': false,
          'German Language Labeling': false,
          'Organic Certification (if applicable)': false,
          'Traceability Documentation': false
        },
        'UAE': {
          'UAE Import Permit': false,
          'Halal Certification': false,
          'Emirates Authority Food Safety': false,
          'Arabic Language Labeling': false,
          'Certificate of Origin': false,
          'Health Certificate': false
        }
      };
      
      return requirements[country] || {
        'Export License': false,
        'Health Certificate': false,
        'Certificate of Origin': false,
        'Quality Assurance Documentation': false,
        'Proper Packaging & Labeling': false,
        'Insurance Documentation': false
      };
    };

    setComplianceChecklist(getComplianceRequirements(buyer.country));
  };

  const initializeBuyerPersona = async () => {
    try {
      // Generate initial buyer persona response
      const persona = await generateBuyerPersona();
      const initialMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: buyer.id,
        senderName: buyer.name,
        senderType: 'buyer',
        content: persona,
        timestamp: new Date(),
        status: 'delivered'
      };

      setMessages([initialMessage]);
    } catch (error) {
      console.error('Error initializing buyer persona:', error);
    }
  };

  const generateBuyerPersona = async (): Promise<string> => {
    try {
      const prompt = `You are ${buyer.name} from ${buyer.city}, ${buyer.country}. You are a professional seafood buyer with the following profile:

Company: ${buyer.name}
Location: ${buyer.city}, ${buyer.country}
Import Volume: ${buyer.importVolume}
Product Categories: ${buyer.productCategories.join(', ')}
Certifications Required: ${buyer.certifications.join(', ')}
Requirements: ${buyer.requirements}
Description: ${buyer.description}

A new Indian seafood seller wants to connect with you. Respond professionally as this buyer persona, showing interest but asking relevant business questions about their products, certifications, pricing, and supply capabilities. Keep it under 150 words and sound authentic.`;

      const messages = [
        {
          role: "system",
          content: "You are an AI that roleplays as international seafood buyers. Respond professionally and realistically based on the buyer profile provided."
        },
        {
          role: "user",
          content: prompt
        }
      ];

      const response = await externalApiService.groqChatCompletion(messages);
      
      if (response?.choices?.[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      
      const fallback = `Hello! I'm interested in learning more about your seafood products. We import ${buyer.importVolume} annually and focus on ${buyer.productCategories.join(', ')}. Could you tell me more about your certifications and supply capacity?`;
      return fallback;
    } catch (error) {
      const fallback = `Hello! Thank you for reaching out. We're always looking for reliable seafood suppliers. Could you please provide more information about your products and certifications?`;
      return fallback;
    }
  };

  const generatePitchTemplate = async () => {
    try {
      const buyerLanguage = getBuyerLanguage();
      
      const prompt = `Generate a professional business pitch template for an Indian seafood exporter to send to ${buyer.name} in ${buyer.country}. 

Buyer Profile:
- Company: ${buyer.name}
- Location: ${buyer.city}, ${buyer.country}
- Import Volume: ${buyer.importVolume}
- Products Needed: ${buyer.productCategories.join(', ')}
- Requirements: ${buyer.requirements}
- Certifications: ${buyer.certifications.join(', ')}

Create a compelling but professional pitch template that addresses their specific needs. Include placeholders like [YOUR_COMPANY], [PRODUCT_DETAILS], [CERTIFICATIONS], etc. Keep it concise but comprehensive.

${buyerLanguage !== 'en' ? `Please provide the template in both English and ${languages.find(l => l.code === buyerLanguage)?.name}.` : ''}`;

      const messages = [
        {
          role: "system",
          content: "You are a professional business communication specialist who creates effective B2B pitch templates for international trade."
        },
        {
          role: "user",
          content: prompt
        }
      ];

      const response = await externalApiService.groqChatCompletion(messages);
      
      if (response?.choices?.[0]?.message?.content) {
        setPitchTemplate(response.choices[0].message.content);
      }
    } catch (error) {
      console.error('Error generating pitch template:', error);
    }
  };

  const getBuyerLanguage = (): string => {
    // Map countries to primary business languages
    const countryLanguageMap: Record<string, string> = {
      'Japan': 'ja',
      'South Korea': 'ko',
      'China': 'zh',
      'UAE': 'ar',
      'Saudi Arabia': 'ar',
      'Spain': 'es',
      'France': 'fr',
      'Germany': 'de',
      'Netherlands': 'nl',
    };
    
    return countryLanguageMap[buyer.country] || 'en';
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    
    try {
      // Create seller message
      const sellerMessage: Message = {
        id: `msg-${Date.now()}-seller`,
        senderId: 'seller-001',
        senderName: 'Your Company',
        senderType: 'seller',
        content: newMessage,
        timestamp: new Date(),
        status: 'sent'
      };

      // Add seller message
      setMessages(prev => [...prev, sellerMessage]);
      setNewMessage('');
      
      // Increment message count
      setMessageCount(prev => prev + 1);

      // Generate buyer response using AI
      setTimeout(async () => {
        const buyerResponse = await generateBuyerResponse(newMessage);
        
        const buyerMessage: Message = {
          id: `msg-${Date.now()}-buyer`,
          senderId: buyer.id,
          senderName: buyer.name,
          senderType: 'buyer',
          content: buyerResponse,
          timestamp: new Date(),
          status: 'delivered'
        };

        setMessages(prev => [...prev, buyerMessage]);
        
        // Check if buyer should suggest payment after 2-3 messages
        if (messageCount >= 2 && !paymentReceived) {
          setTimeout(() => {
            const paymentMessage: Message = {
              id: `msg-${Date.now()}-payment`,
              senderId: buyer.id,
              senderName: buyer.name,
              senderType: 'buyer',
              content: `Great! I'm satisfied with your products and terms. I would like to proceed with the purchase. Please complete the compliance requirements for ${buyer.country} and I'll process the payment immediately.`,
              timestamp: new Date(),
              status: 'delivered'
            };
            setMessages(prev => [...prev, paymentMessage]);
          }, 1000);
        }
      }, 2000 + Math.random() * 3000); // Random delay to simulate real conversation

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateBuyerResponse = async (sellerMessage: string): Promise<string> => {
    try {
      const conversationContext: string = messages
        .slice(-5) // Last 5 messages for context
        .map((m: Message) => `${m.senderName}: ${m.content}`)
        .join('\n');

      const prompt: string = `Continue the conversation as ${buyer.name}, the seafood buyer from ${buyer.country}. 

Your profile:
Company: ${buyer.name}
Location: ${buyer.city}, ${buyer.country}
Import Volume: ${buyer.importVolume}
Requirements: ${buyer.requirements}

Recent conversation:
${conversationContext}

Latest message from seller: "${sellerMessage}"

Respond professionally as this buyer. You should:
- Ask relevant business questions about products, pricing, certifications, supply capacity
- Show interest but be professional and business-focused
- Request specific information you need to make purchasing decisions
- Occasionally express concerns or requirements specific to your market
- Keep responses under 100 words
- Sound authentic and human`;

      const aiMessages = [
        {
          role: "system",
          content: "You are roleplaying as an international seafood buyer. Respond realistically based on the buyer's profile and business needs."
        },
        {
          role: "user",
          content: prompt
        }
      ];

      const response = await externalApiService.groqChatCompletion(aiMessages);
      
      if (response?.choices?.[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      
      const fallback = "Thank you for the information. Could you provide more details about pricing and delivery terms?";
      return fallback;
    } catch (error) {
      console.error('Error generating buyer response:', error);
      const fallback = "I'm interested in learning more. Could you send me your product catalog and pricing information?";
      return fallback;
    }
  };

  const translateMessage = async (message: string, targetLanguage: string): Promise<string> => {
    if (targetLanguage === 'en') return message;
    
    try {
      const targetLang = languages.find(l => l.code === targetLanguage)?.name || 'English';
      
      const prompt = `Translate the following business message to ${targetLang}. Maintain professional tone and business context:

"${message}"

Provide only the translation without any additional text.`;

      const messages = [
        {
          role: "system",
          content: "You are a professional business translator specializing in international trade communication."
        },
        {
          role: "user",
          content: prompt
        }
      ];

      const response = await externalApiService.groqChatCompletion(messages);
      
      if (response?.choices?.[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      
      return message;
    } catch (error) {
      console.error('Translation error:', error);
      return message;
    }
  };

  const usePitchTemplate = () => {
    setNewMessage(pitchTemplate);
    setUseTemplate(false);
  };

  const handleComplianceComplete = () => {
    setComplianceCompleted(true);
    setShowCompliance(false);
    
    // Show payment received automatically after compliance completion
    setTimeout(() => {
      const paymentReceivedMessage: Message = {
        id: `msg-${Date.now()}-payment-received`,
        senderId: buyer.id,
        senderName: buyer.name,
        senderType: 'buyer',
        content: `✅ Perfect! All compliance requirements are met. I've processed the payment of $${(Math.random() * 50000 + 10000).toFixed(0)} USD. Payment confirmed and funds transferred. Looking forward to receiving the shipment!`,
        timestamp: new Date(),
        status: 'delivered'
      };
      
      setMessages(prev => [...prev, paymentReceivedMessage]);
      setPaymentReceived(true);
      
      toast({
        title: "Payment Received! 💰",
        description: `${buyer.name} has completed the payment successfully.`,
        variant: "default"
      });
    }, 2000);
  };

  const toggleComplianceItem = (item: string) => {
    setComplianceChecklist(prev => {
      const updated = {
        ...prev,
        [item]: !prev[item]
      };
      
      // Check if all items are now complete
      const allComplete = Object.values(updated).every(Boolean);
      if (allComplete && !complianceCompleted) {
        // Auto-trigger payment after a short delay
        setTimeout(() => {
          handleComplianceComplete();
        }, 1000);
      }
      
      return updated;
    });
  };

  const isAllComplianceComplete = () => {
    return Object.values(complianceChecklist).every(Boolean);
  };

  return (
    <Card className="h-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {buyer?.name?.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{buyer?.name}</CardTitle>
                <Badge variant="outline">{buyer?.country}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {buyer?.city} • {buyer?.importVolume} • {buyer?.productCategories?.join(', ')}
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        <div className="flex gap-4 h-full">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderType === 'seller' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.senderType === 'seller'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.senderName}
                      </span>
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    {message.translatedContent && (
                      <div className="mt-2 pt-2 border-t border-opacity-20">
                        <p className="text-xs opacity-80">
                          Translation: {message.translatedContent}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUseTemplate(true)}
                  className="flex items-center gap-1 px-2 py-1 text-xs h-8"
                >
                  <FileText className="h-3 w-3" />
                  Pitch Template
                </Button>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  rows={3}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || loading}
                  className="self-end"
                >
                  {loading ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Buyer Info Sidebar */}
          <div className="w-80 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Buyer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Company</Label>
                  <p className="text-sm font-medium">{buyer?.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Location</Label>
                  <p className="text-sm">{buyer?.city}, {buyer?.country}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Import Volume</Label>
                  <p className="text-sm">{buyer?.importVolume}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Products</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {buyer?.productCategories?.map((cat: string) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Required Certifications</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {buyer?.certifications?.map((cert: string) => (
                      <Badge key={cert} variant="outline" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Requirements</Label>
                  <p className="text-xs text-gray-600">{buyer?.requirements}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8">
                  <FileText className="h-3 w-3 mr-2" />
                  Send Catalog
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8">
                  <CheckCircle className="h-3 w-3 mr-2" />
                  Share Certificates
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full justify-start text-xs h-8"
                  onClick={() => setShowCompliance(true)}
                >
                  <Shield className="h-3 w-3 mr-2" />
                  Compliance Support
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8">
                  <Globe className="h-3 w-3 mr-2" />
                  Request Quote
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8">
                  <Zap className="h-3 w-3 mr-2" />
                  View Market Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pitch Template Dialog */}
        <Dialog open={useTemplate} onOpenChange={setUseTemplate}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Auto-Generated Pitch Template</DialogTitle>
              <DialogDescription>
                AI-generated pitch template customized for {buyer?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto max-h-[60vh]">
              <Textarea
                value={pitchTemplate}
                onChange={(e) => setPitchTemplate(e.target.value)}
                rows={10}
                className="w-full resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setUseTemplate(false)}>
                Cancel
              </Button>
              <Button onClick={usePitchTemplate}>
                Use This Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Compliance Support Dialog */}
        <Dialog open={showCompliance} onOpenChange={setShowCompliance}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Requirements for {buyer?.country}
              </DialogTitle>
              <DialogDescription>
                Complete all requirements to proceed with the order from {buyer?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Export Requirements Checklist
                  </h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Ensure all requirements are met before shipment to {buyer?.country}
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(complianceChecklist).map(([requirement, completed]) => (
                  <div key={requirement} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="checkbox"
                      id={requirement}
                      checked={completed}
                      onChange={() => toggleComplianceItem(requirement)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label 
                      htmlFor={requirement} 
                      className={`flex-1 text-sm cursor-pointer ${
                        completed ? 'text-green-700 dark:text-green-300 line-through' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {requirement}
                    </label>
                    {completed && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>

              {isAllComplianceComplete() && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      All Requirements Complete!
                    </h3>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    You have completed all compliance requirements for export to {buyer?.country}.
                  </p>
                  <Button 
                    onClick={handleComplianceComplete}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Submit for Payment Processing
                  </Button>
                </div>
              )}

              {!isAllComplianceComplete() && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                      Compliance Progress
                    </h3>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {Object.values(complianceChecklist).filter(Boolean).length} of {Object.keys(complianceChecklist).length} requirements completed
                  </p>
                  <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2 mt-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(Object.values(complianceChecklist).filter(Boolean).length / Object.keys(complianceChecklist).length) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCompliance(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Simulation */}
        {showPayment && (
          <PaymentSimulation
            buyer={buyer}
            onClose={() => setShowPayment(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}