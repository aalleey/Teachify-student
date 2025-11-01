# Vercel Environment Variables Setup 🔧

## ⚠️ CRITICAL: Your MongoDB URI is Missing the Database Name!

Your current Vercel env: `mongodb+srv://aalleey27:laptop321@techify.zoafzhc.mongodb.net/`

**This is incomplete!** It's missing the database name and query parameters.

## ✅ Correct Environment Variables for Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these **EXACT** values:

```
MONGODB_URI=mongodb+srv://aalleey27:laptop321@techify.zoafzhc.mongodb.net/teachify?retryWrites=true&w=majority
JWT_SECRET=laptop321
NODE_ENV=production
```

### Important Notes:

1. **MONGODB_URI** must include:
   - Database name: `/teachify` 
   - Query parameters: `?retryWrites=true&w=majority`

2. **Apply to all environments**: Production, Preview, Development

3. **After adding variables**: Redeploy your app:
   ```bash
   vercel --prod
   ```

## 🔍 How to Verify Your Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure all three variables are listed
3. Check that `MONGODB_URI` ends with `/teachify?retryWrites=true&w=majority`

## 👤 Admin User Setup

**IMPORTANT**: The admin user needs to exist in your production MongoDB database!

### Option 1: Check if admin exists
Run this locally (it will connect to your production MongoDB):

```bash
node verify-admin.js
```

### Option 2: Create admin user in production
Run this script (it uses your Vercel MongoDB URI):

```bash
node seed-admin-production.js
```

This will create:
- **Email**: `admin@teachify.com`
- **Password**: `admin123`

## 🐛 Troubleshooting Login Issues

### Issue 1: "Invalid credentials"
- ✅ Check admin user exists in MongoDB
- ✅ Verify password is correct: `admin123`
- ✅ Run `node seed-admin-production.js` if user doesn't exist

### Issue 2: "Database connection error"
- ✅ Verify `MONGODB_URI` in Vercel includes `/teachify`
- ✅ Check MongoDB Atlas allows connections from Vercel IPs (whitelist: `0.0.0.0/0`)
- ✅ Verify MongoDB credentials are correct

### Issue 3: "JWT error"
- ✅ Verify `JWT_SECRET` is set in Vercel
- ✅ Make sure `JWT_SECRET` matches between local and Vercel

### Issue 4: "Network error" or CORS error
- ✅ Check Vercel function logs: `vercel logs`
- ✅ Verify API routes are working: `https://your-app.vercel.app/api/health`

## 📋 Step-by-Step Fix

1. **Update Vercel Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://aalleey27:laptop321@techify.zoafzhc.mongodb.net/teachify?retryWrites=true&w=majority
   JWT_SECRET=laptop321
   NODE_ENV=production
   ```

2. **Redeploy**:
   ```bash
   vercel --prod
   ```

3. **Create Admin User** (if not exists):
   ```bash
   node seed-admin-production.js
   ```

4. **Test Login**:
   - Go to: `https://your-app.vercel.app/login`
   - Email: `admin@teachify.com`
   - Password: `admin123`

## ✅ Verification Checklist

- [ ] MongoDB URI includes `/teachify?retryWrites=true&w=majority`
- [ ] JWT_SECRET is set in Vercel
- [ ] NODE_ENV=production is set
- [ ] All variables applied to Production, Preview, Development
- [ ] App redeployed after adding variables
- [ ] Admin user exists in MongoDB
- [ ] `/api/health` endpoint works
- [ ] Login form submits successfully

---

**After fixing these, your login should work!** 🎉

