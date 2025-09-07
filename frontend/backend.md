# TradeNavigator Backend Integration Guide (MongoDB)

## 🎯 Quick Start for AI Developers

This guide provides **step-by-step instructions** for any AI system to understand and implement the complete backend for TradeNavigator platform using **MongoDB** as the primary database.

### 📋 What You'll Build
- **MongoDB-based backend** with 11 core collections
- **REST API endpoints** for all frontend features
- **Authentication system** with JWT tokens
- **File upload system** for compliance documents
- **Real-time data integration** replacing all dummy data

---

## 🗄️ MongoDB Database Architecture

### Database Name: `tradenavigator`

### Collection Schemas (Copy-Paste Ready)

#### 1. **users** - User Accounts & Profiles
\`\`\`javascript
{
  _id: ObjectId,
  email: String, // UNIQUE INDEX
  companyName: String,
  contactPerson: String,
  role: String, // 'Exporter' | 'Processor' | 'Farmer Group' | 'International Trader'
  sector: String, // 'Seafood' | 'Textile' | 'Both'
  hsCode: String,
  targetCountries: [String], // ['EU', 'Japan', 'Korea', 'UAE', 'UK']
  createdAt: Date,
  updatedAt: Date,
  isVerified: Boolean,
  isActive: Boolean,
  // Dashboard metrics (calculated fields)
  totalRevenue: Number,
  ordersSecured: Number,
  marketsEntered: Number,
  jobsRetained: Number
}
\`\`\`

#### 2. **marketIntelligence** - Tariff & Market Data
\`\`\`javascript
{
  _id: ObjectId,
  hsCode: String,
  country: String,
  tariffRate: Number, // Percentage
  importVolume: Number, // in MT
  avgPricePerKg: Number, // in USD
  competitivenessScore: Number, // 1-100
  demandGrowth: Number, // Percentage
  lastUpdated: Date,
  // COMPOUND INDEX: { hsCode: 1, country: 1 }
}
\`\`\`

#### 3. **buyers** - International Buyers Directory
\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  country: String,
  productCategories: [String], // ['Seafood', 'Textile']
  importVolume: Number, // Annual volume in MT
  contactEmail: String,
  contactPhone: String,
  certificationsRequired: [String], // ['HACCP', 'ISO', 'Organic']
  preferredIncoterms: [String], // ['FOB', 'CIF', 'CFR']
  paymentTerms: String, // 'LC at sight', '30 days credit'
  isVerified: Boolean,
  createdAt: Date
}
\`\`\`

#### 4. **userBuyerInteractions** - Contact Tracking
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId, // REF: users._id
  buyerId: ObjectId, // REF: buyers._id
  status: String, // 'Not Contacted' | 'Contacted' | 'Replied' | 'Negotiating' | 'Deal Closed'
  pitchSentAt: Date,
  lastContactAt: Date,
  dealValue: Number, // If deal closed
  notes: String,
  createdAt: Date
}
\`\`\`

#### 5. **complianceChecklists** - Market Compliance Tracking
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId, // REF: users._id
  targetCountry: String,
  requirements: {
    labeling: { completed: Boolean, uploadedAt: Date, fileUrl: String },
    traceability: { completed: Boolean, uploadedAt: Date, fileUrl: String },
    coldChain: { completed: Boolean, uploadedAt: Date, fileUrl: String },
    labReports: { completed: Boolean, uploadedAt: Date, fileUrl: String },
    certifications: { completed: Boolean, uploadedAt: Date, fileUrl: String }
  },
  completionPercentage: Number, // Auto-calculated
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

#### 6. **reliefSchemes** - Government Relief Programs
\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  authority: String, // 'Ministry of Commerce', 'APEDA', etc.
  benefitAmount: Number, // Maximum benefit in INR
  benefitType: String, // 'Subsidy', 'Credit', 'Grant'
  deadline: Date,
  eligibilityCriteria: {
    minTurnover: Number,
    maxEmployees: Number,
    sectors: [String], // ['Seafood', 'Textile']
    regions: [String] // ['Odisha', 'All India']
  },
  applicationProcess: String,
  documentsRequired: [String],
  isActive: Boolean,
  createdAt: Date
}
\`\`\`

#### 7. **userReliefApplications** - Relief Application Tracking
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId, // REF: users._id
  schemeId: ObjectId, // REF: reliefSchemes._id
  status: String, // 'Eligible' | 'Applied' | 'Under Review' | 'Approved' | 'Rejected'
  appliedAt: Date,
  benefitCalculated: Number,
  documentsUploaded: [String], // File URLs
  reviewNotes: String,
  createdAt: Date
}
\`\`\`

#### 8. **forumPosts** - Community Forum
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId, // REF: users._id
  title: String,
  content: String,
  category: String, // 'Market Updates' | 'Success Stories' | 'Q&A' | 'General Discussion'
  tags: [String],
  likes: Number,
  commentsCount: Number,
  isAnswered: Boolean, // For Q&A posts
  isPinned: Boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

#### 9. **forumReplies** - Forum Comments
\`\`\`javascript
{
  _id: ObjectId,
  postId: ObjectId, // REF: forumPosts._id
  userId: ObjectId, // REF: users._id
  content: String,
  likes: Number,
  isMentorReply: Boolean,
  isAcceptedAnswer: Boolean, // For Q&A posts
  createdAt: Date
}
\`\`\`

#### 10. **impactLogs** - Success Tracking
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId, // REF: users._id
  eventType: String, // 'pitch_sent' | 'po_received' | 'shipment_completed' | 'market_entered'
  buyerId: ObjectId, // REF: buyers._id (optional)
  revenueAmount: Number, // In INR
  quantityKg: Number,
  pricePerKg: Number,
  targetCountry: String,
  productCategory: String,
  eventDate: Date,
  createdAt: Date
}
\`\`\`

#### 11. **fileUploads** - Document Management
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId, // REF: users._id
  fileName: String,
  originalName: String,
  fileType: String, // 'image/jpeg', 'application/pdf'
  fileSize: Number, // In bytes
  fileUrl: String, // S3 or local storage URL
  uploadPurpose: String, // 'compliance_evidence' | 'pitch_document' | 'profile_image'
  relatedId: ObjectId, // Related document ID (optional)
  createdAt: Date
}
\`\`\`

---

## 🔧 MongoDB Setup & Connection

### 1. Database Connection (lib/mongodb.js)
\`\`\`javascript
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
\`\`\`

### 2. Database Helper Functions (lib/database.js)
\`\`\`javascript
import clientPromise from './mongodb'
import { ObjectId } from 'mongodb'

export async function getDatabase() {
  const client = await clientPromise
  return client.db('tradenavigator')
}

// User Management
export async function createUser(userData) {
  const db = await getDatabase()
  const result = await db.collection('users').insertOne({
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
    isVerified: false,
    isActive: true,
    totalRevenue: 0,
    ordersSecured: 0,
    marketsEntered: 0,
    jobsRetained: 0
  })
  return result
}

export async function getUserById(userId) {
  const db = await getDatabase()
  return await db.collection('users').findOne({ _id: new ObjectId(userId) })
}

export async function getUserByEmail(email) {
  const db = await getDatabase()
  return await db.collection('users').findOne({ email })
}

// Market Intelligence
export async function getMarketData(filters = {}) {
  const db = await getDatabase()
  return await db.collection('marketIntelligence').find(filters).toArray()
}

// Buyers Directory
export async function getBuyers(filters = {}, page = 1, limit = 20) {
  const db = await getDatabase()
  const skip = (page - 1) * limit
  return await db.collection('buyers')
    .find(filters)
    .skip(skip)
    .limit(limit)
    .toArray()
}

// Impact Tracking
export async function logImpactEvent(eventData) {
  const db = await getDatabase()
  return await db.collection('impactLogs').insertOne({
    ...eventData,
    createdAt: new Date()
  })
}

// Add more helper functions as needed...
\`\`\`

### 3. Create Database Indexes
\`\`\`javascript
// scripts/create-indexes.js
import { getDatabase } from '../lib/database.js'

async function createIndexes() {
  const db = await getDatabase()
  
  // Users collection
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  
  // Market Intelligence
  await db.collection('marketIntelligence').createIndex(
    { hsCode: 1, country: 1 }, 
    { unique: true }
  )
  
  // Buyers
  await db.collection('buyers').createIndex({ country: 1, productCategories: 1 })
  
  // User Buyer Interactions
  await db.collection('userBuyerInteractions').createIndex({ userId: 1, buyerId: 1 })
  
  // Forum Posts
  await db.collection('forumPosts').createIndex({ createdAt: -1, category: 1 })
  
  // Impact Logs
  await db.collection('impactLogs').createIndex({ userId: 1, eventDate: -1 })
  
  console.log('All indexes created successfully')
}

createIndexes().catch(console.error)
\`\`\`

---

## 🎯 DUMMY DATA REPLACEMENT GUIDE

### **CRITICAL**: Files with Dummy Data (Must Replace)

#### 1. **app/dashboard/indian/page.tsx** - Lines 25-85
**Current Dummy Data:**
\`\`\`javascript
const sampleData = {
  tariffWatch: [
    { country: "Japan", rate: "2.5%", trend: "down", savings: "₹12L" },
    // ... more dummy data
  ],
  // ... other dummy objects
}
\`\`\`

**Replace With:**
\`\`\`javascript
// Add this hook at the top of component
const { data: dashboardData, error } = useSWR('/api/dashboard/indian', fetcher)

// Replace sampleData usage with:
const tariffWatch = dashboardData?.tariffWatch || []
const buyerMatches = dashboardData?.buyerMatches || []
const complianceStatus = dashboardData?.complianceStatus || {}
\`\`\`

**API Endpoint to Create:** `pages/api/dashboard/indian.js`

#### 2. **app/dashboard/international/page.tsx** - Lines 25-90
**Current Dummy Data:**
\`\`\`javascript
const sampleData = {
  supplierMatches: [
    { name: "Ocean Fresh Exports", location: "Bhubaneswar", rating: 4.8 },
    // ... more dummy data
  ]
}
\`\`\`

**Replace With:**
\`\`\`javascript
const { data: dashboardData } = useSWR('/api/dashboard/international', fetcher)
const supplierMatches = dashboardData?.supplierMatches || []
\`\`\`

#### 3. **app/market-intelligence/page.tsx** - Lines 15-80
**Current Dummy Data:**
\`\`\`javascript
const tariffData = [
  { country: "Japan", seafood: "2.5%", textile: "8.2%" },
  // ... more dummy data
]
\`\`\`

**Replace With:**
\`\`\`javascript
const { data: marketData } = useSWR('/api/market-intelligence', fetcher)
const tariffData = marketData?.tariffs || []
const pricingTrends = marketData?.pricing || []
\`\`\`

#### 4. **app/buyers/page.tsx** - Lines 20-120
**Current Dummy Data:**
\`\`\`javascript
const buyersData = [
  {
    id: 1,
    name: "Tokyo Seafood Co.",
    country: "Japan",
    // ... more fields
  }
]
\`\`\`

**Replace With:**
\`\`\`javascript
const [filters, setFilters] = useState({})
const { data: buyersResponse } = useSWR(
  `/api/buyers?${new URLSearchParams(filters)}`, 
  fetcher
)
const buyers = buyersResponse?.buyers || []
\`\`\`

#### 5. **app/pitch-assistant/page.tsx** - Lines 15-35
**Replace buyer selection with real buyer data from API**

#### 6. **app/compliance/page.tsx** - Lines 20-100
**Replace compliance checklists and vendor data with user-specific data**

#### 7. **app/relief-schemes/page.tsx** - Lines 15-80
**Replace schemes data with real government schemes from database**

#### 8. **app/community/page.tsx** - Lines 15-60
**Replace forum posts with real user-generated content**

#### 9. **app/impact/page.tsx** - Lines 15-100
**Replace impact metrics with real user achievement data**

---

## 🚀 API Endpoints Implementation

### Authentication Routes

#### `pages/api/auth/signup.js`
\`\`\`javascript
import { getDatabase, createUser } from '@/lib/database'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, companyName, contactPerson, role, sector, hsCode, targetCountries } = req.body
    
    // Validation
    if (!email || !companyName || !contactPerson) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if user exists
    const db = await getDatabase()
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Create user
    const result = await createUser({
      email,
      companyName,
      contactPerson,
      role,
      sector,
      hsCode,
      targetCountries
    })
    
    // Generate JWT
    const token = jwt.sign(
      { userId: result.insertedId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      userId: result.insertedId 
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
\`\`\`

#### `pages/api/dashboard/indian.js`
\`\`\`javascript
import { getDatabase, getUserById } from '@/lib/database'
import { verifyToken } from '@/lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    const db = await getDatabase()
    
    // Get user data
    const user = await getUserById(decoded.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get tariff watch data
    const tariffWatch = await db.collection('marketIntelligence')
      .find({ hsCode: user.hsCode })
      .sort({ tariffRate: 1 })
      .limit(3)
      .toArray()

    // Get buyer matches
    const buyerMatches = await db.collection('buyers')
      .find({ 
        productCategories: { $in: [user.sector] },
        country: { $in: user.targetCountries }
      })
      .limit(5)
      .toArray()

    // Get compliance status
    const complianceStatus = await db.collection('complianceChecklists')
      .findOne({ userId: user._id })

    // Get relief schemes
    const reliefSchemes = await db.collection('reliefSchemes')
      .find({ 
        isActive: true,
        'eligibilityCriteria.sectors': { $in: [user.sector] }
      })
      .limit(3)
      .toArray()

    res.status(200).json({
      tariffWatch: tariffWatch.map(item => ({
        country: item.country,
        rate: `${item.tariffRate}%`,
        trend: item.tariffRate < 5 ? 'down' : 'up',
        savings: `₹${Math.floor(item.importVolume * 0.1)}L`
      })),
      buyerMatches: {
        newMatches: buyerMatches.length,
        totalMatches: await db.collection('buyers').countDocuments({
          productCategories: { $in: [user.sector] }
        })
      },
      complianceStatus: {
        percentage: complianceStatus?.completionPercentage || 0
      },
      reliefSchemes: reliefSchemes.length,
      impactSummary: {
        revenueRecovered: user.totalRevenue,
        ordersSecured: user.ordersSecured,
        newMarkets: user.marketsEntered,
        jobsRetained: user.jobsRetained
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
\`\`\`

### Market Intelligence Route

#### `pages/api/market-intelligence.js`
\`\`\`javascript
import { getDatabase } from '@/lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { hsCode, countries } = req.query
    const db = await getDatabase()
    
    let filter = {}
    if (hsCode) filter.hsCode = hsCode
    if (countries) filter.country = { $in: countries.split(',') }

    const marketData = await db.collection('marketIntelligence')
      .find(filter)
      .toArray()

    // Format for tariff comparison table
    const tariffs = marketData.map(item => ({
      country: item.country,
      tariffRate: `${item.tariffRate}%`,
      importVolume: `${item.importVolume} MT`,
      avgPrice: `$${item.avgPricePerKg}/kg`,
      competitiveness: item.competitivenessScore
    }))

    // Generate pricing trends (mock historical data)
    const pricing = marketData.map(item => ({
      country: item.country,
      data: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('en', { month: 'short' }),
        price: item.avgPricePerKg * (0.9 + Math.random() * 0.2)
      }))
    }))

    res.status(200).json({
      tariffs,
      pricing,
      summary: {
        totalMarkets: marketData.length,
        avgTariff: marketData.reduce((sum, item) => sum + item.tariffRate, 0) / marketData.length,
        bestMarket: marketData.sort((a, b) => a.tariffRate - b.tariffRate)[0]?.country
      }
    })
  } catch (error) {
    console.error('Market intelligence error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
\`\`\`

---

## 📁 Environment Variables Setup

\`\`\`env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tradenavigator?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
NEXTAUTH_SECRET=your-nextauth-secret-key

# Email Service (for magic links)
SENDGRID_API_KEY=SG.your-sendgrid-api-key
FROM_EMAIL=noreply@tradenavigator.com

# File Upload (AWS S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=tradenavigator-uploads
AWS_REGION=us-east-1

# External APIs
MARKET_DATA_API_KEY=your-market-data-provider-key
CURRENCY_API_KEY=your-currency-conversion-api-key

# Application URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Redis (for caching)
REDIS_URL=redis://localhost:6379
\`\`\`

---

## 🔄 Step-by-Step Integration Process

### Phase 1: Database Setup (Day 1)
1. **Create MongoDB Atlas cluster** or local MongoDB instance
2. **Run index creation script** to optimize queries
3. **Seed initial data** (market intelligence, relief schemes, sample buyers)
4. **Test database connection** with sample queries

### Phase 2: Authentication (Day 2)
1. **Replace signup/signin dummy logic** with real MongoDB user creation
2. **Implement JWT token generation** and verification
3. **Add middleware for protected routes**
4. **Test user registration and login flow**

### Phase 3: Dashboard Integration (Day 3-4)
1. **Replace Indian dashboard dummy data** with API calls
2. **Replace International dashboard dummy data** with API calls
3. **Implement user-specific data fetching**
4. **Add error handling and loading states**

### Phase 4: Core Features (Day 5-7)
1. **Market Intelligence**: Replace static data with database queries
2. **Buyers Directory**: Implement search, filtering, pagination
3. **Pitch Assistant**: Connect to real buyer data and email sending
4. **Compliance Center**: Add file upload and progress tracking

### Phase 5: Community & Impact (Day 8-9)
1. **Forum System**: Real post creation, comments, likes
2. **Impact Tracking**: Connect to user achievements and metrics
3. **Relief Schemes**: Eligibility checking and application tracking

### Phase 6: Testing & Optimization (Day 10)
1. **End-to-end testing** of all features
2. **Performance optimization** with proper indexing
3. **Security audit** of API endpoints
4. **Documentation update** with final API specifications

---

## 🚨 Critical Success Factors

### ✅ Must-Do Items:
1. **Replace ALL dummy data** - No hardcoded arrays should remain
2. **Implement proper authentication** - JWT tokens with expiration
3. **Add input validation** - Sanitize all user inputs
4. **Create database indexes** - For optimal query performance
5. **Handle errors gracefully** - Proper error messages and status codes
6. **Add loading states** - Use Suspense and skeleton components
7. **Implement pagination** - For large datasets (buyers, forum posts)
8. **Add file upload security** - Validate file types and sizes

### ⚠️ Common Pitfalls to Avoid:
1. **Don't skip authentication** - All API routes must verify user tokens
2. **Don't ignore validation** - Always validate input data
3. **Don't forget indexes** - Queries will be slow without proper indexing
4. **Don't hardcode data** - Everything should come from the database
5. **Don't skip error handling** - Always handle database connection errors

---

## 📊 Sample Data for Testing

### Market Intelligence Sample Data
\`\`\`javascript
// Insert into marketIntelligence collection
[
  {
    hsCode: "030613",
    country: "Japan",
    tariffRate: 2.5,
    importVolume: 15000,
    avgPricePerKg: 12.50,
    competitivenessScore: 85,
    demandGrowth: 5.2,
    lastUpdated: new Date()
  },
  {
    hsCode: "030613",
    country: "Germany",
    tariffRate: 0,
    importVolume: 25000,
    avgPricePerKg: 11.80,
    competitivenessScore: 78,
    demandGrowth: 3.8,
    lastUpdated: new Date()
  }
  // Add more sample data...
]
\`\`\`

### Buyers Sample Data
\`\`\`javascript
// Insert into buyers collection
[
  {
    name: "Tokyo Seafood Co.",
    country: "Japan",
    productCategories: ["Seafood"],
    importVolume: 500,
    contactEmail: "procurement@tokyoseafood.jp",
    contactPhone: "+81-3-1234-5678",
    certificationsRequired: ["HACCP", "JAS Organic"],
    preferredIncoterms: ["FOB", "CIF"],
    paymentTerms: "LC at sight",
    isVerified: true,
    createdAt: new Date()
  }
  // Add more buyers...
]
\`\`\`

This comprehensive guide provides everything needed to transform the TradeNavigator frontend into a fully functional platform with MongoDB backend integration. Follow the phases sequentially for best results.
