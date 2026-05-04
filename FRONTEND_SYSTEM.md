# Frontend System Specification

> Production-ready implementation guide. Converted from DESIGN.md.
> **Rule: Do NOT redesign. Implement exactly as specified.**

---

## 1. Design Tokens (CSS Custom Properties)

```css
/* === FILE: tokens.css === */
:root {
  /* ─── Brand & Accent ─── */
  --color-primary: #0a0a0a;
  --color-brand-pink: #ff4d8b;
  --color-brand-teal: #1a3a3a;
  --color-brand-lavender: #b8a4ed;
  --color-brand-peach: #ffb084;
  --color-brand-ochre: #e8b94a;
  --color-brand-mint: #a4d4c5;
  --color-brand-coral: #ff6b5a;

  /* ─── Surfaces ─── */
  --color-canvas: #fffaf0;
  --color-surface-soft: #faf5e8;
  --color-surface-card: #f5f0e0;
  --color-surface-strong: #ebe6d6;
  --color-surface-dark: #0a1a1a;
  --color-surface-dark-elevated: #1a2a2a;
  --color-hairline: #e5e5e5;

  /* ─── Text ─── */
  --color-ink: #0a0a0a;
  --color-body-strong: #1a1a1a;
  --color-body: #3a3a3a;
  --color-muted: #6a6a6a;
  --color-muted-soft: #9a9a9a;
  --color-on-primary: #ffffff;

  /* ─── Semantic ─── */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* ─── Spacing (base 4px) ─── */
  --space-xxs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;
  --space-section: 96px;

  /* ─── Border Radius ─── */
  --rounded-xs: 6px;
  --rounded-sm: 8px;
  --rounded-md: 12px;
  --rounded-lg: 16px;
  --rounded-xl: 24px;
  --rounded-pill: 9999px;
  --rounded-full: 50%;

  /* ─── Typography ─── */
  --font-display: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* ─── Container ─── */
  --container-max: 1280px;

  /* ─── Elevation (rare) ─── */
  --shadow-subtle: 0 2px 8px rgba(0,0,0,0.06);
}
```

### Typography Utility Classes

```css
/* === FILE: typography.css === */

/* Display — use Inter wt 500 + negative letter-spacing (Plain Black substitute) */
.text-display-xl { font-family: var(--font-display); font-size: 72px; font-weight: 500; line-height: 1.0;  letter-spacing: -2.5px; }
.text-display-lg { font-family: var(--font-display); font-size: 56px; font-weight: 500; line-height: 1.05; letter-spacing: -2px; }
.text-display-md { font-family: var(--font-display); font-size: 40px; font-weight: 500; line-height: 1.1;  letter-spacing: -1px; }
.text-display-sm { font-family: var(--font-display); font-size: 32px; font-weight: 500; line-height: 1.15; letter-spacing: -0.5px; }

/* Titles — Inter wt 600 */
.text-title-lg  { font-family: var(--font-body); font-size: 24px; font-weight: 600; line-height: 1.3;  letter-spacing: -0.3px; }
.text-title-md  { font-family: var(--font-body); font-size: 18px; font-weight: 600; line-height: 1.4;  letter-spacing: 0; }
.text-title-sm  { font-family: var(--font-body); font-size: 16px; font-weight: 600; line-height: 1.4;  letter-spacing: 0; }

/* Body — Inter wt 400 */
.text-body-md   { font-family: var(--font-body); font-size: 16px; font-weight: 400; line-height: 1.55; letter-spacing: 0; }
.text-body-sm   { font-family: var(--font-body); font-size: 14px; font-weight: 400; line-height: 1.55; letter-spacing: 0; }

/* Captions & UI */
.text-caption           { font-family: var(--font-body); font-size: 13px; font-weight: 500; line-height: 1.4; letter-spacing: 0; }
.text-caption-uppercase { font-family: var(--font-body); font-size: 12px; font-weight: 600; line-height: 1.4; letter-spacing: 1.5px; text-transform: uppercase; }
.text-button            { font-family: var(--font-body); font-size: 14px; font-weight: 600; line-height: 1.0; letter-spacing: 0; }
.text-nav-link          { font-family: var(--font-body); font-size: 14px; font-weight: 500; line-height: 1.4; letter-spacing: 0; }
```

