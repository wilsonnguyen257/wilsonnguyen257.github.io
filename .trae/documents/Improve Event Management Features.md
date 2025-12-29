# Improve Event Management

To make managing your large list of events easier, I will implement the following features in the Admin Events page:

## 1. Pagination
- Instead of showing all 2000+ events at once (which slows down the page), I will split them into pages.
- **Display**: Show 20 events per page.
- **Controls**: Add "Previous", "Next", and page number buttons at the bottom of the list.

## 2. Search & Filter
- Add a **Search Bar** at the top to quickly find events by name or location.
- This allows you to find specific events without scrolling through hundreds of pages.

## 3. Sorting
- Add a **Sort Dropdown** (or clickable table headers) to order events by:
  - Date (Newest First) - *Default*
  - Date (Oldest First)
  - Name (A-Z)

## 4. Bulk Delete
- Add **Checkboxes** next to each event.
- Add a **"Select All"** checkbox for the current page.
- Add a **"Delete Selected"** button to remove multiple events at once (useful for cleaning up test data or old imports).

This will make the "Manage Events" page much faster and easier to use.
