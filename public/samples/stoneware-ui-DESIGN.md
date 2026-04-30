# Stoneware UI

A warm, light design system for product surfaces. Covers the full token surface — colors, typography, spacing, radius, shadows, glow effects, layout, breakpoints, z-index, motion, and components.

---

## Colors

### Surface

| Name | Value | Usage |
|------|-------|-------|
| White | `#ffffff` | Primary background |
| Stone Lightest | `#fbf8f5` | Inverse text, lightest warm surface |
| Stone Light | `#f9f3ed` | Brand warm background |
| Stone | `#f6eee5` | Card backgrounds, alternating sections |
| Stone Deep | `#ddd6ce` | Deeper warm accent |
| Stone Deeper | `#c5beb7` | Muted warm accent |

### Text

| Name | Value | Usage |
|------|-------|-------|
| Ink | `#2c2c2c` | Primary text — dominant across the system |
| Ink Soft | `rgba(44, 44, 44, 0.7)` | Body text, longer reading |
| Ink Muted | `rgba(44, 44, 44, 0.5)` | Captions, metadata |
| Ink Faint | `rgba(44, 44, 44, 0.3)` | Disabled, placeholders |

### Brand

| Name | Value | Usage |
|------|-------|-------|
| Forest | `#094413` | Primary CTA background |
| Forest Bright | `#088924` | Success, positive emphasis |
| Ember | `#d73815` | Alert and error accent |

---

## Typography

### Font Families

| Name | Stack | Role |
|------|-------|------|
| Display | `DM Sans`, Helvetica, Arial, sans-serif | Everything — single-font hierarchy via size and weight |

### Scale

| Token | Size | Weight | Line height | Letter spacing |
|-------|------|--------|-------------|----------------|
| xs | 12px | 400 | 1.5 | normal |
| sm | 14px | 400 | 1.5 | normal |
| base | 16px | 400 | 1.3 | normal |
| lg | 20px | 500 | 1.25 | -0.2px |
| xl | 24px | 600 | 1.2 | -0.4px |
| 2xl | 32px | 600 | 1.0 | -0.96px |
| 3xl | 48px | 600 | 1.0 | -1.44px |
| 4xl | 64px | 600 | 1.0 | -1.92px |

### Presets

#### Hero

```
Font:     DM Sans
Size:     64px
Weight:   600
Line-H:   1.0
Spacing:  -1.92px
Color:    #2c2c2c
```

#### Section Heading

```
Font:     DM Sans
Size:     48px
Weight:   600
Line-H:   1.0
Spacing:  -1.44px
Color:    #2c2c2c
```

#### Card Heading

```
Font:     DM Sans
Size:     32px
Weight:   600
Line-H:   1.0
Spacing:  -0.96px
Color:    #2c2c2c
```

#### Body

```
Font:     DM Sans
Size:     16px
Weight:   400
Line-H:   1.3
Spacing:  normal
Color:    #2c2c2c
```

---

## Spacing

| Token | Value |
|-------|-------|
| `0` | 0px |
| `1` | 4px |
| `2` | 8px |
| `3` | 12px |
| `4` | 16px |
| `6` | 24px |
| `8` | 32px |
| `12` | 48px |
| `16` | 64px |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Subtle rounding on tags and chips |
| sm | 9px | Small inputs and badges |
| md | 12px | Cards |
| base | 14px | Buttons |
| lg | 16px | Larger cards |
| xl | 20px | Modals |
| 2xl | 25.6px | Hero panels |
| 3xl | 32px | Feature blocks |
| pill | 112px | Pill-shaped buttons and inputs |
| pill-lg | 128px | Wider pill controls |
| full | 50% | Circular elements, avatars |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| Small | `0 10px 16px -3px rgba(20,21,26,0.08), 0 3px 6px -2px rgba(20,21,26,0.05)` | Subtle card elevation |
| Medium | `0 12px 24px rgba(61,60,60,0.2)` | Standard card lift |
| Large | `0 70px 76px rgba(44,44,44,0.2)` | Deep section / hero shadow |
| Hero | `0 0 34px rgba(112,144,210,0.03), 0 0 29px rgba(0,0,0,0.1), 0 8px 21px rgba(0,0,0,0)` | Layered hero element shadow |

---

## Effects

### Glow

Interactive glow effect on focus-target elements.

| State | Blur | Opacity |
|-------|------|---------|
| Rest | 9px | 0.46 |
| Hover | 7.5px | 0.76 |
| Focus | 16px | 0.70 |

---

## Layout

| Token | Value | Usage |
|-------|-------|-------|
| Container Min | 992px | Smallest container width |
| Container Max | 1440px | Largest container width |
| Container | `clamp(992px, 100vw, 1440px)` | Fluid container |
| Size Unit | 16px | Base unit for fluid type calculations |

---

## Breakpoints

| Token | Value |
|-------|-------|
| `xs` | 340px |
| `sm` | 479px |
| `md` | 767px |
| `lg` | 991px |
| `xl` | 1200px |

---

## Z-Index

| Token | Value | Usage |
|-------|-------|-------|
| Behind | -1 | Decorative backgrounds |
| Base | 1 | Default stacking |
| Raised | 5 | Elevated surfaces |
| Dropdown | 10 | Menus and popovers |
| Sticky | 100 | Sticky headers |
| Overlay | 10000 | Modals and sheets |

---

## Motion

### Duration

| Token | Value |
|-------|-------|
| Fast | 100ms |
| Default | 200ms |
| Medium | 300ms |
| Slow | 400ms |
| Slowest | 600ms |
| Fade | 700ms |

### Easing

| Token | Value | Usage |
|-------|-------|-------|
| Ease Out | `ease-out` | Simple state transitions |
| Smooth | `cubic-bezier(0.215, 0.61, 0.355, 1)` | Borders, colors, transforms |
| Snappy | `cubic-bezier(0.38, 0.005, 0.215, 1)` | Background and color swaps |
| Expressive | `cubic-bezier(0.625, 0.05, 0, 1)` | Transforms, grid choreography |
| Linear | `linear` | Opacity fades |

---

## Components

### Primary Button

```
background-color: #094413
color: #f9f3ed
padding: 14px 28px
border-radius: 14px
font-family: DM Sans
font-size: 16px
font-weight: 500
```

#### Hover

```
background-color: #000000
```

### Secondary Button

```
background-color: rgba(44, 44, 44, 0.05)
color: rgba(44, 44, 44, 0.9)
padding: 14px 28px
border-radius: 14px
font-family: DM Sans
font-size: 16px
font-weight: 500
```

#### Hover

```
background-color: rgba(44, 44, 44, 0.1)
```

### Input Field

```
background-color: #ffffff
color: #2c2c2c
border: 1px solid #ddd6ce
border-radius: 12px
padding: 12px 16px
font-family: DM Sans
font-size: 16px
```

### Card

#### Default

```
background-color: #ffffff
border-radius: 16px
padding: 24px
box-shadow: 0 10px 16px -3px rgba(20,21,26,0.08), 0 3px 6px -2px rgba(20,21,26,0.05)
```

#### Elevated

```
background-color: #fbf8f5
border-radius: 16px
padding: 24px
box-shadow: 0 12px 24px rgba(61,60,60,0.2)
```