---

## 2. Component System

### 2.1 TopNav

| Property | Value |
|---|---|
| **Purpose** | Primary site navigation |
| **Height** | 64px |
| **Background** | `var(--color-canvas)` |
| **Position** | `sticky; top: 0; z-index: 50` |
| **Layout** | Flex row: `[Logo] [CenterMenu] [RightCluster]` |

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `logo` | `ReactNode` | required | Logo + wordmark |
| `menuItems` | `{label, href}[]` | required | Center nav links |
| `ctaLabel` | `string` | `"Try free"` | Primary CTA text |
| `ctaHref` | `string` | required | CTA destination |
| `signInLabel` | `string` | `"Sign in"` | Text link label |

**Styling:**
- Menu items: `.text-nav-link`, color `var(--color-body)`
- Sign in: `button-text-link` variant
- CTA: `button-primary` variant
- Breakpoint `< 768px`: collapse to hamburger menu

---

### 2.2 Button

| Property | Value |
|---|---|
| **Purpose** | All interactive actions |
| **Base height** | 44px |
| **Border radius** | `var(--rounded-md)` (12px) |
| **Typography** | `.text-button` |
| **Padding** | `12px 20px` |

**Props:**

| Prop | Type | Default |
|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'on-color' \| 'text-link'` | `'primary'` |
| `size` | `'md' \| 'lg'` | `'md'` |
| `children` | `ReactNode` | required |
| `href` | `string?` | — |
| `onClick` | `() => void` | — |
| `disabled` | `boolean` | `false` |
| `iconLeft` | `ReactNode?` | — |
| `iconRight` | `ReactNode?` | — |

**Variants:**

| Variant | Background | Text | Border |
|---|---|---|---|
| `primary` | `var(--color-primary)` | `var(--color-on-primary)` | none |
| `secondary` | `var(--color-canvas)` | `var(--color-ink)` | 1px `var(--color-hairline)` |
| `on-color` | `#ffffff` | `var(--color-ink)` | none |
| `text-link` | transparent | `var(--color-ink)` | none, underline on text |

---

### 2.3 FeatureCard

| Property | Value |
|---|---|
| **Purpose** | Primary visual element — showcases product features |
| **Border radius** | `var(--rounded-xl)` (24px) |
| **Padding** | `var(--space-xl)` (32px) |

**Props:**

| Prop | Type | Default |
|---|---|---|
| `color` | `'pink' \| 'teal' \| 'lavender' \| 'peach' \| 'ochre' \| 'cream'` | required |
| `title` | `string` | required |
| `description` | `string` | required |
| `media` | `ReactNode?` | — (product UI fragment or illustration) |
| `ctaLabel` | `string?` | — |
| `ctaHref` | `string?` | — |

**Color Map & Text Logic:**

| Variant | Background | Text Color | CTA Variant |
|---|---|---|---|
| `pink` | `var(--color-brand-pink)` | `var(--color-on-primary)` white | `on-color` |
| `teal` | `var(--color-brand-teal)` | `var(--color-on-primary)` white | `on-color` |
| `lavender` | `var(--color-brand-lavender)` | `var(--color-ink)` dark | `primary` |
| `peach` | `var(--color-brand-peach)` | `var(--color-ink)` dark | `primary` |
| `ochre` | `var(--color-brand-ochre)` | `var(--color-ink)` dark | `primary` |
| `cream` | `var(--color-surface-card)` | `var(--color-ink)` dark | `primary` |

**Layout:** Vertical stack — `[title .text-title-md] [description .text-body-md] [media] [cta?]`

---

