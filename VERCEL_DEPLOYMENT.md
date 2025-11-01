# Vercel Deployment Guide

This project is configured to deploy both the React frontend and Express backend to Vercel as serverless functions.

## Project Structure

```
Teachify/
├── client/           # React frontend
│   └── build/        # Built React app (generated)
├── server/           # Express backend (for local development)
│   ├── models/       # MongoDB models
│   ├── routes/       # Express routes (reference)
│   └── middleware/   # Express middleware
└── api/              # Vercel serverless functions
    ├── auth.js       # Authentication endpoints
    ├── faculty.js    # Faculty management
    ├── syllabus.js   # Syllabus endpoints
    ├── announcements.js
    ├── notes.js
    ├── calendar.js
    └── health.js     # Health check
```

## Configuration Files

### vercel.json
Routes API requests to serverless functions and serves the React build for all other routes.

### package.json
Contains `build` and `vercel-build` scripts that build the React app.

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `NODE_ENV` - Set to `production`
   - Any other environment variables from `server/env.example`

4. **Deploy**:
   ```bash
   vercel
   ```

   For production deployment:
   ```bash
   vercel --prod
   ```

## How It Works

1. **Frontend**: React app is built using `npm run build` and served as static files from `client/build/`.

2. **Backend**: Express routes in `api/` folder are converted to Vercel serverless functions using `@vercel/node`.

3. **Routing**:
   - `/api/*` requests → routed to corresponding serverless function in `api/`
   - All other requests → served from `client/build/` (React SPA)

## API Endpoints

All API endpoints are prefixed with `/api/`:

- `/api/health` - Health check
- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/auth/me` - Get current user (requires auth)
- `/api/faculty` - Faculty management (GET, POST, PUT, DELETE)
- `/api/syllabus` - Syllabus management
- `/api/announcements` - Announcements
- `/api/notes` - Notes management
- `/api/calendar` - Calendar events

## Important Notes

1. **File Uploads**: The syllabus upload feature may need adjustment for Vercel's serverless environment. Consider using Cloudinary or similar service for file storage.

2. **MongoDB Connection**: Each serverless function manages its own MongoDB connection. The `_utils.js` file includes connection caching to improve performance.

3. **CORS**: CORS is enabled in all API functions to allow requests from the frontend.

4. **Environment Variables**: Make sure all required environment variables are set in the Vercel dashboard.

## Local Testing

To test the Vercel configuration locally:

```bash
vercel dev
```

This will:
- Start a local server that mimics Vercel's routing
- Build and serve the React app
- Execute serverless functions locally

## Troubleshooting

- **Build fails**: Check that `client/package.json` has all dependencies and the build script works
- **API 404**: Verify `vercel.json` routes are correct and API files export Express apps
- **MongoDB connection**: Ensure `MONGODB_URI` is set correctly in Vercel environment variables
- **CORS errors**: Check that CORS middleware is present in all API files

