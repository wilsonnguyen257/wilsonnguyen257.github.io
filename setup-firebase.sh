#!/bin/bash
# Quick Setup Script for Firebase

echo "🔥 Firebase Setup for Church Website"
echo "======================================"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file already exists"
else
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your Firebase credentials"
    echo ""
fi

# Check if Firebase CLI is installed
if command -v firebase &> /dev/null; then
    echo "✅ Firebase CLI is installed"
else
    echo "❌ Firebase CLI not found"
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Create a Firebase project at https://console.firebase.google.com/"
echo "2. Edit .env file with your Firebase config values"
echo "3. Run: firebase login"
echo "4. Run: firebase init"
echo "   - Select 'Firestore' and 'Storage'"
echo "   - Use existing files: firestore.rules and storage.rules"
echo "5. Run: firebase deploy --only firestore:rules,storage"
echo "6. Run: npm run dev (to test locally)"
echo "7. Run: npm run build && npm run preview (to test production build)"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo ""
