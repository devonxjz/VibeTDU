# ChemLab UI Upgrade Plan

> Page-level implementation plan for upgrading the current ChemLab interface using `FRONTEND_SYSTEM.md` and the safe namespacing decisions from `featurecard_plan.md`.
> Rule: Preserve the current lab functionality. Upgrade presentation, hierarchy, and consistency without breaking the existing ChemLab theme.

---

## Goal

Transform the current ChemLab page from a mixed-style internal tool UI into a coherent, premium interface built on the Clay-inspired system already introduced in this repo.

This plan does **not** replace the safety decision from `featurecard_plan.md`.
All new design tokens and typography remain namespaced as:

- `--clay-*`
- `.clay-*`

This is required to avoid collisions with the existing ChemLab theme tokens such as `--color-primary`, `--color-muted`, and related text utilities.

---

## Inputs

### Primary Specifications

- `FRONTEND_SYSTEM.md`
- `featurecard_plan.md`

### Current ChemLab Surface Areas

- `frontend/src/components/chemlab/ChemLabShell.tsx`
- `frontend/src/components/chemlab/Toolbar.tsx`
- `frontend/src/components/chemlab/panels/ConditionPanel.tsx`
- `frontend/src/components/chemlab/panels/ChemicalLibrary.tsx`
- `frontend/src/components/chemlab/scene/LabWorkbench.tsx`
- `frontend/src/components/chemlab/scene/ReactionResultCard.tsx`

---

## Current State Assessment

The page is currently in a partially migrated state:

- `ChemicalLibrary.tsx` already follows the new Clay-style direction fairly closely.
- `ConditionPanel.tsx` still uses the legacy ChemLab visual language.
- `Toolbar.tsx` still uses old toolbar tokens and compact internal-tool styling.
- `ChemLabShell.tsx` still frames the center stage using older lab tokens and inset shadows.
- `ReactionResultCard.tsx` uses legacy card colors and ad-hoc semantic styling.
- `LabWorkbench.tsx` is visually stronger than the old UI, but still not aligned with the warm Clay canvas/surface system.

Result: the page feels inconsistent because the right panel looks like one design system, while the left panel, toolbar, and center stage still look like another.

---

## Upgrade Principles

### 1. Keep Functionality Stable

Do not change:

- lab state flow
- reaction triggers
- drag resize behavior
- keyboard shortcuts
- chatbot behavior
- experiment logic

### 2. Restyle by Composition, Not Rewrite

Prefer:

- swapping tokens
- replacing utility classes
- introducing small presentational wrappers
- extracting reusable Clay panel/button primitives

Avoid:

- rewriting store logic
- moving component responsibilities unnecessarily
- redesigning interaction patterns that already work

### 3. Use Clay as the Visual Layer

Adopt from `FRONTEND_SYSTEM.md`:

- warm canvas backgrounds
- strong radius system
- Inter-based typography scale
- clear text hierarchy
- premium spacing
- color-coded cards and section accents

Do **not** blindly rename everything back to `--color-*` or `.text-*`.
The `clay-` namespace remains the correct implementation choice for this repo.

---

## Page-Level Design Mapping

### Global Page Atmosphere

Map the full page toward:

- page background: `var(--clay-canvas)`
- secondary surfaces: `var(--clay-surface-soft)`
- cards/panels: `var(--clay-surface-card)`
- main text: `var(--clay-ink)`
- supporting text: `var(--clay-body)` / `var(--clay-muted)`

Desired outcome:

- less dark SaaS/internal-tool feeling
- more warm editorial/product feel
- clearer separation between page canvas, cards, and active controls

### Toolbar -> Top Navigation Band

Current role:

- brand
- environment controls
- reset action
- chatbot/theme/user actions

Upgrade target:

- visually closer to `TopNav` from `FRONTEND_SYSTEM.md`
- height and spacing cleaned up
- stronger title hierarchy
- controls grouped into card-like clusters on a warm background

Concrete direction:

- use `var(--clay-canvas)` as the toolbar base
- replace dark/translucent toolbar feel with a clean, editorial top band
- keep controls inline, but convert each control group into soft rounded surfaces
- upgrade brand lockup typography using `.clay-title-md` or `.clay-title-lg`
- make the chatbot or primary lab action visually intentional instead of icon-noise

