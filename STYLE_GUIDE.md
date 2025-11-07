# Brutalist Design System Style Guide

## Overview

This design system embraces a **brutalist aesthetic** characterized by stark minimalism, sharp geometric forms, and a monochromatic color palette. The design philosophy prioritizes functionality, density, and raw structure over decorative elements.

**Core Principles:**
- **Zero Tolerance for Curves**: All corners are perfectly angular (0deg)
- **Border-Driven Segmentation**: Spacing is eliminated in favor of borders to define structure
- **Monospace Typography**: Extensive use of monospace fonts for a technical, utilitarian feel
- **Neutral Grayscale**: Pure zinc-based palette without color temperature bias
- **High Information Density**: Minimal padding, maximum content visibility
- **Grid-Based Layout**: Strict alignment and border-based separation

---

## Color Palette

### Primary Colors
The entire interface uses the **Zinc** color scale from Tailwind CSS, providing a true neutral gray without blue undertones.

```css
/* Base */
--background: #000000      /* Pure black */
--foreground: #ffffff      /* Pure white */

/* Zinc Scale (Grayscale Palette) */
zinc-50:   #fafafa        /* Lightest gray */
zinc-100:  #f4f4f5
zinc-200:  #e4e4e7
zinc-300:  #d4d4d8        /* Light gray for body text */
zinc-400:  #a1a1aa        /* Medium gray for secondary text */
zinc-500:  #71717a        /* Icons, tertiary elements */
zinc-600:  #52525b        /* Muted text */
zinc-700:  #3f3f46        /* Borders, subtle elements */
zinc-800:  #27272a        /* Primary borders, dividers */
zinc-900:  #18181b        /* Dark backgrounds */
zinc-950:  #09090b        /* Darkest background */
```

### Color Usage Guidelines

| Element Type | Color | Usage |
|--------------|-------|-------|
| **Primary Background** | `bg-black` | Main canvas, panels |
| **Surface Background** | `bg-zinc-900`, `bg-zinc-950` | Cards, headers, inputs |
| **Primary Text** | `text-white` | Headings, primary content |
| **Secondary Text** | `text-zinc-300`, `text-zinc-400` | Body text, descriptions |
| **Tertiary Text** | `text-zinc-500`, `text-zinc-600` | Labels, metadata |
| **Disabled/Muted** | `text-zinc-700` | Timestamps, subtle info |
| **Borders** | `border-zinc-800`, `border-zinc-700` | Primary dividers |
| **Hover States** | `bg-zinc-950`, `bg-zinc-800` | Interactive feedback |

### Color Restrictions
- **No colors allowed**: No blues, greens, reds, yellows, or any chromatic colors
- **No gradients**: Only solid fills
- **No color temperature**: Pure neutral grays only (zinc, not gray which has blue tint)

---

## Typography

### Font Families

```css
/* Primary Font Stack */
font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
           'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
           sans-serif

/* Monospace Font Stack (Heavily Used) */
font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas,
           'Liberation Mono', 'Courier New', monospace
```

### Font Usage Strategy

The design uses **monospace fonts extensively** to create a technical, code-like aesthetic:

**Monospace (`font-mono`) is used for:**
- All buttons and labels
- Form inputs and placeholders
- Model names and technical labels
- Navigation items ("NEW CHAT", "AI SDK")
- Timestamps and metadata
- Data values (pricing, context size)
- Headers with technical content
- All uppercase text

**Sans-serif (default) is used for:**
- Message content
- Long-form text
- Descriptions and explanations

### Font Sizes

```css
/* Text Size Scale */
text-xs:    0.75rem    /* 12px - Metadata, timestamps, labels */
text-sm:    0.875rem   /* 14px - Body text, buttons, inputs */
text-base:  1rem       /* 16px - Headers, important text */
text-lg:    1.125rem   /* 18px - Rarely used */

/* Line Height */
leading-6:     1.5rem   /* Standard for body text */
leading-snug:  1.375    /* Compact text */
```

### Font Weights

```css
font-normal:  400      /* Default body text */
font-medium:  500      /* Slightly emphasized text */
font-semibold: 600     /* Rare, for special emphasis */
font-bold:    700      /* Headers, strong emphasis */
```

