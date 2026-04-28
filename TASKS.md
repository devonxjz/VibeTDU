# TASKS — ChemLab Dev Tracker
> Agent rules: Đọc README.md trước. Làm từng task một. Chỉ touch file trong "Files" list. Sau mỗi task chạy `npx tsc --noEmit` — không pass thì không sang task tiếp.

---

## ✅ Phase 1–2 — DONE. Không sửa.

---

## ✅ Phase 3A — Drag & Drop MVP — DONE

> Tất cả các acceptance criteria đã pass. Implementation khác tên file so với spec gốc nhưng đầy đủ chức năng.

| Task | File thực tế | Status |
|------|-------------|--------|
| 3A-0 Chemicals data | `src/constants/chemicals.ts` (40+ chemicals, colors, categories) | ✅ |
| 3A-1 BeakerDropZone | `src/components/chemlab/scene/BeakerHero.tsx` — `useDroppable`, glow khi isOver | ✅ |
| 3A-2 Draggable items | `src/components/chemlab/SearchPanel.tsx` — `useDraggable` trên bottle SVG | ✅ |
| 3A-3 DnD Context + Overlay | `src/components/chemlab/ChemLabShell.tsx` — `DndContext`, `DragOverlay` (bottle-only) | ✅ |
| 3A-4 Store beakerContents | `src/stores/lab-store.ts` — `addChemicalToVessel`, `undoLastChemical`, `resetBoard` | ✅ |
| 3A-5 Liquid fill visual | `src/components/chemlab/scene/BeakerHero.tsx` — animated spring fill, blended color | ✅ |

### 3A Acceptance — ALL PASS ✅
- [x] `npx tsc --noEmit` — 0 errors
- [x] Kéo bottle từ search panel → cursor hiện bottle SVG theo cùng
- [x] Beaker border glow xanh khi kéo qua
- [x] Drop vào beaker → liquid level tăng + pouring animation
- [x] Drop ra ngoài beaker → không có gì
- [x] Không cho duplicate chemical (cùng formula)
- [x] Bottle-only drag overlay (không kéo cả card)

---

## ✅ Phase 3B — Reaction Controls & Mock Engine — DONE

> System dùng real API (Gemini) thay vì mock engine. Tất cả chức năng khác đều implement đầy đủ.

| Task | File thực tế | Status |
|------|-------------|--------|
| 3B-1 Reaction engine | Real API via `src/api/client/lab.ts` → backend Gemini | ✅ (API, not mock) |
| 3B-2 ReactionControlPanel | `src/components/chemlab/Toolbar.tsx` — T°, P, Catalyst sliders | ✅ |
| 3B-3 Reaction trigger | `src/stores/lab-store.ts` → `runReaction()`, Play button | ✅ |
| 3B-4 ReactionResultCard | `src/components/chemlab/PropertiesPanel.tsx` → `ReactionResultPanel` | ✅ |
| 3B-5 ReactionInfoPanel | `PropertiesPanel.tsx` — Observation, Explanation, Safety sections | ✅ |
| 3B-6 Reset & Undo | `lab-store.ts` — `resetBoard()` + `undoLastChemical()`, wired to PropertiesPanel | ✅ |

### 3B Acceptance — ALL PASS ✅
- [x] `npx tsc --noEmit` — 0 errors
- [x] Drop HCl + NaOH → Play → ReactionResultPanel hiển thị equation + effect
- [x] Observation text xuất hiện trong right panel
- [x] Temperature slider → store update
- [x] Reset → beaker empty, reaction result biến mất
- [x] Undo → xóa chemical cuối, liquid level giảm
- [x] Console không có lỗi

---

## ⬜ Phase 4 — Effects & Presets
> Prerequisite: Phase 3B pass đủ criteria ✅
> Ready to implement.

### Planned features:
- [ ] Reaction effect animations (gas bubbles, precipitate, color change, heat glow)
- [ ] Preset experiments (common reactions with one-click setup)
- [ ] Reaction history log

---

## ⬜ Phase 5 — Learning & Polish
> Prerequisite: Phase 4 pass.
> Detail: Sẽ viết sau khi Phase 4 pass.
