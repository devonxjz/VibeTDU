# TASKS — ChemLab Dev Tracker (PRO Strategy)

> **Agent rules:**
> 1. Đọc README.md trước khi làm bất cứ thứ gì.
> 2. Làm từng task một — không skip, không làm song song.
> 3. Sau mỗi task chạy `npx tsc --noEmit`. Không pass → không sang task tiếp.
> 4. Chỉ được touch file trong danh sách **Files** của từng task.
> 5. Không xóa code đang hoạt động — chỉ extend.
> 6. Tất cả UI text dùng tiếng Việt.

---

## 🔴 Phase 1 — Nền tảng mới (Migration + Layout)

> Bỏ toàn bộ dnd-kit. Xây lại layout theo chiến lược PRO.
> Đây là phase nền — mọi phase sau phụ thuộc vào phase này.

---

### TASK 1-0 — Gỡ dnd-kit hoàn toàn

**Files:**
- `package.json` *(modify)*
- `src/components/chemlab/ChemLabShell.tsx` *(modify)*
- Bất kỳ file nào đang import từ `@dnd-kit/*`

**Checklist:**
- [ ] Xóa `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` khỏi `package.json`
- [ ] Chạy `npm install` để cập nhật node_modules
- [ ] Xóa toàn bộ import `@dnd-kit/*` trong tất cả files
- [ ] Xóa DndContext, DragOverlay, useDraggable, useDroppable, CSS.Translate khỏi code
- [ ] Xóa `PouringAnimation.tsx` nếu nó chỉ phục vụ DnD flow
- [ ] Xóa `src/utils/collision.ts`

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 1-1 — Layout 3 cột mới

**Files:**
- `src/components/chemlab/ChemLabShell.tsx` *(rewrite)*
- `src/app/globals.css` *(modify)*

**Layout:**
```
[LEFT 240px] | [CENTER flex-1] | [RIGHT 280px]
ConditionPanel  Beaker + Effects  ChemicalLibrary
```

**Checklist:**
- [ ] Left panel: `w-60 flex-shrink-0 bg-white border-r`
- [ ] Center: `flex-1 relative overflow-hidden bg-slate-100`
- [ ] Right panel: `w-72 flex-shrink-0 bg-white border-l overflow-y-auto`
- [ ] Không còn kệ hóa chất trong center

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 1-2 — Workbench Center (không có kệ)

**Files:**
- `src/components/chemlab/scene/LabWorkbench.tsx` *(rewrite)*
- `src/utils/color.ts` *(create nếu chưa có)*

**Checklist:**
- [ ] Xóa hoàn toàn kệ hóa chất
- [ ] Mặt bàn hiện đại: `bg-slate-200/50 rounded-2xl shadow-lg`
- [ ] Beaker SVG lớn (~180x240px), đặt chính giữa
- [ ] Liquid fill: `height = beakerLiquidLevel%`, `transition: height 0.6s cubic-bezier(0.34,1.56,0.64,1)`
- [ ] Vạch đo mL ở cạnh phải beaker
- [ ] `blendColors(colors: string[]): string` trong `src/utils/color.ts`

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 1-3 — Store: click-to-add flow

**Files:**
- `src/stores/lab-store.ts` *(modify — ADD ONLY)*
- `src/types/lab.ts` *(modify nếu thiếu)*

**State:**
```ts
beakerContents: VesselContent[]
beakerLiquidLevel: number        // 0-100
isLoading: boolean
canPlay: boolean                 // length >= 2 && !isLoading
lastReaction: ReactionResult | null
activeEffect: ActiveEffect | null
isReacting: boolean
temperature: number              // 25
pressure: number                 // 1
catalyst: string                 // 'Không'
```

**Actions:**
- `addToBeaker(chemical)` — no dupes, +15 level, update canPlay
- `removeFromBeaker(formula)` — -15 level
- `clearBeaker()` — reset all
- `undoLastChemical()` — remove last, -15 level
- `setEnvironment(env)` — update conditions
- `runReaction()` — try API → catch → fallback mock, auto-clear isReacting 3000ms

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 1-4 — Left Panel: ConditionPanel

