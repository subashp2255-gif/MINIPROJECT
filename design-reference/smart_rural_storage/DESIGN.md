---
name: Smart Rural Storage
colors:
  surface: '#f4fbf3'
  surface-dim: '#d5dcd4'
  surface-bright: '#f4fbf3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef6ed'
  surface-container: '#e9f0e8'
  surface-container-high: '#e3eae2'
  surface-container-highest: '#dde4dd'
  on-surface: '#161d18'
  on-surface-variant: '#404941'
  inverse-surface: '#2b322d'
  inverse-on-surface: '#ebf3eb'
  outline: '#707971'
  outline-variant: '#c0c9bf'
  surface-tint: '#2b6a45'
  primary: '#004625'
  on-primary: '#ffffff'
  primary-container: '#1e5e3a'
  on-primary-container: '#94d5a8'
  inverse-primary: '#94d5a7'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#86f8c2'
  on-secondary-container: '#00734e'
  tertiary: '#612d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#844000'
  on-tertiary-container: '#ffb787'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#aff2c2'
  primary-fixed-dim: '#94d5a7'
  on-primary-fixed: '#00210f'
  on-primary-fixed-variant: '#0d512f'
  secondary-fixed: '#86f8c2'
  secondary-fixed-dim: '#69dba8'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311300'
  on-tertiary-fixed-variant: '#723600'
  background: '#f4fbf3'
  on-background: '#161d18'
  surface-variant: '#dde4dd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.5rem
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  body-lg:
    fontFamily: Noto Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Noto Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Noto Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.25rem
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.125rem
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

The design system is crafted for grassroots agricultural utility, delivering intuitive intelligence to rural farmers, aggregation centers, and cold warehouse operators. The identity fuses high-utility minimalism with tactile, earthy warmth—communicating dependability, harvest freshness, and operational clarity under varied outdoor lighting conditions.

### Design Principles
- **Field-Ready Clarity**: Visual hierarchy prioritizes quick scanning under bright sunlight, utilizing high-contrast geometry, generous touch targets (minimum 48px), and non-cluttered card layouts.
- **Rooted Reliability**: Balanced between sophisticated predictive cold-chain telemetry and approachable, non-intimidating vernacular utility.
- **Bilingual Symbiosis**: Visual metrics, typography, and interactive touchpoints balance Latin script (English) with Tamil glyph dynamics without clipping or awkward line breaking.
- **Action Over Abstraction**: Clear statuses (e.g., chamber humidity, crate availability, booking lifespan) use realistic crop metaphors and vivid alert signifiers rather than obscure numerical codes alone.

## Colors

The palette draws directly from lush crop yields, deep foliage, and rich field soil. Built strictly in light mode to maximize legibility on budget smartphones under direct sun.

- **Primary (`#1E5E3A` - Deep Harvest Foliage)**: Directs primary actions, top app bars, confirmed storage receipts, and active navigation nodes. Provides AAA contrast against light backgrounds.
- **Secondary (`#0D9668` - Fresh Sprout Emerald)**: Expresses healthy cold-chain temperatures, AI-optimized humidity ranges, vacant bay capacity, and active sensor signals.
- **Tertiary (`#C86D24` - Sun-Baked Terracotta)**: Grounds alerts, upcoming expiration dates, pending payments, and urgent harvesting dispatches.
- **Neutral (`#242B26` - Humus Charcoal)**: Provides deep, legible body text with a gentle green-black warmth, avoiding harsh pure black.
- **Canvas & Surface Grounds**: Clean whites (`#FFFFFF`) paired with soft, warm sunlit neutrals (`#F7F8F5` for canvas, `#ECEFEA` for card outlines and subtle dividers) to reduce glare while retaining freshness.

## Typography

Typography pairs **Plus Jakarta Sans** for prominent headers and action surfaces with **Noto Sans** for multilingual structural readability. 

- **Noto Sans** supports extensive Unicode requirements for Tamil script (தமிழ்) alongside standard Latin characters, retaining vertical balance and optical harmony across code-switched phrases.
- Tamil copy tends to have taller ascenders/descenders; generous line heights (`1.5rem` to `1.75rem` for body copy) prevent vowel marker collision.
- Numbers, metrics, weights (kg, quintals), and temperature values (`°C`) are set in `Plus Jakarta Sans` with bold tabular lining figures to ensure zero vertical jitter in real-time sensor dashboards.

## Layout & Spacing

