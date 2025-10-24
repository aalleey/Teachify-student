// Test script to verify deployment
const axios = require('axios');

async function testDeployment() {
  console.log('🧪 Testing Teachify Deployment...\n');
  
  // Test backend health
  try {
    console.log('1. Testing Backend Health...');
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const healthResponse = await axios.get(`${backendUrl}/api/health`);
    console.log('✅ Backend Health:', healthResponse.data);
  } catch (error) {
    console.log('❌ Backend Health Failed:', error.message);
  }
  
  // Test frontend build
  try {
    console.log('\n2. Testing Frontend Build...');
    const { execSync } = require('child_process');
    execSync('cd client && npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend Build Successful');
  } catch (error) {
    console.log('❌ Frontend Build Failed:', error.message);
  }
  
  console.log('\n🎉 Deployment test completed!');
}

testDeployment();