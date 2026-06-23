---
name: Academic Core
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#ffb869'
  on-tertiary: '#482900'
  tertiary-container: '#ca801e'
  on-tertiary-container: '#3f2300'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdcbb'
  tertiary-fixed-dim: '#ffb869'
  on-tertiary-fixed: '#2c1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 12px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

This design system is engineered for the modern academic environment—a high-density, data-rich ecosystem that balances professional utility with a tech-forward aesthetic. It is tailored for students and faculty who require rapid access to schedules, communications, and administrative data.

The visual style is **Corporate / Modern** with a lean toward **Minimalism**. It utilizes a deep charcoal foundation to reduce eye strain during long study sessions, punctuated by vibrant electric accents that guide the user’s eye to interactive elements and critical status updates. The interface relies on tonal layering and crisp geometry rather than decorative effects, ensuring that complex information remains legible and structured on small screens.

The emotional response should be one of **organized focus and technical reliability.**

## Colors

The palette is anchored in a multi-tiered dark theme. The base canvas is a deep, near-black charcoal, while interactive surfaces use slightly lighter shades to create depth without relying on heavy shadows.

- **Primary (Electric Violet):** Used for primary actions, active navigation states, and branding elements.
- **Secondary (Atmospheric Blue):** Used for secondary actions, informational badges, and subtle highlights.
- **Semantic Palette:** High-contrast Green, Orange, and Red are strictly reserved for status indicators (Available, In-Class, On-Leave, or Critical Alerts). 
- **Neutrals:** A range of cool greys provides hierarchy for secondary text and borders. Text contrast is kept high to ensure accessibility in varied lighting conditions.

## Typography

This design system uses a dual-sans-serif approach to maximize clarity. **Hanken Grotesk** serves as the primary typeface, offering a clean, contemporary feel for headings and body copy. **Geist** is used for labels, status tags, and technical metadata to provide a precise, developer-friendly aesthetic that aids in data parsing.

For mobile-first optimization:
- Headlines are kept compact to allow for maximum screen real estate.
- Body text maintains a 14px floor to ensure legibility.
- Letter spacing is slightly increased on uppercase labels to improve scanability at small sizes.

## Layout & Spacing

The layout utilizes a **fluid grid** system based on a 4px baseline rhythm. 

- **Mobile:** A 4-column grid with 16px side margins and 12px gutters.
- **Tablet/Desktop:** A 12-column grid. The navigation moves from a bottom bar or hidden drawer (mobile) to a persistent vertical sidebar (desktop).
- **Density:** The system favors high-density layouts. Content cards and list items use tight internal padding (12px to 16px) to display as much information as possible without overcrowding.

Group related data using "containers within containers" to maintain logical clusters of information.

## Elevation & Depth

Depth is communicated through **Tonal Layers** rather than traditional shadows. In a dark environment, this creates a cleaner, more sophisticated UI.

1.  **Level 0 (Canvas):** The lowest layer (`#0F0F10`), used for the background.
2.  **Level 1 (Surface):** The primary container layer (`#1C1C1E`), used for cards, sidebars, and navigation bars.
3.  **Level 2 (High-Surface):** Used for elevated elements like modals, popovers, or active input states (`#2C2C2E`).
4.  **Outlines:** Low-contrast borders (1px, 10-15% white opacity) are used to define boundaries between surfaces of the same tonal level.

## Shapes

The shape language is **Soft** and disciplined. A 4px (0.25rem) radius is the standard for most UI components to maintain a professional, slightly technical edge. 

- **Standard Elements:** 4px radius (Buttons, Input Fields, Small Cards).
- **Large Containers:** 8px radius (Main dashboard panels, Modal overlays).
- **Status Pills:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.
- **Icons:** Contained within soft-squared backgrounds (8px radius) to create a consistent grid pattern in menus.

## Components

### Buttons
- **Primary:** Solid Purple gradient or flat fill with white text. 4px roundedness.
- **Secondary:** Transparent with a subtle border or a dark grey tonal fill.
- **Ghost:** No background, primary-colored text; used for tertiary actions.

### Status Indicators (Pills)
Small, high-contrast badges using the semantic palette. Text is typically bold and all-caps at 10px to ensure the message is immediate.

### Input Fields
Dark backgrounds (`#121212`) with a subtle 1px border. On focus, the border transitions to the Primary Purple. Labels are placed above the field in a smaller, lighter grey font.

### Cards & Lists
Cards use a subtle `#1C1C1E` background. Lists in the mobile view should utilize full-width rows with thin dividers. Each row should have a clear "chevron" or "active state" to indicate tapability.

### Chips & Filters
Horizontal scrolling chips are used for category filtering (e.g., "All," "Technical," "Cultural"). They use a dark grey background when inactive and the primary color when selected.