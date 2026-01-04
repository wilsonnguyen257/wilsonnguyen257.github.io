I have identified the issues causing the build failure.

### **Identified Issues**
1.  **Duplicate Object Keys**: In `src/contexts/LanguageContext.tsx`, there are multiple duplicate keys in the `vi` object (lines 72-77), including `home.location_short`, `home.church_name`, `home.address_short`, `home.weekly_worship`, `home.visit_contact`, and `home.learn_more`. This is invalid JavaScript/TypeScript syntax.
2.  **Unused Variables**:
    *   `src/lib/firebase.ts`: `getFirestore` is imported but not used.
    *   `src/pages/Events.tsx`: `stripHtml` is defined but not used.

### **Plan of Action**
1.  **Fix Duplicate Keys**:
    *   Remove the duplicate key definitions in `src/contexts/LanguageContext.tsx`.
2.  **Clean Up Unused Variables**:
    *   Remove the unused `getFirestore` import in `src/lib/firebase.ts`.
    *   Remove the unused `stripHtml` function in `src/pages/Events.tsx`.

I will proceed with these fixes to ensure the build passes.
