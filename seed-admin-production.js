// Script to seed admin user in production MongoDB
// Uses the same MongoDB URI format that Vercel uses
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env from server folder or root
dotenv.config({ path: path.join(__dirname, 'server', '.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

// Use production MongoDB URI (same as Vercel)
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aalleey27:laptop321@techify.zoafzhc.mongodb.net/teachify?retryWrites=true&w=majority';

// Normalize URI (add database name if missing)
function normalizeMongoURI(uri) {
  if (!uri) return 'mongodb+srv://aalleey27:laptop321@techify.zoafzhc.mongodb.net/teachify?retryWrites=true&w=majority';
  
  let normalized = uri.trim();
  
  // If URI ends with just /, add database name
  if (normalized.endsWith('/')) {
    normalized = normalized + 'teachify';
  }
  
  // Add query parameters if not present
  if (!normalized.includes('?')) {
    normalized = normalized + '?retryWrites=true&w=majority';
  } else if (!normalized.includes('retryWrites')) {
    // Check if we need to add params
    const hasRetryWrites = normalized.includes('retryWrites');
    if (!hasRetryWrites) {
      normalized = normalized + '&retryWrites=true&w=majority';
    }
  }
  
  return normalized;
}

MONGODB_URI = normalizeMongoURI(MONGODB_URI);

const DB_NAME = 'teachify';

(async () => {
  let client;
  try {
    console.log('🔗 Connecting to MongoDB (Production)...');
    console.log('📝 Using URI:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ email: 'admin@teachify.com' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log('\n✅ You can login with:');
      console.log('   Email: admin@teachify.com');
      console.log('   Password: admin123\n');
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const adminUser = {
        name: 'Admin User',
        email: 'admin@teachify.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await usersCollection.insertOne(adminUser);
      console.log('\n✅ Admin user created successfully!\n');
      console.log('═══════════════════════════════════════════════════');
      console.log('📋 ADMIN LOGIN CREDENTIALS:');
      console.log('═══════════════════════════════════════════════════');
      console.log('📧 Email: admin@teachify.com');
      console.log('🔐 Password: admin123');
      console.log('═══════════════════════════════════════════════════\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('authentication')) {
      console.error('\n💡 Tip: Check your MongoDB username and password');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.error('\n💡 Tip: Check your MongoDB connection string and network');
    }
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
})();