**Files:**
- `src/components/chemlab/panels/ConditionPanel.tsx` *(create)*

**Checklist:**
- [ ] List beakerContents: dot màu + formula + nút xóa
- [ ] Placeholder "Chưa có hoá chất" khi rỗng
- [ ] Slider nhiệt độ 0-500°C
- [ ] Select áp suất: 0.5 / 1 / 2 / 5 atm
- [ ] Select xúc tác: Không / MnO₂ / Fe / Pt / Ni / V₂O₅
- [ ] Nút Play: `bg-emerald-500 rounded-xl w-full py-3`, disabled khi !canPlay
- [ ] Nút Hoàn tác (outline) + Nút Xóa tất cả

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 1-5 — Right Panel: ChemicalLibrary

**Files:**
- `src/components/chemlab/panels/ChemicalLibrary.tsx` *(create)*

**Checklist:**
- [ ] Search input, filter tabs theo category
- [ ] List item: dot màu + tên + formula + badge
- [ ] Click → `addToBeaker()` với `whileTap={{ scale: 0.95 }}`
- [ ] Chất đã có: dim + icon ✓, không click được
- [ ] Không có drag handle

**Verify:** `npx tsc --noEmit` → 0 errors

---

### Phase 1 — Acceptance Criteria

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] 0 import từ @dnd-kit
- [ ] Click hoá chất → liquid dâng lên
- [ ] Không thêm trùng
- [ ] Play disabled khi < 2 chất
- [ ] Center không có kệ, layout 3 cột

---

## 🔴 Phase 2 — Hiệu ứng phản ứng + Result Display

> Prerequisite: Phase 1 pass.

---

### TASK 2-1 — ReactionResultCard

**Files:**
- `src/components/chemlab/scene/ReactionResultCard.tsx` *(create)*

**Checklist:**
- [ ] Absolute, bottom center stage, width ~90%, centered
- [ ] equation + badge loại phản ứng + messageVi
- [ ] Framer Motion: initial opacity:0 y:30 → animate opacity:1 y:0
- [ ] AnimatePresence + exit
- [ ] Chỉ render khi `lastReaction?.hasReaction === true`
- [ ] Style: `bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl`

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 2-2 — GasBubbleEffect

**Files:**
- `src/components/chemlab/effects/GasBubbleEffect.tsx` *(create)*

**Checklist:**
- [ ] SVG circles float lên từ đáy beaker
- [ ] Spawn interval = `200ms / effectSpeed`
- [ ] Formula khí nhỏ (H₂, CO₂) nổi theo bubble
- [ ] Chỉ render khi `activeEffect?.type === 'GAS_BUBBLE'`
- [ ] Cleanup clearInterval khi unmount

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 2-3 — PrecipitateEffect

**Files:**
- `src/components/chemlab/effects/PrecipitateEffect.tsx` *(create)*

**Checklist:**
- [ ] 20-30 particles rơi xuống đáy, staggered delay
- [ ] Color = `activeEffect.precipitateColor ?? '#e0e0e0'`
- [ ] Chỉ render khi `activeEffect?.type === 'PRECIPITATE'`

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 2-4 — HeatEffect

**Files:**
- `src/components/chemlab/effects/HeatEffect.tsx` *(create)*

**Checklist:**
- [ ] Hơi nóng mờ bốc lên từ miệng beaker
- [ ] Gradient cam-đỏ nhạt, glow xung quanh beaker
- [ ] Chỉ render khi `activeEffect?.type === 'HEAT'`

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 2-5 — ExplosionEffect

**Files:**
- `src/components/chemlab/effects/ExplosionEffect.tsx` *(create)*
- `src/app/globals.css` *(thêm keyframes)*

