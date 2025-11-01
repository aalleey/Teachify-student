# 🔐 Authentication-Based Routing Guide

## ✅ Implementation Complete

Your Teachify app now has full authentication-based routing with protected routes, public routes, and dynamic navbar visibility.

---

## 📋 Overview

### **Route Types**

1. **Public Routes** (`PublicRoute`) - Only accessible to guests (not logged in)
   - `/` (Home)
   - `/login`
   - `/register`
   - If a logged-in user tries to access these → redirects to their dashboard

2. **Protected Routes** (`ProtectedRoute`) - Require authentication
   - `/admin/dashboard` - Admin only
   - `/student/dashboard` - Student only
   - If a guest tries to access → redirects to `/login`
   - If wrong role → redirects to user's appropriate dashboard

3. **Open Routes** - Accessible to everyone (guests and authenticated users)
   - `/faculty` - Faculty directory page

---

## 🔄 How It Works

### **1. Authentication Flow**

```
Guest (Not Logged In)
  ↓
Access Public Route (Home, Login, Register) ✅
Access Protected Route (Dashboard) ❌ → Redirect to /login
  ↓
Login Success
  ↓
Redirect to Dashboard based on role
  ↓
Authenticated User
  ↓
Access Public Route (Home) ❌ → Redirect to Dashboard
Access Protected Route ✅
```

### **2. Navbar Behavior**

**Guest Navbar:**
- Home
- Teachers (Faculty)
- About
- Contact
- Login
- Register
- Dark Mode Toggle

**Authenticated Navbar:**
- Dashboard (links to role-specific dashboard)
- Faculty
- Welcome, [User Name] with role badge
- Logout button
- Dark Mode Toggle

---

## 🛠️ Components

### **PublicRoute Component**
Location: `client/src/components/PublicRoute.js`

**Purpose:** Redirects authenticated users away from public pages

**Usage:**
```jsx
<Route 
  path="/" 
  element={
    <PublicRoute>
      <Home />
    </PublicRoute>
  } 
/>
```

**Behavior:**
- If user is authenticated → Redirects to their dashboard
- If user is guest → Shows the component

---

### **ProtectedRoute Component**
Location: `client/src/components/ProtectedRoute.js`

**Purpose:** Protects routes that require authentication and optional role

**Usage:**
```jsx
// Require authentication only
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>

// Require authentication + specific role
<Route 
  path="/admin/dashboard" 
  element={
    <ProtectedRoute role="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

**Behavior:**
- If user is not authenticated → Redirects to `/login`
- If user doesn't have required role → Redirects to their dashboard
- If user is authenticated and has role → Shows the component

---

## 🚀 Adding New Routes

### **Add a Public Route (Guest Only)**

In `client/src/App.js`:

```jsx
<Route 
  path="/about" 
  element={
    <PublicRoute>
      <About />
    </PublicRoute>
  } 
