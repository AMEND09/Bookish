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
- **Primary**: Ionicons from `@expo/vector-icons`
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
- Always maintain sufficient contrast ratios (4.5:1 minimum)
- Use color as enhancement, not the sole indicator
- Test colors in both light and dark environments

### Typography
- Limit to 2-3 font weights per screen
- Ensure text is readable at minimum font sizes
- Use consistent line heights for better readability

### Spacing
- Use the 8px grid system consistently
- Maintain consistent spacing between similar elements
- Provide adequate touch targets (44px minimum)

### Components
- Reuse component styles across the app
- Maintain consistent interaction patterns
- Test components across different screen sizes

---

## 🔧 Implementation

### Using the Style Guide

```typescript
// Import and use color constants
import { colors, typography, spacing } from './styleGuide';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
```

### Theming Support

```typescript
// Theme structure for future dark mode support
const lightTheme = {
  colors: {
    primary: '#D2691E',
    background: '#F7F5F3',
    surface: '#FFFFFF',
    text: '#3A3A3A',
    // ... other colors
  },
};

const darkTheme = {
  colors: {
    primary: '#E89556',
    background: '#1A1A1A',
    surface: '#2A2A2A',
    text: '#FFFFFF',
    // ... other colors
  },
};
```

---

**This style guide ensures consistency across the entire Bookish app while maintaining the warm, book-inspired aesthetic that makes reading feel cozy and inviting.** 📚✨