### Typography Combinations

**Pattern 1: Technical Headers**
```tsx
<h1 className="text-white text-base font-mono font-bold tracking-tight">
  TECHNICAL IMPLEMENTATION OF PPO
</h1>
```
- White text on dark background
- Base size (16px)
- Monospace font
- Bold weight
- Tight letter spacing
- ALL CAPS for emphasis

**Pattern 2: Metadata/Labels**
```tsx
<p className="text-zinc-600 text-xs font-mono">
  2 VERSIONS • STARTED 2 HOURS AGO
</p>
```
- Muted zinc-600 color
- Extra small (12px)
- Monospace
- ALL CAPS
- Normal weight

**Pattern 3: Body Content**
```tsx
<div className="text-white text-sm leading-6">
  Body text content...
</div>
```
- White or zinc-300 for readability
- Small (14px)
- Sans-serif (default)
- Normal line height (1.5)

**Pattern 4: Button Labels**
```tsx
<button className="text-white text-sm font-mono">
  NEW CHAT
</button>
```
- White text
- Small (14px)
- Monospace
- ALL CAPS

**Pattern 5: Technical Data**
```tsx
<span className="text-white text-xs font-mono">
  1000,000 tokens
</span>
```
- White for values
- Extra small
- Monospace (fixed-width alignment)

---

## Spacing System

### Spacing Philosophy
The design uses **minimal spacing** with borders as primary separators. Internal padding exists, but external margins and gaps are eliminated.

### Padding Scale

```css
/* Internal Padding (Tailwind Scale) */
p-0:    0          /* No padding */
p-1:    0.25rem    /* 4px - Rare */
p-1.5:  0.375rem   /* 6px - Rare */
p-2:    0.5rem     /* 8px - Minimal padding */
p-3:    0.75rem    /* 12px - Standard padding */
p-4:    1rem       /* 16px - Rare, larger containers */

/* Directional Padding */
px-3:   0.75rem    /* Horizontal: 12px - Standard for content */
py-2:   0.5rem     /* Vertical: 8px - Buttons */
py-3:   0.75rem    /* Vertical: 12px - Content areas */
```

### Common Spacing Patterns

**Pattern 1: Container Padding**
```tsx
<div className="px-3 py-3">
  {/* Standard content padding: 12px all around */}
</div>
```

**Pattern 2: Button Padding**
```tsx
<button className="px-3 py-2">
  {/* Buttons: 12px horizontal, 8px vertical */}
</button>
```

**Pattern 3: Header Padding**
```tsx
<div className="px-3 py-3">
  {/* Headers match content padding */}
</div>
```

**Pattern 4: Compact Elements**
```tsx
<div className="px-2 py-1.5">
  {/* Dropdown items, compact lists */}
</div>
```

### Gap (Element Spacing)

```css
gap-1:   0.25rem   /* 4px - Rare */
gap-2:   0.5rem    /* 8px - Tight spacing (icons + text) */
gap-3:   0.75rem   /* 12px - Standard spacing */

/* Common Usage */
flex gap-2  /* Icon next to label */
flex gap-3  /* Message avatar + content */
```

### Spacing Between Components

**Zero External Spacing Rule:**
- No margins between major containers
- No gaps in flex/grid layouts at container level
- Borders used instead of spacing for visual separation

```tsx
{/* CORRECT: Border-based separation */}
<div className="border-b border-zinc-800">Item 1</div>
<div className="border-b border-zinc-800">Item 2</div>

{/* INCORRECT: Gap-based separation */}
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

---

## Component Styles

### Buttons

**Primary Button Style:**
```tsx
<button className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center gap-2 text-white text-sm font-mono transition-colors">
  <Plus className="w-4 h-4" />
  NEW CHAT
</button>
```

**Key Characteristics:**
- Background: `bg-zinc-900`
- Hover: `hover:bg-zinc-800`
- Border: `border border-zinc-700`
- Text: White, small, monospace, ALL CAPS
- Transition: `transition-colors` only
- Icon size: `w-4 h-4`

**Icon Button Style:**
```tsx
<button className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors">
  <Settings className="w-4 h-4 text-zinc-500" />