### Left Sidebar -> Experiment Control Panel

Current role:

- beaker contents
- preset selector
- timeline
- action bar

Upgrade target:

- convert from utilitarian admin sidebar into a proper stacked Clay panel
- introduce stronger vertical rhythm and section framing

Concrete direction:

- panel shell: `bg-clay-surface-soft` or `bg-clay-canvas`
- internal sections: `bg-clay-surface-card`, rounded via `--clay-rounded-lg`/`xl`
- panel title: `.clay-display-sm` or `.clay-title-lg`
- section labels: `.clay-caption-uppercase`
- content rows: quieter cream cards with clearer spacing
- primary CTA: Clay primary button styling, not the current emerald utility button
- destructive/secondary actions: Clay secondary/text-link logic

### Center Stage -> Hero Workbench

Current role:

- main beaker scene
- reaction result reveal

Upgrade target:

- treat the experiment stage as the page hero
- preserve the visual focus on the beaker
- reduce noise behind the lab action

Concrete direction:

- outer frame should read like a premium stage card on the warm page canvas
- simplify background texture if it competes with the beaker
- use a softer, cleaner table/stage presentation
- reduce “dashboard chrome” around the stage
- give the board more breathing room so the beaker becomes the protagonist

Important:

- `FRONTEND_SYSTEM.md` emphasizes depth through color contrast and layout, not heavy shadows.
- avoid piling on dark gradients, glows, and inset effects

### Reaction Result Area -> Insight Card

Current role:

- show outcome
- show equation
- show explanation
- show safety note

Upgrade target:

- turn the result region into a readable editorial card system
- preserve urgency for safety, but remove the current patchwork of ad-hoc semantic blocks

Concrete direction:

- card base: `bg-clay-surface-card`
- sections inside result: cream or white-like elevated blocks
- heading: `.clay-title-md`
- formula: strong title/display treatment, not generic bold text
- effect badge colors derived from the Clay accent palette
- safety block remains distinct, but harmonized with the system

### Right Sidebar -> Chemical Discovery Panel

Current role:

- search
- filters
- categorized chemicals

Current status:

- already closest to the desired design language

Upgrade target:

- refine rather than rebuild

Concrete direction:

- use as the visual reference for the rest of the page
- standardize spacing/radius/text sizing with the final shared Clay tokens
- ensure category cards, pills, and search input align exactly with typography and spacing rules

---

## Implementation Phases

## Phase 1: Foundation Audit and Token Lock

### Goal

Confirm the Clay token layer is complete and freeze the naming strategy before broader page work begins.

### Deliverables

- verify `--clay-*` tokens in `frontend/src/app/globals.css`
- verify `frontend/src/styles/clay-typography.css`
- verify component usage avoids raw hex values where Clay tokens exist
- document any missing utility classes needed for page-level UI

### Exit Criteria

- all page-level colors and typography can be expressed via `clay-*`
- no dependency on renaming tokens back to the original `FRONTEND_SYSTEM.md` names

---

## Phase 2: Create Reusable Clay Shell Primitives

### Goal

Avoid repeating ad-hoc utility strings across every ChemLab section.

### Components to Introduce

- `ClayPanelShell`
- `ClaySectionCard`
- `ClayActionButton`
- `ClayPill`
- `ClayFieldShell`

### Purpose

- make `ConditionPanel`, `Toolbar`, and `ReactionResultCard` visually consistent
- reduce drift between page sections

### Exit Criteria

- major sections can be restyled through shared primitives instead of one-off class piles

---

## Phase 3: Toolbar Upgrade

### Goal

Restyle `Toolbar.tsx` into a clean top navigation/control band.

### Changes

- move toolbar onto Clay canvas/surface tokens
- regroup controls into rounded clusters
- reduce icon-only ambiguity where text labels are needed
- align sizing with 44px control height where practical
- improve spacing and hierarchy for brand, controls, and utility actions

### Must Not Change

- environment control behavior
- reset behavior
- chatbot toggle
- theme toggle logic

