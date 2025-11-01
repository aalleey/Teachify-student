// Quick script to add admin user only
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from server folder
dotenv.config({ path: path.join(__dirname, 'server', '.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

const User = require('./server/models/User');

// Use the working MongoDB URI directly
const MONGODB_URI = 'mongodb+srv://aalleey27:laptop321@techify.zoafzhc.mongodb.net/teachify?retryWrites=true&w=majority';

(async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI.trim(), {
      serverSelectionTimeoutMS: 30000,
    });
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@teachify.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Email: admin@teachify.com');
      console.log('   Password: (check your database)');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@teachify.com',
      password: 'admin123',
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 ADMIN LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════════════════');
    console.log('📧 Email: admin@teachify.com');
    console.log('🔐 Password: admin123');
    console.log('═══════════════════════════════════════════════════\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();