</button>
```

### Inputs

**Text Input Style:**
```tsx
<input
  type="text"
  placeholder="SEARCH MODELS..."
  className="w-full pl-8 pr-2.5 py-2 bg-zinc-950 border-0 text-sm text-white placeholder:text-zinc-700 focus:outline-none font-mono"
/>
```

**Textarea Style:**
```tsx
<textarea
  placeholder="TYPE YOUR MESSAGE..."
  className="w-full bg-zinc-950 border-0 px-3 py-3 pr-12 text-white placeholder:text-zinc-700 text-sm resize-none focus:outline-none font-mono"
/>
```

**Key Characteristics:**
- Background: `bg-zinc-950`
- No border (or `border-0`)
- Text: White, small, monospace
- Placeholder: `text-zinc-700`, ALL CAPS
- Focus: `focus:outline-none` (no rings)

### Cards/Containers

**Panel Container:**
```tsx
<div className="flex-1 flex flex-col bg-black border-r border-zinc-800 overflow-hidden">
  {/* Content */}
</div>
```

**Surface Container:**
```tsx
<div className="bg-zinc-900 border-b border-zinc-800">
  {/* Content */}
</div>
```

### Dropdowns

**Dropdown Container:**
```tsx
<div className="w-64 bg-black border border-zinc-800 shadow-2xl">
  {/* Dropdown content */}
</div>
```

**Dropdown Item:**
```tsx
<button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-950 border-b border-zinc-800 transition-colors text-left">
  <span className="text-base">{icon}</span>
  <span className="text-white text-sm flex-1 font-mono">{name}</span>
</button>
```

### Badges

**PRO Badge Style:**
```tsx
<span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-xs font-mono border border-zinc-700">
  PRO
</span>
```

**Key Characteristics:**
- Rectangular (no border radius)
- Background: `bg-zinc-800`
- Border: `border-zinc-700`
- Text: `text-zinc-400`, monospace, ALL CAPS
- Tight padding: `px-1.5 py-0.5`

### Lists

**Sidebar List Item (Active):**
```tsx
<div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 cursor-pointer">
  <div className="flex items-start gap-2">
    <div className="w-5 h-5 bg-zinc-800 flex items-center justify-center flex-shrink-0">
      <Bot className="w-3 h-3 text-zinc-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white text-sm truncate leading-snug font-mono">
        Chat title
      </p>
      <p className="text-zinc-600 text-xs font-mono">Time</p>
    </div>
  </div>
</div>
```

**Sidebar List Item (Inactive):**
```tsx
<div className="px-3 py-2 hover:bg-zinc-950 border-b border-zinc-800 cursor-pointer transition-colors">
  {/* Same structure */}
</div>
```

### Message Containers

**Message Wrapper:**
```tsx
<div className="flex gap-3 px-3 py-3">
  <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
    <User className="w-3.5 h-3.5 text-zinc-500" />
  </div>
  <div className="flex-1">
    <div className="text-white text-sm leading-6">
      Message content
    </div>
    <div className="text-zinc-600 text-xs font-mono">01:36 PM</div>
  </div>
</div>
```

---

## Borders

### Border Widths
```css
border:    1px    /* Default, used everywhere */
border-0:  0      /* Remove border */
```

**Only 1px borders are used. No thick borders.**

### Border Colors

```css
border-zinc-700:  #3f3f46    /* Secondary borders, badges */
border-zinc-800:  #27272a    /* Primary borders (most common) */
border-zinc-900:  #18181b    /* Subtle dividers within components */
```

### Border Usage Patterns

**Border Positions:**
```tsx
border-b        /* Bottom border - separates stacked items */
border-t        /* Top border - separates from above */
border-r        /* Right border - vertical panel separator */
border-l        /* Left border - info card connection */
border          /* All sides - dropdowns, cards, buttons */
border-0        /* Remove border - inputs */
```

**Common Border Patterns:**
```tsx
{/* List with separators */}
<div className="border-b border-zinc-800">Item 1</div>
<div className="border-b border-zinc-800">Item 2</div>

