## Deploy to Render

### Backend (server)
- Service type: Web Service
- Root: `server`
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Environment Variables:
  - `NODE_ENV=production`
  - `MONGODB_URI=...`
  - `JWT_SECRET=...`
  - `CLOUDINARY_CLOUD_NAME=dqgoleqga`
  - `CLOUDINARY_API_KEY=574366883697562`
  - `CLOUDINARY_API_SECRET=EotWBxDs3HzH5jkModagJfgFyyI`

CORS is configured to allow `*.onrender.com` in `server/server.js`.

### Frontend (client) — Static Site
- Root: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`
- Environment Variables:
  - `REACT_APP_API_URL=https://<your-backend>.onrender.com`

### Notes
- Client automatically uses `REACT_APP_API_URL` for API calls.
- Syllabus and profile images use Cloudinary URLs directly; no `localhost` prefixes remain.
- Verify API after deploy: open `https://<your-backend>.onrender.com/api/health`.