**Checklist:**
- [ ] White flash overlay + screen shake + sparks
- [ ] Warning text "⚠️ Phản ứng nguy hiểm!" 2s
- [ ] globals.css thêm @keyframes shake và @keyframes flash
- [ ] Chỉ trigger khi `activeEffect?.type === 'EXPLOSION'`

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 2-6 — effectSpeed theo nhiệt độ

**Files:**
- `src/stores/lab-store.ts` *(modify)*
- `src/components/chemlab/effects/GasBubbleEffect.tsx` *(modify)*

**Checklist:**
- [ ] `effectSpeed = Math.min(temperature / 25, 10)` trong store
- [ ] GasBubbleEffect dùng effectSpeed để điều chỉnh spawn interval

**Verify:** `npx tsc --noEmit` → 0 errors

---

### Phase 2 — Acceptance Criteria

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] HCl + NaOH → ReactionResultCard xuất hiện
- [ ] HCl + Zn → Gas bubble + formula H₂
- [ ] AgNO₃ + NaCl → Precipitate rơi xuống đáy
- [ ] 200°C → bubble nhanh hơn 25°C
- [ ] Reset → effects dừng + card biến mất

---

## 🔴 Phase 3 — Offline Mock + Presets

> Prerequisite: Phase 2 pass.

---

### TASK 3-1 — reaction-mock.ts

**Files:**
- `src/utils/reaction-mock.ts` *(create)*

**Checklist:**
- [ ] Import type ReactionResult từ @/types/api — KHÔNG tạo lại
- [ ] `getMockReaction(reactants: string[]): ReactionResult`
- [ ] Key = `reactants.map(r => r.toLowerCase()).sort().join('+')`
- [ ] 10 reactions với đủ fields: messageVi, explanationVi, safetyNoteVi, basicExplanation, intermediateExplanation, advancedExplanation
- [ ] NO_REACTION fallback
- [ ] Field là `messageVi` không phải `observationVi`

**10 reactions:**

| Key | effectType |
|---|---|
| hcl+naoh | COLOR_CHANGE |
| bacl2+h2so4 | PRECIPITATE |
| agno3+nacl | PRECIPITATE |
| cuso4+naoh | PRECIPITATE |
| hcl+zn | GAS_BUBBLE |
| hcl+na2co3 | GAS_BUBBLE |
| h2so4+kmno4 | COLOR_CHANGE |
| fe+hcl | GAS_BUBBLE |
| ca+h2o | GAS_BUBBLE |
| hcl+mg | GAS_BUBBLE |

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 3-2 — Offline fallback

**Files:**
- `src/stores/lab-store.ts` *(modify)*

**Checklist:**
- [ ] try mixChemicals() → catch → getMockReaction(formulas)
- [ ] Fallback: KHÔNG set error state, KHÔNG show toast
- [ ] formulas = `beakerContents.map(c => c.formula)`

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 3-3 — PresetSelector

**Files:**
- `src/components/chemlab/PresetSelector.tsx` *(create)*
- `src/components/chemlab/panels/ConditionPanel.tsx` *(modify)*

**5 presets:** Trung hoà / Kết tủa trắng / Sinh khí H₂ / Kết tủa xanh / Đổi màu tím

**Checklist:**
- [ ] Click → clearBeaker() → delay 200ms → addToBeaker() từng chất (delay 300ms giữa)
- [ ] Horizontal scroll chips ở top ConditionPanel

**Verify:** `npx tsc --noEmit` → 0 errors

---

### Phase 3 — Acceptance Criteria

- [ ] Mock hoạt động khi BE offline
- [ ] Preset load tuần tự có delay

---

## 🔴 Phase 4 — Timeline + Keyboard Shortcuts

> Prerequisite: Phase 3 pass.

---

### TASK 4-1 — TimelineEvent + store

**Files:**
- `src/types/lab.ts` *(modify)*
- `src/stores/lab-store.ts` *(modify)*