{/* Panel with right border */}
<div className="border-r border-zinc-800">Left Panel</div>
<div>Right Panel</div>

{/* Container with full border */}
<div className="border border-zinc-800">Card</div>
```

---

## Shadows & Elevations

### Shadow Scale

```css
shadow-2xl:  /* Only shadow used */
  0 25px 50px -12px rgb(0 0 0 / 0.25)
```

**Shadow Usage:**
- Used **sparingly** for dropdowns only
- Provides depth for floating menus
- No shadows on regular containers or cards

```tsx
{/* Dropdown with shadow */}
<div className="bg-black border border-zinc-800 shadow-2xl">
  Dropdown content
</div>
```

**Elevation Strategy:**
- Borders define structure (not shadows)
- Z-index for layering (`z-50` for dropdowns)
- Minimal depth illusion

---

## Animations & Transitions

### Transition Properties

```css
transition-colors   /* Only transition used */
  transition-property: color, background-color, border-color
  transition-duration: 150ms
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)
```

### Transition Usage

**Hover Transitions:**
```tsx
<button className="hover:bg-zinc-800 transition-colors">
  Button
</button>

<div className="hover:bg-zinc-950 border border-transparent hover:border-zinc-800 transition-colors">
  Interactive element
</div>
```

**Key Points:**
- **Only color transitions** (no transforms, opacity fades, or movements)
- Instant, utilitarian feel
- No loading spinners or complex animations
- No entrance/exit animations

---

## Border Radius

### Global Rule

```css
* {
  border-radius: 0 !important;
}
```

**All corners are perfectly angular (0deg). No exceptions.**

This includes:
- Buttons
- Inputs
- Cards
- Badges
- Dropdowns
- Code blocks
- Images
- Icons (when possible)
- Scrollbar thumbs

---

## Opacity and Transparency

### Opacity Scale Usage

The design uses transparency for text hierarchy and subtle elements:

```css
/* Text Opacity (via color) */
text-white       /* 100% - Primary text */
text-zinc-300    /* ~90% - Body text */
text-zinc-400    /* ~70% - Secondary text */
text-zinc-500    /* ~55% - Icons, tertiary */
text-zinc-600    /* ~40% - Labels */
text-zinc-700    /* ~25% - Muted text */

/* Background Opacity */
bg-zinc-950      /* ~3% opacity on black */
bg-zinc-900      /* ~6% opacity on black */
bg-zinc-800      /* ~12% opacity on black */
```

### Transparency Patterns

```tsx
{/* Icon with reduced opacity */}
<Bot className="w-4 h-4 text-zinc-500" />

{/* Muted timestamp */}
<span className="text-zinc-600 text-xs">Time</span>

{/* Subtle background */}
<div className="bg-zinc-950">Content</div>
```

**No explicit opacity utilities used:**
- No `opacity-50`, `opacity-75`, etc.
- Opacity controlled through color selection

---

## Layout Patterns

### Flex Layouts

**Horizontal Stack:**
```tsx
<div className="flex items-center gap-2">
  <Icon className="w-4 h-4" />
  <span>Label</span>
</div>
```

**Vertical Stack:**
```tsx
<div className="flex flex-col">
  <div className="border-b">Item 1</div>
  <div className="border-b">Item 2</div>
</div>
```

**Full Height Layout:**
```tsx
<div className="h-screen flex">
  <div className="w-72 border-r">Sidebar</div>
  <div className="flex-1 flex flex-col">
    <div className="border-b">Header</div>
    <div className="flex-1 overflow-y-auto">Content</div>
    <div className="border-t">Footer</div>
  </div>
</div>
```

### Grid Patterns

Not used. All layouts use flexbox for precision control.

---

## Common Tailwind CSS Patterns

### Utility Combinations

**Text Truncation:**
```tsx
<p className="truncate min-w-0">Long text...</p>
```

**Scrollable Area:**
```tsx
<div className="flex-1 overflow-y-auto">
  {/* Content */}
</div>
```

**Hidden Overflow:**
```tsx
<div className="overflow-hidden">
  {/* Prevents content bleeding */}
</div>
```

**Centering:**
```tsx
<div className="flex items-center justify-center">
  {/* Centered content */}
