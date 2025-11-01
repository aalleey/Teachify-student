// Simple script to add admin user using native MongoDB driver
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://aalleey27:laptop321@techify.zoafzhc.mongodb.net/teachify?retryWrites=true&w=majority';

(async () => {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('teachify');
    const usersCollection = db.collection('users');

    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ email: 'admin@teachify.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Email: admin@teachify.com');
      await client.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    console.log('👤 Creating admin user...');
    await usersCollection.insertOne({
      name: 'Admin User',
      email: 'admin@teachify.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 ADMIN LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════════════════');
    console.log('📧 Email: admin@teachify.com');
    console.log('🔐 Password: admin123');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
})();

