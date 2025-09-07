const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(userData) {
    this.email = userData.email;
    this.companyName = userData.companyName;
    this.contactPerson = userData.contactPerson;
    // New simplified role structure: userType (Indian/Foreigner) + role (Buyer/Seller)
    this.userType = userData.userType; // 'Indian' | 'Foreigner' 
    this.role = userData.role; // 'Buyer' | 'Seller'
    this.isAdmin = userData.isAdmin || false; // Admin role for platform management
    this.sector = userData.sector; // 'Seafood' | 'Textile' | 'Both'
    this.hsCode = userData.hsCode;
    this.targetCountries = userData.targetCountries || [];
    this.password = userData.password;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.isVerified = false;
    this.isActive = true;
    this.totalRevenue = 0;
    this.ordersSecured = 0;
    this.marketsEntered = 0;
    this.jobsRetained = 0;
    
    // Extended profile fields for comprehensive business information
    this.profileCompleted = false;
    this.companySize = userData.companySize;
    this.annualTurnover = userData.annualTurnover;
    this.establishedYear = userData.establishedYear;
    this.businessDescription = userData.businessDescription;
    this.website = userData.website;
    this.primaryProducts = userData.primaryProducts || [];
    this.certifications = userData.certifications || [];
    this.targetMarkets = userData.targetMarkets || [];
    this.currentMarkets = userData.currentMarkets || [];
    
    // Buyer-specific fields
    this.sourcingBudget = userData.sourcingBudget;
    this.orderFrequency = userData.orderFrequency;
    this.preferredSupplierLocation = userData.preferredSupplierLocation;
    this.qualityRequirements = userData.qualityRequirements;
    
    // Seller-specific fields
    this.productionCapacity = userData.productionCapacity;
    this.exportExperience = userData.exportExperience;
    this.leadTime = userData.leadTime;
    this.minimumOrderQuantity = userData.minimumOrderQuantity;
    this.paymentTerms = userData.paymentTerms;
    
    // Additional fields
    this.specialRequirements = userData.specialRequirements;
    this.businessGoals = userData.businessGoals || [];
  }

  async save() {
    const db = getDB();
    
    // Hash password if provided
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const result = await db.collection('users').insertOne(this);
    return result;
  }

  static async findByEmail(email) {
    const db = getDB();
    return await db.collection('users').findOne({ email });
  }

  static async findById(id) {
    const db = getDB();
    return await db.collection('users').findOne({ _id: new ObjectId(id) });
  }

  static async updateById(id, updateData) {
    const db = getDB();
    updateData.updatedAt = new Date();
    return await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateMetrics(userId, metrics) {
    const db = getDB();
    return await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $inc: {
          totalRevenue: metrics.revenue || 0,
          ordersSecured: metrics.orders || 0,
          marketsEntered: metrics.markets || 0,
          jobsRetained: metrics.jobs || 0
        },
        $set: { updatedAt: new Date() }
      }
    );
  }
}

module.exports = User;
