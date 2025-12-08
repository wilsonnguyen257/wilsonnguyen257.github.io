# Admin Login Guide

## 🔐 How to Access the Admin Panel

### Step 1: Set Up Firebase Authentication

Before you can log in, you need to create an admin user in Firebase:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**
3. **Navigate to**: Authentication → Users
4. **Click "Add user"**
5. **Enter**:
   - Email: Your admin email (e.g., `admin@yourdomain.com`)
   - Password: A strong password (at least 6 characters)
6. **Click "Add user"**

### Step 2: Access the Login Page

1. **Open your browser** and navigate to:
   - Local development: `http://localhost:3000/login`
   - Production: `https://yourdomain.com/login`

2. **Enter your credentials**:
   - Email: The email you created in Firebase
   - Password: The password you set

3. **Click "Sign In"**

### Step 3: Access Admin Features

After successful login, you'll be automatically redirected to the admin dashboard at `/admin`.

From there you can access:
- **Admin Dashboard** (`/admin`) - Overview and quick links
- **Manage Events** (`/admin/events`) - Create, edit, delete events
- **Manage Reflections** (`/admin/reflections`) - Create, edit, delete reflections
- **Manage Gallery** (`/admin/gallery`) - Upload, manage images

## 🚪 URL Routes

- `/login` - Admin login page
- `/admin` - Admin dashboard (requires authentication)
- `/admin/events` - Event management (requires authentication)
- `/admin/reflections` - Reflection management (requires authentication)
- `/admin/gallery` - Gallery management (requires authentication)

## 🔒 Security Features

### Route Protection
- All `/admin/*` routes are protected
- Unauthenticated users are automatically redirected to `/login`
- After login, you're redirected back to the page you were trying to access

### Session Timeout
- Sessions expire after **30 minutes** of inactivity
- You'll see a warning **5 minutes** before timeout
- Click "Stay Logged In" to extend your session
- All activity (mouse, keyboard, scroll) resets the timer

### Audit Logging
Every admin action is logged:
- Login/logout events
- Creating, updating, deleting events
- Creating, updating, deleting reflections
- Bulk operations
- Timestamps, user info, and action details

You can view these logs in Firebase Console:
1. Go to Firestore Database
2. Open the `audit-logs` collection
3. View all logged actions with timestamps

## 🆘 Troubleshooting

### "Firebase is not configured"
**Solution**: Make sure your `.env` file has all Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### "Invalid email or password"
**Solution**: 
1. Double-check the email and password
2. Verify the user exists in Firebase Console → Authentication → Users
3. Try resetting the password in Firebase Console

### "Too many failed attempts"
**Solution**: 
- Wait 15-30 minutes before trying again
- Firebase temporarily blocks login after multiple failed attempts for security

### "No account found with this email"
**Solution**: 
1. Create the user in Firebase Console → Authentication → Users
2. Make sure the email matches exactly (check for typos, spaces)

### Can't access admin pages after login
**Solution**:
1. Check browser console for errors (F12 → Console tab)
2. Verify Firebase configuration in `.env`
3. Make sure Firestore rules are deployed: `firebase deploy --only firestore:rules`

## 📱 Demo Login Flow

1. **Visit**: `http://localhost:3000/login`
2. **You'll see**: A clean login form with email and password fields
3. **Enter credentials**: The email/password you created in Firebase
4. **Click "Sign In"**: Button will show "Signing in..." while processing
5. **Success**: Automatically redirected to `/admin` dashboard
6. **Error**: Red error message appears with specific details

## 🎯 Quick Start (Development)

```bash
# 1. Make sure Firebase is configured
# Check that .env file exists with Firebase credentials

# 2. Start the dev server
npm run dev

# 3. Open browser
# Navigate to: http://localhost:3000/login

# 4. Login with your Firebase user
# Email: admin@example.com (or whatever you created)
# Password: your_password

# 5. You're now in the admin panel!
# Navigate to /admin/events or /admin/reflections to manage content
```

## 🔑 Creating Additional Admin Users

To add more admin users:

1. **Firebase Console** → Authentication → Users → "Add user"
2. Enter new admin's email and password
3. Click "Add user"
4. They can now log in at `/login`

**Note**: If you uncomment the email whitelist in `firestore.rules`, you'll need to add their email to the whitelist:

```javascript
// In firestore.rules
function isAdmin() {
  let adminEmails = [
    'admin@yourdomain.com',
    'newadmin@yourdomain.com'  // Add new admins here
  ];
  return request.auth != null && request.auth.token.email in adminEmails;
}
```

Then deploy: `firebase deploy --only firestore:rules`

## 💡 Tips

- **Bookmark**: `/login` for quick access
- **Stay logged in**: Your session persists across browser tabs
- **Secure logout**: Always click "Logout" when done, especially on shared computers
- **Monitor logs**: Regularly check audit logs in Firebase for security
- **Strong passwords**: Use unique, strong passwords for admin accounts
- **2FA recommended**: Enable two-factor authentication in Firebase for extra security

## 🎨 Login Page Features

- ✅ Clean, professional design
- ✅ Email and password validation
- ✅ Helpful error messages
- ✅ Loading state while signing in
- ✅ Auto-redirect after successful login
- ✅ Returns to originally requested page
- ✅ Disabled inputs during submission
- ✅ Accessible form labels and ARIA attributes
- ✅ Mobile-responsive layout
