---
name: Ganeshwaram Signature
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
  on-surface-variant: '#4d4635'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#7f7663'
  outline-variant: '#d0c5af'
  surface-tint: '#735c00'
  primary: '#735c00'
  on-primary: '#ffffff'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#e9c349'
  secondary: '#b41b5c'
  on-secondary: '#ffffff'
  secondary-container: '#fe5993'
  on-secondary-container: '#62002d'
  tertiary: '#586062'
  on-tertiary: '#ffffff'
  tertiary-container: '#adb4b6'
  on-tertiary-container: '#3f4648'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#ffd9e1'
  secondary-fixed-dim: '#ffb1c5'
  on-secondary-fixed: '#3f001a'
  on-secondary-fixed-variant: '#8f0045'
  tertiary-fixed: '#dde4e6'
  tertiary-fixed-dim: '#c1c8ca'
  on-tertiary-fixed: '#161d1f'
  on-tertiary-fixed-variant: '#41484a'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

The design system is engineered to bridge the gap between high-end hospitality and modern enterprise SaaS. The brand personality is **Prestigious, Intentional, and Hospitable**, catering to elite restaurant staff and banquet managers who require power without sacrificing aesthetic grace.

The visual style is a hybrid of **Modern Minimalism** and **Glassmorphism**, utilizing expansive whitespace and high-quality imagery to evoke a sense of calm and luxury. Drawing inspiration from Apple’s structural clarity and Stripe’s functional elegance, the system uses translucent layers and soft blurs to create a sense of depth and physical presence. This approach ensures the UI feels like a premium digital concierge rather than a standard utility tool.

## Colors

The palette is anchored by a sophisticated interplay of metals and jewel tones.
- **Base Surfaces:** We use absolute white (#FFFFFF) for primary work surfaces and an off-white (#F8F9FA) for background depth to reduce eye strain.
- **The Signature Gold:** Used sparingly for decorative accents, icons, and premium "VIP" indicators to signify exclusivity.
- **The Brand Pink:** A deep, authoritative pink used exclusively for primary actions (CTAs) and critical highlights to ensure high conversion and discoverability.
- **Typography:** We avoid pure black, opting for Deep Charcoal (#2D3436) for primary content to maintain a softer, more luxurious reading experience.

## Typography

This design system utilizes a high-contrast typographic pairing to signal both authority and modernity. 

**Playfair Display** is reserved for headlines and large display moments. It brings a literary and artisanal quality to the interface, reminiscent of luxury menus and editorial publishing. 

**Inter** serves as the functional workhorse. Its neutral, systematic nature ensures that complex banquet data and kitchen management tasks remain legible and professional. Label styles should use uppercase styling with increased letter spacing to provide a "metadata" feel that distinguishes navigation from content.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. While the central dashboard content sits within a 1440px max-width container to maintain readability, background elements and navigation sidebars bleed to the edges of the screen.

- **The 8px Grid:** All margins, paddings, and component heights must be multiples of 8px to ensure mathematical harmony.
- **Banquet Dashboard:** Uses a 12-column grid for desktop. For data-heavy views, the gutter is reduced to 16px.
- **Mobile Reflow:** On mobile devices, the 24px side margins are maintained, and complex 3-column card layouts reflow into a single vertical stack. 
- **The "Breathe" Principle:** Generous top and bottom padding (48px+) is used between major sections to prevent the SaaS functionality from feeling cluttered.

## Elevation & Depth

Depth is communicated through **Layered Glassmorphism** rather than traditional heavy shadows.

- **Level 1 (Base):** Off-white background.
- **Level 2 (Cards):** Pure white with a 1px subtle border (#E1E4E8) and a 4px blur shadow.
- **Level 3 (Overlays/Modals):** Semi-transparent white (Alpha 80%) with a 20px backdrop-filter blur. This allows the vibrant food photography or data behind it to bleed through softly.
- **Shadow Profile:** Shadows should be highly diffused (30px-40px blur) with very low opacity (5-8%) using a tint of the Deep Charcoal neutral to avoid "dirty" grey smudges.

## Shapes

The design system embraces large, organic radii to soften the industrial nature of SaaS software. 

- **Standard Components:** Buttons and inputs use a 12px (0.75rem) radius.
- **Main Containers:** Cards, Kanban columns, and Image containers use a 24px (1.5rem) radius to create a "contained" and friendly aesthetic.
- **Interactive Elements:** Active states or "Floating" indicators may use the pill-shape (full radius) to contrast against the structured grid of the cards.

## Components

### Buttons
- **Primary:** Dark Pink background, white text. Transitions to a slightly darker shade on hover with a subtle scale-up effect (1.02x).
- **Secondary:** Rich Gold border and text, transparent background. Used for "Add-on" or "Upgrade" actions.
- **Floating Action Button (FAB):** Circular, positioned at the bottom right for quick "New Booking" or "Add Item" actions, using the Brand Pink with a high-depth shadow.

### Cards & KPIs
- **KPI Cards:** Feature a large Playfair Display number with a small Gold icon trend indicator. Background is a subtle white-to-transparent gradient.
- **Premium Food Cards:** Full-width photography at the top, followed by a 24px padded content area using the secondary text grey for descriptions.

### Kitchen Kanban
- **Columns:** Soft-grey background with 16px padding.
- **Tickets:** High-contrast white cards. Priority tickets feature a 4px Gold vertical stripe on the left edge.
- **Status Indicators:** Pulsing animated dots (Green for 'In Progress', Warning Gold for 'Delayed') to provide live feedback.

### Input Fields
- **Stateful:** Transitions from a soft grey border to a Rich Gold border on focus. Labels are always floating and use the `label-md` typographic style.