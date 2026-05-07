# Beaker Stage Upgrade Plan

> Practical roadmap from the current 2.5D SVG/DOM stage toward a future 3D-lite reaction stage.

---

## Current State

The ChemLab center stage is currently:

- React + SVG + CSS gradients
- Framer Motion for timing and motion
- visually 2.5D, not real 3D

This means:

- good enough for UI-level depth
- not enough for premium liquid/material realism
- still limited for refraction, volumetric light, and convincing fluid behavior

---

## Goal

Create a staged path:

1. Max out the current stack first
2. Prove the art direction in the beaker area
3. Move only the center experiment stage to 3D-lite later

---

## Direction

### Phase 1: Advanced 2.5D Beaker

Upgrade the current `BeakerHero` using the existing stack:

- stronger glass material layering
- better liquid depth and surface treatment
- inner glow and caustic highlights
- reaction-aware lighting
- sediment and gas response that feel attached to the liquid
- better pedestal shadow and stage anchoring

Expected result:

- materially better than current SVG
- no new dependency
- still easy to maintain

### Phase 2: 3D-lite Prototype

Introduce a separate experiment-stage prototype using:

- `three`
- `@react-three/fiber`
- optional `@react-three/drei`

Only the beaker/stage moves to 3D-lite.
All sidebars, toolbar, cards, and shell remain standard React UI.

Expected result:

- real camera depth
- mesh-based glass
- shader-driven liquid surface
- much stronger premium feel

### Phase 3: Effect Migration

Move selected effects from DOM/SVG overlays into stage-local rendering:

- gas
- heat distortion
- liquid color diffusion
- shock/flash response

Leave text/result panels in the normal UI layer.

---

## Implementation Priority

1. `BeakerHero.tsx`
2. `LabWorkbench.tsx`
3. reaction effect alignment around the beaker
4. only then evaluate 3D-lite dependency adoption

---

## Decision

Implement now:

- Phase 1 fully

Defer:

- Phase 2 and 3 until the repo is ready to add 3D dependencies

This keeps momentum while avoiding a half-integrated 3D setup.