A responsive grid designed for mobile-first handheld field operations, transitioning cleanly to desktop management consoles:

- **Mobile Viewports (<600px)**: 4-column layout with `1rem` outer margins and gutters. Single-column card stacks dominate to maintain wide, uncrowded tap boundaries.
- **Tablet (600px - 1024px)**: 8-column layout with `1.25rem` gutters. Accommodates two-column split cards (e.g., booking form on left, temperature telemetry map on right).
- **Desktop (>1024px)**: 12-column layout capped at 1280px max-width, `1.5rem` gutters, and `2rem` outer margins.
- **Touch Target Integrity**: Component paddings maintain a strict 48x48px interactive target footprint, ensuring buttons and selectable rows are effortless to activate with gloved or weathered hands.

## Elevation & Depth

Visual hierarchy uses **tonal layering** reinforced by crisp, low-contrast borders rather than diffuse, hard-to-see shadows. This preserves distinct spatial planes in extreme outdoor brightness:

- **Level 0 (App Canvas)**: Grounded in soft cream-tinted off-white (`#F7F8F5`).
- **Level 1 (Cards & Data Panels)**: Pure white (`#FFFFFF`) with a 1px structural outline (`#DFE4DC`). Ambient drop shadow is kept subtle: `0px 2px 4px rgba(36, 43, 38, 0.05)`.
- **Level 2 (Active Modals, Booking Bottom Sheets)**: `#FFFFFF` surface lifted with `0px 8px 24px rgba(30, 94, 58, 0.12)`, combining grounding opacity with a faint harvest-green halo.
- **Level 3 (Toasts & Urgent Field Alerts)**: Elevated floating bars framed by a 1.5px solid border in Tertiary Terracotta or Sprout Emerald, avoiding dependence on shadow for structural edge detection.

## Shapes

The geometry uses a balanced **Rounded (`2`)** standard. Surfaces communicate gentle organic craft while preserving modular density.

- Base elements (buttons, inputs, status tags): `0.5rem` (8px).
- Containers & Cards (`rounded-lg`): `1rem` (16px) for approachable handheld card sorting.
- Drawers & Bottom Sheets (`rounded-xl`): `1.5rem` (24px) top-radius closures for tactile thumb gestures.
- Pills: Used selectively for status badges (e.g., "Available / கிடைக்கும்") to distinguish quick statuses from rectangular action buttons.

## Components

### Buttons
- **Primary Action**: Deep Harvest Foliage (`#1E5E3A`) fill with `#FFFFFF` text. Height of 52px on mobile with bold 16px label. Hover/focus shifts to `#16462B`.
- **Secondary Action**: White fill with 1.5px outline in `#1E5E3A` and matching green text.
- **Tactile Feedback**: 1px inset active highlight with zero floating motion to maintain a predictable, reliable interface.

### Cards & Card-Based Navigation
- Primary interaction vehicle for cold room listings, chamber summaries, and current grain/produce lots.
- Structured with an icon banner (e.g., Tomato, Onion, Banana icon badge), clear English + Tamil title, prominent slot gauge (e.g., "75% Full / 75% நிரம்பியுள்ளது"), and full-card tap surface.
- Border accents on left edges (4px solid `#0D9668` for safe temperature; `#C86D24` for expiring stock) provide rapid peripheral vision feedback.

### Input Fields & Selectors
- Tall form fields (52px height) with light grey borders (`#CAD1C8`) that transition to a 2px `#1E5E3A` outline upon active state.
- Floating label or high-contrast persistent top label accompanied by Tamil translation underneath in secondary tone (`#556057`).
- Native numeric step pickers for crate/quintal quantities with extra-large decrement/increment (`-` / `+`) buttons (48x48px) flanking the input.

### Chips & Filter Tabs
- Quick-filter agricultural produce types (e.g., "Vegetables", "Fruits", "Spices") with integrated line-art crop icons.
- Unselected: Neutral light background (`#ECEFEA`), text `#242B26`. Selected: `#1E5E3A` background with crisp white typography.

### Checkboxes & Radio Controls
- Minimum 24x24px physical target embedded within a full-width card row or 48px target zone.
- Custom tick and radio center finished in Fresh Harvest Emerald (`#0D9668`).

### Bilingual Language Toggle
- Persistent top-right navigation pill switch: English | தமிழ். High visual contrast indicates the currently active primary interface language without hidden sub-menus.