# TASKS — ChemLab Dev Tracker
> Agent rules: Đọc README.md trước. Làm từng task một. Chỉ touch file trong "Files" list. Sau mỗi task chạy `npx tsc --noEmit` — không pass thì không sang task tiếp.

---

## ✅ Phase 1–2 — DONE. Không sửa.

---

## 🔴 Phase 3A — Drag & Drop MVP
> Prerequisite: Phase 2 pass. Không thêm reaction logic.

### TASK 3A-0 — Prep: Bổ sung chemicals + fix ChemBottle
- [ ] Thêm 8 chemicals mới vào `src/data/chemicals.ts` (nacl, caco3, zn, na, fe, mg, kmno4, feso4)
- [ ] Remove framer-motion `drag` khỏi `ChemBottle.tsx` (giữ `whileHover`)

### TASK 3A-1 — BeakerDropZone
**File:** `src/components/chemlab/scene/BeakerDropZone.tsx`
- [ ] `useDroppable({ id: 'beaker' })` 
- [ ] Khi `isOver === true`: border success + glow
- [ ] Khi `isOver === false`: border dashed
- [ ] Wrap existing `<LabWorkbench>` bên trong

### TASK 3A-2 — TraySlot draggable
**File:** `src/components/chemlab/CurrentTray.tsx` *(modify)*
- [ ] `useDraggable({ id: chemical.id })` cho mỗi filled slot
- [ ] `transform: CSS.Translate.toString(transform)` inline style
- [ ] `opacity: isDragging ? 0.4 : 1`

### TASK 3A-3 — DragOverlay + DnD Context
**File:** `src/components/chemlab/AppShell.tsx` *(modify)*
- [ ] Wrap layout bằng `<DndContext>`
- [ ] `onDragStart` → set `activeId`
- [ ] `onDragEnd` → if `over.id === 'beaker'` → `addToBeaker(activeId)`
- [ ] `<DragOverlay>` render MiniBottle inline

### TASK 3A-4 — Store: beakerContents
**File:** `src/stores/lab-store.ts` *(modify — chỉ thêm)*
- [ ] Thêm `beakerContents: []`, `beakerLiquidLevel: 0`
- [ ] `addToBeaker(chemicalId)` — no dupes, +15 level
- [ ] `clearBeaker()` — reset all
- [ ] Thêm `VesselContent` type vào `types/lab.ts`

### TASK 3A-5 — Beaker liquid fill visual
**File:** `src/components/chemlab/scene/LabWorkbench.tsx` *(modify)*
- [ ] Read `beakerLiquidLevel` từ store
- [ ] SVG liquid fill rect, height = level%, color = `blendColors()`
- [ ] Transition smooth
- [ ] Tạo `src/utils/color.ts` với `blendColors()`

### 3A — Acceptance Criteria
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] Kéo slot từ tray → cursor hiện bottle mini theo cùng
- [ ] Beaker border đổi màu xanh khi kéo qua
- [ ] Drop vào beaker → liquid level tăng visually
- [ ] Drop ra ngoài beaker → không có gì thay đổi
- [ ] Slot gốc opacity 0.4 khi đang drag
- [ ] Không thêm chemical trùng vào beaker

---

## 🔴 Phase 3B — Reaction Controls & Mock Engine
> Prerequisite: Phase 3A pass đủ 7 criteria.

### TASK 3B-1 — reaction-mock.ts ⚠️ CRITICAL
**File:** `src/utils/reaction-mock.ts`
- [ ] 10 hardcoded reactions với đúng interface `MockReactionOutput`
- [ ] `getMockReaction(input)` — sorted key lookup
- [ ] `NO_REACTION_RESULT` fallback

### TASK 3B-2 — ReactionControlPanel
**File:** `src/components/chemlab/panels/ReactionControlPanel.tsx`
- [ ] Temperature range 0–1000
- [ ] Pressure select
- [ ] pH range 1–14 với labels
- [ ] Catalyst select
- [ ] Volume select
- [ ] Stirring toggle
- [ ] Store fields + setters trong `lab-store.ts`

### TASK 3B-3 — Reaction trigger logic
**File:** `src/stores/lab-store.ts` *(modify)*
- [ ] `triggerReaction()` — gọi `getMockReaction()`, set state
- [ ] Auto-trigger khi `beakerContents.length >= 2`
- [ ] Auto-clear `isReacting` sau 3s

### TASK 3B-4 — ReactionResultCard
**File:** `src/components/chemlab/scene/ReactionResultCard.tsx`
- [ ] Overlay bottom của lab scene
- [ ] Hiển thị equation + type
- [ ] Framer motion fade-in

### TASK 3B-5 — ReactionInfoPanel
**File:** `src/components/chemlab/panels/ReactionInfoPanel.tsx`
- [ ] Observation section
- [ ] Explanation section
- [ ] Safety note section
- [ ] Placeholder khi chưa có reaction

### TASK 3B-6 — Reset & Undo
**File:** `src/stores/lab-store.ts`, `TopBar.tsx`
- [ ] `resetExperiment()` — clear all
- [ ] `undoLastChemical()` — remove last, -15 level
- [ ] Wire vào TopBar buttons

### 3B — Acceptance Criteria
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `getMockReaction({ reactants: ['hcl','naoh'], ... })` return đúng interface
- [ ] `getMockReaction` với reactants không match → `hasReaction: false`
- [ ] Drop HCl + NaOH vào beaker → ReactionResultCard xuất hiện
- [ ] Observation text xuất hiện trong right panel
- [ ] Temperature slider → store update
- [ ] Reset → beaker empty, card biến mất
- [ ] Undo → xóa chemical cuối, liquid level giảm
- [ ] Offline hoàn toàn (no network request)
- [ ] Console không có lỗi

---

## ⬜ Phase 4 — Effects & Presets
> Prerequisite: Phase 3B pass đủ 10 criteria.
> Detail: Sẽ viết sau khi 3B pass.

## ⬜ Phase 5 — Learning & Polish
> Prerequisite: Phase 4 pass.
> Detail: Sẽ viết sau khi Phase 4 pass.
