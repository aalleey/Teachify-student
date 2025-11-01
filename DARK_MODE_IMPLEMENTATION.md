# 🌙 AMOLED Dark Mode Implementation Guide

## ✅ What Has Been Implemented

### 1. **Tailwind Configuration**
- ✅ Enabled `darkMode: "class"` in `tailwind.config.js`
- ✅ Class-based dark mode (not media-based) for full control

### 2. **Dark Mode Hook** (`client/src/hooks/useDarkMode.js`)
- ✅ Custom React hook for managing dark mode state
- ✅ Automatically persists preference to `localStorage`
- ✅ Applies/removes `dark` class on `<html>` element
- ✅ Returns `[isDarkMode, toggleDarkMode]` for easy use

### 3. **Navbar Integration**
- ✅ Dark mode toggle button (sun/moon icons) in desktop navbar
- ✅ Dark mode toggle in mobile menu
- ✅ Smooth icon animations (300ms transition)
- ✅ All navbar elements support AMOLED dark theme:
  - Background: `#000000` (true black)
  - Text: White/gray variants
  - Borders: `#1a1a1a`
  - Hover states: `#0d0d0d` and `#1a1a1a`

### 4. **AMOLED Color Scheme**
All dark mode colors use true black for AMOLED displays:
- **Background**: `#000000` (true black)
- **Card/Container**: `#0d0d0d` (near-black)
- **Borders/Dividers**: `#1a1a1a` (subtle dark gray)
- **Text Primary**: `#ffffff` or `#e5e5e5`
- **Text Secondary**: `#a0a0a0` or `#808080`
- **Accent Colors**: Primary blue with slight desaturation

### 5. **Updated Components**
- ✅ **Navbar**: Full dark mode support
- ✅ **App.js**: AMOLED background
- ✅ **index.css**: Global dark mode styles
- ✅ **Faculty Page**: AMOLED background
- ✅ **Home Page**: Partial dark mode (can be expanded)
- ✅ **Card Component**: Uses `.card` class (dark mode enabled)
- ✅ **Input Fields**: Uses `.input-field` class (dark mode enabled)
- ✅ **Buttons**: `.btn-primary` and `.btn-secondary` (dark mode enabled)

### 6. **Initialization**
- ✅ Dark mode preference loads from `localStorage` on app start
- ✅ Applies dark class before React renders (prevents flash)

---

## 🎨 AMOLED Color Reference

### Light Mode → Dark Mode Mappings

| Element | Light Mode | Dark Mode (AMOLED) |
|---------|------------|-------------------|
| Background | `bg-gray-50` | `dark:bg-[#000000]` |
| Card/Container | `bg-white` | `dark:bg-[#0d0d0d]` |
| Border | `border-gray-200` | `dark:border-[#1a1a1a]` |
| Text Primary | `text-gray-900` | `dark:text-gray-100` |
| Text Secondary | `text-gray-600` | `dark:text-gray-400` |
| Hover Background | `hover:bg-gray-50` | `dark:hover:bg-[#1a1a1a]` |
| Primary Button | `bg-primary-600` | `dark:bg-primary-500` |

---

## 📝 How to Add Dark Mode to New Components

### Step 1: Use the Dark Mode Hook
```javascript
import { useDarkMode } from '../hooks/useDarkMode';

const MyComponent = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  // Use isDarkMode if needed for conditional rendering
  // Use toggleDarkMode if adding a toggle button
};
```

### Step 2: Add Dark Mode Classes
For any element, add `dark:` variants:

```jsx
// Background
<div className="bg-white dark:bg-[#0d0d0d]">

// Text
<p className="text-gray-900 dark:text-gray-100">

// Border
<div className="border border-gray-200 dark:border-[#1a1a1a]">

// Hover states
<button className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
```

### Step 3: Add Transitions
Always include transition classes for smooth theme switching:

```jsx
<div className="bg-white dark:bg-[#000000] transition-colors duration-300">
```

---

## 🎯 Common Patterns

### Card with Dark Mode
```jsx
<div className="bg-white dark:bg-[#0d0d0d] rounded-lg shadow-md dark:shadow-black/50 p-6 border border-gray-200 dark:border-[#1a1a1a] transition-colors duration-300">
  <h3 className="text-gray-900 dark:text-gray-100">Title</h3>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

### Button with Dark Mode
```jsx
<button className="bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
  Click Me
</button>
```

### Input Field with Dark Mode
```jsx
<input 
  className="w-full px-3 py-2 border border-gray-300 dark:border-[#1a1a1a] bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
/>
```

---

## 🔧 Customization

### Change Dark Mode Storage Location

By default, preference is stored in `localStorage` with key `'darkMode'`.

To change this, modify `client/src/hooks/useDarkMode.js`:

```javascript
// Change storage key
const saved = localStorage.getItem('myDarkModeKey');
localStorage.setItem('myDarkModeKey', JSON.stringify(isDarkMode));

// Or use sessionStorage instead
const saved = sessionStorage.getItem('darkMode');
sessionStorage.setItem('darkMode', JSON.stringify(isDarkMode));
```

### Customize Accent Colors for Dark Mode

Update `tailwind.config.js` to add custom dark mode colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Light mode colors
        600: '#2563eb',
        // Add dark mode specific colors
        dark: {
          500: '#3b82f6',  // Slightly lighter for dark mode
          600: '#2563eb',
        }
      }
    }
  }
}
```

Then use in components:
```jsx
<button className="bg-primary-600 dark:bg-primary-dark-500">
```

### Change Transition Duration

Update transition classes throughout the app:
- `duration-200` → Fast (200ms)
- `duration-300` → Default (300ms) ⭐ Recommended
- `duration-500` → Slow (500ms)

---

## 🚀 Testing Dark Mode

1. **Toggle Test**: Click the sun/moon icon in navbar
2. **Persistence Test**: Toggle dark mode, refresh page - should remember preference
3. **Smooth Transitions**: All color changes should animate smoothly
4. **AMOLED Check**: Background should be pure black `#000000` (not gray)
5. **Contrast Check**: Text should be clearly readable on dark backgrounds

---

## 📱 Mobile Support

- ✅ Dark mode toggle available in mobile menu
- ✅ All responsive breakpoints support dark mode
- ✅ Touch interactions work correctly

---

## 🐛 Troubleshooting

### Dark Mode Not Working?
1. Check if `darkMode: 'class'` is in `tailwind.config.js`
2. Verify `dark` class is being added to `<html>` element (inspect in DevTools)
3. Check browser console for JavaScript errors
4. Clear `localStorage` and try again: `localStorage.removeItem('darkMode')`

### Flash of Light Content?
- Dark mode initialization happens in `index.js` before React renders
- If you still see flash, check that initialization runs synchronously

### Colors Not Updating?
- Ensure all color classes have `dark:` variants
- Check that transition classes are present
- Verify Tailwind is rebuilding CSS (restart dev server if needed)

---

## ✨ Future Enhancements

Potential improvements:
- [ ] System preference detection (optional)
- [ ] Auto-switch based on time of day
- [ ] Different color schemes (blue dark, purple dark, etc.)
- [ ] Animation preferences (reduce motion support)

---

## 📚 Resources

- [Tailwind Dark Mode Docs](https://tailwindcss.com/docs/dark-mode)
- [AMOLED Design Principles](https://material.io/design/color/dark-theme.html)
- [Accessibility in Dark Mode](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**Implementation Complete!** 🎉

Your Teachify app now has a full AMOLED dark mode with smooth transitions, persistent preferences, and a beautiful toggle in the navbar.

