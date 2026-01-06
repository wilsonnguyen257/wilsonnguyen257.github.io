# Development Guide

## Translation Management

### ✅ Ensuring Translation Sync

To prevent missing translations between English and Vietnamese:

1. **Always add translations in pairs**
   ```typescript
   vi: {
     'new.key': 'Vietnamese translation',
   },
   en: {
     'new.key': 'English translation',
   },
   ```

2. **Check translations before committing**
   ```bash
   npm run check-translations
   ```

3. **Build process includes translation check**
   The build will fail if translations are out of sync:
   ```bash
   npm run build  # Automatically checks translations
   ```

### 🔧 Common Translation Issues

#### Issue: Missing Vietnamese Translation
```javascript
// ❌ BAD - Only English added
en: {
  'home.location_short': 'Box Hill North',
}

// ✅ GOOD - Both languages added
vi: {
  'home.location_short': 'Box Hill North',
},
en: {
  'home.location_short': 'Box Hill North',
}
```

#### Issue: Asymmetric Fallback in Code
```javascript
// ❌ BAD - Falls back only to Vietnamese
name: { vi: d.name?.vi || '', en: d.name?.en || d.name?.vi || '' }

// ✅ GOOD - Symmetric fallback
const nameVi = d.name?.vi || d.name?.en || '';
const nameEn = d.name?.en || d.name?.vi || '';
name: { vi: nameVi, en: nameEn }
```

### 📝 Translation Best Practices

1. **Keep translations consistent** - Use the same terminology across the site
2. **Test both languages** - Switch between languages to ensure everything displays correctly
3. **Use descriptive keys** - e.g., `home.hero.title` instead of `title1`
4. **Group related translations** - Keep similar keys together for easier maintenance

### 🛠️ Available Scripts

- `npm run check-translations` - Verify all translations are in sync
- `npm run build` - Build with translation check
- `npm run dev` - Development server
- `npm run type-check` - TypeScript type checking
- `npm run lint` - ESLint checking

### 🚀 Before Deploying

Always run these commands:
```bash
npm run check-translations  # Ensure translations are complete
npm run build               # Full build check
npm run lint                # Code quality check
```

This ensures the website is ready for production with complete translations and no errors.