</div>
```

**Icon Sizing:**
```tsx
<Icon className="w-4 h-4" />     {/* Standard: 16x16px */}
<Icon className="w-3.5 h-3.5" /> {/* Small: 14x14px */}
<Icon className="w-3 h-3" />     {/* Tiny: 12x12px */}
```

**Flex Shrink Prevention:**
```tsx
<div className="flex-shrink-0">
  {/* Won't shrink in flex container */}
</div>
```

### Responsive Design

The current design is **not responsive**. It's optimized for desktop only with fixed widths.

**Sidebar Width:**
```tsx
<div className="w-72"> {/* Fixed 288px width */}
```

**Content Width:**
```tsx
{/* No max-width constraints on messages */}
```

---

## Icon System

### Icon Library
Uses **Lucide React** icon library.

### Icon Sizing

```tsx
w-3 h-3      /* 12x12px - Tiny icons in badges */
w-3.5 h-3.5  /* 14x14px - Small icons in messages */
w-4 h-4      /* 16x16px - Standard icons (buttons) */
w-5 h-5      /* 20x20px - Larger icons (avatars) */
```

### Icon Colors

```tsx
text-zinc-300   /* Standard icon color */
text-zinc-400   /* Active/visible icons */
text-zinc-500   /* Muted icons */
text-zinc-600   /* Very muted icons */
```

### Common Icons

```tsx
import {
  Bot,           // Message avatar
  User,          // User avatar
  Plus,          // Add action
  Send,          // Submit
  Settings,      // Configuration
  MoreHorizontal, // Menu
  ChevronDown,   // Dropdown
  Search,        // Search input
  GitBranch      // Branch indicator
} from "lucide-react";
```

---

## Example Components

### Complete Button Example

```tsx
// Primary Action Button
<button className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center gap-2 text-white text-sm font-mono transition-colors">
  <Plus className="w-4 h-4" />
  NEW CHAT
</button>

// Icon Button
<button className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors">
  <Settings className="w-4 h-4 text-zinc-500" />
</button>

// Dropdown Toggle Button
<button className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors">
  <span className="text-base">🔷</span>
  <span className="text-white text-sm font-mono">Model Name</span>
  <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-xs font-mono border border-zinc-700">
    PRO
  </span>
  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
</button>
```

### Complete Input Example

```tsx
// Search Input
<div className="relative">
  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
  <input
    type="text"
    placeholder="SEARCH MODELS..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-8 pr-2.5 py-2 bg-zinc-950 border-0 text-sm text-white placeholder:text-zinc-700 focus:outline-none font-mono"
  />
</div>

// Message Textarea
<div className="relative">
  <textarea
    placeholder="TYPE YOUR MESSAGE..."
    rows={1}
    className="w-full bg-zinc-950 border-0 px-3 py-3 pr-12 text-white placeholder:text-zinc-700 text-sm resize-none focus:outline-none font-mono"
  />
  <button className="absolute right-3 top-3 p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors">
    <Send className="w-3.5 h-3.5 text-zinc-300" />
  </button>
</div>
```

### Complete Card/Panel Example

```tsx
// Left Panel Structure
<div className="flex-1 flex flex-col bg-black border-r border-zinc-800 overflow-hidden">
  {/* Header */}
  <div className="h-11 border-b border-zinc-800 flex items-center justify-between px-3 bg-zinc-950">
    <div className="flex items-center gap-2">
      <span className="text-white text-sm font-mono">Model Name</span>
    </div>
    <div className="flex items-center gap-1">
      <button className="p-2 hover:bg-zinc-900 transition-colors">
        <Settings className="w-4 h-4 text-zinc-500" />
      </button>
    </div>
  </div>

  {/* Content */}
  <div className="flex-1 overflow-y-auto bg-black">
    {/* Messages */}
  </div>

  {/* Footer */}
  <div className="border-t border-zinc-800 bg-black">
    {/* Input */}
  </div>
