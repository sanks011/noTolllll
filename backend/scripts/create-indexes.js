const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = 'tradenavigator';

async function createIndexes() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1, sector: 1 });
    console.log('✓ Users indexes created');
    
    // Market Intelligence indexes
    await db.collection('marketIntelligence').createIndex(
      { hsCode: 1, country: 1 }, 
      { unique: true }
    );
    await db.collection('marketIntelligence').createIndex({ competitivenessScore: -1 });
    await db.collection('marketIntelligence').createIndex({ tariffRate: 1 });
    console.log('✓ Market Intelligence indexes created');
    
    // Buyers indexes
    await db.collection('buyers').createIndex({ country: 1, isVerified: 1 });
    await db.collection('buyers').createIndex({ productCategories: 1 });
    await db.collection('buyers').createIndex({ name: 'text', country: 'text' });
    console.log('✓ Buyers indexes created');
    
    // User Buyer Interactions indexes
    await db.collection('userBuyerInteractions').createIndex(
      { userId: 1, buyerId: 1 }, 
      { unique: true }
    );
    await db.collection('userBuyerInteractions').createIndex({ userId: 1, status: 1 });
    console.log('✓ User Buyer Interactions indexes created');
    
    // Compliance Checklists indexes
    await db.collection('complianceChecklists').createIndex({ userId: 1 }, { unique: true });
    await db.collection('complianceChecklists').createIndex({ targetCountry: 1 });
    console.log('✓ Compliance Checklists indexes created');
    
    // Relief Schemes indexes
    await db.collection('reliefSchemes').createIndex({ isActive: 1, deadline: 1 });
    await db.collection('reliefSchemes').createIndex({ 'eligibilityCriteria.sectors': 1 });
    console.log('✓ Relief Schemes indexes created');
    
    // User Relief Applications indexes
    await db.collection('userReliefApplications').createIndex(
      { userId: 1, schemeId: 1 }, 
      { unique: true }
    );
    await db.collection('userReliefApplications').createIndex({ userId: 1, status: 1 });
    console.log('✓ User Relief Applications indexes created');
    
    // Forum Posts indexes
    await db.collection('forumPosts').createIndex({ createdAt: -1 });
    await db.collection('forumPosts').createIndex({ category: 1, isPinned: -1 });
    await db.collection('forumPosts').createIndex({ title: 'text', content: 'text', tags: 'text' });
    console.log('✓ Forum Posts indexes created');
    
    // Forum Replies indexes
    await db.collection('forumReplies').createIndex({ postId: 1, createdAt: 1 });
    await db.collection('forumReplies').createIndex({ userId: 1 });
    console.log('✓ Forum Replies indexes created');
    
    // Impact Logs indexes
    await db.collection('impactLogs').createIndex({ userId: 1, eventDate: -1 });
    await db.collection('impactLogs').createIndex({ eventType: 1 });
    console.log('✓ Impact Logs indexes created');
    
    // File Uploads indexes
    await db.collection('fileUploads').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('fileUploads').createIndex({ uploadPurpose: 1 });
    console.log('✓ File Uploads indexes created');
    
    console.log('\n🎉 All indexes created successfully!');
    
  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await client.close();
  }
}

createIndexes();
