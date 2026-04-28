## Phase 1 — Lab Scene & App Shell

### 🎯 Goal
Build the 2.5D isometric lab visual and full application shell. All panel slots visible as placeholders. User sees a **beautiful chemistry lab** on first load.

### 📦 Features
1. **2.5D Lab Background** — isometric workbench, decorative shelf with bottles, category labels, equipment sprites (beaker, flask, burner), safety poster. All CSS/SVG.
2. **App Shell Layout** — top bar (logo, "New Experiment", settings), left sidebar nav icons, left panel slot, center lab scene, right panel slot, bottom tray slot, bottom timeline slot.
3. **Collapsible Panels** — reusable `PanelSlot` wrapper.
4. **Design Tokens** — CSS custom properties for colors, spacing, shadows, typography.

### 🔧 Components
| Component | Status | Notes |
|-----------|--------|-------|
| `AppShell.tsx` | New | Master layout |
| `LabScene.tsx` | New | 2.5D SVG background |
| `TopBar.tsx` | Refactor `Toolbar.tsx` | Match PRD design |
| `SideNav.tsx` | New | Icon rail |
| `PanelSlot.tsx` | New | Collapsible wrapper |
| `LabWorkbench.tsx` | New | Center beaker area |

### ✅ Acceptance Criteria
- [ ] Lab scene renders with isometric workbench and shelf background
- [ ] All 5 panel regions are visible (left, right, center, bottom tray, bottom timeline)
- [ ] Panels show "Coming soon" placeholder content
- [ ] Responsive down to 1280×720 without overflow
- [ ] No JS errors in console
- [ ] Page loads in < 2 seconds (dev mode)

### 🚫 Not in Phase 1
Chemical Library, Current Tray, drag-and-drop, reactions, effects, learning panels.
