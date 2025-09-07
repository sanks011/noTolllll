"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProfileCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  userRole: "Buyer" | "Seller"
  onProfileUpdate: (profileData: any) => void
}

// Common sectors for both buyers and sellers
const businessSectors = [
  "Seafood & Marine Products",
  "Textiles & Apparel", 
  "Spices & Condiments",
  "Agricultural Products",
  "Handicrafts & Art",
  "Leather & Footwear",
  "Chemicals & Pharmaceuticals",
  "Engineering Goods",
  "Electronics & IT",
  "Other"
]

// Target markets for international trade
const targetMarkets = [
  "United States", "European Union", "United Kingdom", "Japan", "South Korea",
  "Australia", "Canada", "UAE", "Singapore", "China", "Other"
]

// Company sizes
const companySizes = [
  "1-10 employees", "11-50 employees", "51-200 employees", 
  "201-500 employees", "500+ employees"
]

// Annual turnover ranges
const turnoverRanges = [
  "Under $100K", "$100K - $500K", "$500K - $1M", 
  "$1M - $5M", "$5M - $10M", "$10M+"
]

// Quality certifications
const certifications = [
  "ISO 9001", "ISO 22000", "HACCP", "FDA", "CE Marking", 
  "GOTS", "Organic Certified", "Fair Trade", "Other", "None"
]

