# 🚀 Production Setup with Ngrok Tunnel

## Setup Instructions

### Step 1: Build the React App

First, build the React app to create the production bundle:

```bash
cd client
npm run build
```

This will create the `client/build` folder with all the static files.

### Step 2: Update Environment Variables

Make sure your `server/.env` file has:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

If `.env` doesn't exist, copy from `env.example`:
```bash
cd server
copy env.example .env
# Then edit .env and add NODE_ENV=production
```

### Step 3: Ensure Ngrok is Installed

Make sure ngrok is installed and configured:

```bash
# Install ngrok globally (if not already installed)
npm install -g ngrok

# Configure ngrok authtoken (if not done)
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 4: Start Server with Ngrok Tunnel

```bash
cd server
npm run start:tunnel
```

This will:
1. Start an ngrok tunnel for port 5000 in a new window
2. Start your Express server serving both API and React app

### Step 5: Access Your App

- **Ngrok URL**: Check the ngrok window for the public HTTPS URL (e.g., `https://xyz.ngrok.io`)
- **Local URL**: `http://localhost:5000`

Both URLs will serve your complete MERN app (frontend + backend).

---

## 🎯 What's Configured

### ✅ Server Features

- **ES Module Support**: Uses `fileURLToPath` and `__dirname` for ES modules
- **Static File Serving**: Serves React build from `../client/build`
- **SPA Routing**: All non-API routes serve `index.html` (React Router support)
- **API Routes**: All `/api/*` routes work as before
- **CORS**: Configured to allow ngrok domains
- **Port**: Uses `process.env.PORT || 5000`

### ✅ Route Priority

1. `/api/*` routes → Handled by Express API routes
2. Static files (JS, CSS, images) → Served from `client/build`
3. All other routes (`*`) → Serve `index.html` for React Router

---

## 📁 File Structure

```
Teachify/
├── client/
│   └── build/          # React production build (created by npm run build)
├── server/
│   ├── server.js       # Main server file (ES modules)
│   ├── index.js        # Development server (unchanged)
│   ├── .env            # Environment variables
│   └── package.json    # Updated with start:tunnel script
```

---

## 🔧 Alternative: Run Without Ngrok

If you just want to test locally without ngrok:

```bash
cd server
npm start
```

Access at: `http://localhost:5000`

---

## 🐛 Troubleshooting

### Build Folder Not Found

If you see "React build folder not found":
1. Make sure you ran `cd client && npm run build`
2. Check that `client/build` folder exists
3. Verify the path in `server.js` is correct

### Ngrok Not Starting

If ngrok doesn't start:
1. Verify ngrok is installed: `ngrok version`
2. Check ngrok authtoken is configured
3. Try running ngrok manually: `ngrok http 5000`

### Port Already in Use

If port 5000 is already in use:
1. Change `PORT` in `.env` file
2. Update ngrok command to match: `ngrok http YOUR_PORT`
3. Update `start:tunnel` script in `package.json`

### API Routes Not Working

If API routes return 404:
- Make sure API routes are defined BEFORE the catch-all `app.get('*')` route
- Check that routes are properly imported
- Verify the request path starts with `/api/`

---

## 📝 Notes

- **Development**: Continue using `npm run dev` for development (uses `index.js`)
- **Production**: Use `npm start` or `npm run start:tunnel` (uses `server.js`)
- **Ngrok URL**: Changes every time you restart (free plan) or use a fixed domain (paid plan)

---

**Setup Complete!** Your MERN app is now ready to serve from a single port with ngrok tunnel support. 🎉

