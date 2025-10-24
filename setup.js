const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Teachify Student Management System...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Create .env files if they don't exist
const serverEnvPath = path.join(__dirname, 'server', '.env');
const clientEnvPath = path.join(__dirname, 'client', '.env');

if (!fs.existsSync(serverEnvPath)) {
  console.log('📝 Creating server/.env file...');
  const serverEnvContent = `# Database
MONGODB_URI=mongodb://localhost:27017/teachify

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_${Math.random().toString(36).substring(2, 15)}

# Server Port
PORT=5000

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
`;
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log('✅ Server .env file created');
}

if (!fs.existsSync(clientEnvPath)) {
  console.log('📝 Creating client/.env file...');
  const clientEnvContent = `# API Configuration
REACT_APP_API_URL=http://localhost:5000
`;
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ Client .env file created');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing server dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });
  
  console.log('Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  console.log('✅ All dependencies installed successfully!');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running (local or Atlas)');
console.log('2. Update the .env files with your configuration');
console.log('3. Run "npm run dev" to start the development servers');
console.log('4. Run "cd server && npm run seed" to populate sample data');
console.log('\n🔗 Access the application at:');
console.log('- Frontend: http://localhost:3000');
console.log('- Backend API: http://localhost:5000');
console.log('\n👤 Sample login credentials:');
console.log('- Admin: admin@teachify.com / admin123');
console.log('- Student: john@student.com / student123');
console.log('- Faculty: jane@faculty.com / faculty123');
