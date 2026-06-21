---
name: Kinetic Sketch
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#464553'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#777585'
  outline-variant: '#c7c4d5'
  surface-tint: '#534ec3'
  primary: '#504bc0'
  on-primary: '#ffffff'
  primary-container: '#6965db'
  on-primary-container: '#fefaff'
  inverse-primary: '#c3c0ff'
  secondary: '#5f5e60'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfe1'
  on-secondary-container: '#636264'
  tertiary: '#864e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#a86400'
  on-tertiary-container: '#fffaff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3a33ab'
  secondary-fixed: '#e4e2e4'
  secondary-fixed-dim: '#c8c6c8'
  on-secondary-fixed: '#1b1b1d'
  on-secondary-fixed-variant: '#474649'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#ffb86d'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#683c00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  canvas-bg: '#FFFFFF'
  border-muted: '#CED4DA'
  ink-black: '#1E1E20'
typography:
  display-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Virgil, cursive
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Virgil, cursive
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  margin-page: 24px
  gutter: 16px
  canvas-padding: 40px
---

## Brand & Style

The design system is built upon a "Digital Whiteboard" aesthetic that prioritizes human-centric interaction over mechanical perfection. It targets collaborative tools, creative platforms, and educational interfaces where the goal is to lower the barrier to entry for ideation. The brand personality is informal, approachable, and intentionally "unfinished," encouraging users to iterate without fear of making mistakes.

The visual style is a sophisticated blend of **Minimalism** and **Tactile Sketching**. It mimics the physical sensation of ink on paper or marker on a dry-erase board. Every element avoids perfect geometric precision in favor of organic, slightly irregular lines that feel hand-drawn. This "blueprint" feel is professional enough for engineering diagrams but playful enough for casual brainstorming.

## Colors

The palette is anchored by a vibrant, digital indigo (`#6965DB`) used for primary actions and selection states. The canvas itself is a pure white (`#FFFFFF`), while the surrounding interface uses a soft off-white (`#F8F9FA`) to distinguish "tools" from the "work surface."

Text and structural ink lines utilize a deep charcoal (`#1E1E20`), providing high contrast while feeling softer than a harsh mathematical black. Neutral borders use a cool grey (`#CED4DA`) to maintain structure without competing for visual attention.

## Typography

Typography is the cornerstone of this design system's playful nature.
- **Headlines:** Utilize **Bricolage Grotesque** for its quirky, variable-width appearance that feels modern yet slightly eccentric.
- **Body & Content:** A hand-drawn typeface (like **Virgil** or an equivalent cursive-leaning font) is required for the "sketch" feel. It mimics handwriting and makes text-heavy blocks feel like personal notes.
- **Technical Labels:** **Space Mono** provides a "blueprint" or "developer" aesthetic for tooltips, coordinates, and metadata, grounding the playful elements with a sense of technical utility.

## Layout & Spacing

The layout follows a **Fixed Grid** for the interface chrome (toolbars, sidebars) but allows for a completely fluid, infinite-canvas approach for the content area. 

The spacing rhythm is based on a **4px base unit**. Unlike traditional corporate designs that favor large, airy margins, this design system uses tighter, more intentional grouping of tools to mimic a physical toolbox. Elements should appear to "float" above the white canvas, maintaining clear margins of at least 24px from the edges of the viewport to prevent the UI from feeling cluttered.

## Elevation & Depth

Depth is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than traditional shadows. 
- **The Surface:** The primary canvas is flat. 
- **The Interface:** Toolbars and menus use a subtle border (`1.5px`) with a slight irregularity to the line. 
- **Selection:** Instead of a glow or heavy shadow, selected items are highlighted with a thick, hand-drawn stroke in the primary indigo color.
- **Floating Panels:** Use a very soft, low-opacity tint of the primary color as a "backdrop shadow" to suggest elevation, but avoid blurry Gaussian shadows to keep the "ink on paper" aesthetic consistent.

## Shapes

The shape language is defined by **Organic Irregularity**. While the variables indicate a base roundedness, this should be interpreted as a "rough" corner. 

Boxes, circles, and buttons should not be mathematically perfect. Implementation should utilize SVGs or CSS paths that introduce a slight jitter or "double-stroke" effect on borders. Use a consistent stroke weight of `1.5px` or `2px` for all UI borders to maintain the "felt-tip marker" weight.

## Components

- **Buttons:** Styled with a solid border and a "rough" outline. On hover, the background fills with a light tint of the primary color, and the border thickness appears to increase slightly as if more pressure was applied to the pen.
- **Input Fields:** These should look like simple underlined regions or "rough" boxes. The focus state uses a bold, hand-drawn bracket or a thicker primary-color stroke.
- **Chips:** Small, pill-shaped outlines that look like they were circled in a hurry.
- **Cards:** Floating containers with a subtle `1px` border in `#CED4DA`. They should have a "post-it note" quality—flat colors with high-contrast text.
- **Toolbars:** Centered "islands" floating at the top or bottom of the screen. Each tool icon should look like a simple line drawing.
- **Checkboxes & Radios:** These should explicitly look like an "X" or a "dot" hand-drawn inside a square or circle. Avoid the standard OS-level rendering.