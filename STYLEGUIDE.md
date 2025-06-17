# 🎨 Bookish Design System & Style Guide

This document outlines the complete design system for the Bookish reading app, including colors, typography, spacing, components, and usage guidelines.

## 📋 Table of Contents
- [Color Palette](#-color-palette)
- [Typography](#-typography)
- [Spacing System](#-spacing-system)
- [Component Styles](#-component-styles)
- [Icon Guidelines](#-icon-guidelines)
- [Layout Patterns](#-layout-patterns)
- [Animation Guidelines](#-animation-guidelines)

---

## 🎨 Color Palette

### Primary Colors
```typescript
const colors = {
  // Primary Brand Colors
  primary: '#D2691E',        // Chocolate Orange - Main brand color
  primaryLight: '#E89556',   // Lighter orange for hover states
  primaryDark: '#B8571A',    // Darker orange for pressed states
  
  // Secondary Colors
  secondary: '#8B7355',      // Warm Brown - Secondary actions
  secondaryLight: '#A68B6B', // Light brown for subtle elements
  secondaryDark: '#6B5A47',  // Dark brown for strong contrast
  
  // Neutral Colors
  background: '#F7F5F3',     // Warm White - Main background
  surface: '#FFFFFF',        // Pure White - Card backgrounds
  surfaceElevated: '#FEFEFE', // Slightly elevated surfaces
  
  // Text Colors
  textPrimary: '#3A3A3A',    // Dark Gray - Primary text
  textSecondary: '#8B7355',  // Brown - Secondary text
  textTertiary: '#A0A0A0',   // Light Gray - Tertiary text
  textInverse: '#FFFFFF',    // White - Text on dark backgrounds
  
  // Border Colors
  border: '#E8E3DD',         // Light border for dividers
  borderLight: '#F0EDE8',    // Very light border
  borderDark: '#D4C4B0',     // Darker border for emphasis
  
  // Status Colors
  success: '#10B981',        // Green - Success states
  warning: '#F59E0B',        // Amber - Warning states
  error: '#EF4444',          // Red - Error states
  info: '#3B82F6',           // Blue - Info states
  
  // Category Colors
  wantToRead: '#FEF3C7',     // Light yellow background
  wantToReadText: '#D97706', // Orange text
  currentlyReading: '#DBEAFE', // Light blue background
  currentlyReadingText: '#2563EB', // Blue text
  completed: '#D1FAE5',      // Light green background
  completedText: '#059669',  // Green text
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
  overlayLight: 'rgba(0, 0, 0, 0.3)', // Light overlay
};
```

### Color Usage Guidelines

**Primary Color (`#D2691E`)**
- Main action buttons (Start Reading, Add Book)
- Active navigation tabs
- Progress bars and indicators
- Brand elements and accents

**Secondary Color (`#8B7355`)**
- Secondary buttons (Cancel, Back)
- Icon colors
- Supporting text elements
- Inactive navigation tabs

**Background (`#F7F5F3`)**
- Main app background
- Screen backgrounds
- Large surface areas

**Surface (`#FFFFFF`)**
- Card backgrounds
- Modal backgrounds
- Input field backgrounds
- List item backgrounds

---

## 📝 Typography

### Font Families
```typescript
const fonts = {
  // System fonts for cross-platform consistency
  ios: 'System',
  android: 'Roboto',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};
```

### Font Weights
```typescript
const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};
```

### Typography Scale
```typescript
const typography = {
  // Headlines
  h1: {
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 40,
    color: '#3A3A3A',
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: '#3A3A3A',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: '#3A3A3A',
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: '#3A3A3A',
  },
  
  // Body Text
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#3A3A3A',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#3A3A3A',
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#8B7355',
  },
  
  // Interactive Text
  button: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#FFFFFF',
  },
  buttonSmall: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#FFFFFF',
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#D2691E',
  },
  
  // Labels and Captions
  label: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#8B7355',
  },
  caption: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 14,
    color: '#8B7355',
  },
};
```

### Typography Usage

**Headlines (h1-h4)**
- Screen titles
- Section headers
- Card titles
- Important announcements

**Body Text**
- Main content
- Descriptions
- Book summaries
- Reading notes

**Interactive Text**
- Button labels
- Links
- Navigation items
- Action text

**Labels & Captions**
- Form labels
- Status indicators
- Metadata
- Timestamps

---

## 📏 Spacing System

### Base Spacing Unit
```typescript
const spacing = {
  xs: 4,    // Extra small spacing
  sm: 8,    // Small spacing
  md: 12,   // Medium spacing
  lg: 16,   // Large spacing (base unit)
  xl: 20,   // Extra large spacing
  '2xl': 24, // 2x extra large
  '3xl': 32, // 3x extra large
  '4xl': 40, // 4x extra large
  '5xl': 48, // 5x extra large
};
```

### Specific Use Cases
```typescript
const spacingUsage = {
  // Component Spacing
  buttonPadding: '12px 16px',      // Button internal padding
  cardPadding: 16,                 // Card internal padding
  screenPadding: 16,               // Screen edge padding
  sectionGap: 24,                  // Gap between sections
  
  // Layout Spacing
  headerHeight: 60,                // Navigation header height
  tabBarHeight: 60,                // Bottom tab bar height
  inputHeight: 48,                 // Standard input height
  buttonHeight: 44,                // Standard button height
  
  // Grid Spacing
  gridGap: 12,                     // Gap in grid layouts
  listItemGap: 8,                  // Gap between list items
  iconTextGap: 8,                  // Gap between icon and text
};
```

---

## 🧩 Component Styles

### Buttons

```typescript
const buttonStyles = {
  // Primary Button
  primary: {
    backgroundColor: '#D2691E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Secondary Button
  secondary: {
    backgroundColor: '#F0EDE8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  
  // Small Button
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  
  // Icon Button
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EDE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
};
```

### Cards

```typescript
const cardStyles = {
  // Standard Card
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Elevated Card
  elevated: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Interactive Card
  interactive: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
};
```

### Input Fields

```typescript
const inputStyles = {
  // Text Input
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8E3DD',
    fontSize: 16,
    color: '#3A3A3A',
  },
  
  // Search Input
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8E3DD',
    fontSize: 16,
    color: '#3A3A3A',
  },
  
  // Input with Icon
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E8E3DD',
  },
};
```

### Badges & Tags

```typescript
const badgeStyles = {
  // Status Badges
  wantToRead: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentlyReading: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completed: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  // Count Badge
  count: {
    backgroundColor: '#E8E3DD',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
};
```

---

## 🔍 Icon Guidelines

### Icon Library
- **Primary**: Ionicons from `Lucide`
- **Style**: Outline icons preferred, filled for active states
- **Sizes**: 16px, 20px, 24px, 32px, 48px, 64px

### Icon Usage

```typescript
const iconSizes = {
  xs: 16,   // Small icons in text
  sm: 20,   // Standard UI icons
  md: 24,   // Primary action icons
  lg: 32,   // Feature icons
  xl: 48,   // Large display icons
  '2xl': 64, // Hero icons
};

const iconColors = {
  primary: '#D2691E',    // Primary actions
  secondary: '#8B7355',  // Secondary actions
  tertiary: '#A0A0A0',   // Inactive states
  success: '#10B981',    // Success states
  warning: '#F59E0B',    // Warning states
  error: '#EF4444',      // Error states
};
```

### Common Icons

```typescript
const commonIcons = {
  // Navigation
  home: 'home-outline',
  search: 'search-outline',
  library: 'library-outline',
  notes: 'create-outline',
  pet: 'happy-outline',
  
  // Actions
  add: 'add',
  remove: 'trash-outline',
  edit: 'pencil-outline',
  save: 'checkmark',
  cancel: 'close',
  
  // Content
  book: 'book-outline',
  bookmark: 'bookmark-outline',
  time: 'time-outline',
  stats: 'stats-chart-outline',
  
  // Status
  success: 'checkmark-circle',
  warning: 'warning',
  error: 'alert-circle',
  info: 'information-circle',
};
```

---

## 📐 Layout Patterns

### Screen Layout

```typescript
const screenLayout = {
  container: {
    flex: 1,
    backgroundColor: '#F7F5F3',
  },
  
  // Header with navigation
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E3DD',
  },
  
  // Content area
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Scrollable content
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
};
```

### Grid Systems

```typescript
const gridLayouts = {
  // Two column grid
  twoColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    columnGap: 8,
  },
  
  // Action grid for quick actions
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
};
```

### List Patterns

```typescript
const listPatterns = {
  // Standard list item
  listItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Book list item
  bookItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  
  // Horizontal scroll list
  horizontalList: {
    flexDirection: 'row',
    paddingLeft: 16,
    gap: 12,
  },
};
```

---

## 🎬 Animation Guidelines

### Transition Timings

```typescript
const animations = {
  // Duration (in milliseconds)
  fast: 150,        // Quick feedback animations
  normal: 250,      // Standard transitions
  slow: 350,        // Complex transitions
  
  // Easing curves
  easeOut: 'ease-out',
  easeIn: 'ease-in',
  easeInOut: 'ease-in-out',
  
  // Spring configurations
  spring: {
    damping: 0.8,
    stiffness: 100,
    mass: 1,
  },
};
```

### Animation Types

**Micro-interactions**
- Button press feedback (100-150ms)
- Icon state changes
- Loading spinners

**Page Transitions**
- Screen navigation (250ms)
- Modal appearance/dismissal
- Tab switching

**Content Animations**
- List item appearance
- Card hover effects
- Progress bar updates

### Accessibility

- Respect user's motion preferences
- Provide alternative feedback for animations
- Ensure animations don't interfere with screen readers

---

## 🎯 Best Practices

### Color Usage
- Always maintain sufficient contrast ratios (4.5:1 minimum for light mode, 7:1 for dark mode)
- Use color as enhancement, not the sole indicator
- Test colors in both light and dark environments
- Ensure brand colors remain recognizable across themes

### Dark Mode Specific Guidelines
- **Avoid pure black (#000000)** - Use #121212 for better readability
- **Maintain color hierarchy** - Ensure surface levels are distinguishable
- **Test with real devices** - OLED displays may show different contrast
- **Consider user context** - Default to system preference when possible
- **Smooth transitions** - Animate theme changes for better UX

### Typography
- Limit to 2-3 font weights per screen
- Ensure text is readable at minimum font sizes
- Use consistent line heights for better readability
- Increase contrast in dark mode for better legibility

### Spacing
- Use the 8px grid system consistently
- Maintain consistent spacing between similar elements
- Provide adequate touch targets (44px minimum)

### Components
- Reuse component styles across the app
- Maintain consistent interaction patterns
- Test components across different screen sizes
- Ensure all interactive elements have proper focus states in both themes

### Theme Switching
- **Persist user preference** - Save theme choice to localStorage/user profile
- **Respect system preference** - Use `prefers-color-scheme` media query as default
- **Provide manual toggle** - Allow users to override system preference
- **Immediate feedback** - Apply theme changes instantly without reload

---

## 🔧 Implementation

### Using the Style Guide with Dark Mode

```typescript
// Import theme hook and use dynamic colors
import { useTheme } from './context/ThemeContext';

const MyComponent: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div 
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.textPrimary,
        padding: '16px',
      }}
      className={`
        transition-colors duration-200
        ${theme.isDark ? 'dark' : 'light'}
      `}
    >
      <h1 style={{ color: theme.colors.textPrimary }}>
        Welcome to Bookish
      </h1>
      <button 
        style={{
          backgroundColor: theme.colors.primary,
          color: theme.colors.textInverse,
          padding: '12px 16px',
          borderRadius: '12px',
          border: 'none',
        }}
      >
        Start Reading
      </button>
    </div>
  );
};
```

### Tailwind CSS Integration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Light theme colors
        primary: {
          DEFAULT: '#D2691E',
          light: '#E89556',
          dark: '#B8571A',
        },
        secondary: {
          DEFAULT: '#8B7355',
          light: '#A68B6B',
          dark: '#6B5A47',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FEFEFE',
          secondary: '#F5F5F5',
        },
        background: '#F7F5F3',
        
        // Dark theme colors (with dark: prefix)
        dark: {
          primary: {
            DEFAULT: '#E89556',
            light: '#F4A971',
            dark: '#D2691E',
          },
          secondary: {
            DEFAULT: '#A68B6B',
            light: '#B89980',
            dark: '#8B7355',
          },
          surface: {
            DEFAULT: '#1E1E1E',
            elevated: '#2A2A2A',
            secondary: '#252525',
          },
          background: '#121212',
        },
      },
    },
  },
  plugins: [],
};
```

### CSS Custom Properties Approach

```css
/* Define theme variables */
:root {
  --color-primary: #D2691E;
  --color-primary-light: #E89556;
  --color-primary-dark: #B8571A;
  --color-background: #F7F5F3;
  --color-surface: #FFFFFF;
  --color-text-primary: #3A3A3A;
  --color-text-secondary: #8B7355;
  --color-border: #E8E3DD;
}

[data-theme="dark"] {
  --color-primary: #E89556;
  --color-primary-light: #F4A971;
  --color-primary-dark: #D2691E;
  --color-background: #121212;
  --color-surface: #1E1E1E;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #B0B0B0;
  --color-border: #3A3A3A;
}

/* Use variables in components */
.card {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.button-primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.button-primary:hover {
  background-color: var(--color-primary-light);
}
```

### Dark Mode Color Palette

```typescript
const darkColors = {
  // Primary Brand Colors (adjusted for dark mode)
  primary: '#E89556',        // Lighter orange for better contrast
  primaryLight: '#F4A971',   // Even lighter for hover states
  primaryDark: '#D2691E',    // Original orange for pressed states
  
  // Secondary Colors
  secondary: '#A68B6B',      // Lighter brown for better visibility
  secondaryLight: '#B89980', // Light brown for subtle elements
  secondaryDark: '#8B7355',  // Medium brown for contrast
  
  // Neutral Colors
  background: '#121212',     // True dark background
  surface: '#1E1E1E',       // Card backgrounds
  surfaceElevated: '#2A2A2A', // Elevated surfaces
  surfaceSecondary: '#252525', // Secondary surface level
  
  // Text Colors
  textPrimary: '#FFFFFF',    // White - Primary text
  textSecondary: '#B0B0B0',  // Light Gray - Secondary text
  textTertiary: '#808080',   // Medium Gray - Tertiary text
  textInverse: '#121212',    // Dark text on light backgrounds
  
  // Border Colors
  border: '#3A3A3A',         // Dark border for dividers
  borderLight: '#2A2A2A',    // Very dark border
  borderDark: '#4A4A4A',     // Lighter border for emphasis
  
  // Status Colors (adjusted for dark mode)
  success: '#22C55E',        // Brighter green for visibility
  warning: '#FB923C',        // Brighter amber for visibility
  error: '#F87171',          // Brighter red for visibility
  info: '#60A5FA',           // Brighter blue for visibility
  
  // Category Colors (dark mode versions)
  wantToRead: '#422006',     // Dark yellow background
  wantToReadText: '#FB923C', // Bright orange text
  currentlyReading: '#1E3A8A', // Dark blue background
  currentlyReadingText: '#60A5FA', // Bright blue text
  completed: '#14532D',      // Dark green background
  completedText: '#22C55E',  // Bright green text
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.8)', // Darker modal overlay
  overlayLight: 'rgba(0, 0, 0, 0.6)', // Medium overlay
};
```

### Theming Support

```typescript
// Complete theme structure with both light and dark modes
const lightTheme = {
  colors: {
    primary: '#D2691E',
    primaryLight: '#E89556',
    primaryDark: '#B8571A',
    
    secondary: '#8B7355',
    secondaryLight: '#A68B6B',
    secondaryDark: '#6B5A47',
    
    background: '#F7F5F3',
    surface: '#FFFFFF',
    surfaceElevated: '#FEFEFE',
    surfaceSecondary: '#F5F5F5',
    
    textPrimary: '#3A3A3A',
    textSecondary: '#8B7355',
    textTertiary: '#A0A0A0',
    textInverse: '#FFFFFF',
    
    border: '#E8E3DD',
    borderLight: '#F0EDE8',
    borderDark: '#D4C4B0',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    wantToRead: '#FEF3C7',
    wantToReadText: '#D97706',
    currentlyReading: '#DBEAFE',
    currentlyReadingText: '#2563EB',
    completed: '#D1FAE5',
    completedText: '#059669',
    
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },
};

const darkTheme = {
  colors: {
    primary: '#E89556',
    primaryLight: '#F4A971',
    primaryDark: '#D2691E',
    
    secondary: '#A68B6B',
    secondaryLight: '#B89980',
    secondaryDark: '#8B7355',
    
    background: '#121212',
    surface: '#1E1E1E',
    surfaceElevated: '#2A2A2A',
    surfaceSecondary: '#252525',
    
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    textInverse: '#121212',
    
    border: '#3A3A3A',
    borderLight: '#2A2A2A',
    borderDark: '#4A4A4A',
    
    success: '#22C55E',
    warning: '#FB923C',
    error: '#F87171',
    info: '#60A5FA',
    
    wantToRead: '#422006',
    wantToReadText: '#FB923C',
    currentlyReading: '#1E3A8A',
    currentlyReadingText: '#60A5FA',
    completed: '#14532D',
    completedText: '#22C55E',
    
    overlay: 'rgba(0, 0, 0, 0.8)',
    overlayLight: 'rgba(0, 0, 0, 0.6)',
  },
};

// Theme context type
export interface Theme {
  colors: typeof lightTheme.colors;
  isDark: boolean;
}

// Usage with theme context
const useTheme = () => {
  const { theme } = useContext(ThemeContext);
  return theme;
};
```

### Dark Mode Implementation Guidelines

**Color Adaptation Principles**
- Maintain brand identity while ensuring readability
- Increase contrast ratios for better accessibility
- Use warmer tones to reduce eye strain
- Preserve color meaning across themes

**Surface Hierarchy**
```typescript
const surfaceLevels = {
  light: {
    level0: '#F7F5F3',  // Background
    level1: '#FFFFFF',  // Cards, modals
    level2: '#FEFEFE',  // Elevated elements
    level3: '#F5F5F5',  // Secondary surfaces
  },
  dark: {
    level0: '#121212',  // Background
    level1: '#1E1E1E',  // Cards, modals
    level2: '#2A2A2A',  // Elevated elements
    level3: '#252525',  // Secondary surfaces
  },
};
```

**Text Contrast Guidelines**
- Light mode: Minimum 4.5:1 contrast ratio
- Dark mode: Minimum 7:1 contrast ratio for body text
- Always test with actual users for comfort

**Component Adaptations**
```typescript
const componentStyles = {
  card: {
    light: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E8E3DD',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
      backgroundColor: '#1E1E1E',
      borderColor: '#3A3A3A',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
    },
  },
  input: {
    light: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E8E3DD',
      textColor: '#3A3A3A',
      placeholderColor: '#A0A0A0',
    },
    dark: {
      backgroundColor: '#2A2A2A',
      borderColor: '#3A3A3A',
      textColor: '#FFFFFF',
      placeholderColor: '#808080',
    },
  },
};
```

---

**This style guide ensures consistency across the entire Bookish app while maintaining the warm, book-inspired aesthetic that makes reading feel cozy and inviting.** 📚✨
