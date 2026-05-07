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
- [x] Xóa `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` khỏi `package.json`
- [x] Chạy `npm install` để cập nhật node_modules
- [x] Xóa toàn bộ import `@dnd-kit/*` trong tất cả files
- [x] Xóa DndContext, DragOverlay, useDraggable, useDroppable, CSS.Translate khỏi code
- [x] Xóa `PouringAnimation.tsx` nếu nó chỉ phục vụ DnD flow
- [x] Xóa `src/utils/collision.ts`

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
- [x] Left panel: `w-60 flex-shrink-0 bg-white border-r`
- [x] Center: `flex-1 relative overflow-hidden bg-slate-100`
- [x] Right panel: `w-72 flex-shrink-0 bg-white border-l overflow-y-auto`
- [x] Không còn kệ hóa chất trong center

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 1-2 — Workbench Center (không có kệ)

**Files:**
- `src/components/chemlab/scene/LabWorkbench.tsx` *(rewrite)*
- `src/utils/color.ts` *(create nếu chưa có)*

**Checklist:**
- [x] Xóa hoàn toàn kệ hóa chất
- [x] Mặt bàn hiện đại: `bg-slate-200/50 rounded-2xl shadow-lg`
- [x] Beaker SVG lớn (~180x240px), đặt chính giữa
- [x] Liquid fill: `height = beakerLiquidLevel%`, `transition: height 0.6s cubic-bezier(0.34,1.56,0.64,1)`
- [x] Vạch đo mL ở cạnh phải beaker
- [x] `blendColors(colors: string[]): string` trong `src/utils/color.ts`

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
- [x] `addToBeaker(chemical)` — no dupes, +15 level, update canPlay
- [x] `removeFromBeaker(formula)` — -15 level
- [x] `clearBeaker()` — reset all
- [x] `undoLastChemical()` — remove last, -15 level
- [x] `setEnvironment(env)` — update conditions
- [x] `runReaction()` — try API → catch → fallback mock, auto-clear isReacting 3000ms

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 1-4 — Left Panel: ConditionPanel

**Files:**
- `src/components/chemlab/panels/ConditionPanel.tsx` *(create)*

**Checklist:**
- [x] List beakerContents: dot màu + formula + nút xóa
- [x] Placeholder "Chưa có hoá chất" khi rỗng
- [x] Slider nhiệt độ 0-500°C
- [x] Select áp suất: 0.5 / 1 / 2 / 5 atm
- [x] Select xúc tác: Không / MnO₂ / Fe / Pt / Ni / V₂O₅
- [x] Nút Play: `bg-emerald-500 rounded-xl w-full py-3`, disabled khi !canPlay
- [x] Nút Hoàn tác (outline) + Nút Xóa tất cả

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 1-5 — Right Panel: ChemicalLibrary

**Files:**
- `src/components/chemlab/panels/ChemicalLibrary.tsx` *(create)*

**Checklist:**
- [x] Search input, filter tabs theo category
- [x] List item: dot màu + tên + formula + badge
- [x] Click → `addToBeaker()` với `whileTap={{ scale: 0.95 }}`
- [x] Chất đã có: dim + icon ✓, không click được
- [x] Không có drag handle

**Verify:** `npx tsc --noEmit` → 0 errors

---

### Phase 1 — Acceptance Criteria

- [x] `npx tsc --noEmit` → 0 errors
- [x] 0 import từ @dnd-kit
- [x] Click hoá chất → liquid dâng lên
- [x] Không thêm trùng
- [x] Play disabled khi < 2 chất
- [x] Center không có kệ, layout 3 cột

---

## 🔴 Phase 2 — Hiệu ứng phản ứng + Result Display

> Prerequisite: Phase 1 pass.

---

### TASK 2-1 — ReactionResultCard

**Files:**
- `src/components/chemlab/scene/ReactionResultCard.tsx` *(create)*

**Checklist:**
- [x] Absolute, bottom center stage, width ~90%, centered
- [x] equation + badge loại phản ứng + messageVi
- [x] Framer Motion: initial opacity:0 y:30 → animate opacity:1 y:0
- [x] AnimatePresence + exit
- [x] Chỉ render khi `lastReaction?.hasReaction === true`
- [x] Style: `bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl`

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 2-2 — GasBubbleEffect

**Files:**
- `src/components/chemlab/effects/GasBubbleEffect.tsx` *(create)*

