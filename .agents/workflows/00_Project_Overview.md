# ChemLab — Interactive 2.5D Virtual Chemistry Lab

> **For coding agents:** Read this file FIRST. Follow phases in order. Each phase must pass its acceptance criteria before moving on. The client-side mock reaction engine (`reaction-mock.ts`) is the **primary** reaction source — backend API is optional for MVP.

---

## Project Overview

ChemLab is an **interactive chemistry lab** focused on education. Users drag chemicals, run experiments visually, adjust conditions, observe realistic effects, and **understand WHY reactions happen**.

The UI is a **2.5D isometric lab** (CSS/SVG — not a 3D engine):
- **Center:** lab workbench with main beaker
- **Left panel:** Chemical Library (searchable, filterable)
- **Right panel:** Reaction Controls + Observation + Explanation
- **Bottom:** Current Tray (max 8 chemicals) + Experiment Timeline

---

## MVP Definition

> **The MVP is complete when a user can:**

1. ✅ See a 2.5D lab environment on load
2. ✅ Browse and search chemicals in the Chemical Library
3. ✅ Add chemicals to the Current Tray (max 8)
4. ✅ Drag a chemical from the tray into the beaker
5. ✅ Trigger a **mock reaction** (no backend required)
6. ✅ See visual effects (color change, precipitate, bubbles)
7. ✅ Read a simple text explanation of the reaction
8. ✅ Adjust basic conditions (temperature, catalyst)
9. ✅ Reset the experiment and start over

**If these 9 criteria are met, the MVP ships.**

---

## Non-Goals (MVP)

Do NOT build these for MVP:

| Non-Goal | Reason |
|----------|--------|
| Full 3D rendering engine | CSS/SVG 2.5D is sufficient |
| Complete chemistry database (1000+ chemicals) | 80–100 curated chemicals is enough |
| Real AI reaction prediction | Mock engine covers MVP; AI is optional enhancement |
| Multiplayer / collaborative mode | Single-user only |
| User accounts & authentication | Not needed for learning demo |
| Cloud sync / server persistence | localStorage only |
| Notebook with PDF export | Post-MVP feature |
| Ion view / particle view modes | Post-MVP feature |
| Mobile-first responsive design | Desktop-first (min 1280×720) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript** |
| UI Library | **React 19** |
| Styling | **Tailwind CSS v4** + CSS custom properties |
| State | **Zustand** |
| Drag & Drop | **@dnd-kit/core** + @dnd-kit/sortable |
| Animation | **Framer Motion** |
| UI Primitives | **Radix UI** |
| Icons | **Lucide React** |
| Backend (optional) | **Spring Boot** + Gemini AI |

---

## Current State Assessment

### ✅ Already Built
- `ChemLabShell` — DnD context wrapper with overlay
- `Board` — canvas area for vessels
- `Vessel` — beaker with colored liquid fill
- `SearchPanel` — chemical search with category chips
- `PropertiesPanel` — right panel for vessel info
- `Toolbar` — top bar with reset/environment controls
- `PouringAnimation` — bottle-pour on drop
- Visual Effects — `GasBubbleEffect`, `PrecipitateEffect`, `ColorChangeEffect`, `HeatEffect`, `ExplosionEffect`
- Chemical Database — 80+ chemicals, 6 categories, realistic colors
- Lab Store (Zustand) — vessels, effects, mixing, environment
- API Client — `mixChemicals()`, `resetSession()`
- Chatbot Widget — AI assistant
- Type System — full DTOs (`api.ts`, `lab.ts`)

### ❌ Not Yet Built
- 2.5D isometric scene (shelf, workbench, burner)
- Chemical Library with favorites, recently used
- Current Tray (bottom bar)
- Reaction Control Panel (sliders)
- `reaction-mock.ts` (client-side reaction engine)
- Explanation panel (multi-level)
- Experiment Timeline
- Safety warning system
- Smart hints
- Undo / redo
- Preset experiments

---

## Data Flow

