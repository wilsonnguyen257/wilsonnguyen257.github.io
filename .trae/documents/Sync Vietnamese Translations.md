I have identified that the Vietnamese translations are missing some keys that exist in the English section, particularly the badge-related ones and some others added recently. I will synchronize the Vietnamese translations to ensure they match the English structure.

### **Missing Keys in Vietnamese (`vi`)**
Based on the file content, the following keys are present in `en` but potentially missing or need verification in `vi`:
*   `home.welcome_badge` (Already added in previous step, but I'll double-check context)
*   `home.location` (Already added)
*   `home.location_short` (Already added)
*   `home.church_name` (Already added)
*   `home.address_short` (Already added)
*   `home.weekly_worship` (Already added)
*   `home.visit_contact` (Already added)

Wait, I just added those in the previous step. Let me check for **other** badges that might be missing in `vi`.

Looking at `en` vs `vi`:
*   `events.next_event`: 'Upcoming Events' (en) vs 'Sự Kiện Sắp Diễn Ra' (vi) - OK
*   `events.latest_event`: 'Next event' (en) vs 'Sự kiện gần nhất' (vi) - OK
*   `home.important_event`: 'Important upcoming event' (en) vs 'Sự kiện quan trọng sắp diễn ra' (vi) - OK
*   `home.featured_event`: 'Featured Event' (en) vs 'Sự Kiện Nổi Bật' (vi) - OK
*   `home.other_events`: 'Other upcoming events' (en) vs 'Các sự kiện sắp tới khác' (vi) - OK
*   `reflections.featured`: 'Featured Reflection' (en) vs 'Suy Niệm Nổi Bật' (vi) - OK

The user specifically mentioned `home.welcome_badge`. In my previous turn, I added:
`'home.welcome_badge': 'Chào mừng',` to `vi` and `'home.welcome_badge': 'Welcome',` to `en`.

However, looking at the *current* state of the file provided by the `Read` tool (lines 58-72 for `vi` and 368-378 for `en`), it seems my previous `SearchReplace` might have been applied to `vi` but I need to make sure **all** keys are perfectly synced.

Actually, looking closely at the `Read` output again:
**English Section (lines 368+):**
```typescript
    'home.title': 'Vietnamese Catholic Community St Ane Le Thi Thanh',
    'home.subtitle': 'Welcome to our small community in Melbourne!',
    'home.description': 'Our goal is to live according to the Gospel spirit in unity, love and service.',
    'home.welcome_badge': 'Welcome', // <--- This exists
    'home.mass': 'Sunday Mass',
    'home.mass_time': 'Sunday Mass at 5:00 PM at 138 Woodhouse Grove, Box Hill North VIC 3129.',
    'home.location': 'Location', // <--- This exists
    'home.learn_more': 'Learn More',
    'home.contact_us': 'Contact Us',
```

**Vietnamese Section (lines 59+):**
```typescript
    'home.title': 'Cộng Đoàn Công Giáo Việt Nam Thánh Anê Lê Thị Thành',
    'home.subtitle': 'Chào mừng quý vị đến với cộng đoàn nhỏ bé của chúng tôi tại Melbourne!',
    'home.description': 'Mục tiêu của cộng đoàn là sống theo tinh thần Tin Mừng trong đoàn kết, yêu thương và phục vụ.',
    'home.mass': 'Thánh Lễ Chúa Nhật',
    'home.mass_time': 'Thánh Lễ Chúa Nhật lúc 5:00 PM tại 138 Woodhouse Grove, Box Hill North VIC 3129.',
    'home.learn_more': 'Tìm hiểu thêm', // <--- home.welcome_badge is MISSING here in the Read output!
    'home.contact_us': 'Liên hệ với chúng tôi',
```

**Correction:** My previous `SearchReplace` might have failed or been overwritten, or the `Read` output is showing the file *before* the change (though `Read` usually shows current state). Wait, looking at the `Read` output, `home.welcome_badge` is indeed **missing** in the `vi` section (lines 59-66) but present in `en` (line 372).

I will rigorously add all the missing keys to the `vi` section to match the `en` section.

### **Plan**
1.  **Sync `vi` translations**: Add `home.welcome_badge`, `home.location`, `home.location_short`, `home.church_name`, `home.address_short`, `home.weekly_worship`, `home.visit_contact` to the `vi` object in `LanguageContext.tsx`.
2.  **Verify**: Ensure no other keys are missing by comparing the two objects.

**(Self-Correction)**: I see `home.location` is also missing in the `vi` section of the `Read` output. I will add all of them now.
