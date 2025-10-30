# Deployment Guide - Making Content Available Online

This guide will help you set up Firebase so your website content is available to everyone online while maintaining admin control.

## 🎯 Goal

- ✅ **Public Access**: Everyone can view events, reflections, and gallery
- ✅ **Admin Control**: Only authenticated admins can add/edit/delete content
- ✅ **Real-time Updates**: Changes sync across all users instantly

## 📋 Prerequisites

- A Google account
- Your website deployed (GitHub Pages, Vercel, or Netlify)

## 🔥 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `church-st-timothy` (or your preferred name)
4. Disable Google Analytics (optional, not needed for this project)
5. Click **"Create project"**

## 🌐 Step 2: Register Web App

1. In your Firebase project, click the **Web icon** `</>`
2. Enter app nickname: `Church Website`
3. **Do NOT** check "Firebase Hosting" (we're using GitHub Pages/Vercel)
4. Click **"Register app"**
5. Copy the Firebase configuration values (you'll need these)

## 🔐 Step 3: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click **Sign-in method** tab
3. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"
4. Go to **Users** tab → Click **"Add user"**
5. Add admin account:
   - Email: `your-admin@email.com`
   - Password: Create a strong password (save it securely!)
   - Click **"Add user"**

## 📊 Step 4: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we have custom rules)
4. Select location: Choose closest to your users (e.g., `australia-southeast1`)
5. Click **"Enable"**

## 📁 Step 5: Deploy Firestore Security Rules

### Option A: Using Firebase Console (Easiest)

1. In Firestore Database, go to **Rules** tab
2. Replace ALL content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Publicly readable site data: events, reflections, gallery
    match /site-data/{doc} {
      allow read: if true; // Everyone can read
      
      // Only authenticated users can write
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

### Option B: Using Firebase CLI (Advanced)

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (only needed once)
firebase init firestore
# Select your project
# Use firestore.rules and firestore.indexes.json

# Deploy rules
firebase deploy --only firestore:rules
```

## 🖼️ Step 6: Enable Storage (For Gallery)

1. In Firebase Console, go to **Storage**
2. Click **"Get started"**
3. Click **"Next"** (accept default rules)
4. Choose same location as Firestore
5. Click **"Done"**

### Deploy Storage Rules

Go to **Storage** → **Rules** tab and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Publicly readable gallery files
    match /gallery/{allPaths=**} {
      allow read: if true; // Everyone can view
      allow write: if request.auth != null; // Only admins can upload
    }
    
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

Click **"Publish"**

## 🔑 Step 7: Configure Environment Variables

1. In your project root, create `.env` file:

```bash
# Copy from .env.example
cp .env.example .env
```

2. Edit `.env` and paste your Firebase config values:

```bash
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

3. **IMPORTANT**: Never commit `.env` to git! It's already in `.gitignore`

## 🌍 Step 8: Add Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Click **"Add domain"**
3. Add your production domain:
   - GitHub Pages: `wilsonnguyen257.github.io`
   - Vercel: `your-site.vercel.app`
   - Custom domain: `your-domain.com`

## 🚀 Step 9: Deploy Your Website

### For GitHub Pages:

```bash
# Build the project
npm run build

# The dist folder is your production site
# Push to gh-pages branch or configure GitHub Pages in repo settings
```

### For Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel Dashboard:
# Go to Project Settings → Environment Variables
# Add each VITE_FIREBASE_* variable
```

### Important: Set Environment Variables in Hosting Platform

For **Vercel**:
1. Go to your project → Settings → Environment Variables
2. Add each `VITE_FIREBASE_*` variable
3. Redeploy

For **Netlify**:
1. Site settings → Build & deploy → Environment
2. Add each variable
3. Trigger new deploy

For **GitHub Pages** (no server-side env):
1. You'll need to use GitHub Actions to inject env variables during build
2. Or hardcode them (less secure) in the build

## 🎨 Step 10: Add Initial Content

1. Start your dev server locally:
```bash
npm run dev
```

2. Visit `http://localhost:3000/login`
3. Sign in with your admin email/password
4. Go to Admin Dashboard:
   - `/admin/events` - Add upcoming events
   - `/admin/reflections` - Add weekly reflections
   - `/admin/gallery` - Upload photos

## ✅ Step 11: Verify Everything Works

### Test Public Access (Incognito/Private Window):

1. Visit your deployed website
2. Browse events, reflections, gallery
3. **Should work** - Content is visible to everyone

### Test Admin Access:

1. Visit `/login` on your site
2. Sign in with admin credentials
3. Go to `/admin`
4. **Should work** - Can add/edit/delete content

### Test Real-time Updates:

1. Open your site in two browser windows
2. In one window, sign in as admin and add a reflection
3. In the other window (public view), refresh or wait
4. **Should see** - New content appears automatically

## 🔒 Security Best Practices

### 1. Restrict Write Access to Specific Admins

Edit Firestore rules to allow only specific emails:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /site-data/{doc} {
      allow read: if true;
      
      // Only allow specific admin emails
      allow write: if request.auth != null && 
        request.auth.token.email in [
          'admin1@yourdomain.com',
          'admin2@yourdomain.com'
        ];
    }
  }
}
```

### 2. Enable Multi-Factor Authentication (Recommended)

1. Firebase Console → Authentication → Settings
2. Enable **Multi-factor authentication**
3. Require for admin accounts

### 3. Monitor Usage

1. Firebase Console → Usage and billing
2. Set up budget alerts
3. Monitor authentication logs in Authentication → Users

## 🐛 Troubleshooting

### Content not showing online but works locally?

- ✅ Check: Environment variables are set in hosting platform
- ✅ Check: Firebase config values are correct
- ✅ Check: Firestore rules allow public read
- ✅ Check: Browser console for errors

### Can't sign in on production?

- ✅ Check: Domain is added to Authorized domains in Firebase
- ✅ Check: Using HTTPS (not HTTP)
- ✅ Check: Cookies/localStorage are enabled

### Changes not syncing?

- ✅ Check: Browser console for Firestore errors
- ✅ Check: Internet connection
- ✅ Try: Hard refresh (Ctrl+Shift+R)

### "Permission denied" errors?

- ✅ Check: Firestore rules are published
- ✅ Check: User is properly authenticated
- ✅ Check: User email is in allowlist (if using restricted rules)

## 📱 Bonus: Progressive Web App

Your site is already PWA-ready! To make it installable:

1. Add to `public/manifest.json`:

```json
{
  "name": "St. Timothy Vietnamese Catholic Church",
  "short_name": "St. Timothy",
  "description": "Community website for St. Timothy Vietnamese Catholic Church",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3d45db",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

2. Link in `index.html`:
```html
<link rel="manifest" href="/manifest.json">
```

## 🎉 You're Done!

Your website is now:
- ✅ Accessible to everyone online
- ✅ Secure admin control
- ✅ Real-time content updates
- ✅ Ready for production use

For questions or issues, check the [README.md](./README.md) or Firebase documentation.
