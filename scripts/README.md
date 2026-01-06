# Scripts Directory

This directory contains utility scripts for maintaining the website.

## check-translations.js

### Purpose
Ensures that English and Vietnamese translations are always in sync. This prevents missing translations like the `home.location_short` issue that was fixed.

### How it works
- Scans the `LanguageContext.tsx` file
- Extracts all translation keys from both English (en) and Vietnamese (vi) sections
- Compares the keys and reports any mismatches
- Exits with error code if translations are missing

### Usage
```bash
# Run manually
npm run check-translations

# Automatically runs during build
npm run build
```

### Adding new translations
When adding new translations, always add both English and Vietnamese versions:

```typescript
// In LanguageContext.tsx
vi: {
  'your.new.key': 'Vietnamese translation',
},
en: {
  'your.new.key': 'English translation',
},
```

The script will catch any missing translations during the build process, preventing deployment with incomplete translations.