**Checklist:**
- [x] SVG circles float lên từ đáy beaker
- [x] Spawn interval = `200ms / effectSpeed`
- [x] Formula khí nhỏ (H₂, CO₂) nổi theo bubble
- [x] Chỉ render khi `activeEffect?.type === 'GAS_BUBBLE'`
- [x] Cleanup clearInterval khi unmount

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 2-3 — PrecipitateEffect

**Files:**
- `src/components/chemlab/effects/PrecipitateEffect.tsx` *(create)*

**Checklist:**
- [x] 20-30 particles rơi xuống đáy, staggered delay
- [x] Color = `activeEffect.precipitateColor ?? '#e0e0e0'`
- [x] Chỉ render khi `activeEffect?.type === 'PRECIPITATE'`

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 2-4 — HeatEffect

**Files:**
- `src/components/chemlab/effects/HeatEffect.tsx` *(create)*

**Checklist:**
- [x] Hơi nóng mờ bốc lên từ miệng beaker
- [x] Gradient cam-đỏ nhạt, glow xung quanh beaker
- [x] Chỉ render khi `activeEffect?.type === 'HEAT'`

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 2-5 — ExplosionEffect

**Files:**
- `src/components/chemlab/effects/ExplosionEffect.tsx` *(create)*
- `src/app/globals.css` *(thêm keyframes)*

**Checklist:**
- [x] White flash overlay + screen shake + sparks
- [x] Warning text "⚠️ Phản ứng nguy hiểm!" 2s
- [x] globals.css thêm @keyframes shake và @keyframes flash
- [x] Chỉ trigger khi `activeEffect?.type === 'EXPLOSION'`

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 2-6 — effectSpeed theo nhiệt độ

**Files:**
- `src/stores/lab-store.ts` *(modify)*
- `src/components/chemlab/effects/GasBubbleEffect.tsx` *(modify)*

**Checklist:**
- [x] `effectSpeed = Math.min(temperature / 25, 10)` trong store
- [x] GasBubbleEffect dùng effectSpeed để điều chỉnh spawn interval

**Verify:** `npx tsc --noEmit` → 0 errors

---

### Phase 2 — Acceptance Criteria

- [x] `npx tsc --noEmit` → 0 errors
- [x] HCl + NaOH → ReactionResultCard xuất hiện
- [x] HCl + Zn → Gas bubble + formula H₂
- [x] AgNO₃ + NaCl → Precipitate rơi xuống đáy
- [x] 200°C → bubble nhanh hơn 25°C
- [x] Reset → effects dừng + card biến mất

---

## 🔴 Phase 3 — Offline Mock + Presets

> Prerequisite: Phase 2 pass.

---

### TASK 3-1 — reaction-mock.ts

**Files:**
- `src/utils/reaction-mock.ts` *(create)*

**Checklist:**
- [x] Import type ReactionResult từ @/types/api — KHÔNG tạo lại
- [x] `getMockReaction(reactants: string[]): ReactionResult`
- [x] Key = `reactants.map(r => r.toLowerCase()).sort().join('+')`
- [x] 10 reactions với đủ fields: messageVi, explanationVi, safetyNoteVi, basicExplanation, intermediateExplanation, advancedExplanation
- [x] NO_REACTION fallback
- [x] Field là `messageVi` không phải `observationVi`

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
- [x] try mixChemicals() → catch → getMockReaction(formulas)
- [x] Fallback: KHÔNG set error state, KHÔNG show toast
- [x] formulas = `beakerContents.map(c => c.formula)`

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 3-3 — PresetSelector

**Files:**
- `src/components/chemlab/PresetSelector.tsx` *(create)*
- `src/components/chemlab/panels/ConditionPanel.tsx` *(modify)*

**5 presets:** Trung hoà / Kết tủa trắng / Sinh khí H₂ / Kết tủa xanh / Đổi màu tím

**Checklist:**
- [x] Click → clearBeaker() → delay 200ms → addToBeaker() từng chất (delay 300ms giữa)
- [x] Horizontal scroll chips ở top ConditionPanel

**Verify:** `npx tsc --noEmit` → 0 errors

---

### Phase 3 — Acceptance Criteria

- [x] Mock hoạt động khi BE offline
- [x] Preset load tuần tự có delay

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

**Verify:** `npx tsc --noEmit` → 0 errors (DONE)

---

### TASK 4-2 — ExperimentTimeline component

**Files:**
- `src/components/chemlab/timeline/ExperimentTimeline.tsx` *(create)*
- `src/components/chemlab/panels/ConditionPanel.tsx` *(modify — thêm ở bottom)*

