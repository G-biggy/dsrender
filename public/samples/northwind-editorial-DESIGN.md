# Northwind Editorial

A dark editorial design system tuned for long-form reading and content-led layouts. Demonstrates layered z-index, expressive motion, and a typography stack that mixes serif body text with a display family for headlines.

---

## Colors

### Surface

| Name | Value | Usage |
|------|-------|-------|
| Black | `#000000` | Page background, dominant surface |
| Near Black | `#131313` | Secondary surface |
| Surface 1 | `#222222` | Card backgrounds |
| Surface 2 | `#2d2d2d` | Elevated cards |
| Overlay | `rgba(49, 49, 49, 0.9)` | Modal / sheet overlays |

### Text

| Name | Value | Usage |
|------|-------|-------|
| Primary | `#ffffff` | Headlines, body on dark |
| Muted | `#949494` | Timestamps, metadata |
| Subtle | `#e9e9e9` | Borders on light contexts |

### Accent

| Name | Value | Usage |
|------|-------|-------|
| Mint | `#3cffd0` | CTAs, links, section headers |
| Mint Soft | `rgba(60, 255, 208, 0.85)` | Hover and secondary states |
| Violet | `#5200ff` | Highlights and special sections |
| Violet Deep | `#3d00bf` | Visited links, secondary borders |

---

## Typography

### Font Families

| Name | Stack | Role |
|------|-------|------|
| Display | `Manrope`, Helvetica, sans-serif | Hero headlines, oversized titles |
| Body | `Source Serif Pro`, Georgia, serif | Article body and excerpts |
| UI | `Inter`, system-ui, sans-serif | Section headers, metadata, navigation |
| Mono | `JetBrains Mono`, Menlo, monospace | CTAs, captions, labels |

### Scale

| Token | Size | Weight | Line height | Letter spacing |
|-------|------|--------|-------------|----------------|
| 2xs | 11px | 500 | 1.2 | 1.1px |
| xs | 14px | 400 | 1.5 | 0.32px |
| base | 16px | 400 | 1.5 | 0.14px |
| md | 18px | 400 | 1.5 | normal |
| xl | 24px | 400 | 1.2 | normal |
| 2xl | 32px | 600 | 1.2 | -0.4px |
| 3xl | 48px | 700 | 1.1 | -1.2px |
| 4xl | 64px | 700 | 1.0 | -1.92px |

### Presets

#### Hero Headline

```
Font:     Manrope
Size:     64px
Weight:   700
Line-H:   1.0
Spacing:  -1.92px
Color:    #ffffff
```

#### Section Header

```
Font:     Inter
Size:     16px
Weight:   500
Line-H:   1.2
Spacing:  0.32px
Color:    #3cffd0
```

#### Article Body

```
Font:     Source Serif Pro
Size:     18px
Weight:   400
Line-H:   1.5
Spacing:  normal
Color:    #ffffff
```

#### CTA / Button

```
Font:     JetBrains Mono
Size:     11px
Weight:   500
Line-H:   1.2
Spacing:  1.1px
Transform: UPPERCASE
Color:    #3cffd0
```

#### Timestamp

```
Font:     Inter
Size:     11px
Weight:   400
Line-H:   1.2
Spacing:  1.1px
Transform: UPPERCASE
Color:    #949494
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
| `5` | 20px |
| `6` | 24px |
| `8` | 32px |
| `10` | 40px |
| `12` | 48px |
| `16` | 64px |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| none | 0px | Hard edges |
| sm | 2px | Inputs, small surfaces |
| md | 4px | Cards |
| lg | 8px | Modals |
| full | 9999px | Pills, avatars |

---

## Breakpoints

| Token | Value |
|-------|-------|
| `xs` | 320px |
| `sm` | 425px |
| `md` | 550px |
| `lg` | 768px |
| `xl` | 900px |
| `2xl` | 1024px |
| `3xl` | 1180px |
| `4xl` | 1280px |

---

## Z-Index

| Token | Value | Usage |
|-------|-------|-------|
| Behind | -1 | Decorative backgrounds |
| Default | 1 | Default stacking |
| Sticky | 50 | Sticky sub-navigation |
| Header | 900 | Site header |
| Overlay | 11000 | Modals, sheets, command palettes |

---

## Motion

### Duration

| Token | Value |
|-------|-------|
| Fast | 100ms |
| Default | 200ms |
| Medium | 300ms |
| Slow | 400ms |
| Slower | 450ms |
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
background-color: #3cffd0
color: #131313
padding: 12px 24px
border-radius: 8px
font-family: JetBrains Mono
font-size: 11px
font-weight: 500
letter-spacing: 1.1px
text-transform: uppercase
```

#### Hover

```
background-color: rgba(60, 255, 208, 0.85)
```

### Secondary Button

```
background-color: transparent
color: #3cffd0
border: 1px solid #3cffd0
padding: 12px 24px
border-radius: 8px
font-family: JetBrains Mono
font-size: 11px
font-weight: 500
letter-spacing: 1.1px
text-transform: uppercase
```

### Input Field

```
background-color: #222222
color: #ffffff
border: 1px solid #2d2d2d
border-radius: 4px
padding: 12px 16px
font-family: Inter
font-size: 14px
```

### Tab

#### Container

```
background-color: #222222
border-radius: 8px
padding: 4px
```

#### Inactive

```
padding: 8px 16px
border-radius: 6px
color: #949494
font-family: Inter
font-size: 14px
font-weight: 500
```

#### Active

```
padding: 8px 16px
border-radius: 6px
background-color: #2d2d2d
color: #ffffff
font-family: Inter
font-size: 14px
font-weight: 500
```

### Toggle

#### Container

```
background-color: #131313
border-radius: 999px
padding: 4px
```

#### Inactive

```
padding: 6px 14px
border-radius: 999px
color: #949494
font-size: 13px
```

#### Active

```
padding: 6px 14px
border-radius: 999px
background-color: #3cffd0
color: #131313
font-size: 13px
font-weight: 600
```
