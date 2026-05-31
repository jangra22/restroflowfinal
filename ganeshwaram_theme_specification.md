# Ganeshwaram Signature - Full Design Specification

## 1. Core Brand Identity
**Theme Name:** Ganeshwaram Signature
**Visual Style:** Traditional Premium / Modern Luxury SaaS
**Core Philosophy:** Combining the warmth of Indian vegetarian hospitality (Gold) with contemporary technological precision (Pink & White).

---

## 2. Color Palette
| Token | Hex Code | Usage |
| :--- | :--- | :--- |
| **Surface (Base)** | `#f8f9fa` | Page backgrounds, clean negative space. |
| **Primary (Gold)** | `#d4af37` | Headings, luxury accents, status indicators, key highlights. |
| **Secondary (Pink)** | `#b02a5b` | Primary Action Buttons (CTAs), active navigation states, "New" badges. |
| **On-Surface** | `#1a1a1a` | Main body text, high-contrast descriptions. |
| **Surface-Container**| `#ffffff` | Card backgrounds, elevated surface elements. |
| **Outline-Variant** | `#e0e0e0` | Borders, subtle dividers, inactive states. |

---

## 3. Typography (Playfair Display & Sans-Serif)
- **H1 / Display:** Playfair Display, Bold, 32px-40px. *Used for main page titles (e.g., "Digital Menu").*
- **H2 / Headline:** Playfair Display, Semi-Bold, 24px-28px. *Used for section headers.*
- **Sub-headline:** Playfair Display, Medium, 18px-20px. *Used for card titles (e.g., "Paneer Tikka").*
- **Body Large:** Sans-Serif, Regular, 16px. *Used for descriptions and intro text.*
- **Body Medium:** Sans-Serif, Regular, 14px. *Used for secondary details and ingredient lists.*
- **Label / Button:** Sans-Serif, Semi-Bold, 14px, Uppercase/Tracking. *Used for button text and small labels.*

---

## 4. Component Styles

### A. Buttons
- **Primary Button (Pink):**
  - Background: `#b02a5b`
  - Text: `#ffffff` (Sans-Serif, Semi-Bold)
  - Shape: Rounded-8px (Medium Roundness)
  - Hover/Active: Scale 0.95 transition.
- **Secondary / Outline Button (Gold):**
  - Border: 1.5px solid `#d4af37`
  - Text: `#d4af37`
  - Background: Transparent
- **Ghost / Icon Button:**
  - Color: `#1a1a1a` or `#b02a5b`
  - Background: Soft `#f3f4f5` on hover.

### B. Cards (Food & KPI Cards)
- **Background:** `#ffffff` (Surface-Bright)
- **Shadow:** `0px 4px 20px rgba(0, 0, 0, 0.05)` (Soft, deep elevation)
- **Border:** Optional 1px solid `#f0f0f0`
- **Rounding:** 12px - 16px
- **Layout:** Vertical stack for mobile; Image top, content bottom with generous padding.

### C. Navigation (Top & Bottom)
- **Top Bar:** Glassmorphic white (`rgba(248, 249, 250, 0.8)`) with `backdrop-blur-xl`. Gold serif logo.
- **Bottom Navigation:** Fixed, white background with subtle top border. Active icons in Pink (`#b02a5b`) with a soft pill-shaped container.

---

## 5. Global Design Tokens
- **Roundness:** `ROUND_EIGHT` (8px base) for inputs and buttons; `16px` for main containers.
- **Spacing:** Gutter base of `16px`. Vertical rhythm follows `8px` increments.
- **Shadows:** Layered, low-blur shadows to avoid "dirty" look on white surfaces.
- **Interactions:** 200ms ease-in-out for all hover and state transitions.
