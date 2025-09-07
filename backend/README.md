# TradeNavigator Backend

Complete backend API for the TradeNavigator platform with MongoDB integration.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

1. **Clone and setup**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB credentials
   ```

3. **Database Setup**
   ```bash
   # Create database indexes
   npm run create-indexes
   
   # Seed sample data
   npm run seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## 📊 Database Schema

### Collections Overview
- **users** - User accounts and profiles
- **marketIntelligence** - Tariff and market data
- **buyers** - International buyers directory
- **userBuyerInteractions** - Contact tracking
- **complianceChecklists** - Market compliance tracking
- **reliefSchemes** - Government relief programs
- **userReliefApplications** - Relief application tracking
- **forumPosts** - Community forum posts
- **forumReplies** - Forum comments
- **impactLogs** - Success tracking
- **fileUploads** - Document management

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - User login
- `POST /api/auth/verify-token` - Verify JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Dashboard
- `GET /api/dashboard/indian` - Indian trader dashboard
- `GET /api/dashboard/international` - International trader dashboard

### Market Intelligence
- `GET /api/market-intelligence` - Get market data with filters
- `GET /api/market-intelligence/countries` - List available countries
- `GET /api/market-intelligence/hs-codes` - List available HS codes
- `GET /api/market-intelligence/trends/:country` - Country-specific trends

### Buyers
- `GET /api/buyers` - Get buyers list with filters
- `GET /api/buyers/:id` - Get buyer details
- `POST /api/buyers/:id/contact` - Update contact status
- `GET /api/buyers/filters/options` - Get filter options

### Compliance
- `GET /api/compliance` - Get compliance checklist
- `PUT /api/compliance/requirement` - Update requirement status
- `GET /api/compliance/vendors` - Get compliance vendors

### Relief Schemes
- `GET /api/relief-schemes` - Get available schemes
- `POST /api/relief-schemes/:id/apply` - Apply for scheme
- `GET /api/relief-schemes/applications` - Get user applications

### Forum
- `GET /api/forum/posts` - Get forum posts
- `POST /api/forum/posts` - Create new post
- `GET /api/forum/posts/:id` - Get post with replies
- `POST /api/forum/posts/:id/replies` - Add reply
- `POST /api/forum/posts/:id/like` - Like post

### Impact Tracking
- `GET /api/impact/dashboard` - Get impact dashboard
- `POST /api/impact/events` - Log impact event
- `GET /api/impact/events` - Get impact events

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload/files` - Get user files
- `DELETE /api/upload/files/:id` - Delete file

## 🔒 Authentication

All API endpoints (except auth routes) require JWT authentication:
```javascript
headers: {
  'Authorization': 'Bearer <jwt_token>'
}
```

## 📝 Request/Response Examples

### User Registration
```javascript
POST /api/auth/signup
{
  "email": "user@company.com",
  "companyName": "Export Company Ltd",
  "contactPerson": "John Doe",
  "role": "Exporter",
  "sector": "Seafood",
  "hsCode": "030613",
  "targetCountries": ["Japan", "EU", "UAE"],
  "password": "securepassword"
}
```

### Market Intelligence Query
```javascript
GET /api/market-intelligence?hsCode=030613&countries=Japan,Germany&page=1&limit=10
```

### Buyer Search
```javascript
GET /api/buyers?country=Japan&productCategory=Seafood&search=fish&page=1
```

## 🛠️ Development

### Project Structure
```
backend/
├── config/          # Database and logging config
├── middleware/      # Auth and error handling
├── models/          # Data models
├── routes/          # API route handlers
├── scripts/         # Database scripts
├── uploads/         # File upload directory
├── logs/           # Application logs
└── server.js       # Main server file
```

### Adding New Routes
1. Create route file in `routes/`
2. Add route to `server.js`
3. Test with Postman or frontend

### Database Operations
```javascript
const { getDB } = require('../config/database');
const db = getDB();
const result = await db.collection('collectionName').find({}).toArray();
```

## 🔧 Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm run create-indexes` - Create database indexes
- `npm test` - Run tests

## 🌐 Environment Variables

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tradenavigator
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

## 📦 Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   ```

2. **Database Indexes**
   ```bash
   npm run create-indexes
   ```

3. **Start Server**
   ```bash
   npm start
   ```

## 🐛 Error Handling

The API uses consistent error response format:
```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if any
}
```

## 📊 Logging

Logs are stored in `logs/` directory:
- `error.log` - Error logs only
- `combined.log` - All logs

## 🔄 API Integration with Frontend

Replace all dummy data in frontend with API calls:

### Dashboard Data (Indian)
```javascript
// Replace sampleData in app/dashboard/indian/page.tsx
const { data } = await fetch('/api/dashboard/indian', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Buyers List
```javascript
// Replace buyersData in app/buyers/page.tsx
const { data } = await fetch('/api/buyers', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Market Intelligence
```javascript
// Replace tariffData in app/market-intelligence/page.tsx
const { data } = await fetch('/api/market-intelligence', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🧪 Testing

Use tools like Postman, Insomnia, or curl to test endpoints:

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test protected endpoint
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/users/profile
```

## 📈 Performance Considerations

- Database indexes created for optimal query performance
- Pagination implemented for large datasets
- File upload size limits configured
- Rate limiting implemented
- Compression enabled

## 🛡️ Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation with Joi
- File type validation
- Rate limiting
- CORS configuration
- Helmet security headers

## 🤝 Contributing

1. Follow existing code structure
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test all endpoints

## 📞 Support

For questions or issues:
1. Check the logs in `logs/` directory
2. Verify MongoDB connection
3. Ensure all environment variables are set
4. Check API endpoint documentation