export default function ProfileCompletionModal({ 
  isOpen, 
  onClose, 
  userRole,
  onProfileUpdate 
}: ProfileCompletionModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [profileData, setProfileData] = useState({
    // Basic Business Info
    sector: "",
    companySize: "",
    annualTurnover: "",
    establishedYear: "",
    businessDescription: "",
    website: "",
    
    // Product/Service Info
    primaryProducts: [] as string[],
    hsCode: "",
    certifications: [] as string[],
    
    // Market Info  
    targetMarkets: [] as string[],
    currentMarkets: [] as string[],
    
    // Buyer-specific fields
    sourcingBudget: "",
    orderFrequency: "",
    preferredSupplierLocation: "",
    qualityRequirements: "",
    
    // Seller-specific fields
    productionCapacity: "",
    exportExperience: "",
    leadTime: "",
    minimumOrderQuantity: "",
    paymentTerms: "",
    
    // Additional
    specialRequirements: "",
    businessGoals: [] as string[]
  })

  const [newProduct, setNewProduct] = useState("")

  const handleArrayField = (field: keyof typeof profileData, value: string, checked: boolean) => {
    const currentArray = profileData[field] as string[]
    if (checked) {
      setProfileData(prev => ({
        ...prev,
        [field]: [...currentArray, value]
      }))
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: currentArray.filter(item => item !== value)
      }))
    }
  }

  const addProduct = () => {
    if (newProduct.trim() && !profileData.primaryProducts.includes(newProduct.trim())) {
      setProfileData(prev => ({
        ...prev,
        primaryProducts: [...prev.primaryProducts, newProduct.trim()]
      }))
      setNewProduct("")
    }
  }

  const removeProduct = (product: string) => {
    setProfileData(prev => ({
      ...prev,
      primaryProducts: prev.primaryProducts.filter(p => p !== product)
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Call the API to update profile
      onProfileUpdate(profileData)
      toast({
        title: "Profile completed successfully!",
        description: "Your business profile has been updated.",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalSteps = userRole === "Buyer" ? 3 : 4

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your {userRole} Profile</DialogTitle>
          <DialogDescription>
            Step {step} of {totalSteps}: Help us understand your business better to provide personalized recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Business Information</CardTitle>
                <CardDescription>Tell us about your company</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sector">Business Sector *</Label>
                  <Select 
                    value={profileData.sector} 
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, sector: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary business sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessSectors.map(sector => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size *</Label>
                    <Select 
                      value={profileData.companySize} 
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, companySize: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="turnover">Annual Turnover *</Label>
                    <Select 
                      value={profileData.annualTurnover} 
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, annualTurnover: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        {turnoverRanges.map(range => (
                          <SelectItem key={range} value={range}>{range}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      placeholder="e.g., 2010"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={profileData.establishedYear}
                      onChange={(e) => setProfileData(prev => ({ ...prev, establishedYear: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://www.yourcompany.com"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your business, products, and services..."
                    rows={3}
                    value={profileData.businessDescription}
                    onChange={(e) => setProfileData(prev => ({ ...prev, businessDescription: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {userRole === "Buyer" ? "Sourcing Requirements" : "Product Information"}
                </CardTitle>
                <CardDescription>
                  {userRole === "Buyer" 
                    ? "What products are you looking to source?"
                    : "What products do you manufacture/export?"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Products/Services *</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add product name"
                      value={newProduct}
                      onChange={(e) => setNewProduct(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addProduct()}
                    />
                    <Button type="button" onClick={addProduct} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {profileData.primaryProducts.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileData.primaryProducts.map((product, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {product}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeProduct(product)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hsCode">Primary HS Code</Label>
                  <Input
                    id="hsCode"
                    placeholder="e.g., 030617 (Frozen Shrimp)"
                    value={profileData.hsCode}
                    onChange={(e) => setProfileData(prev => ({ ...prev, hsCode: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quality Certifications</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {certifications.map((cert) => (
                      <div key={cert} className="flex items-center space-x-2">
                        <Checkbox
                          id={cert}
                          checked={profileData.certifications.includes(cert)}
                          onCheckedChange={(checked) => 
                            handleArrayField("certifications", cert, checked as boolean)
                          }
                        />
                        <Label htmlFor={cert} className="text-sm">{cert}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {userRole === "Buyer" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="sourcingBudget">Annual Sourcing Budget</Label>
                      <Select 
                        value={profileData.sourcingBudget} 
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, sourcingBudget: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          {turnoverRanges.map(range => (
                            <SelectItem key={range} value={range}>{range}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderFrequency">Order Frequency</Label>
                      <Select 
                        value={profileData.orderFrequency} 
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, orderFrequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="How often do you place orders?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                          <SelectItem value="asNeeded">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {userRole === "Seller" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productionCapacity">Monthly Production Capacity</Label>
                        <Input
                          id="productionCapacity"
                          placeholder="e.g., 100 MT, 10,000 units"
                          value={profileData.productionCapacity}
                          onChange={(e) => setProfileData(prev => ({ ...prev, productionCapacity: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="leadTime">Lead Time</Label>
                        <Input
                          id="leadTime"
                          placeholder="e.g., 15-30 days"
                          value={profileData.leadTime}
                          onChange={(e) => setProfileData(prev => ({ ...prev, leadTime: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exportExperience">Export Experience (Years)</Label>
                      <Input
                        id="exportExperience"
                        type="number"
                        placeholder="e.g., 5"
                        value={profileData.exportExperience}
                        onChange={(e) => setProfileData(prev => ({ ...prev, exportExperience: e.target.value }))}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Information</CardTitle>
                <CardDescription>
                  {userRole === "Buyer" 
                    ? "Which markets do you source from or want to source from?"
                    : "Which markets do you currently export to or want to target?"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Markets *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {targetMarkets.map((market) => (
                      <div key={market} className="flex items-center space-x-2">
                        <Checkbox
                          id={market}
                          checked={profileData.targetMarkets.includes(market)}
                          onCheckedChange={(checked) => 
                            handleArrayField("targetMarkets", market, checked as boolean)
                          }
                        />
                        <Label htmlFor={market} className="text-sm">{market}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Current Markets (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {targetMarkets.map((market) => (
                      <div key={market} className="flex items-center space-x-2">
                        <Checkbox
                          id={`current-${market}`}
                          checked={profileData.currentMarkets.includes(market)}
                          onCheckedChange={(checked) => 
                            handleArrayField("currentMarkets", market, checked as boolean)
                          }
                        />
                        <Label htmlFor={`current-${market}`} className="text-sm">{market}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {userRole === "Buyer" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="preferredLocation">Preferred Supplier Location</Label>
                      <Select 
                        value={profileData.preferredSupplierLocation} 
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, preferredSupplierLocation: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="domestic">Domestic (Same Country)</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="noPreference">No Preference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qualityRequirements">Quality Requirements</Label>
                      <Textarea
                        id="qualityRequirements"
                        placeholder="Describe your quality standards, specifications, or requirements..."
                        rows={3}
                        value={profileData.qualityRequirements}
                        onChange={(e) => setProfileData(prev => ({ ...prev, qualityRequirements: e.target.value }))}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {step === 4 && userRole === "Seller" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Terms & Goals</CardTitle>
                <CardDescription>Share your business terms and objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minOrder">Minimum Order Quantity</Label>
                    <Input
                      id="minOrder"
                      placeholder="e.g., 1 MT, 500 units"
                      value={profileData.minimumOrderQuantity}
                      onChange={(e) => setProfileData(prev => ({ ...prev, minimumOrderQuantity: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Preferred Payment Terms</Label>
                    <Select 
                      value={profileData.paymentTerms} 
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, paymentTerms: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="advance">100% Advance</SelectItem>
                        <SelectItem value="lc">Letter of Credit</SelectItem>
                        <SelectItem value="tt">Telegraphic Transfer</SelectItem>
                        <SelectItem value="net30">Net 30 days</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Business Goals (Select all that apply)</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "Expand to new markets",
                      "Increase export volume", 
                      "Find long-term buyers",
                      "Improve product quality",
                      "Reduce costs",
                      "Build brand recognition"
                    ].map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={goal}
                          checked={profileData.businessGoals.includes(goal)}
                          onCheckedChange={(checked) => 
                            handleArrayField("businessGoals", goal, checked as boolean)
                          }
                        />
                        <Label htmlFor={goal} className="text-sm">{goal}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequirements">Special Requirements/Notes</Label>
                  <Textarea
                    id="specialRequirements"
                    placeholder="Any additional information about your business, special requirements, or notes for potential buyers..."
                    rows={3}
                    value={profileData.specialRequirements}
                    onChange={(e) => setProfileData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            >
              {step === 1 ? "Cancel" : "Previous"}
            </Button>

            {step < totalSteps ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!profileData.sector || !profileData.companySize || !profileData.annualTurnover || !profileData.businessDescription)) ||
                  (step === 2 && profileData.primaryProducts.length === 0) ||
                  (step === 3 && profileData.targetMarkets.length === 0)
                }
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : "Complete Profile"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
