const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

console.log('🚀 Starting server first, then ngrok tunnel...\n');

// Start the Express server first
console.log('⚙️  Starting Express server on port 5000...\n');

const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  detached: false
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.error(`❌ Server exited with code ${code}`);
  process.exit(code);
});

// Wait for server to be ready (check if port 5000 is listening)
function waitForServer(maxAttempts = 30, delay = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkServer = () => {
      attempts++;
      const req = http.get('http://localhost:5000/api/health', (res) => {
        console.log('✅ Server is ready!\n');
        resolve();
      });
      
      req.on('error', (err) => {
        if (attempts >= maxAttempts) {
          reject(new Error('Server did not start in time'));
        } else {
          setTimeout(checkServer, delay);
        }
      });
      
      req.setTimeout(500, () => {
        req.destroy();
        if (attempts >= maxAttempts) {
          reject(new Error('Server did not start in time'));
        } else {
          setTimeout(checkServer, delay);
        }
      });
    };
    
    // Wait a bit before first check
    setTimeout(checkServer, 2000);
  });
}

// After server is ready, start ngrok
waitForServer()
  .then(() => {
    console.log('📡 Starting Ngrok tunnel...\n');
    
    // Start ngrok in a new window
    const ngrok = spawn('cmd', ['/c', 'start', 'cmd', '/k', 'ngrok http 5000'], {
      shell: true,
      detached: true,
      stdio: 'ignore'
    });
    
    ngrok.unref();
    
    console.log('✅ Ngrok tunnel opened in new window');
    console.log('📋 Check the ngrok window for your public URL\n');
    console.log('🌐 Your app is now accessible at:');
    console.log('   - Local: http://localhost:5000');
    console.log('   - Public: (see ngrok window)\n');
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    console.error('   Make sure your server starts correctly');
    server.kill();
    process.exit(1);
  });

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill();
  process.exit(0);
});
