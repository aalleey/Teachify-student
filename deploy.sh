#!/bin/bash

echo "🚀 Starting Teachify Deployment Process..."
echo "=========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ CLI tools ready"

# Deploy Backend to Railway
echo "🚀 Deploying Backend to Railway..."
cd server

# Set environment variables
echo "Setting environment variables..."
railway variables set MONGODB_URI="mongodb+srv://aalleey27:laptop321@techify.zoafzhc.mongodb.net/"
railway variables set JWT_SECRET="laptop321"
railway variables set NODE_ENV="production"

# Deploy
echo "Deploying to Railway..."
railway up

# Get backend URL
echo "Getting backend URL..."
BACKEND_URL=$(railway domain)
echo "✅ Backend deployed: $BACKEND_URL"

# Deploy Frontend to Vercel
echo "🎨 Deploying Frontend to Vercel..."
cd ../client

# Deploy
echo "Deploying to Vercel..."
vercel --prod

# Get frontend URL
echo "Getting frontend URL..."
FRONTEND_URL=$(vercel ls | grep -o 'https://[^ ]*\.vercel\.app' | head -1)
echo "✅ Frontend deployed: $FRONTEND_URL"

echo "🎉 Deployment Complete!"
echo "======================"
echo "🌐 Frontend: $FRONTEND_URL"
echo "🔗 Backend: $BACKEND_URL"
echo ""
echo "Next steps:"
echo "1. Set REACT_APP_API_URL in Vercel dashboard to: $BACKEND_URL"
echo "2. Test your application!"