**Checklist:**
- [x] Horizontal scroll, chips với icon theo type
- [x] Auto-scroll đến item mới nhất
- [x] Placeholder "Chưa có thao tác nào"

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

- [x] Skip khi focus input/textarea
- [x] Space phải e.preventDefault()

**Verify:** `npx tsc --noEmit` → 0 errors

---

### Phase 4 — Acceptance Criteria

- [x] Timeline đúng sau mỗi action
- [x] Space → reaction, Z → undo, R → reset
- [x] Shortcuts không trigger khi gõ search

---

## 🔴 Phase 5 — ExplanationPanel 3 cấp + Polish

> Prerequisite: Phase 4 pass.

---

### TASK 5-1 — ExplanationPanel

**Files:**
- `src/components/chemlab/panels/ExplanationPanel.tsx` *(create)*
- `src/components/chemlab/ChemLabShell.tsx` *(modify)*

**Checklist:**
- [x] 3 tabs Radix Tabs: Cơ bản / Trung cấp / Nâng cao
- [x] Cơ bản → basicExplanation (ngôn ngữ phổ thông)
- [x] Trung cấp → intermediateExplanation (cơ chế phản ứng)
- [x] Nâng cao → advancedExplanation (ion rút gọn, ΔG) — tích hợp số liệu định lượng vào text
- [x] safetyNoteVi: bg-amber-50 border-amber-200
- [x] Placeholder khi lastReaction === null

**Verify:** `npx tsc --noEmit` → 0 errors

---

### TASK 5-2 — Font + CSS Polish

**Files:**
- `src/app/globals.css` *(modify)*
- `src/app/layout.tsx` *(modify)*

**Checklist:**
- [x] Import DM_Sans từ next/font/google, variable --font-dm-sans
- [x] --font-sans: var(--font-dm-sans, 'DM Sans', system-ui, sans-serif)
- [x] Giữ Plus Jakarta Sans cho --font-display
- [x] Xác nhận @keyframes shake, flash, particle-fall có trong globals.css

**Verify:** `npx tsc --noEmit` → 0 errors

---

### Phase 5 — Acceptance Criteria

- [x] 3 tabs switch đúng, content khác nhau
- [x] Số liệu định lượng trong text, không có input riêng
- [x] Safety note background vàng
- [x] Font DM Sans active

---

## 📋 Master Checklist

- [x] Phase 1: 0 @dnd-kit import, click-to-add hoạt động, layout 3 cột
- [x] Phase 2: Gas/Precipitate/Heat/Explosion effects, nhiệt độ ảnh hưởng tốc độ
- [x] Phase 3: Mock offline, preset load tuần tự
- [x] Phase 4: Timeline, keyboard shortcuts
- [x] Phase 5: 3-tab explanation, font DM Sans

---

## Không làm

- Không dùng lại code DnD
- Không có kệ hóa chất ở center
- Không auto-trigger reaction — phải bấm Play
- Không input nhập số mol/nồng độ
- Không cài package ngoài task cho phép

## 🔴 Phase 6 — Fix Bug Normalization & Reliability

### TASK 6-1 — Fix Normalization Logic [DONE]
**What to build**: Sửa `LabMixService` lấy kết quả từ `chemicalResolverService.resolve()`. Cập nhật `allFormulae` bằng `canonicalFormula`. Đảm bảo `reactionKey` luôn chuẩn.
**Acceptance criteria**:
- [x] `LabMixService` dùng kết quả resolve.
- [x] `allFormulae` chứa công thức chuẩn.
- [x] `reactionKey` không còn chứa "Copper Sulfate".
**Blocked by**: None.

---

### TASK 6-2 — Localization & Fallback [DONE]
**What to build**: Việt hóa toàn bộ thông báo trong `ReactionPredictionService` và `AiClient` Mock.
**Acceptance criteria**:
- [x] `fallbackDto` dùng tiếng Việt.
- [x] `getMockReaction` dùng tiếng Việt cho `messageVi`.
- [x] Xóa message tiếng Anh dư thừa.
**Blocked by**: None.

---

### TASK 6-3 — Normalization Integration Tests (TDD) [DONE]
**What to build**: Viết Integration Test cho luồng Mix. Input tên thô -> Verify chuẩn hóa -> Verify kết quả.
**Acceptance criteria**:
- [x] Test gọi `/api/lab/mix` với "Copper Sulfate" pass.
- [x] Verify `reactionKey` đúng định dạng.
- [x] Chạy `mvn test` pass 100%.
**Blocked by**: 6-1.
