# FeatureCard Implementation Plan

> Sequential phases to build FeatureCard following FRONTEND_SYSTEM.md strictly.
> Stack: React + TypeScript + Tailwind v4 + CVA (class-variance-authority) + `cn()` utility.

---

## Context: Current Codebase State

- **Framework**: Next.js 16 + Tailwind v4 + `@tailwindcss/postcss`
- **Component pattern**: CVA + `cn()` + `React.forwardRef` + Radix Slot (see `button.tsx`)
- **CSS tokens**: `globals.css` uses Tailwind v4 `@theme inline` block — NOT raw CSS `:root` variables
- **Design system colors in FRONTEND_SYSTEM.md** (cream canvas, brand pink/teal/lavender/peach/ochre) are **new tokens** that do NOT exist in the current `globals.css` yet
- **Existing font**: `DM Sans` / `Plus Jakarta Sans` — NOT `Inter` yet

> [!IMPORTANT]
> The FRONTEND_SYSTEM.md defines a Clay.com-inspired design language that is a **separate system** from the existing ChemLab theme. Tokens must be added without breaking existing components.

---

## Phase 1: Register Design Tokens in `globals.css`

### Goal
Add all FRONTEND_SYSTEM.md color, spacing, radius, and typography tokens into the Tailwind v4 theme so they are available as utility classes.

### What Will Be Implemented
- Add new CSS custom properties under `:root` for:
  - Brand colors: `--clay-primary`, `--clay-brand-pink`, `--clay-brand-teal`, `--clay-brand-lavender`, `--clay-brand-peach`, `--clay-brand-ochre`
  - Surface colors: `--clay-canvas`, `--clay-surface-soft`, `--clay-surface-card`
  - Text colors: `--clay-ink`, `--clay-body`, `--clay-muted`, `--clay-on-primary`
  - Hairline: `--clay-hairline`
- Register these in the `@theme inline` block so Tailwind generates `bg-clay-brand-pink`, `text-clay-ink`, etc.
- Add spacing tokens: `--clay-space-xl` (32px), `--clay-space-lg` (24px), `--clay-space-section` (96px)
- Add radius tokens: `--clay-rounded-xl` (24px), `--clay-rounded-lg` (16px), `--clay-rounded-md` (12px)

### What MUST NOT Be Touched
- All existing `:root` variables (ChemLab theme)
- Existing `@theme inline` entries
- The `.dark` block
- Any existing component CSS

### Naming Strategy
Prefix all new tokens with `clay-` to namespace them away from the existing ChemLab design system. This prevents collisions.

### Risks / Common Mistakes
- ❌ Overwriting existing `--color-primary` — the ChemLab theme uses this. Use `--clay-primary` instead.
- ❌ Forgetting to add to `@theme inline` — raw `:root` vars alone won't generate Tailwind classes in v4.
- ❌ Using hex values directly in components later — tokens MUST be the only source.

---

## Phase 2: Create Typography Utility Classes

### Goal
Define the Clay typography scale as CSS utility classes, following the FRONTEND_SYSTEM.md spec exactly.

### What Will Be Implemented
- Create a new file: `src/styles/clay-typography.css`
- Define classes:
  - `.clay-display-xl` → 72px / wt 500 / lh 1.0 / ls -2.5px
  - `.clay-display-lg` → 56px / wt 500 / lh 1.05 / ls -2px
  - `.clay-display-md` → 40px / wt 500 / lh 1.1 / ls -1px
  - `.clay-display-sm` → 32px / wt 500 / lh 1.15 / ls -0.5px
  - `.clay-title-lg` → 24px / wt 600 / lh 1.3 / ls -0.3px
  - `.clay-title-md` → 18px / wt 600 / lh 1.4
  - `.clay-body-md` → 16px / wt 400 / lh 1.55
  - `.clay-button` → 14px / wt 600 / lh 1.0
- Font family: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Import this file in `globals.css` (after Tailwind imports)

### What MUST NOT Be Touched
- Existing heading styles (`h1-h6` rules in `@layer base`)
- Existing `--font-sans` / `--font-display` variables
- Any existing component styles

### Risks / Common Mistakes
- ❌ Setting display weight to 600 or 700 — spec says 500 only for display text
- ❌ Forgetting negative letter-spacing on display classes — this IS the brand voice
- ❌ Using `var(--font-display)` (existing Plus Jakarta) — Clay typography needs Inter specifically
- ❌ Not importing the Inter font — must add Google Fonts import or `next/font` registration

