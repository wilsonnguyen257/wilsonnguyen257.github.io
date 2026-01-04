I will fix the missing translation keys and ensure the UI is consistent across the site.

### **1. Fix Missing Translations**
*   **Missing Keys**: I noticed `home.welcome_badge` and `home.location` are missing from the `translations` object in `src/contexts/LanguageContext.tsx`.
*   **Action**: Add these keys to both the Vietnamese (`vi`) and English (`en`) sections of the translation file.
    *   `home.welcome_badge`: "Chào mừng" / "Welcome"
    *   `home.location`: "Địa điểm" / "Location"

### **2. UI Consistency Audit & Fixes**
*   **Buttons**: Ensure all primary buttons use the `bg-brand-600` style with rounded corners (`rounded-xl` or `rounded-2xl`) and consistent hover effects.
*   **Cards**: Standardize card styles (shadows, border radius, padding) across Home, Events, and Reflections pages to match the modern "glass/clean" look we established.
*   **Typography**: Verify that headings and subtitles share consistent font weights and colors (e.g., `text-slate-900` for headings, `text-brand-600` for accents).
*   **Spacing**: Check section padding (`py-24` vs `py-20`) to ensure a rhythmic flow down the page.

This will ensure the "Welcome Badge" and "Location" labels appear correctly and the entire website feels like a unified, professional product.
