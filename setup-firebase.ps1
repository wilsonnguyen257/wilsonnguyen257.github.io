# Quick Setup Script for Firebase (PowerShell)

Write-Host "🔥 Firebase Setup for Church Website" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
} else {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env and add your Firebase credentials" -ForegroundColor Yellow
    Write-Host ""
}

# Check if Firebase CLI is installed
$firebaseCmd = Get-Command firebase -ErrorAction SilentlyContinue
if ($firebaseCmd) {
    Write-Host "✅ Firebase CLI is installed" -ForegroundColor Green
} else {
    Write-Host "❌ Firebase CLI not found" -ForegroundColor Red
    Write-Host "📦 Installing Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create a Firebase project at https://console.firebase.google.com/"
Write-Host "2. Edit .env file with your Firebase config values"
Write-Host "3. Run: firebase login"
Write-Host "4. Run: firebase init"
Write-Host "   - Select 'Firestore' and 'Storage'"
Write-Host "   - Use existing files: firestore.rules and storage.rules"
Write-Host "5. Run: firebase deploy --only firestore:rules,storage"
Write-Host "6. Run: npm run dev (to test locally)"
Write-Host "7. Run: npm run build; npm run preview (to test production build)"
Write-Host ""
Write-Host "📚 For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Green
Write-Host ""
