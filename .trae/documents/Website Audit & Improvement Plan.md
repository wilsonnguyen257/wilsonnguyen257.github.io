# Website Audit Report & Improvement Plan

As your technical auditor, I have reviewed the codebase and identified several key areas to elevate the website from "functional" to "professional."

## 📊 Audit Findings

### ✅ Strengths
*   **Architecture**: Solid React + Vite + TypeScript setup.
*   **Performance**: Lazy loading is correctly implemented for all pages.
*   **Resilience**: The hybrid storage system (Firebase + LocalStorage fallback) is excellent for reliability.
*   **Localization**: Bilingual support (Vietnamese/English) is well-structured.

### ⚠️ Areas for Improvement
1.  **User Experience (UX)**:
    *   **Alerts**: Using browser `alert()` for success/error messages feels outdated and interrupts the user flow.
    *   **Loading States**: "Loading..." text is jarring; Skeleton screens are the modern standard.
2.  **SEO & Sharing**:
    *   **Static Meta Tags**: The site title doesn't change when navigating. Sharing a specific event or reflection on Facebook/Zalo will just show the generic homepage title.
3.  **Performance**:
    *   **Image Uploads**: There is no client-side compression. If an admin uploads a 10MB photo from a phone, it will slow down the site for everyone.
4.  **Security**:
    *   Basic security rules are in place, but we should verify the "Admin Only" write access is strictly enforced.

---

## 🚀 Implementation Plan

I propose we tackle these improvements in the following order:

### Phase 1: UX Polish (High Impact)
1.  **Replace `alert()` with Toasts**: Install `react-hot-toast`. This will make "Saved successfully" messages appear as smooth popups (like Gmail) instead of blocking the screen.
2.  **Dynamic Page Titles (SEO)**: Install `react-helmet-async`.
    *   *Goal*: When users visit "Events", the tab says "Events | Anê Thành".
    *   *Goal*: When viewing a reflection, the tab shows the reflection title.

### Phase 2: Performance (Medium Impact)
3.  **Image Compression**: Add `browser-image-compression` to the upload flow.
    *   *Goal*: Automatically resize and compress images to <500KB before uploading to Firebase.

### Phase 3: Visuals (Low Impact)
4.  **Skeleton Loaders**: Create a `Skeleton` component to show gray placeholder boxes while data loads, preventing layout shift.

## Next Step
**Shall we proceed with Phase 1 (Toasts & SEO)?** This will immediately make the admin experience smoother and improve how the site looks on Google/Social Media.