</div>
```

### Complete Dropdown Example

```tsx
// Dropdown Container
{isOpen && (
  <div className="absolute top-full left-0 flex z-50">
    {/* Dropdown Menu */}
    <div className="w-64 bg-black border border-zinc-800 shadow-2xl">
      {/* Search */}
      <div className="border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <input
            type="text"
            placeholder="SEARCH..."
            className="w-full pl-8 pr-2.5 py-2 bg-zinc-950 border-0 text-sm text-white placeholder:text-zinc-700 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item)}
            onMouseEnter={() => setHovered(item)}
            onMouseLeave={() => setHovered(null)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-950 border-b border-zinc-800 transition-colors text-left"
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-white text-sm flex-1 font-mono">{item.name}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Info Card (appears on hover) */}
    {hoveredItem && (
      <div className="w-72 bg-black border-l border-zinc-800 shadow-2xl p-3">
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-white text-xs font-mono font-bold">
                {hoveredItem.title.toUpperCase()}
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-snug">
              {hoveredItem.description}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
              <span className="text-zinc-600 text-xs font-mono">LABEL</span>
              <span className="text-white text-xs font-mono">Value</span>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)}
```

### Complete List Item Example

```tsx
// Active List Item
<div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 cursor-pointer">
  <div className="flex items-start gap-2">
    <div className="w-5 h-5 bg-zinc-800 flex items-center justify-center flex-shrink-0">
      <Bot className="w-3 h-3 text-zinc-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white text-sm truncate leading-snug font-mono">
        Chat title text here
      </p>
      <p className="text-zinc-600 text-xs font-mono">01:36 PM</p>
    </div>
  </div>
</div>

// Inactive List Item (hover state)
<div className="px-3 py-2 hover:bg-zinc-950 border-b border-zinc-800 cursor-pointer transition-colors">
  {/* Same structure */}
</div>
```

### Complete Message Example

```tsx
// User Message
<div className="flex gap-3 px-3 py-3">
  <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
    <User className="w-3.5 h-3.5 text-zinc-500" />
  </div>
  <div className="flex-1">
    <div className="text-white text-sm leading-6">
      Message content goes here
    </div>
    <div className="text-zinc-600 text-xs font-mono">01:36 PM</div>
  </div>
</div>

// Assistant Message
<div className="flex gap-3 px-3 py-3">
  <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
    <Bot className="w-3.5 h-3.5 text-zinc-500" />
  </div>
  <div className="flex-1">
    <div className="text-zinc-600 text-xs font-mono mb-3">
      GPT-5 THOUGHT FOR 33 SECONDS
    </div>
    <div className="text-zinc-300 text-sm leading-6">
      Response content...
    </div>
  </div>
</div>
```

---

## State Variants

### Hover States

```tsx
// Button Hover
hover:bg-zinc-800           // Background darkens
hover:bg-zinc-900           // Subtle darken
hover:bg-zinc-950           // Very subtle

// Border Hover
border border-transparent hover:border-zinc-800

// Combined
hover:bg-zinc-950 border-b border-zinc-800 transition-colors
```

### Active/Selected States

```tsx
// Active Item
bg-zinc-900 border-b border-zinc-800

// Selected Button
bg-zinc-800 border border-zinc-700
```

### Disabled States

Not explicitly implemented. Disabled elements would use:
```tsx
opacity-50 cursor-not-allowed
```

### Focus States

```tsx
focus:outline-none              // Remove default outline
focus:border-zinc-700           // Subtle border change (rare)
```

---

## Accessibility Considerations

### Contrast Ratios

The design maintains WCAG AA compliance:

- **White on Black**: 21:1 (AAA)
- **zinc-300 on Black**: ~14:1 (AAA)
- **zinc-400 on Black**: ~9:1 (AAA)
- **zinc-500 on Black**: ~5.5:1 (AA)
- **zinc-600 on Black**: ~3.5:1 (Below AA for small text)

**Recommendation:**
- Use `text-white` or `text-zinc-300` for primary text
- `text-zinc-400` for secondary text (minimum)
- `text-zinc-500` and darker only for large text or icons

### Interactive Elements

```tsx
cursor-pointer              // Clickable items
transition-colors           // Visual feedback
hover:bg-*                  // Clear hover states
```

### Keyboard Navigation

Current implementation does not show explicit focus styles. Recommended addition:

```tsx
focus-visible:ring-2 focus-visible:ring-zinc-600
```

---

## Performance Considerations

### CSS Optimization

- Uses Tailwind CSS utility classes (tree-shakeable)
- No custom CSS (except global resets)
- Minimal runtime style calculations

### Rendering Optimization

```tsx
// Conditional rendering pattern
{isOpen && <Dropdown />}

// Event handlers memoization recommended
const handleClick = useCallback(() => {}, [deps]);
```

---

## Design System Constraints

### DO's
✅ Use only zinc color scale
✅ Use monospace fonts for technical elements
✅ Use borders for segmentation
✅ Keep padding minimal (px-3 py-3 standard)
✅ Use ALL CAPS for labels and buttons
✅ Maintain sharp corners (0 border radius)
✅ Use transition-colors for interactions
✅ Stack elements with border-b separators

### DON'Ts
❌ No colors (no blues, reds, greens, etc.)
❌ No gradients
❌ No rounded corners anywhere
❌ No spacing between major containers
❌ No box shadows (except dropdowns)
❌ No complex animations
❌ No opacity utilities (use color variants)
❌ No thick borders (only 1px)

---

## Development Guidelines

### Component Structure Pattern

```tsx
// Typical component structure
export function Component() {
  return (
    <div className="flex-1 flex flex-col bg-black border-r border-zinc-800 overflow-hidden">
      {/* Header - Fixed height, border-b */}
      <div className="h-11 border-b border-zinc-800 px-3 bg-zinc-950">
        <div className="flex items-center justify-between">
          {/* Header content */}
        </div>
      </div>

      {/* Body - Flexible, scrollable */}
      <div className="flex-1 overflow-y-auto bg-black">
        {/* Content items with border-b */}
        <div className="px-3 py-3 border-b border-zinc-800">
          {/* Item content */}
        </div>
      </div>

      {/* Footer - Fixed, border-t */}
      <div className="border-t border-zinc-800 bg-black">
        {/* Footer content */}
      </div>
    </div>
  );
}
```

### Naming Conventions

- Use descriptive class names
- Group related utilities together
- Order: Layout → Spacing → Borders → Background → Text → States

```tsx
// Good ordering
className="flex items-center gap-2 px-3 py-2 border border-zinc-800 bg-zinc-900 text-white text-sm font-mono hover:bg-zinc-800 transition-colors"
```

---

## Future Enhancements

### Potential Additions
- Dark mode toggle (even darker theme)
- Keyboard shortcut indicators
- Loading states
- Error states
- Toast notifications (brutalist style)
- Modal dialogs
- Context menus

### Maintaining the System
- New components must follow the brutalist principles
- Color palette should never expand beyond zinc
- Test on dark displays for optimal visibility
- Ensure new patterns maintain information density

---

## Quick Reference

### Most Common Classes

```css
/* Layout */
flex flex-col flex-1 items-center justify-between gap-2 gap-3

/* Spacing */
px-3 py-3 px-2 py-2 p-3

/* Borders */
border border-zinc-800 border-b border-r border-t border-l border-0

/* Backgrounds */
bg-black bg-zinc-900 bg-zinc-950

/* Text */
text-white text-zinc-300 text-zinc-400 text-zinc-500 text-zinc-600
text-sm text-xs text-base
font-mono font-bold

/* Interactions */
hover:bg-zinc-800 hover:bg-zinc-900 hover:bg-zinc-950
transition-colors cursor-pointer

/* Sizing */
w-full w-4 w-5 w-7 h-4 h-5 h-7 h-11
overflow-hidden overflow-y-auto

/* Display */
flex-shrink-0 truncate
```

---

## Version History

**v1.0.0** - Initial Brutalist Design System
- Established zinc-only color palette
- Defined typography scale and monospace usage
- Border-based spacing system
- Zero border radius global rule
- Component library foundation

---

## Support & Contributions

For questions or suggestions regarding this design system, please refer to the implementation in:
- `/src/app/demo/page.tsx` - Component implementations
- `/src/app/globals.css` - Global styles and resets

---

**End of Style Guide**
