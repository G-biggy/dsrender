---
name: Atmospheric Glass
colors:
  surface: "#0b1326"
  surface-dim: "#0b1326"
  surface-bright: "#31394d"
  surface-container-lowest: "#060e20"
  surface-container-low: "#131b2e"
  surface-container: "#171f33"
  surface-container-high: "#222a3d"
  surface-container-highest: "#2d3449"
  on-surface: "#dae2fd"
  on-surface-variant: "#c4c7c8"
  inverse-surface: "#dae2fd"
  inverse-on-surface: "#283044"
  outline: "#8e9192"
  outline-variant: "#444748"
  surface-tint: "#c6c6c7"
  primary: "#ffffff"
  on-primary: "#2f3131"
  primary-container: "#e2e2e2"
  on-primary-container: "#636565"
  inverse-primary: "#5d5f5f"
  secondary: "#adc9eb"
  on-secondary: "#14324e"
  secondary-container: "#304b68"
  on-secondary-container: "#9fbbdd"
  tertiary: "#ffffff"
  on-tertiary: "#620040"
  tertiary-container: "#ffd8e7"
  on-tertiary-container: "#ab3779"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#e2e2e2"
  primary-fixed-dim: "#c6c6c7"
  on-primary-fixed: "#1a1c1c"
  on-primary-fixed-variant: "#454747"
  secondary-fixed: "#d0e4ff"
  secondary-fixed-dim: "#adc9eb"
  on-secondary-fixed: "#001d35"
  on-secondary-fixed-variant: "#2d4965"
  tertiary-fixed: "#ffd8e7"
  tertiary-fixed-dim: "#ffafd3"
  on-tertiary-fixed: "#3d0026"
  on-tertiary-fixed-variant: "#85145a"
  background: "#0b1326"
  on-background: "#dae2fd"
  surface-variant: "#2d3449"
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 84px
    fontWeight: 700
    lineHeight: 90px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 600
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 500
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  card-gap: 16px
  section-margin: 40px
  glass-padding: 20px
components:
  glass-card-standard:
    backgroundColor: "rgba(255, 255, 255, 0.1)"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.glass-padding}"
  glass-card-elevated:
    backgroundColor: "rgba(255, 255, 255, 0.2)"
    textColor: "{colors.primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.glass-padding}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
    height: 48px
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-fixed-dim}"
  button-ghost:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.primary}"
    rounded: "{rounded.xl}"
  input-field:
    backgroundColor: "rgba(255, 255, 255, 0.1)"
    textColor: "{colors.primary}"
    rounded: "{rounded.xl}"
    padding: 20px
    height: 48px
---

# Atmospheric Glass

> A glassmorphism weather app design system by Google Labs

## Brand & Style

This design system centers on a high-fidelity Glassmorphism aesthetic designed to evoke a sense of clarity, depth, and modern sophistication. The UI relies on a "vibrant-minimalist" approach: the background provides the energy through multi-colored abstract gradients, while the interface elements act as frosted crystalline lenses.

## Colors

The color strategy prioritizes luminosity and contrast. Because the background is a vibrant, multi-colored abstract composition, the UI components utilize a monochromatic white palette with varying alpha channels.

- **Primary Canvas:** A multi-stop gradient featuring Deep Blue (#1E3A8A), Vivid Purple (#7E22CE), and Soft Pink (#DB2777)
- **Surface Alpha:** Component backgrounds range from `rgba(255, 255, 255, 0.1)` to `0.2`
- **Text:** White (#FFFFFF) or high-tint silver (#E2E8F0) for WCAG compliance

## Typography

The system uses **Inter** for its geometric clarity which balances the organic blurred backgrounds.

| Level | Size | Weight | Line Height | Tracking |
|-------|------|--------|-------------|----------|
| Display Large | 84px | 700 | 90px | -0.04em |
| Headline Large | 32px | 600 | 40px | -0.02em |
| Headline Medium | 24px | 500 | 32px | 0 |
| Body Large | 18px | 400 | 28px | 0 |
| Body Medium | 16px | 400 | 24px | 0 |
| Label Small | 12px | 600 | 16px | 0.05em |

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| unit | 8px | Base grid unit |
| container-padding | 24px | Outer container padding |
| card-gap | 16px | Gap between cards |
| section-margin | 40px | Section vertical margins |
| glass-padding | 20px | Glass card inner padding |

## Elevation & Depth

| Level | Treatment | Use |
|-------|-----------|-----|
| Level 1 (Base) | Dynamic gradient + grain | Background canvas |
| Level 2 (Card) | blur(20px), rgba(255,255,255,0.1) | Standard cards |
| Level 3 (Elevated) | blur(40px), rgba(255,255,255,0.2) | Modals, focal points |

## Shapes

| Token | Value | Usage |
|-------|-------|-------|
| sm | 0.25rem | Small elements |
| DEFAULT | 0.5rem | Default rounding |
| md | 0.75rem | Medium elements |
| lg | 1rem | Cards |
| xl | 1.5rem | Buttons, search bars |
| full | 9999px | Pills, avatars |

## Components

### Glass Containers
Standard cards use a 20px blur, elevated cards use 40px blur and higher opacity. All glass elements feature a 1px white border to simulate light refraction.

### Buttons
Primary buttons are solid white for maximum contrast. Ghost buttons use backdrop filters to remain integrated with the atmospheric background.

### Inputs
Interactive elements use subtle hover states and light blurs rather than solid color changes, preserving transparency.
