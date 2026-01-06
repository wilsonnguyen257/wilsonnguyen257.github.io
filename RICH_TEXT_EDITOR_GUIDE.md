# Rich Text Editor Guide

## Overview
The website now includes an enhanced Rich Text Editor that preserves the structure and formatting when pasting from Facebook, Word, and other platforms.

## Features

### Paste with Structure Preservation
- **Facebook Posts**: Preserves paragraphs, line breaks, links, and text formatting
- **Microsoft Word**: Maintains document structure with headings, lists, and styling
- **Web Pages**: Keeps the original layout with paragraphs, divs, and formatting
- **Google Docs**: Preserves rich text structure and formatting

### Formatting Tools
- **Bold** (Ctrl+B)
- **Italic** (Ctrl+I) 
- **Underline** (Ctrl+U)
- **Headings** (H1, H2, H3, H4)
- **Bullet Lists**
- **Numbered Lists**
- **Links** (Ctrl+K)
- **Clear Formatting**

### Smart Cleaning
The editor automatically:
- Removes Facebook-specific attributes and tracking
- Cleans up unnecessary HTML tags
- Preserves essential text formatting (bold, italic, underline, colors)
- Maintains document structure (paragraphs, headings, lists)
- Keeps clickable links
- Preserves margins, padding, and text alignment

## How to Use

### Pasting Content
1. Copy formatted text from Facebook, Word, or any website
2. Paste directly into the editor (Ctrl+V or Cmd+V)
3. The structure and formatting are automatically preserved
4. Paragraphs, line breaks, and spacing are maintained

### What Gets Preserved
- **Paragraphs**: Multiple paragraphs are kept separate
- **Line Breaks**: Single and double line breaks are maintained
- **Headings**: H1-H6 headings with proper spacing
- **Lists**: Both bullet and numbered lists
- **Links**: Clickable hyperlinks are preserved
- **Text Formatting**: Bold, italic, underline, colors
- **Structure**: Divs, sections, and block elements
- **Alignment**: Left, center, right text alignment
- **Spacing**: Margins and padding between elements

### Editing Tools
1. Use the toolbar buttons for formatting
2. Keyboard shortcuts work for common actions
3. Switch between Vietnamese and English tabs

### Bilingual Support
- Separate content for Vietnamese and English
- Each language maintains its own structure and formatting
- Switch between languages using the tabs

## Technical Details

### HTML Preservation
- **Text styling**: font-weight, font-style, text-decoration, color, background-color
- **Structure**: font-size, line-height, margin, padding, text-align
- **Layout**: display, float, clear, width, height
- **Hyperlinks**: All href attributes are preserved
- **Lists**: Ordered and unordered list structures
- **Headings**: H1 through H6 with proper nesting

### Removed Elements
- Facebook-specific attributes (data-ft, data-xt, etc.)
- Scripts and style tags
- Meta tags and links
- Iframes and embedded content
- Excessive inline styles
- Grammarly and other editor attributes

## Best Practices

1. **Test Pastes**: Always review pasted content for structure accuracy
2. **Clean Up**: Use "Clear Formatting" if needed to reset text
3. **Save Often**: Use Ctrl+S to save your work
4. **Check Both Languages**: Ensure content looks good in both Vietnamese and English
5. **Preserve Structure**: Avoid removing all paragraphs when editing

## Troubleshooting

### Structure Not Preserved?
- Ensure you're copying content with actual formatting
- Try selecting more content including paragraph markers
- Check if the source uses proper HTML structure

### Paste Not Working?
- Try using Ctrl+V instead of right-click paste
- Check if the source content has actual structure
- Refresh the page and try again

### Formatting Issues?
- Use "Clear Formatting" and reapply styling
- Check the original source for complex formatting
- Simplify the content before pasting

### Links Not Clickable?
- Use the Link tool (Ctrl+K) to re-add links
- Ensure URLs start with http:// or https://
- Check that links weren't removed during cleaning

## Example Usage

### From Facebook:
1. Select a Facebook post with multiple paragraphs
2. Copy (Ctrl+C)
3. Paste into the editor
4. Paragraphs, line breaks, and formatting are preserved

### From Word:
1. Copy a document with headings and lists
2. Paste into the editor
3. Document structure, headings, and lists are maintained

### From Web:
1. Select content with proper structure
2. Copy and paste
3. Layout, paragraphs, and formatting are preserved
