---
name: Nocturnal Noir
colors:
  surface: '#0e1513'
  surface-dim: '#0e1513'
  surface-bright: '#333b38'
  surface-container-lowest: '#09100e'
  surface-container-low: '#161d1b'
  surface-container: '#1a211f'
  surface-container-high: '#242b29'
  surface-container-highest: '#2f3634'
  on-surface: '#dde4e0'
  on-surface-variant: '#bacac5'
  inverse-surface: '#dde4e0'
  inverse-on-surface: '#2b3230'
  outline: '#859490'
  outline-variant: '#3c4a46'
  surface-tint: '#3cddc7'
  primary: '#57f1db'
  on-primary: '#003731'
  primary-container: '#2dd4bf'
  on-primary-container: '#00574d'
  inverse-primary: '#006b5f'
  secondary: '#d2bbff'
  on-secondary: '#3f008e'
  secondary-container: '#6001d1'
  on-secondary-container: '#c9aeff'
  tertiary: '#d9d6ff'
  on-tertiary: '#1d00a5'
  tertiary-container: '#b9b7ff'
  on-tertiary-container: '#3a2cd2'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#62fae3'
  primary-fixed-dim: '#3cddc7'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#e2dfff'
  tertiary-fixed-dim: '#c3c0ff'
  on-tertiary-fixed: '#0f0069'
  on-tertiary-fixed-variant: '#3323cc'
  background: '#0e1513'
  on-background: '#dde4e0'
  surface-variant: '#2f3634'
typography:
  display-accent:
    fontFamily: Cormorant Garamond
    fontSize: 80px
    fontWeight: '500'
    lineHeight: '1.1'
  headline-xl:
    fontFamily: Outfit
    fontSize: 64px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  body-md:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '300'
    lineHeight: '1.6'
  body-lg:
    fontFamily: Outfit
    fontSize: 22px
    fontWeight: '300'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  numbering:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  container-max: 1440px
  section-gap: 80px
---

## Brand & Style
The brand personality is sophisticated, mysterious, and high-precision. It targets elite creative professionals and enterprise leadership who value cinematic aesthetics and surgical clarity. 

The design style is a refined hybrid of **Glassmorphism** and **Atmospheric Minimalism**. It uses a "Nocturnal Nature" theme—deep, organic dark tones paired with ethereal light effects. The interface relies on a multi-layered "aurora" background and a subtle star-field overlay to create an immersive, infinite depth that makes content feel as if it is floating in a curated digital void.

## Colors
The palette is built on a "Deep Jungle" neutral base (`#0e1513`) rather than a pure black, providing a softer, more premium nocturnal foundation. 

- **Primary Teal:** Used for critical branding elements, active states, and focus highlights.
- **Secondary Purple:** Reserved for status indicators, confidence tags, and sophisticated accents.
- **Atmospheric Gradients:** Depth is achieved through low-opacity radial gradients (Teal, Purple, Cyan) that mimic an aurora borealis effect.
- **Glass Surfaces:** Semi-transparent layers with high-blur backdrops allow the background energy to bleed through without sacrificing text legibility.

## Typography
The system uses a primary sans-serif, **Outfit**, for its geometric yet approachable character. It is paired with **Cormorant Garamond** for editorial "flair" moments—specifically for emphasized italic words in large headlines to signal luxury and heritage.

Typography follows a strict hierarchy:
- **Hero Headlines:** Use a mix of heavy-weight Outfit and italic Cormorant Garamond.
- **Narrative Copy:** Employs a light weight (300) for body text at larger sizes (18px-22px) to maintain a modern, airy feel.
- **Labels:** Sentence case with increased tracking for metadata and structural signposts.
- **Numbering:** Stylized with circular borders to create editorial "milestone" markers.

## Layout & Spacing
The system utilizes a **Fixed Grid** model centered within a 1440px container. 

- **Grid Logic:** A 12-column layout for desktop. Main content blocks typically span 8 columns, while a persistent metadata sidebar occupies the remaining 4 columns.
- **Editorial Rules:** Horizontal rules use a 1px linear gradient that fades into transparency, reinforcing the "vanishing" nocturnal aesthetic.
- **Vertical Rhythm:** Large section gaps (80px) and substantial top padding (128px for hero sections) ensure that the interface feels unhurried and premium.
- **Mobile Adaptivity:** Margins shrink to 20px, and grid columns collapse into a single vertical stack.

## Elevation & Depth
Depth is not communicated through shadows, but through **translucency and atmospheric layering**:

- **Layer 0 (Base):** The aurora-tinted background with star-field overlay.
- **Layer 1 (Cards):** "Glass-cards" use a 70% opacity fill and a 12px backdrop-blur. A 10% opacity white border defines the edge without creating a hard visual break.
- **Layer 2 (Navigation):** The top bar uses a 90% background blur to create a semi-opaque "shelf" for navigation.
- **Layer 3 (Modals/Overlays):** High-contrast borders or solid primary-color fills for small floating elements like confidentially badges.

## Shapes
The shape language is consistently rounded to feel organic and fluid. 

- **Cards & Hero Images:** Use `rounded-2xl` (1.5rem) to soften large surface areas.
- **Interactive Elements:** Buttons, tags, and small badges are typically **Pill-shaped** (full rounding) to contrast against the rectangular structural grid.
- **Editorial Lines:** Terminal ends of rules should be soft or faded, never abrupt.

## Components
- **Buttons:** Primary buttons are pill-shaped with a solid primary-to-secondary transition or clear borders. Secondary buttons use a transparent background with a subtle border and high-vibrancy hover states.
- **Glass Cards:** The workhorse of the UI. Must feature `backdrop-blur-md` and a thin, low-opacity border.
- **Milestone Tags:** Small circular badges containing a numbering font, used to sequence narrative content.
- **Metadata Lists:** Vertically stacked blocks separated by gradient editorial rules, with labels in uppercase `label-caps`.
- **Badges:** Confidential or status badges use high-saturation container colors (e.g., secondary-container) to pop against the dark background.
- **Navigation:** Minimalist text links with a primary-color dot or color shift for active states.