### 2.4 HeroSection

| Property | Value |
|---|---|
| **Purpose** | Page-level hero band |
| **Background** | `var(--color-canvas)` |
| **Padding** | `var(--space-section)` vertical |
| **Layout** | 12-col grid, 7/5 split → stacks on mobile |

**Props:**

| Prop | Type |
|---|---|
| `headline` | `string` (`.text-display-xl`) |
| `subheadline` | `string` (`.text-body-md`, color `var(--color-body)`) |
| `primaryCta` | `{label, href}` |
| `secondaryCta` | `{label, href}?` |
| `illustration` | `ReactNode` (right column) |

**Desktop:** `grid-template-columns: 7fr 5fr; gap: var(--space-xl); align-items: center;`
**Mobile (<768px):** Single column stack. `h1` drops to 36px. Illustration stacks below.

---

### 2.5 ProductMockupCard

| Property | Value |
|---|---|
| **Background** | `var(--color-canvas)` |
| **Border** | 1px `var(--color-hairline)` |
| **Radius** | `var(--rounded-lg)` (16px) |
| **Padding** | `var(--space-lg)` (24px) |

**Props:** `title: string`, `description: string?`, `mockupImage: ReactNode`

---

### 2.6 TestimonialCard

| Property | Value |
|---|---|
| **Background** | `var(--color-surface-card)` |
| **Radius** | `var(--rounded-lg)` (16px) |
| **Padding** | `var(--space-lg)` (24px) |

**Props:** `avatar: string(url)`, `name: string`, `role: string`, `quote: string`

**Layout:** `[Row: avatar(40px round) + name(.text-title-sm) + role(.text-body-sm, --color-muted)] [quote .text-body-md]`

---

### 2.7 PricingTierCard

| Property | Value |
|---|---|
| **Radius** | `var(--rounded-lg)` (16px) |
| **Padding** | `var(--space-xl)` (32px) |

**Props:**

| Prop | Type |
|---|---|
| `planName` | `string` (`.text-title-lg`) |
| `price` | `string` |
| `period` | `string` |
| `features` | `string[]` |
| `ctaLabel` | `string` |
| `featured` | `boolean` (default `false`) |

**Variants:**

| Variant | Background | Text | Border |
|---|---|---|---|
| normal | `var(--color-canvas)` | `var(--color-ink)` | 1px `var(--color-hairline)` |
| featured | `var(--color-brand-teal)` | `var(--color-on-primary)` | none |

---

### 2.8 Input

| Property | Value |
|---|---|
| **Background** | `var(--color-canvas)` |
| **Text** | `var(--color-ink)`, `.text-body-md` |
| **Radius** | `var(--rounded-md)` (12px) |
| **Height** | 44px |
| **Padding** | `12px 16px` |
| **Border** | 1px `var(--color-hairline)` |
| **Focus** | border-color → `var(--color-ink)` |

**Props:** `label?: string`, `placeholder?: string`, `type?: string`, `error?: string`, `value`, `onChange`

---

### 2.9 CategoryTab / Badge

**CategoryTab:**

| State | Background | Text |
|---|---|---|
| inactive | transparent | `var(--color-muted)` |
| active | `var(--color-surface-card)` | `var(--color-ink)` |

Padding `8px 16px`, radius `var(--rounded-pill)`.

**BadgePill:** `.text-caption`, background `var(--color-surface-card)`, radius `var(--rounded-pill)`, padding `4px 12px`.

---

### 2.10 CTABand

| Property | Value |
|---|---|
| **Background** | `var(--color-surface-soft)` |
| **Radius** | `var(--rounded-xl)` (24px) |
| **Padding** | 80px |

**Props:** `headline: string` (`.text-display-md`), `subline: string`, `ctaLabel: string`, `ctaHref: string`, `illustration?: ReactNode`

---

### 2.11 Footer

