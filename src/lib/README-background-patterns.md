# Homepage Background Pattern Changer

This feature allows you to dynamically change the background pattern of the hero section on the homepage.

## Available Patterns

- **dots** - Small circular dots in a grid pattern (default)
- **grid** - Linear grid pattern
- **diagonal** - Diagonal striped pattern
- **waves** - Wave-like circular pattern
- **crosses** - Cross/plus sign pattern
- **none** - No pattern (solid background)

## How to Use

### From Browser Console

The `changeHeroBackground` function is exposed globally when you're on the homepage. Open your browser's developer console and use:

```javascript
// Change to grid pattern
window.changeHeroBackground('grid')

// Change to waves pattern
window.changeHeroBackground('waves')

// Change to diagonal pattern
window.changeHeroBackground('diagonal')

// Change to crosses pattern
window.changeHeroBackground('crosses')

// Remove pattern (solid background)
window.changeHeroBackground('none')

// Return to default dots pattern
window.changeHeroBackground('dots')
```

### From Code

To change the pattern programmatically from within the React component:

```typescript
import type { BackgroundPattern } from './path/to/types';

// In your component or function
const pattern: BackgroundPattern = 'grid';
if (window.changeHeroBackground) {
  window.changeHeroBackground(pattern);
}
```

## Technical Details

The background pattern is controlled by:
- **State**: `heroBackgroundPattern` useState in Home.tsx
- **Function**: `changeHeroBackground(pattern)` exposed on window object
- **Renderer**: `getBackgroundPatternStyle()` function that returns CSS styles
- **Element**: Applied to `div.absolute.inset-0` inside the hero section's background layer

## Customization

To add new patterns, edit the `getBackgroundPatternStyle()` function in `src/pages/Home.tsx`:

```typescript
case 'yourNewPattern':
  return {
    backgroundImage: 'your-css-gradient-or-pattern',
    backgroundSize: 'size',
    backgroundPosition: 'position' // optional
  };
```

Then add the new pattern name to the `BackgroundPattern` type definition.

## Example Use Cases

1. **Testing designs**: Quickly preview different patterns without modifying code
2. **Admin controls**: Could be integrated with an admin panel to let administrators customize the homepage
3. **Seasonal themes**: Automatically change patterns based on seasons or events
4. **User preferences**: Allow users to choose their preferred background pattern