### Success Criteria

- toolbar reads as part of the same system as `ChemicalLibrary`
- toolbar no longer feels like a separate dark app chrome

---

## Phase 4: Left Panel Upgrade

### Goal

Bring `ConditionPanel.tsx` up to the same design level as the right panel.

### Changes

- restyle panel shell and title hierarchy
- convert content list rows to Clay cards
- redesign empty state using the new typography and soft surfaces
- restyle action area using Clay button logic
- frame timeline and preset selector consistently

### Must Not Change

- remove/add chemical logic
- run/undo/clear functionality
- timeline behavior

### Success Criteria

- the left panel no longer looks legacy next to the right panel
- action area feels intentional and premium, not utilitarian

---

## Phase 5: Center Stage and Workbench Upgrade

### Goal

Make the experiment area the visual centerpiece of the page.

### Changes

- restyle the `ChemLabShell.tsx` stage container onto Clay surfaces
- simplify borders and shadows
- tune `LabWorkbench.tsx` background, glow, and table treatment
- increase whitespace around the beaker
- make the scene feel calm, premium, and focused

### Must Not Change

- board logic
- effects logic
- layout responsibility of the center column

### Success Criteria

- stage looks like a hero section, not a dashboard box
- beaker and reactions are easier to focus on

---

## Phase 6: Reaction Result Card Upgrade

### Goal

Convert `ReactionResultCard.tsx` into a high-clarity insight surface.

### Changes

- replace legacy card colors with Clay surface mapping
- align headings, labels, and body text to Clay typography classes
- create consistent message blocks for:
  - no reaction
  - reaction summary
  - effect badge
  - safety warning
  - explanation

### Must Not Change

- result reveal animation behavior unless a visual polish tweak is clearly needed
- explanation content logic

### Success Criteria

- the result region feels integrated with the rest of the page
- semantic states remain clear without looking visually chaotic

---

## Phase 7: Responsive and Layout Cohesion Pass

### Goal

Ensure the upgraded design survives across desktop, tablet, and smaller laptop widths.

### Focus Areas

- left panel collapse behavior
- right panel width and scroll behavior
- toolbar control wrapping/overflow
- stage margins on narrower viewports
- readability of result and sidebar cards

### Success Criteria

- no section feels visually broken or cramped below large desktop widths
- hierarchy remains clear after panel stacking/collapse

---

## Phase 8: Visual QA and Cleanup

### Goal

Check that the final page behaves like one system instead of several stitched together.

### QA Checklist

- all major page surfaces use Clay tokens
- typography hierarchy is consistent across toolbar, sidebars, and stage
- border radii match the plan
- there are no accidental collisions with legacy ChemLab tokens
- primary actions look primary everywhere
- empty states and badges belong to the same visual language
- no heavy shadow usage contradicts the system
- right panel remains the reference quality bar for the rest of the page

---

## Recommended Order of Execution

1. Finish the foundation audit.
2. Introduce shared Clay shell primitives.
3. Upgrade `Toolbar.tsx`.
4. Upgrade `ConditionPanel.tsx`.
5. Upgrade `ChemLabShell.tsx` and `LabWorkbench.tsx`.
6. Upgrade `ReactionResultCard.tsx`.
7. Run responsive polish and visual QA.

This order is deliberate:

- the toolbar and left panel currently create the biggest consistency gap
- the right panel already provides a useful reference target
- the stage should be upgraded after the surrounding UI language is stable

---

## Explicit Non-Goals

This plan does **not** include:

- changing business logic
- changing Zustand store shape
- redesigning chemistry interactions
- replacing the beaker/effects system
- renaming `clay-*` tokens back to `--color-*`
- rebuilding the app into the exact marketing-site structure from `FRONTEND_SYSTEM.md`

The goal is to **translate that design language onto ChemLab**, not to erase the product’s existing structure.

---

## Final Recommendation

Use `featurecard_plan.md` as the foundation-system plan.
Use this file as the page-integration plan.

Together they form a safe implementation strategy:

- `featurecard_plan.md` defines the design language safely
- `chemlab_ui_upgrade_plan.md` applies that language coherently across the actual ChemLab page