```ts
interface TimelineEvent {
  id: string           // nanoid(6)
  timestamp: string    // HH:MM:SS
  type: 'ADD' | 'REACT' | 'UNDO' | 'RESET' | 'PRESET'
  description: string
}
```

Wire: addToBeaker→ADD / runReaction→REACT / undoLastChemical→UNDO / clearBeaker→RESET+clearTimeline

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 4-2 — ExperimentTimeline component

**Files:**
- `src/components/chemlab/timeline/ExperimentTimeline.tsx` *(create)*
- `src/components/chemlab/panels/ConditionPanel.tsx` *(modify — thêm ở bottom)*

**Checklist:**
- [ ] Horizontal scroll, chips với icon theo type
- [ ] Auto-scroll đến item mới nhất
- [ ] Placeholder "Chưa có thao tác nào"

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 4-3 — Keyboard Shortcuts

**Files:**
- `src/components/chemlab/ChemLabShell.tsx` *(modify)*

| Key | Action | Điều kiện |
|---|---|---|
| Z / Ctrl+Z | undoLastChemical() | luôn |
| R | clearBeaker() | luôn |
| Space / Enter | runReaction() | canPlay === true |

- [ ] Skip khi focus input/textarea
- [ ] Space phải e.preventDefault()

**Verify:** `npx tsc --noEmit` → 0 errors

---

### Phase 4 — Acceptance Criteria

- [ ] Timeline đúng sau mỗi action
- [ ] Space → reaction, Z → undo, R → reset
- [ ] Shortcuts không trigger khi gõ search

---

## 🔴 Phase 5 — ExplanationPanel 3 cấp + Polish

> Prerequisite: Phase 4 pass.

---

### TASK 5-1 — ExplanationPanel

**Files:**
- `src/components/chemlab/panels/ExplanationPanel.tsx` *(create)*
- `src/components/chemlab/ChemLabShell.tsx` *(modify)*

**Checklist:**
- [ ] 3 tabs Radix Tabs: Cơ bản / Trung cấp / Nâng cao
- [ ] Cơ bản → basicExplanation (ngôn ngữ phổ thông)
- [ ] Trung cấp → intermediateExplanation (cơ chế phản ứng)
- [ ] Nâng cao → advancedExplanation (ion rút gọn, ΔG) — tích hợp số liệu định lượng vào text
- [ ] safetyNoteVi: bg-amber-50 border-amber-200
- [ ] Placeholder khi lastReaction === null

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 5-2 — Font + CSS Polish

**Files:**
- `src/app/globals.css` *(modify)*
- `src/app/layout.tsx` *(modify)*

**Checklist:**
- [ ] Import DM_Sans từ next/font/google, variable --font-dm-sans
- [ ] --font-sans: var(--font-dm-sans, 'DM Sans', system-ui, sans-serif)
- [ ] Giữ Plus Jakarta Sans cho --font-display
- [ ] Xác nhận @keyframes shake, flash, particle-fall có trong globals.css

**Verify:** `npx tsc --noEmit` → 0 errors

---

### Phase 5 — Acceptance Criteria

- [ ] 3 tabs switch đúng, content khác nhau
- [ ] Số liệu định lượng trong text, không có input riêng
- [ ] Safety note background vàng
- [ ] Font DM Sans active

---

## 📋 Master Checklist

- [ ] Phase 1: 0 @dnd-kit import, click-to-add hoạt động, layout 3 cột
- [ ] Phase 2: Gas/Precipitate/Heat/Explosion effects, nhiệt độ ảnh hưởng tốc độ
- [ ] Phase 3: Mock offline, preset load tuần tự
- [ ] Phase 4: Timeline, keyboard shortcuts
- [ ] Phase 5: 3-tab explanation, font DM Sans

---

## Không làm

- Không dùng lại code DnD
- Không có kệ hóa chất ở center
- Không auto-trigger reaction — phải bấm Play
- Không input nhập số mol/nồng độ
- Không cài package ngoài task cho phép