---

## Phase 3: Define the FeatureCard TypeScript Interface

### Goal
Create the component file with ONLY the TypeScript type definitions and prop interface. No rendering logic yet.

### What Will Be Implemented
- Create file: `src/components/ui/feature-card.tsx`
- Define and export:

```
FeatureCardColor = 'pink' | 'teal' | 'lavender' | 'peach' | 'ochre' | 'cream'

FeatureCardProps = {
  color: FeatureCardColor          // required
  title: string                     // required
  description: string              // required
  media?: React.ReactNode          // optional — product UI fragment or illustration
  ctaLabel?: string                // optional
  ctaHref?: string                 // optional
  className?: string               // escape hatch
}
```

- Export the color type separately (other components may need it for the "no consecutive same color" rule)

### What MUST NOT Be Touched
- No rendering logic in this phase
- No CVA variants yet
- No styling

### Risks / Common Mistakes
- ❌ Making `color` optional — it is REQUIRED per spec
- ❌ Forgetting `className` prop — needed for layout composition by parent grids
- ❌ Coupling CTA to Button component import here — defer to Phase 5

---

## Phase 4: Build the CVA Color Variant Map

### Goal
Define the CVA variant configuration that maps each `color` prop value to the correct background + text color combination.

### What Will Be Implemented
- In `feature-card.tsx`, create a `featureCardVariants` using `cva()`:
  - Base classes: padding (`p-8` = 32px), border-radius (`rounded-[24px]` or custom utility), vertical flex layout, gap
  - Color variants (6 total):
    - `pink`: `bg-clay-brand-pink text-clay-on-primary`
    - `teal`: `bg-clay-brand-teal text-clay-on-primary`
    - `lavender`: `bg-clay-brand-lavender text-clay-ink`
    - `peach`: `bg-clay-brand-peach text-clay-ink`
    - `ochre`: `bg-clay-brand-ochre text-clay-ink`
    - `cream`: `bg-clay-surface-card text-clay-ink`

### Critical Text Color Logic
```
pink, teal     → white text (--clay-on-primary)
lavender, peach, ochre, cream → dark text (--clay-ink)
```

### What MUST NOT Be Touched
- No JSX rendering yet
- No CTA button logic
- No media slot logic

### Risks / Common Mistakes
- ❌ Using wrong text color on pink/teal — MUST be white, not dark
- ❌ Adding box-shadow — feature cards have NO shadow per spec (depth = color contrast only)
- ❌ Using `rounded-xl` Tailwind default (which may not be 24px) — use `rounded-[24px]` or the registered `--clay-rounded-xl` token
- ❌ Forgetting that `cream` variant uses `surface-card`, not `canvas`

---

## Phase 5: Implement the Render Structure

### Goal
Build the JSX layout: vertical stack of `[title] [description] [media?] [cta?]`.

### What Will Be Implemented
- `React.forwardRef` wrapper (matching existing pattern from `button.tsx`)
- JSX structure:
  ```
  <div className={cn(featureCardVariants({ color }), className)}>
    <h3 className="clay-title-md">{title}</h3>
    <p className="clay-body-md">{description}</p>
    {media && <div className="mt-auto">{media}</div>}
    {cta && <CtaElement />}
  </div>
  ```
- CTA rendering logic:
  - Determine CTA button variant from color:
    - pink/teal → `on-color` (white bg, dark text)
    - lavender/peach/ochre/cream → `primary` (dark bg, white text)
  - Render as `<a>` or `<button>` depending on `ctaHref` presence

### CTA Variant Derivation (helper function)
```
function getCtaVariant(color): 'on-color' | 'primary' {
  return (color === 'pink' || color === 'teal') ? 'on-color' : 'primary'
}
```

### What MUST NOT Be Touched
- Existing `Button` component — the Clay CTA button may need its own styling (the existing Button uses ChemLab tokens). Either:
  - (a) Create a separate `ClayButton` component, OR
  - (b) Add Clay-specific variants to the existing Button
  - Decision: Prefer (a) to avoid contaminating existing components. But for this plan, render CTA as a simple styled `<a>` tag with inline Clay button classes.

