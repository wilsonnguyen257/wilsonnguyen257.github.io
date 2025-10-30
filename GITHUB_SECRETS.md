# GitHub Secrets Setup Guide

This guide shows you how to add Firebase configuration to GitHub Secrets so your website deploys automatically with content support.

## 🎯 Why GitHub Secrets?

GitHub Secrets keep your Firebase configuration secure and allow automatic deployments without exposing credentials in your code.

## 📝 Step-by-Step Instructions

### 1. Get Your Firebase Configuration

First, you need your Firebase config values. If you haven't already:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon (⚙️) → **Project settings**
4. Scroll down to **Your apps** section
5. Click on your web app or create one
6. Copy the config values from the `firebaseConfig` object

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 2. Add Secrets to GitHub Repository

1. Go to your GitHub repository: `https://github.com/wilsonnguyen257/wilsonnguyen257.github.io`

2. Click **Settings** (top navigation)

3. In the left sidebar, click **Secrets and variables** → **Actions**

4. Click **New repository secret** button

5. Add each secret one by one:

#### Secret 1: VITE_FIREBASE_API_KEY
- **Name**: `VITE_FIREBASE_API_KEY`
- **Value**: Your `apiKey` value (e.g., `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
- Click **Add secret**

#### Secret 2: VITE_FIREBASE_AUTH_DOMAIN
- **Name**: `VITE_FIREBASE_AUTH_DOMAIN`
- **Value**: Your `authDomain` value (e.g., `your-project.firebaseapp.com`)
- Click **Add secret**

#### Secret 3: VITE_FIREBASE_PROJECT_ID
- **Name**: `VITE_FIREBASE_PROJECT_ID`
- **Value**: Your `projectId` value (e.g., `your-project-id`)
- Click **Add secret**

#### Secret 4: VITE_FIREBASE_STORAGE_BUCKET
- **Name**: `VITE_FIREBASE_STORAGE_BUCKET`
- **Value**: Your `storageBucket` value (e.g., `your-project.appspot.com`)
- Click **Add secret**

#### Secret 5: VITE_FIREBASE_MESSAGING_SENDER_ID
- **Name**: `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Value**: Your `messagingSenderId` value (e.g., `123456789012`)
- Click **Add secret**

#### Secret 6: VITE_FIREBASE_APP_ID
- **Name**: `VITE_FIREBASE_APP_ID`
- **Value**: Your `appId` value (e.g., `1:123456789012:web:abcdef123456`)
- Click **Add secret**

### 3. Verify Secrets Are Added

You should now see 6 secrets listed:
- ✅ VITE_FIREBASE_API_KEY
- ✅ VITE_FIREBASE_AUTH_DOMAIN
- ✅ VITE_FIREBASE_PROJECT_ID
- ✅ VITE_FIREBASE_STORAGE_BUCKET
- ✅ VITE_FIREBASE_MESSAGING_SENDER_ID
- ✅ VITE_FIREBASE_APP_ID

## 🚀 Testing Automatic Deployment

### 1. Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Click **Save**

### 2. Trigger Deployment

Option A: Push a commit
```bash
git add .
git commit -m "Enable Firebase integration"
git push origin main
```

Option B: Manual trigger
1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

### 3. Monitor Deployment

1. Go to **Actions** tab
2. Click on the running workflow
3. Watch the build process
4. When complete, your site is live at: `https://wilsonnguyen257.github.io/`

## ✅ Verify Everything Works

### Test 1: Public Content Access
1. Open your site in incognito mode: `https://wilsonnguyen257.github.io/`
2. Navigate to Events, Reflections, Gallery
3. **Expected**: Content loads (may be empty initially)

### Test 2: Admin Login
1. Visit: `https://wilsonnguyen257.github.io/login`
2. Sign in with your Firebase admin credentials
3. **Expected**: Successfully logged in, redirected to `/admin`

### Test 3: Add Content
1. While logged in as admin, go to `/admin/events`
2. Add a new event
3. Click Save
4. Open the site in a new incognito window
5. Navigate to Events page
6. **Expected**: New event is visible to everyone

## 🔒 Security Notes

### ✅ Safe to Expose (In GitHub Secrets)
These Firebase values are meant to be public in your frontend code:
- ✅ API Key
- ✅ Auth Domain
- ✅ Project ID
- ✅ Storage Bucket
- ✅ Messaging Sender ID
- ✅ App ID

### 🔐 Security is Handled By
- **Firestore Rules** - Control who can read/write data
- **Storage Rules** - Control who can upload/download files
- **Firebase Authentication** - Control who can sign in
- **Authorized Domains** - Control where your app can run

### ❌ Never Expose
- Firebase Admin SDK credentials
- Service account keys
- Admin passwords

## 🐛 Troubleshooting

### Build Fails in GitHub Actions

**Check**: All 6 secrets are added correctly
1. Go to Settings → Secrets and variables → Actions
2. Verify all `VITE_FIREBASE_*` secrets exist
3. Click **Update** on any that might be wrong

### Site Loads But No Content

**Check**: Firestore rules allow public read
1. Firebase Console → Firestore Database → Rules
2. Verify: `allow read: if true;` for `site-data`

### Can't Login on Production

**Check**: Domain is authorized
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add: `wilsonnguyen257.github.io`

### Content Not Syncing

**Check**: Browser console for errors
1. Open DevTools (F12)
2. Look for Firebase errors
3. Verify internet connection

## 📱 Next Steps

After deployment works:

1. **Add Initial Content**
   - Login as admin
   - Add events, reflections, gallery items

2. **Customize**
   - Update church information
   - Add your logo
   - Modify colors in `tailwind.config.js`

3. **Share**
   - Share the URL with your community
   - Add to church bulletin
   - Post on social media

4. **Monitor**
   - Check Firebase usage in Console
   - Set up billing alerts
   - Review authentication logs

## 🎉 Success!

Once everything is working:
- ✅ Content is live and accessible to everyone
- ✅ Only admins can edit content
- ✅ Changes deploy automatically on git push
- ✅ Real-time updates across all users

For more details, see [DEPLOYMENT.md](./DEPLOYMENT.md)
