## Phase 5 — Learning Features & Polish

### 🎯 Goal
Add the **learning layer** that fulfills the core promise: understanding WHY. Keep scope tight — only MVP learning features.

### 📦 Features (MVP Only)
1. **Explanation Tabs (Basic / Intermediate)**
   - Basic: plain language ("Acid meets base → salt + water")
   - Intermediate: formula-level explanation with ionic detail
   - Data sourced from `reaction-mock.ts` fields (no AI required)
   - "More Details" expands intermediate view

2. **Experiment Timeline (Bottom Strip)**
   - Horizontal step list: step #, action text, timestamp
   - Current step highlighted
   - Undo/Redo buttons in timeline bar
   - Reset clears timeline

3. **Basic Safety Warnings**
   - Hazard badges on dangerous chemicals in Library (⚠️ icon)
   - Warning modal before running dangerous reactions (strong acid + metal, toxic gas)
   - Safety note text in reaction result panel
   - Color severity: yellow (caution) → red (danger)

4. **Smart Hints**
   - After adding 1 chemical, show hint: "Try adding NaOH for a neutralization reaction"
   - Contextual tooltip based on chemical category
   - Dismissible, non-blocking

5. **UI Polish**
   - Smooth panel open/close transitions (Framer Motion)
   - Loading skeleton during reactions
   - Error boundary with friendly message
   - Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo)

### 🔧 Components
| Component | Status | Notes |
|-----------|--------|-------|
| `ExplanationTabs.tsx` | New | Basic / Intermediate tabs |
| `ExperimentTimeline.tsx` | New | Horizontal timeline |
| `TimelineStep.tsx` | New | Step card |
| `SafetyWarning.tsx` | New | Warning modal |
| `SafetyBadge.tsx` | New | Hazard icon on cards |
| `HintTooltip.tsx` | New | Contextual hints |

### ✅ Acceptance Criteria
- [ ] Explanation panel shows Basic and Intermediate tabs
- [ ] Switching tabs changes explanation content
- [ ] Timeline shows each experiment step with timestamp
- [ ] Undo/Redo in timeline works
- [ ] Dangerous chemicals show ⚠️ badge in Library
- [ ] Mixing strong acid + metal shows warning modal
- [ ] Safety note appears in reaction panel
- [ ] Smart hint appears after adding first chemical
- [ ] Ctrl+Z undoes last action
- [ ] All panel transitions are smooth (no layout jumps)

### 🚫 Not in Phase 5
Notebook, PDF export, ion view, particle view, advanced (ionic equation) explanations, AI-powered explanations, onboarding tour.