```
Chemical Library
    │ (click "+")
    ▼
Current Tray (max 8 slots)
    │ (drag)
    ▼
Beaker Drop Zone
    │ (auto-merge chemicals)
    ▼
reaction-mock.ts  ◄── primary
    │                   (fallback if API fails)
    │   OR
    ▼
Backend API (/api/lab/mix)  ◄── optional/secondary
    │
    ▼
┌─────────────────────────────┐
│  Reaction Result            │
│  - equation                 │
│  - observation              │
│  - effectType               │
│  - explanation              │
│  - safetyNote               │
└──────┬──────────┬───────────┘
       │          │
       ▼          ▼
Visual Effects    Explanation Panel
(beaker FX)       (right side)
       │
       ▼
Experiment Timeline (append step)
```

**Key rule:** `reaction-mock.ts` is always available. Backend API is attempted first only if configured and reachable; otherwise mock is used silently.

---

## State Architecture

Suggested Zustand store shape (single store or split slices):

```typescript
interface LabStore {
  // ─── Chemicals ────────────────────────────────
  chemicals: Chemical[];           // full catalog (loaded once)
  recentlyUsed: string[];          // chemical IDs, max 5
  favorites: string[];             // persisted in localStorage

  // ─── Current Tray ─────────────────────────────
  tray: TrayItem[];                // max 8 items
  addToTray: (chemical: Chemical) => void;
  removeFromTray: (id: string) => void;
  clearTray: () => void;

  // ─── Beaker ───────────────────────────────────
  beakerContents: VesselContent[]; // chemicals added to beaker
  beakerColor: string;             // current liquid color
  beakerLiquidLevel: number;       // 0–100%

  // ─── Environment ──────────────────────────────
  temperature: number;             // °C, default 25
  pressure: number;                // atm, default 1.0
  catalyst: string;                // "None" | "Pt" | "MnO2" | ...
  pH: number;                      // 1–14, default 7
  volume: number;                  // mL, default 50

  // ─── Reaction ─────────────────────────────────
  lastReaction: ReactionResult | null;
  isReacting: boolean;

  // ─── Effects ──────────────────────────────────
  activeEffect: ActiveEffect | null;

  // ─── History ──────────────────────────────────
  timeline: TimelineStep[];        // experiment step history
  undoStack: LabSnapshot[];        // for undo/redo

  // ─── UI ───────────────────────────────────────
  activePanelTab: string;          // Library | Equipment | Timeline
  explanationLevel: "basic" | "intermediate" | "advanced";
  isLoading: boolean;
  error: string | null;
}
```

**Note:** This is a target shape. Existing `lab-store.ts` should be incrementally refactored toward this structure across phases — not rewritten all at once.

---

## Error Handling Strategy

| Scenario | Behavior |
|----------|----------|
| API timeout (>5s) or network error | Silently fall back to `reaction-mock.ts`. Show small "offline mode" indicator. |
| Unknown reaction (mock has no match) | Show "No reaction observed under current conditions." No error state. |
| Invalid drop target | Beaker briefly flashes red border. Chemical returns to tray. Toast: "Drop onto the beaker." |
| Unsafe/dangerous reaction | Show warning modal BEFORE running reaction. User confirms or cancels. |
| Backend returns error | Log to console. Fall back to mock. User never sees raw errors. |
| Empty beaker + "run experiment" | Disabled state. Hint text: "Add at least 2 chemicals to begin." |

---

## Performance Budget

| Constraint | Rule |
|-----------|------|
| 2.5D rendering | CSS/SVG only. No WebGL, no canvas, no Three.js in MVP. |
| Chemical list | If >50 visible items, use virtualized list (`react-window` or CSS `content-visibility`). |
| Animations | Framer Motion for drag/pour/effects. Keep particle count ≤ 30 per effect. |
| Re-renders | Zustand selectors to avoid full-tree re-renders. `React.memo` on heavy components. |
| Bundle size | Lazy-load panels (Chemical Library, Explanation) via `React.lazy` / `next/dynamic`. |
| Images | SVG for all lab equipment. No raster images for scene elements. |
