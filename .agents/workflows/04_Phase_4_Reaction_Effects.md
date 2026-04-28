## Phase 4 — Reaction Engine & Visual Effects

### 🎯 Goal
Bring reactions to life with **visual effects**. Bubbles, precipitate, color transitions, heat glow. This is the "wow factor" phase. Also add preset experiments.

### 📦 Features
1. **Visual Effects (Framer Motion)**
   - Precipitate: particles drift down, settle at bottom
   - Gas bubbles: circles rise and pop
   - Color change: smooth liquid transition
   - Heat: edge glow + steam particles
   - No reaction: subtle shake + "No reaction" badge
   - Effect duration: 2–4 seconds, then auto-clear

2. **Beaker Enhancements** — product label above beaker, gradient liquid blending, precipitate layer at bottom.

3. **Backend API Integration (Optional)** — try `/api/lab/mix` first. On timeout/error, fall back to `reaction-mock.ts` silently. Show "🔬 Live" or "📦 Offline" indicator.

4. **Preset Experiments** — 5 built-in experiments as card grid:
   - Precipitation (AgNO₃ + NaCl)
   - Acid-base (HCl + NaOH)
   - Gas formation (CaCO₃ + HCl)
   - Redox (Zn + CuSO₄)
   - Color change (KMnO₄ + FeSO₄ + H₂SO₄)
   - Each auto-loads chemicals + conditions + runs reaction

### 🔧 Components
| Component | Status | Notes |
|-----------|--------|-------|
| `GasBubbleEffect.tsx` | Enhance | Configurable count |
| `PrecipitateEffect.tsx` | Enhance | Settle at bottom |
| `ColorChangeEffect.tsx` | Enhance | Gradient transition |
| `HeatEffect.tsx` | Enhance | Glow + steam |
| `NoReactionFeedback.tsx` | New | Shake + badge |
| `BeakerLiquid.tsx` | New | Multi-layer gradient |
| `ProductLabel.tsx` | New | Floating label |
| `PresetExperiments.tsx` | New | Card grid launcher |
| `api-bridge.ts` | New | API-first with mock fallback logic |

### ✅ Acceptance Criteria
- [ ] AgNO₃ + NaCl → white particles fall in beaker
- [ ] CaCO₃ + HCl → bubbles rise
- [ ] HCl + NaOH → color smoothly transitions
- [ ] Na + H₂O → heat glow + steam
- [ ] Unknown combo → shake + "No reaction" badge
- [ ] Preset experiment card auto-runs full experiment
- [ ] If backend is down, app works identically via mock
- [ ] Effects auto-clear after timeout
- [ ] Product label shows above beaker

### 🚫 Not in Phase 4
Multi-level explanations, experiment timeline, safety UI, notebook, ion/particle views.
