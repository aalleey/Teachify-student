// Quick script to verify if admin user exists in MongoDB
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, 'server', '.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

// Normalize MongoDB URI
function normalizeMongoURI(uri) {
  if (!uri) return 'mongodb+srv://aalleey27:laptop321@techify.zoafzhc.mongodb.net/teachify?retryWrites=true&w=majority';
  
  let normalized = uri.trim();
  if (normalized.endsWith('/')) {
    normalized = normalized + 'teachify';
  }
  if (!normalized.includes('?')) {
    normalized = normalized + '?retryWrites=true&w=majority';
  }
  return normalized;
}

let MONGODB_URI = normalizeMongoURI(process.env.MONGODB_URI || 'mongodb+srv://aalleey27:laptop321@techify.zoafzhc.mongodb.net/teachify?retryWrites=true&w=majority');

(async () => {
  let client;
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected\n');

    const db = client.db('teachify');
    const usersCollection = db.collection('users');

    // Check for admin user
    const admin = await usersCollection.findOne({ email: 'admin@teachify.com' });
    
    if (admin) {
      console.log('✅ Admin user EXISTS in database');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log('\n📋 Login credentials:');
      console.log('   Email: admin@teachify.com');
      console.log('   Password: admin123\n');
    } else {
      console.log('❌ Admin user NOT FOUND in database');
      console.log('\n💡 Run this to create admin user:');
      console.log('   node seed-admin-production.js\n');
    }

    // Show all users
    const allUsers = await usersCollection.find({}).toArray();
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    if (allUsers.length > 0) {
      console.log('\n👥 Users:');
      allUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Connection closed');
    }
    process.exit(0);
  }
})();

