I have identified the remaining missing translations and inconsistencies.

### **1. Identified Missing Translations**
*   **Home Page**:
    *   `Weekly Worship Services` (Hardcoded) -> Needs key `home.weekly_worship`
    *   `Visit & Contact Us` (Hardcoded) -> Needs key `home.visit_contact`
    *   `Box Hill North` (Hardcoded) -> Can be `home.location_short`
    *   `St Francis Xavier's Catholic Church` vs `St Clare Catholic Church` inconsistency. I will standardize on **St Clare Catholic Church** as per the "About" history and `home.address_value`.
    *   `138 Woodhouse Grove, Box Hill North` (Hardcoded) -> Can be `home.address_short`

*   **Reflections Page**:
    *   No obvious hardcoded strings found in the main UI; it uses `t()` correctly.

### **2. Plan of Action**
1.  **Update `LanguageContext.tsx`**:
    *   Add keys: `home.weekly_worship`, `home.visit_contact`, `home.church_name`, `home.address_short`, `home.location_short`.
    *   Vietnamese:
        *   `home.weekly_worship`: "Các Thánh Lễ Hàng Tuần"
        *   `home.visit_contact`: "Ghé Thăm & Liên Hệ"
        *   `home.church_name`: "Nhà thờ St Clare"
        *   `home.address_short`: "138 Woodhouse Grove, Box Hill North"
        *   `home.location_short`: "Box Hill North"
    *   English:
        *   `home.weekly_worship`: "Weekly Worship Services"
        *   `home.visit_contact`: "Visit & Contact Us"
        *   `home.church_name`: "St Clare Catholic Church"
        *   `home.address_short`: "138 Woodhouse Grove, Box Hill North"
        *   `home.location_short`: "Box Hill North"

2.  **Update `Home.tsx`**:
    *   Replace hardcoded strings with `t('key')`.
    *   Update the Map Overlay to use the new `t('home.church_name')` and `t('home.address_short')` keys to ensure the church name is consistent (St Clare).

This will fully resolve the "Fix Missing Translations" request and ensure consistency.
