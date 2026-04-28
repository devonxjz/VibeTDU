## Phase 2 — Chemical Library & Current Tray

### 🎯 Goal
Let users **browse, search, and select chemicals**. Build the Chemical Library (left panel) and Current Tray (bottom bar). App feels interactive even before reactions work.

### 📦 Features
1. **Chemical Library Panel** — search input (debounced), category filter chips, chemical cards (name, formula with subscripts, category badge, "+" button), "Recently Used" row (max 5, localStorage), hover tooltip with properties.
2. **Current Tray** — horizontal bar, max 8 slots, bottle icon + formula + name per slot, "×" remove, count indicator "5/8", clear-all button, instruction text.
3. **Chemical Data** — enrich `chemicals.ts` with: state (solid/liquid/gas), hazard level (safe/caution/danger). Add Indicators category (litmus, phenolphthalein, methyl orange).

### 🔧 Components
| Component | Status | Notes |
|-----------|--------|-------|
| `ChemicalLibrary.tsx` | New | Left panel |
| `ChemicalCard.tsx` | New | List item |
| `CategoryFilter.tsx` | New | Filter chips |
| `CurrentTray.tsx` | New | Bottom bar |
| `TraySlot.tsx` | New | Single slot |
| `ChemicalTooltip.tsx` | New | Hover preview |
| `chemicals.ts` | Refactor | Add fields + indicators |

### ✅ Acceptance Criteria
- [ ] User can search chemicals by name or formula
- [ ] Category filter chips work (show/hide categories)
- [ ] Clicking "+" adds chemical to tray
- [ ] Tray shows max 8 items; "+" disabled when full
- [ ] Clicking "×" removes from tray
- [ ] "Recently Used" persists across page reloads (localStorage)
- [ ] Hover tooltip shows chemical properties
- [ ] List handles 80+ items without jank

### 🚫 Not in Phase 2
Drag-and-drop to beaker, reactions, visual effects, experiment controls.
