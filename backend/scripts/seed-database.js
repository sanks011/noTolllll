const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = 'tradenavigator';

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Clear existing data (optional - comment out in production)
    // await db.collection('marketIntelligence').deleteMany({});
    // await db.collection('buyers').deleteMany({});
    // await db.collection('reliefSchemes').deleteMany({});
    
    // Seed Market Intelligence Data
    const marketIntelligenceData = [
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
      },
      {
        hsCode: "030613",
        country: "United States",
        tariffRate: 4.0,
        importVolume: 45000,
        avgPricePerKg: 13.20,
        competitivenessScore: 72,
        demandGrowth: 2.1,
        lastUpdated: new Date()
      },
      {
        hsCode: "030613",
        country: "United Kingdom",
        tariffRate: 3.5,
        importVolume: 18000,
        avgPricePerKg: 12.90,
        competitivenessScore: 75,
        demandGrowth: 4.5,
        lastUpdated: new Date()
      },
      {
        hsCode: "030613",
        country: "UAE",
        tariffRate: 0,
        importVolume: 8000,
        avgPricePerKg: 11.50,
        competitivenessScore: 88,
        demandGrowth: 7.2,
        lastUpdated: new Date()
      },
      {
        hsCode: "030613",
        country: "South Korea",
        tariffRate: 6.0,
        importVolume: 12000,
        avgPricePerKg: 13.80,
        competitivenessScore: 80,
        demandGrowth: 6.1,
        lastUpdated: new Date()
      },
      // Textile data
      {
        hsCode: "620342",
        country: "Germany",
        tariffRate: 8.2,
        importVolume: 35000,
        avgPricePerKg: 45.50,
        competitivenessScore: 70,
        demandGrowth: 2.8,
        lastUpdated: new Date()
      },
      {
        hsCode: "620342",
        country: "United States",
        tariffRate: 12.5,
        importVolume: 55000,
        avgPricePerKg: 48.20,
        competitivenessScore: 65,
        demandGrowth: 1.9,
        lastUpdated: new Date()
      },
      {
        hsCode: "620342",
        country: "United Kingdom",
        tariffRate: 9.8,
        importVolume: 22000,
        avgPricePerKg: 46.80,
        competitivenessScore: 72,
        demandGrowth: 3.2,
        lastUpdated: new Date()
      }
    ];

    await db.collection('marketIntelligence').insertMany(marketIntelligenceData);
    console.log('✓ Market Intelligence data seeded');

    // Seed Buyers Data
    const buyersData = [
      {
        name: "Tokyo Fish Market Co.",
        country: "Japan",
        city: "Tokyo",
        productCategories: ["Seafood", "Frozen Shrimp", "Prawns"],
        importVolume: 2500,
        contactEmail: "procurement@tokyofish.jp",
        contactPhone: "+81-3-1234-5678",
        certificationsRequired: ["HACCP", "ISO 22000", "JAS Organic"],
        preferredIncoterms: ["FOB", "CIF"],
        paymentTerms: "LC at sight",
        rating: 4.8,
        isVerified: true,
        description: "Leading seafood importer in Japan with 25+ years experience. Specializes in premium frozen seafood products.",
        requirements: "HACCP certified, cold chain maintained, delivery within 30 days",
        createdAt: new Date()
      },
      {
        name: "European Seafood Ltd.",
        country: "Netherlands",
        city: "Amsterdam",
        productCategories: ["Seafood", "Frozen Shrimp", "Crab", "Lobster"],
        importVolume: 4200,
        contactEmail: "buyers@euroseafood.nl",
        contactPhone: "+31-20-123-4567",
        certificationsRequired: ["BRC", "MSC", "EU Organic"],
        preferredIncoterms: ["CIF", "DDP"],
        paymentTerms: "30 days credit",
        rating: 4.6,
        isVerified: true,
        description: "Major European distributor serving premium restaurants and retail chains across EU.",
        requirements: "MSC certification preferred, sustainable sourcing, flexible payment terms",
        createdAt: new Date()
      },
      {
        name: "Gulf Trading House",
        country: "UAE",
        city: "Dubai",
        productCategories: ["Seafood", "Frozen Shrimp", "Fish", "Prawns"],
        importVolume: 1800,
        contactEmail: "import@gulftrading.ae",
        contactPhone: "+971-4-123-4567",
        certificationsRequired: ["HACCP", "Halal", "ESMA"],
        preferredIncoterms: ["FOB", "CFR"],
        paymentTerms: "LC at sight",
        rating: 4.7,
        isVerified: true,
        description: "Regional hub for Middle East and Africa markets. Fast-growing seafood importer.",
        requirements: "Halal certification mandatory, competitive pricing, regular supply",
        createdAt: new Date()
      },
      {
        name: "Seoul Marine Products",
        country: "South Korea",
        city: "Seoul",
        productCategories: ["Seafood", "Prawns", "Shrimp", "Squid"],
        importVolume: 3100,
        contactEmail: "trade@seoulmarine.kr",
        contactPhone: "+82-2-123-4567",
        certificationsRequired: ["K-HACCP", "ISO 14001"],
        preferredIncoterms: ["FOB", "CIF"],
        paymentTerms: "45 days credit",
        rating: 4.5,
        isVerified: true,
        description: "Established Korean importer with strong retail and foodservice network.",
        requirements: "K-HACCP certification, Korean language documentation, 45-day payment terms",
        createdAt: new Date()
      },
      {
        name: "British Seafood Imports",
        country: "United Kingdom",
        city: "London",
        productCategories: ["Seafood", "Fish Fillets", "Frozen Shrimp", "Scallops"],
        importVolume: 2900,
        contactEmail: "sourcing@britishseafood.co.uk",
        contactPhone: "+44-20-1234-5678",
        certificationsRequired: ["BRC", "Red Tractor", "MSC"],
        preferredIncoterms: ["CIF", "DDP"],
        paymentTerms: "30 days credit",
        rating: 4.4,
        isVerified: true,
        description: "Premium UK importer focusing on sustainable and traceable seafood products.",
        requirements: "Full traceability, sustainable sourcing certificates, Brexit compliance",
        createdAt: new Date()
      },
      {
        name: "American Textile Corp",
        country: "United States",
        city: "New York",
        productCategories: ["Textile", "Cotton Garments", "Fashion Wear"],
        importVolume: 5500,
        contactEmail: "sourcing@americantextile.com",
        contactPhone: "+1-212-555-0123",
        certificationsRequired: ["GOTS", "OEKO-TEX", "WRAP"],
        preferredIncoterms: ["FOB", "EXW"],
        paymentTerms: "60 days credit",
        rating: 4.3,
        isVerified: true,
        description: "Major US textile importer serving fashion brands and retailers nationwide.",
        requirements: "Organic certification preferred, ethical manufacturing, competitive pricing",
        createdAt: new Date()
      },
      {
        name: "Deutsche Fashion GmbH",
        country: "Germany",
        city: "Hamburg",
        productCategories: ["Textile", "Organic Cotton", "Sustainable Fashion"],
        importVolume: 3800,
        contactEmail: "einkauf@deutschefashion.de",
        contactPhone: "+49-40-987-6543",
        certificationsRequired: ["GOTS", "CRADLE_TO_CRADLE", "EU_ECO_LABEL"],
        preferredIncoterms: ["CIF", "DDP"],
        paymentTerms: "45 days credit",
        rating: 4.6,
        isVerified: true,
        description: "Leading sustainable fashion importer in Europe with focus on organic materials.",
        requirements: "Sustainable production, fair trade practices, EU compliance",
        createdAt: new Date()
      }
    ];

    await db.collection('buyers').insertMany(buyersData);
    console.log('✓ Buyers data seeded');

    // Seed Relief Schemes Data
    const reliefSchemesData = [
      {
        name: "Export Promotion Capital Goods Scheme (EPCG)",
        authority: "Ministry of Commerce & Industry",
        benefitAmount: 5000000, // 50 Lakhs
        benefitType: "Duty Exemption",
        deadline: new Date('2024-12-31'),
        eligibilityCriteria: {
          minTurnover: 10000000, // 1 Crore
          maxEmployees: 500,
          sectors: ["Seafood", "Textile", "Both"],
          regions: ["All India"]
        },
        applicationProcess: "Apply online through DGFT portal with required documents",
        documentsRequired: [
          "IEC Certificate",
          "CA Certified Financial Statements",
          "Export Performance Certificate",
          "Bank Certificate"
        ],
        isActive: true,
        description: "Scheme for duty free import of capital goods for export production",
        createdAt: new Date()
      },
      {
        name: "Market Development Assistance (MDA) Scheme",
        authority: "APEDA",
        benefitAmount: 1200000, // 12 Lakhs
        benefitType: "Subsidy",
        deadline: new Date('2024-06-30'),
        eligibilityCriteria: {
          minTurnover: 5000000, // 50 Lakhs
          maxEmployees: 200,
          sectors: ["Seafood"],
          regions: ["Odisha", "Andhra Pradesh", "Kerala", "Tamil Nadu"]
        },
        applicationProcess: "Submit application to APEDA regional office",
        documentsRequired: [
          "Registration Certificate",
          "Export License",
          "Quality Certificates",
          "Market Study Report"
        ],
        isActive: true,
        description: "Financial assistance for market development activities in agricultural exports",
        createdAt: new Date()
      },
      {
        name: "Technology Upgradation Fund Scheme (TUFS)",
        authority: "Ministry of Textiles",
        benefitAmount: 8000000, // 80 Lakhs
        benefitType: "Credit Subsidy",
        deadline: new Date('2024-09-30'),
        eligibilityCriteria: {
          minTurnover: 15000000, // 1.5 Crores
          maxEmployees: 1000,
          sectors: ["Textile"],
          regions: ["All India"]
        },
        applicationProcess: "Apply through designated banks with technical approval",
        documentsRequired: [
          "Project Report",
          "Technical Feasibility Study",
          "Environmental Clearance",
          "Bank Loan Sanction Letter"
        ],
        isActive: true,
        description: "Credit linked capital subsidy for technology upgradation in textile industry",
        createdAt: new Date()
      },
      {
        name: "Interest Equalization Scheme on Pre and Post Shipment Rupee Export Credit",
        authority: "Reserve Bank of India",
        benefitAmount: 2000000, // 20 Lakhs
        benefitType: "Interest Subsidy",
        deadline: new Date('2024-03-31'),
        eligibilityCriteria: {
          minTurnover: 2500000, // 25 Lakhs
          maxEmployees: 100,
          sectors: ["Seafood", "Textile", "Both"],
          regions: ["All India"]
        },
        applicationProcess: "Apply through your bank for interest rate subsidy",
        documentsRequired: [
          "Export Order/LC Copy",
          "Bank Account Details",
          "Export Performance Certificate",
          "Audited Financial Statements"
        ],
        isActive: true,
        description: "Interest rate subsidy on rupee export credit to make exports competitive",
        createdAt: new Date()
      }
    ];

    await db.collection('reliefSchemes').insertMany(reliefSchemesData);
    console.log('✓ Relief Schemes data seeded');

    // Seed Forum Posts Data
    const forumPostsData = [
      {
        userId: null, // Will be set to actual user IDs later
        title: "Successfully exported to Japan - Sharing my experience",
        content: "Hi everyone! I wanted to share my recent success story of exporting frozen shrimp to Japan. After months of preparation and following the compliance guidelines from this platform, I finally secured my first order worth ₹15 lakhs. The key was getting the right certifications - HACCP and JAS Organic were crucial. The buyer was very particular about cold chain documentation. Happy to answer any questions about the process!",
        category: "Success Stories",
        tags: ["Japan", "Seafood", "Export Success", "HACCP"],
        likes: 24,
        commentsCount: 8,
        isAnswered: false,
        isPinned: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        userId: null,
        title: "EU tariff rates changing for textile products - What to expect?",
        content: "Has anyone heard about the proposed changes in EU tariff rates for textile imports? I'm particularly concerned about cotton garments (HS Code 620342). My buyer in Germany mentioned some policy changes coming up. Would appreciate if anyone has more information or official sources.",
        category: "Market Updates",
        tags: ["EU", "Textile", "Tariff", "Policy"],
        likes: 15,
        commentsCount: 12,
        isAnswered: true,
        isPinned: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        userId: null,
        title: "How to get MSC certification for seafood exports?",
        content: "I'm looking to export to European markets and many buyers are asking for MSC (Marine Stewardship Council) certification. Can someone guide me through the process? What are the costs involved and how long does it typically take? Any recommended certification bodies in India?",
        category: "Q&A",
        tags: ["MSC", "Certification", "Europe", "Seafood"],
        likes: 18,
        commentsCount: 6,
        isAnswered: false,
        isPinned: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    await db.collection('forumPosts').insertMany(forumPostsData);
    console.log('✓ Forum Posts data seeded');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: node scripts/create-indexes.js');
    console.log('2. Start the server: npm run dev');
    console.log('3. Test the API endpoints');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();