| Property | Value |
|---|---|
| **Background** | `var(--color-surface-soft)` — **NOT dark** |
| **Text** | `var(--color-body)` |
| **Padding** | 80px vertical |
| **Layout** | 4-column link grid → 2-col tablet → 1-col mobile |

**Props:** `columns: {title: string, links: {label, href}[]}[]`, `bottomIllustration?: ReactNode`

---

## 3. Layout System

### Container

```css
.container {
  max-width: var(--container-max); /* 1280px */
  margin: 0 auto;
  padding: 0 var(--space-lg); /* 24px side padding */
}
```

### Grid

```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-lg);
}

/* Hero 7/5 split */
.grid-hero { grid-template-columns: 7fr 5fr; gap: var(--space-xl); align-items: center; }

/* Feature cards */
.grid-features { grid-template-columns: repeat(3, 1fr); gap: var(--space-lg); }

/* Pricing */
.grid-pricing { grid-template-columns: repeat(3, 1fr); gap: var(--space-lg); }
```

### Section Spacing

Every major band: `padding: var(--space-section) 0;` (96px top/bottom).

---

## 4. Color Usage Logic

### When to Use Each Brand Color

| Color | Use For | Semantic Meaning |
|---|---|---|
| **Pink** | Outbound, sequencer, growth features | Energy, action |
| **Teal** | Enterprise, featured pricing tier, premium | Authority, trust |
| **Lavender** | AI-agent, automation features | Intelligence, innovation |
| **Peach** | General SaaS warmth, onboarding | Approachability |
| **Ochre** | Community, experts, knowledge | Warmth, expertise |
| **Cream** | Lower-emphasis features | Neutral, supportive |

### Text Color Switching Rules

```
IF background is pink OR teal:
  text → var(--color-on-primary)  /* white */
  cta  → button variant "on-color"
ELSE (lavender, peach, ochre, cream):
  text → var(--color-ink)         /* dark */
  cta  → button variant "primary"
```

### Color Sequence Rule

> **NEVER repeat the same brand color consecutively.**
> Cycle: pink → teal → lavender → peach → ochre → cream.
> Adjacent feature cards MUST use different colors.

---

## 5. Typography Rules

### Display vs Body — Hard Boundary

| Context | Font | Weight | Letter-Spacing |
|---|---|---|---|
| Headlines (h1–h4, hero, CTA band) | Inter (Plain Black sub) | 500 | negative (-0.5 to -2.5px) |
| Body, UI, buttons, nav, inputs | Inter | 400 or 600 | 0 |

> **System violation:** Using display styling on body text or vice versa.

### Class Mapping

| Element | Class |
|---|---|
| Page h1 | `.text-display-xl` |
| Section h2 | `.text-display-lg` |
| Sub-section h3 | `.text-display-md` |
| CTA band heading | `.text-display-sm` |
| Card title | `.text-title-md` |
| Body paragraph | `.text-body-md` |
| Footer text | `.text-body-sm` |
| Badge | `.text-caption` or `.text-caption-uppercase` |
| Button label | `.text-button` |
| Nav item | `.text-nav-link` |

---

## 6. Responsive Rules

### Breakpoints

```css
/* Mobile first */
@media (min-width: 768px)  { /* tablet  */ }
@media (min-width: 1024px) { /* desktop */ }
@media (min-width: 1440px) { /* wide    */ }
```

### Collapsing Behavior

| Component | Mobile (<768) | Tablet (768-1024) | Desktop (1024+) |
|---|---|---|---|
| TopNav | Hamburger | Tightened | Full |
| Hero grid | 1 col, h1→36px | 1 col | 7fr/5fr |
| Feature cards | 1 col | 2 col | 3 col |
| Pricing cards | 1 col | 2 col | 3 col |
| Footer columns | 1 col | 2 col | 4 col |

### Critical Mobile Rules

- `h1` (`.text-display-xl`): 72px → **36px** on mobile
- Hero illustration stacks **below** headline
- Feature cards keep their colored fill at every breakpoint
- All tap targets minimum **44×44px**

