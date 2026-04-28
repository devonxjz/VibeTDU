## Phase 3 — Drag-and-Drop & Basic Experiment Flow

### 🎯 Goal
Enable the core loop: **drag chemical from tray → drop into beaker → see reaction feedback**. This phase is split into two sub-steps to reduce risk.

---

### Phase 3A — Drag-and-Drop MVP

**Focus:** Get drag-and-drop working. No reaction logic yet.

#### Features
1. **Drag from Tray** — chemicals in Current Tray are draggable (@dnd-kit).
2. **Drop Zone** — center beaker highlights when dragged over (green border glow).
3. **Drag Overlay** — animated bottle follows cursor.
4. **Pour Animation** — on successful drop, bottle tips and liquid flows (existing `PouringAnimation`).
5. **Beaker State** — dropped chemical merges into `beakerContents[]`. Liquid level increases visually.
6. **Invalid Drop** — dropping outside beaker returns chemical with feedback.

#### Acceptance Criteria (3A)
- [ ] Chemical can be dragged from tray
- [ ] Beaker glows on drag-over
- [ ] Drop triggers pour animation
- [ ] Beaker liquid level increases after drop
- [ ] Dropping 2 chemicals shows both in beaker contents
- [ ] Invalid drop gives visual feedback

---

### Phase 3B — Reaction Controls & Basic Feedback

**Focus:** Add environment controls and show reaction results from mock engine.

#### Features
1. **Reaction Control Panel (Right)** — temperature slider (0–1000°C, default 25), pressure dropdown (0.1–10 atm, default 1.0), catalyst dropdown (None, Pt, MnO₂, Fe), pH selector (1–14, default 7), volume input (10–500 mL, default 50).
2. **Mock Reaction Trigger** — when ≥2 chemicals are in beaker, call `reaction-mock.ts`. Environment values passed as params.
3. **Reaction Result Card** — overlay showing equation (with subscripts), reaction type badge.
4. **Observation Text** — right panel: "A white precipitate forms…"
5. **Basic Explanation** — right panel: 1–2 sentence explanation.
6. **Experiment Actions** — Reset (clear beaker), Undo (remove last chemical), "New Experiment" in top bar.

#### `reaction-mock.ts` specification
```typescript
interface MockReactionInput {
  reactants: string[];       // formulas, e.g. ["HCl", "NaOH"]
  temperature: number;
  pressure: number;
  catalyst: string;
  pH: number;
  volume: number;
}

interface MockReactionOutput {
  hasReaction: boolean;
  equation: string;          // "HCl + NaOH → NaCl + H₂O"
  reactionType: string;      // "Acid-Base Neutralization"
  observation: string;       // "The solution warms slightly..."
  explanation: string;       // "The acid donates H⁺ ions..."
  safetyNote: string;        // "Mild exothermic reaction."
  effectType: EffectType;    // "COLOR_CHANGE" | "PRECIPITATE" | ...
  effectColor?: string;
  precipitateColor?: string;
  gasFormula?: string;
}

// Must include at least these 10 pre-built reactions:
// 1. HCl + NaOH (acid-base)
// 2. AgNO3 + NaCl (precipitation)
// 3. CaCO3 + HCl (gas formation)
// 4. Zn + CuSO4 (redox/displacement)
// 5. Na + H2O (vigorous metal + water)
// 6. BaCl2 + Na2SO4 (precipitation)
// 7. Fe + HCl (metal + acid)
// 8. NaOH + CuSO4 (precipitation, blue)
// 9. KMnO4 + FeSO4 + H2SO4 (color change)
// 10. Mg + HCl (gas formation)
```

#### Acceptance Criteria (3B)
- [ ] Reaction controls render with correct defaults
- [ ] Changing temperature/catalyst updates store
- [ ] Dropping HCl + NaOH into beaker triggers mock reaction
- [ ] Equation card shows balanced equation
- [ ] Observation text appears in right panel
- [ ] Explanation text appears in right panel
- [ ] Reset clears beaker and all panels
- [ ] Undo removes last chemical
- [ ] Works fully offline (no backend needed)

### 🔧 Components (Phase 3 combined)
| Component | Status | Notes |
|-----------|--------|-------|
| `BeakerDropZone.tsx` | New | Drop target + liquid fill |
| `ReactionControlPanel.tsx` | New | Right-side sliders/dropdowns |
| `ReactionResultCard.tsx` | New | Equation overlay |
| `ObservationPanel.tsx` | New | Right-side text |
| `ExplanationPanel.tsx` | New | Right-side explanation |
| `ExperimentActions.tsx` | New | Undo, Reset, New |
| `reaction-mock.ts` | **New — critical** | Client-side reaction engine |
| `lab-store.ts` | Refactor | Add beaker, undo stack, pH/volume |

### 🚫 Not in Phase 3
Advanced visual effects (particles, bubbles), preset experiments, multi-level explanations, timeline, safety warnings.
