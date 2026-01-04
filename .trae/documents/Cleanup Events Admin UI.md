I will implement the same cleanup for **Events** and **Admin Events** as we did for Reflections, focusing on removing unnecessary fields and simplifying the UI.

### **1. Admin Events (`AdminEvents.tsx`)**
*   **Remove English Fields**: Remove the **"Name (English)"** and **"Description (English)"** input fields.
*   **Update Save Logic**: Automatically copy the Vietnamese Name and Content into the English fields in the background to ensure data compatibility.
*   **Simplify List View**: In the event list table, stop showing the English name if it is identical to the Vietnamese name.

### **2. Public Events Page (`Events.tsx`)**
*   **Simplify Display**: The public page already handles language switching well. By syncing the English fields to the Vietnamese ones in the background, the page will work seamlessly without any code changes needed here, ensuring users see the content regardless of their language setting.

This will make the Event management interface cleaner and faster to use, just like the Gospel section.