---

## 7. Developer Rules (Enforceable)

### MUST

1. **Canvas is cream** — `background: var(--color-canvas)` on `<body>`. Never cool gray.
2. **All colors via tokens** — never inline hex values.
3. **Section rhythm** — every major band uses `padding: var(--space-section) 0`.
4. **Display headlines** — weight 500, negative letter-spacing. Never weight 700.
5. **Footer is cream** — `var(--color-surface-soft)`. Never dark.
6. **Text contrast** — white text on pink/teal, dark text on lavender/peach/ochre/cream.
7. **Touch targets** — minimum 44×44px on all interactive elements.
8. **Border radius from tokens** — buttons `--rounded-md`, cards `--rounded-lg`, feature cards `--rounded-xl`.

### MUST NOT

1. ❌ Use cool grays for any canvas/background.
2. ❌ Add a 7th brand color card.
3. ❌ Use font-weight > 500 on display text.
4. ❌ Repeat same brand-color card consecutively.
5. ❌ Replace 3D illustrations with flat vector art.
6. ❌ Use a dark footer.
7. ❌ Add custom hover effects beyond system spec.
8. ❌ Mix display typography into body text contexts.
9. ❌ Use shadows on feature cards (depth = color contrast only).

---

## 8. AI Coding Instructions

### For AI Code Generators (Gemini / Copilot / Claude / etc.)

#### How to Use This System

1. **Import tokens first.** Every component file must reference `tokens.css` and `typography.css`.
2. **Reference tokens by CSS variable** — e.g., `var(--color-brand-pink)`, `var(--space-xl)`, `var(--rounded-md)`.
3. **Use typography classes** — apply `.text-display-xl`, `.text-body-md`, etc. Do not create ad-hoc font styles.
4. **Build components from the spec** — each component has defined props, variants, and styling. Follow them exactly.

#### What MUST NOT Be Changed

- **Color values** — the hex codes are final. Do not adjust, lighten, or darken.
- **Spacing scale** — the 4px base unit and token values are fixed.
- **Border radius mapping** — buttons=12px, content cards=16px, feature cards=24px.
- **Typography weights** — display=500, title=600, body=400. No exceptions.
- **Canvas color** — `#fffaf0` is non-negotiable. Never use `#ffffff` or gray.
- **Footer treatment** — always cream (`--color-surface-soft`), never dark.
- **Text color logic** — white on pink/teal, dark on everything else.

#### How to Build a New Page

```
1. Wrap in <body style="background: var(--color-canvas)">
2. Add <TopNav /> at top
3. Add <HeroSection /> if it's a landing page
4. Sequence FeatureCards — alternate colors, never repeat
5. Add section spacing: var(--space-section) between bands
6. Add <CTABand /> before footer
7. Add <Footer /> — cream background, NOT dark
8. Verify: all colors from tokens, all type from classes
```

#### Component Color Selection Guide

```
When building a feature card, pick color by content domain:
  - Outbound / sequencer / growth → pink
  - Enterprise / featured / premium → teal
  - AI / automation / agents        → lavender
  - General / onboarding / warmth   → peach
  - Community / experts / knowledge → ochre
  - Low emphasis / secondary        → cream

Then check adjacent cards — no two same colors in a row.
```

#### Validation Checklist (Run Before Committing)

- [ ] No inline hex colors — all via `var(--color-*)`
- [ ] No inline font sizes — all via `.text-*` classes
- [ ] Canvas background is `--color-canvas` (#fffaf0)
- [ ] Footer background is `--color-surface-soft` (#faf5e8)
- [ ] Display text weight is 500 with negative letter-spacing
- [ ] No consecutive same-color feature cards
- [ ] All buttons/inputs minimum 44px height
- [ ] Section spacing uses `--space-section` (96px)
- [ ] Feature cards use `--rounded-xl` (24px)
- [ ] White text only on pink/teal backgrounds