### Risks / Common Mistakes
- ❌ Using `<Button>` from existing UI — it uses ChemLab tokens, not Clay tokens
- ❌ Forgetting `forwardRef` — breaks composition with parent components
- ❌ Not applying `clay-title-md` / `clay-body-md` classes — using bare text instead
- ❌ Hardcoding colors in JSX — all must come from CVA variants

---

## Phase 6: Responsive Behavior

### Goal
Add responsive adjustments per FRONTEND_SYSTEM.md breakpoint spec.

### What Will Be Implemented
- Feature cards retain colored fill at ALL breakpoints (no changes needed — it's the default)
- Internal padding adjustments (optional):
  - Mobile: reduce from 32px → 24px padding if needed for tighter screens
- Ensure the card's content stacks properly in single-column mobile layout
- The **grid** (parent) is responsible for 3→2→1 column collapsing — NOT the card itself. But verify the card doesn't break at narrow widths.

### What MUST NOT Be Touched
- Card color fills — they MUST persist at every breakpoint
- The parent grid system (that's a separate component's responsibility)

### Risks / Common Mistakes
- ❌ Removing colored background on mobile — this violates the spec
- ❌ Making the card responsible for its own grid column count — that's the parent grid's job
- ❌ Adding breakpoint-specific color changes — colors are fixed per variant

---

## Phase 7: Export and Integration Test

### Goal
Export the component, verify it renders correctly with all 6 color variants, and validate against the FRONTEND_SYSTEM.md checklist.

### What Will Be Implemented
- Named export from `feature-card.tsx`
- Add barrel export from `components/ui/index.ts` (if one exists)
- Create a test/demo page (or Storybook-like preview) rendering all 6 variants side-by-side to visually validate:
  1. `<FeatureCard color="pink" .../>` → pink bg, white text
  2. `<FeatureCard color="teal" .../>` → teal bg, white text
  3. `<FeatureCard color="lavender" .../>` → lavender bg, dark text
  4. `<FeatureCard color="peach" .../>` → peach bg, dark text
  5. `<FeatureCard color="ochre" .../>` → ochre bg, dark text
  6. `<FeatureCard color="cream" .../>` → cream bg, dark text

### Validation Checklist (from FRONTEND_SYSTEM.md §8)
- [ ] No inline hex colors — all via `var(--clay-*)`
- [ ] No inline font sizes — all via `.clay-*` classes
- [ ] Feature cards use `--clay-rounded-xl` (24px) ← `rounded-[24px]`
- [ ] White text only on pink/teal backgrounds
- [ ] No shadows on feature cards
- [ ] Padding is 32px (`var(--clay-space-xl)`)
- [ ] Title uses `.clay-title-md` (18px / 600)
- [ ] Description uses `.clay-body-md` (16px / 400)
- [ ] CTA variant matches color (on-color for pink/teal, primary for rest)

### What MUST NOT Be Touched
- Any existing page routes
- Any existing components

### Risks / Common Mistakes
- ❌ Deploying without visual verification — colors may look wrong if tokens aren't registered properly
- ❌ Not testing the cream variant — it's visually subtle and easy to miss contrast issues
- ❌ Forgetting to test with `media` prop — layout should handle presence/absence gracefully

---

## Summary: Phase Dependency Chain

```
Phase 1: Register Tokens  ──→  Phase 2: Typography Classes
                                         │
                                         ▼
                               Phase 3: TypeScript Interface
                                         │
                                         ▼
                               Phase 4: CVA Variant Map
                                         │
                                         ▼
                               Phase 5: Render Structure
                                         │
                                         ▼
                               Phase 6: Responsive Behavior
                                         │
                                         ▼
                               Phase 7: Export & Validate
```

Each phase depends on the previous. No phase can be skipped or parallelized.

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Token namespace | `clay-` prefix | Avoid collision with existing ChemLab tokens |
| Typography | Separate CSS file | Keeps Clay typography isolated from existing heading styles |
| CTA button | Inline styled `<a>` tag (not existing `<Button>`) | Existing Button uses ChemLab tokens; Clay CTA needs its own styling |
| CVA for variants | Yes | Matches existing codebase pattern (see `button.tsx`) |
| Responsive grid | NOT in FeatureCard | Card is layout-agnostic; parent grid handles columns |
| Shadows | None | Spec explicitly says depth = color contrast, no shadows |