/>
```

### **Add a Protected Route (Any Authenticated User)**

```jsx
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>
```

### **Add a Role-Specific Protected Route**

```jsx
<Route 
  path="/admin/settings" 
  element={
    <ProtectedRoute role="admin">
      <AdminSettings />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/student/courses" 
  element={
    <ProtectedRoute role="student">
      <StudentCourses />
    </ProtectedRoute>
  } 
/>
```

### **Add an Open Route (Everyone Can Access)**

```jsx
<Route path="/help" element={<Help />} />
```

---

## 🎨 Customizing Navbar Links

Location: `client/src/components/Navbar.js`

### **Add Link for Guests**

Edit the `publicNavLinks` array:

```jsx
const publicNavLinks = [
  { name: 'Home', path: '/' },
  { name: 'Teachers', path: '/faculty' },
  { name: 'About', path: '/#about' },
  { name: 'Contact', path: '/#contact' },
  { name: 'Help', path: '/help' }, // New link
];
```

### **Add Link for Authenticated Users**

Edit the `authNavLinks` array:

```jsx
const authNavLinks = [
  { name: 'Dashboard', path: isAdmin ? '/admin/dashboard' : '/student/dashboard' },
  { name: 'Faculty', path: '/faculty' },
  { name: 'Profile', path: '/profile' }, // New link
  { name: 'Settings', path: '/settings' }, // New link
];
```

### **Add Role-Specific Links**

```jsx
const authNavLinks = [
  { name: 'Dashboard', path: isAdmin ? '/admin/dashboard' : '/student/dashboard' },
  { name: 'Faculty', path: '/faculty' },
  // Admin-only links
  ...(isAdmin ? [{ name: 'Admin Panel', path: '/admin/panel' }] : []),
  // Student-only links
  ...(isStudent ? [{ name: 'My Courses', path: '/student/courses' }] : []),
];
```

---

## 🔀 Redirect Logic

### **Where Redirects Happen**

1. **After Login/Register:**
   - Location: `client/src/pages/Login.js` and `client/src/pages/Register.js`
   - Logic: Check user role → Navigate to appropriate dashboard

2. **PublicRoute:**
   - Location: `client/src/components/PublicRoute.js`
   - Logic: If authenticated → Redirect to dashboard

3. **ProtectedRoute:**
   - Location: `client/src/components/ProtectedRoute.js`
   - Logic: If not authenticated → Redirect to login
   - Logic: If wrong role → Redirect to user's dashboard

4. **After Logout:**
   - Location: `client/src/components/Navbar.js`
   - Logic: Clear auth → Navigate to `/login`

---

## 🧪 Testing Scenarios

### **Test 1: Guest Access**
1. Logout (or clear localStorage)
2. Try to access `/` → Should work ✅
3. Try to access `/admin/dashboard` → Should redirect to `/login` ✅
4. Try to access `/student/dashboard` → Should redirect to `/login` ✅

### **Test 2: Student Login**
1. Login as student
2. Should redirect to `/student/dashboard` ✅
3. Try to access `/` → Should redirect to `/student/dashboard` ✅
4. Try to access `/admin/dashboard` → Should redirect to `/student/dashboard` ✅
5. Navbar should show: Dashboard, Faculty, Logout ✅

### **Test 3: Admin Login**
1. Login as admin
2. Should redirect to `/admin/dashboard` ✅
3. Try to access `/` → Should redirect to `/admin/dashboard` ✅
4. Try to access `/student/dashboard` → Should redirect to `/admin/dashboard` ✅
5. Navbar should show: Dashboard, Faculty, Logout ✅

### **Test 4: Logout**
1. While logged in, click Logout
2. Should redirect to `/login` ✅
3. Navbar should show: Home, Teachers, About, Contact, Login, Register ✅

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `client/src/components/PublicRoute.js` | Redirects authenticated users away from public pages |
| `client/src/components/ProtectedRoute.js` | Protects routes requiring authentication |
| `client/src/App.js` | Route definitions and routing logic |
| `client/src/components/Navbar.js` | Dynamic navbar based on auth state |
| `client/src/contexts/AuthContext.js` | Authentication state management |
| `client/src/pages/Login.js` | Login page with redirect logic |
| `client/src/pages/Register.js` | Register page with redirect logic |

---

## 🎯 Common Customizations

### **Change Default Redirect After Login**

Edit `client/src/pages/Login.js`:

```jsx
const handleLoginSuccess = (userData) => {
  const role = userData?.role || user?.role;
  if (role === 'admin') {
    navigate('/admin/dashboard', { replace: true }); // Change this
  } else if (role === 'student') {
    navigate('/student/dashboard', { replace: true }); // Or this
  }
};
```

### **Change Redirect After Logout**

Edit `client/src/components/Navbar.js`:

```jsx
const handleLogout = () => {
  logout();
  setIsMobileMenuOpen(false);
  navigate('/login', { replace: true }); // Change to '/home' or wherever
};
```

### **Add More Roles**

1. Update `ProtectedRoute` to handle new role:
```jsx
if (role === 'admin') {
  return <Navigate to="/admin/dashboard" replace />;
} else if (role === 'student') {
  return <Navigate to="/student/dashboard" replace />;
} else if (role === 'faculty') {
  return <Navigate to="/faculty/dashboard" replace />; // New role
}
```

2. Add route in `App.js`:
```jsx
<Route 
  path="/faculty/dashboard" 
  element={
    <ProtectedRoute role="faculty">
      <FacultyDashboard />
    </ProtectedRoute>
  } 
/>
```

---

## ⚠️ Important Notes

1. **Always use `replace: true`** in navigate calls to prevent back button issues
2. **PublicRoute and ProtectedRoute** handle loading states automatically
3. **Auth state** is managed in `AuthContext` and persists via localStorage
4. **Role-based access** is checked both in routes and navbar
5. **Faculty page** (`/faculty`) is accessible to everyone (not wrapped in PublicRoute)

---

## 🐛 Troubleshooting

### **User stuck on login page after login**
- Check if user role is being returned from API
- Check browser console for errors
- Verify AuthContext is updating user state

### **Redirect loops**
- Ensure PublicRoute and ProtectedRoute don't conflict
- Check that routes are properly wrapped
- Verify auth state is updating correctly

### **Wrong dashboard after login**
- Check user role in localStorage or API response
- Verify role comparison logic in handleLoginSuccess

---

**Implementation Complete!** 🎉

Your Teachify app now has professional authentication-based routing that works exactly like a real web application.

