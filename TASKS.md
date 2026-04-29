# TASKS — ChemLab Dev Tracker

> **Agent rules:**
> 1. Đọc README.md trước khi làm bất cứ thứ gì.
> 2. Làm từng task một — không skip, không làm song song.
> 3. Sau mỗi task chạy `npx tsc --noEmit`. Không pass → không sang task tiếp.
> 4. Chỉ được touch file trong danh sách **Files** của từng task.
> 5. Không xóa code đang hoạt động — chỉ extend.
> 6. Tất cả UI text dùng tiếng Việt.

---

## ✅ Phase 1–2 — DONE. Không sửa. Không touch.

> Bao gồm: toàn bộ layout, DnD context, store cơ bản, BeakerHero, LabScene2D,
> SearchPanel, PropertiesPanel, Toolbar, PouringAnimation, ChatbotWidget,
> tất cả 5 effect components, constants/chemicals.ts.

---

## 🗺️ Kiến trúc cần nắm trước khi làm

```
Entry:       src/app/page.tsx → <ChemLabShell />
DnD:         ChemLabShell.tsx — DndContext bao toàn bộ app
Board:       Board.tsx — canvas chính, render BeakerHero + floating vessels
Store:       src/stores/lab-store.ts — Zustand, source of truth
  vessels:           Record<string, Vessel>   — tất cả vessels trên board
  centerBeakerId:    string | null            — ID của bình trung tâm
  lastReaction:      ReactionResult | null    — kết quả từ BE
  activeEffect:      ActiveEffect | null      — hiệu ứng đang chạy
  sessionCode:       string                   — nanoid(8), gửi kèm mọi API call

Drag flow:   SearchPanel → DragOverlay bottle → drop vào BeakerHero (vessel-target)
             → ChemLabShell.handleDragEnd → setPouringChemical
             → PouringAnimation.onComplete → addChemicalToVessel (LOCAL, không API)
             → User bấm Play → runReaction(centerBeakerId) → POST /api/lab/mix

Types:       src/types/lab.ts   — Vessel, ActiveEffect, Position, DragData
             src/types/api.ts   — MixRequest, MixResponse, ReactionResult, VesselContent
Constants:   src/constants/chemicals.ts — CATEGORY_GROUPS, CHEMICAL_COLORS,
                                          BOTTLE_COLORS, getBottleColor(), getChemicalColor()
```

---

## 🔴 Phase 3 — Offline Mock + Reaction Controls nâng cao

> Prerequisite: Phase 1–2 pass (đã done).

---

### TASK 3-1 — reaction-mock.ts ⚠️ CRITICAL

**Mục đích:** Cho phép app chạy offline, không cần BE, không cần network.
Kết quả mock phải có đúng shape của `ReactionResult` từ `src/types/api.ts`.

**Files:**
- `src/utils/reaction-mock.ts` *(create)*

**Interface cần implement — khớp CHÍNH XÁC với `ReactionResult` trong api.ts:**
```ts
// ReactionResult đã định nghĩa trong src/types/api.ts — KHÔNG tạo lại
// Mock function trả về đúng type này
import type { ReactionResult } from "@/types/api";

export function getMockReaction(reactants: string[]): ReactionResult
export const NO_REACTION: ReactionResult
```

**Key generation:**
```ts
const key = reactants.map(r => r.toLowerCase()).sort().join("+");
```

**10 reactions bắt buộc** — đủ tất cả fields của `ReactionResult`:

| Key (sorted) | equation | effectType | effectColor / precipitateColor |
|---|---|---|---|
| `hcl+naoh` | HCl + NaOH → NaCl + H₂O | COLOR_CHANGE | `rgba(220,235,250,0.8)` |
| `bacl2+h2so4` | BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl | PRECIPITATE | precipitateColor: `#ffffff` |
| `agno3+nacl` | AgNO₃ + NaCl → AgCl↓ + NaNO₃ | PRECIPITATE | precipitateColor: `#f5f5f5` |
| `cuso4+naoh` | CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄ | PRECIPITATE | precipitateColor: `#1565C0` |
| `hcl+zn` | Zn + 2HCl → ZnCl₂ + H₂↑ | GAS_BUBBLE | gasFormula: `H2` |
| `hcl+na2co3` | Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑ | GAS_BUBBLE | gasFormula: `CO2` |
| `h2so4+kmno4` | 2KMnO₄ + H₂SO₄ → K₂SO₄ + 2MnO₄⁻ | COLOR_CHANGE | effectColor: `#E040FB` |
| `fe+hcl` | Fe + 2HCl → FeCl₂ + H₂↑ | GAS_BUBBLE | gasFormula: `H2` |
| `ca+h2o` | Ca + 2H₂O → Ca(OH)₂ + H₂↑ | GAS_BUBBLE | gasFormula: `H2` |
| `hcl+mg` | Mg + 2HCl → MgCl₂ + H₂↑ | GAS_BUBBLE | gasFormula: `H2` |

**Mỗi reaction phải có đủ:**
```ts
{
  hasReaction: true,
  equation: "...",
  productFormula: "...",    // sản phẩm chính
  effectType: "GAS_BUBBLE" | "PRECIPITATE" | "COLOR_CHANGE",
  effectColor?: "...",       // nếu COLOR_CHANGE
  precipitateColor?: "...",  // nếu PRECIPITATE
  gasFormula?: "...",        // nếu GAS_BUBBLE
  messageVi: "...",          // QUAN TRỌNG: field này = "Hiện tượng quan sát" trong PropertiesPanel
  explanationVi: "...",      // hiển thị trong "Giải thích chi tiết"
  safetyNoteVi: "...",       // hiển thị trong "Lưu ý an toàn"
}
```

> ⚠️ Field là `messageVi` (không phải `observationVi`) — khớp với `ReactionResult` trong api.ts
> và với PropertiesPanel đang đọc `reaction.messageVi`.

**Verify:**
- [x] `getMockReaction(['HCl','NaOH'])` → `hasReaction: true, effectType: 'COLOR_CHANGE'`
- [x] `getMockReaction(['HCl','HCl'])` → `hasReaction: false`
- [x] `getMockReaction(['ZN','HCL'])` → `hasReaction: true` (case-insensitive + sort)
- [x] `npx tsc --noEmit` → 0 errors

---

### TASK 3-2 — Offline fallback trong store

**Mục đích:** Khi BE offline/lỗi, `runReaction()` tự fallback sang mock thay vì chỉ set error.

**Files:**
- `src/stores/lab-store.ts` *(modify — ADD ONLY)*

**Checklist:**
- [ ] Import `getMockReaction` từ `@/utils/reaction-mock`
- [ ] Trong `runReaction()`, bọc `mixChemicals()` trong try/catch:
  - Nếu thành công → xử lý response như hiện tại
  - Nếu throw (network error, 5xx) → gọi `getMockReaction(formulas)`, set `lastReaction` và `activeEffect` từ mock result
  - Mock fallback: set `isLoading = false`, KHÔNG set `error`
- [ ] `formulas` = `vessel.contents.map(c => c.formula)` (không lowercase — mock function tự xử lý)
- [ ] Tương tự cho `mixChemicalIntoVessel()` và `mixVessels()` nếu muốn (optional, chỉ bắt buộc cho `runReaction`)

**Verify:**
- [x] Tắt BE → bấm Play → mock reaction hiển thị đúng (không hiện error toast)
- [x] Bật BE → bấm Play → gọi API thật bình thường
- [x] `npx tsc --noEmit` → 0 errors

---

### TASK 3-3 — Catalyst dropdown hoàn chỉnh trong Toolbar

**Mục đích:** Dropdown "Xúc tác" hiện đang là button tĩnh, chưa có options.

**Files:**
- `src/components/chemlab/Toolbar.tsx` *(modify)*

**Checklist:**
- [x] Dùng Radix `<DropdownMenu>` (đã có trong `src/components/ui/dropdown-menu.tsx`)
- [x] Options: `Không`, `MnO₂`, `Fe`, `Pt`, `Ni`, `V₂O₅`
- [x] Click option → gọi `setEnvironment({ catalyst: value })`
- [x] Button hiển thị catalyst hiện tại (đã có `{catalyst}` trong text)
- [x] Icon `<ChevronDown>` rotate 180° khi menu mở (dùng `data-[state=open]` của Radix)

**Verify:**
- [x] Chọn `MnO₂` → store `catalyst === 'MnO₂'`
- [x] Chọn `Không` → store `catalyst === 'Không'`
- [x] `npx tsc --noEmit` → 0 errors

---

### TASK 3-4 — PresetSelector component

**Mục đích:** Cho phép load nhanh cặp hoá chất hay dùng vào beaker.

**Files:**
- `src/components/chemlab/PresetSelector.tsx` *(create)*
- `src/components/chemlab/PropertiesPanel.tsx` *(modify — thêm PresetSelector vào UI)*

**5 Presets:**

| Tên | chemicalIds | Mô tả |
|---|---|---|
| Trung hoà | `['hcl', 'naoh']` | Phản ứng acid-base |
| Kết tủa trắng | `['agno3', 'nacl']` | Tạo AgCl↓ trắng |
| Sinh khí H₂ | `['hcl', 'zn']` | Giải phóng khí H₂ |
| Kết tủa xanh | `['cuso4', 'naoh']` | Cu(OH)₂↓ xanh |
| Đổi màu tím | `['h2so4', 'kmno4']` | Màu tím đặc trưng |

**Checklist:**
- [x] `PresetSelector` nhận không có props, đọc store trực tiếp
- [x] Hiển thị 5 preset dạng horizontal scroll hoặc grid 2-3 cột
- [x] Mỗi preset: tên + mô tả ngắn + icon emoji
- [x] Click preset:
  1. Gọi `resetBoard()` để clear board
  2. Sau 200ms: gọi `initCenterBeaker()` để tạo beaker mới
  3. Sau 400ms: gọi `addChemicalToVessel()` cho chemical đầu tiên
  4. Sau 700ms: gọi `addChemicalToVessel()` cho chemical thứ hai
  - Dùng `setTimeout` chain — delay giúp animation rõ hơn
  - Chemical data lấy từ `CATEGORY_GROUPS` trong `@/constants/chemicals`
- [x] Thêm `<PresetSelector />` vào `PropertiesPanel.tsx` — đặt ngay trên `<BeakerTray />`
- [x] Wrap trong `<section>` với heading "Thí nghiệm nhanh"

> ⚠️ `resetBoard()` là async (gọi API), await nó trước khi setTimeout.
> `initCenterBeaker()` PHẢI được gọi sau `resetBoard()` vì `resetBoard` xóa sạch vessels.

**Verify:**
- [x] Click "Trung hoà" → board clear → beaker xuất hiện → HCl vào → NaOH vào (delay nhìn rõ)
- [x] Không crash khi click preset liên tục
- [x] `npx tsc --noEmit` → 0 errors

---

### ✅ Phase 3 — Acceptance Criteria

- [x] `npx tsc --noEmit` → 0 errors
- [x] `getMockReaction(['HCl','NaOH'])` → `hasReaction: true`
- [x] Tắt BE → Play → mock result hiển thị trong PropertiesPanel (không có error)
- [x] Catalyst dropdown chọn được, store cập nhật
- [x] Click preset → chemicals load tuần tự có delay

> Phase 4 chỉ bắt đầu khi tất cả criteria trên pass.

---

## 🔴 Phase 4 — ExperimentTimeline + Keyboard Shortcuts

> Prerequisite: Phase 3 pass.

---

### TASK 4-1 — TimelineEvent type + store actions

**Mục đích:** Tracking mọi action trong session để hiển thị timeline.

**Files:**
- `src/types/lab.ts` *(modify — ADD ONLY)*
- `src/stores/lab-store.ts` *(modify — ADD ONLY)*

**Thêm vào `src/types/lab.ts`:**
```ts
export interface TimelineEvent {
  id: string;              // nanoid(6)
  timestamp: string;       // format "HH:MM:SS"
  type: "ADD" | "REACT" | "UNDO" | "RESET" | "PRESET";
  description: string;     // ví dụ: "Thêm HCl · 10 mL"
  formulaLabel?: string;   // formula chính liên quan (nếu có)
}
```

**Thêm vào store interface và implementation:**
```ts
timelineEvents: TimelineEvent[]   // init []
addTimelineEvent: (event: Omit<TimelineEvent, "id" | "timestamp">) => void
clearTimeline: () => void
```

**Wire vào các actions hiện có:**
- `addChemicalToVessel()` → push event `ADD`, description: `"Thêm {formula} · {amountMl} mL"`
- `runReaction()` success → push event `REACT`, description: equation hoặc `"Phản ứng đã chạy"`
- `undoLastChemical()` → push event `UNDO`, description: `"Hoàn tác: {formula đã xóa}"`
- `resetBoard()` → push event `RESET`, description: `"Đặt lại thí nghiệm"` + gọi `clearTimeline()`

> Dùng `nanoid(6)` cho id (đã có trong package), timestamp = `new Date().toTimeString().slice(0,8)`

**Verify:**
- [x] Thêm HCl vào beaker → `timelineEvents` có 1 item type `ADD`
- [x] Bấm Play → `timelineEvents` có thêm item type `REACT`
- [x] `npx tsc --noEmit` → 0 errors

---

### TASK 4-2 — ExperimentTimeline component

**Files:**
- `src/components/chemlab/timeline/ExperimentTimeline.tsx` *(create)*
- `src/components/chemlab/PropertiesPanel.tsx` *(modify — thêm timeline vào bottom)*

**Checklist:**
- [x] `ExperimentTimeline` đọc `timelineEvents` từ store
- [x] Layout: horizontal scrollable bar, mỗi event là 1 chip/card nhỏ
- [x] Mỗi event hiển thị: icon theo type + description + timestamp
  - `ADD` → 🧪 icon xanh
  - `REACT` → ⚡ icon amber
  - `UNDO` → ↩️ icon xám
  - `RESET` → 🔄 icon đỏ nhạt
  - `PRESET` → ✨ icon tím
- [x] Khi `timelineEvents.length === 0` → hiển thị placeholder "Chưa có thao tác nào"
- [x] Scroll tự cuộn đến item mới nhất khi có event mới (`useEffect` + `ref.scrollLeft`)
- [x] Thêm vào `PropertiesPanel.tsx`: đặt `<ExperimentTimeline />` ở cuối `<aside>`, sau `<ReactionResultPanel />`

**Verify:**
- [x] Drop HCl vào beaker → timeline xuất hiện chip mới
- [x] Bấm Reset → timeline xóa sạch
- [x] `npx tsc --noEmit` → 0 errors

---

### TASK 4-3 — Keyboard Shortcuts

**Files:**
- `src/components/chemlab/ChemLabShell.tsx` *(modify — ADD ONLY)*

**Checklist:**
- [x] `useEffect` + `window.addEventListener('keydown', handler)` trong `ChemLabShell`
- [x] Cleanup: `return () => window.removeEventListener('keydown', handler)` 
- [x] Shortcuts:

| Key | Action | Điều kiện |
|---|---|---|
| `Z` hoặc `Ctrl+Z` / `Cmd+Z` | `undoLastChemical()` | luôn |
| `R` | `resetBoard()` | luôn |
| `Space` hoặc `Enter` | `runReaction(centerBeakerId)` | chỉ khi `canPlay` |

- [x] `canPlay` = `centerVessel?.contents.filter(c => c.formula).length >= 2 && !isLoading`
- [x] Khi focus đang ở `<input>` hoặc `<textarea>` → KHÔNG trigger shortcuts (check `e.target`)
- [x] `Space` phải `e.preventDefault()` để không scroll page

**Verify:**
- [x] Thêm 2 chất → nhấn Space → reaction chạy
- [x] Nhấn Z → undo
- [x] Nhấn R → reset
- [x] Đang gõ vào SearchPanel input → Space không trigger reaction
- [x] `npx tsc --noEmit` → 0 errors

---

### ✅ Phase 4 — Acceptance Criteria

- [x] `npx tsc --noEmit` → 0 errors
- [x] Timeline hiển thị đúng sau mỗi action (ADD, REACT, UNDO, RESET)
- [x] Timeline scroll đến item mới nhất tự động
- [x] `Space` → trigger reaction (khi đủ điều kiện)
- [x] `Z` / `Ctrl+Z` → undo
- [x] `R` → reset
- [x] Shortcuts không trigger khi đang focus input

> Phase 5 chỉ bắt đầu khi tất cả criteria trên pass.

---

## 🔴 Phase 5 — ExplanationPanel (3-level learning)

> Prerequisite: Phase 4 pass.

---

### TASK 5-1 — Mở rộng reaction-mock với 3 cấp giải thích

**Files:**
- `src/utils/reaction-mock.ts` *(modify)*
- `src/types/api.ts` *(modify — ADD ONLY)*

**Thêm vào `ReactionResult` trong `src/types/api.ts`:**
```ts
// Thêm 3 optional fields vào interface ReactionResult đã có:
basicExplanation?: string;          // 1-2 câu đơn giản, dành cho cấp 1
intermediateExplanation?: string;   // giải thích cơ chế, dành cho cấp 2
advancedExplanation?: string;       // phương trình ion rút gọn, dành cho cấp 3
```

**Populate trong reaction-mock.ts** — thêm 3 fields này vào tất cả 10 reactions:

Ví dụ cho `hcl+naoh`:
```ts
basicExplanation: "Axit HCl và bazơ NaOH tác dụng với nhau tạo thành muối NaCl và nước. Đây là phản ứng trung hòa.",
intermediateExplanation: "Ion H⁺ từ HCl kết hợp với ion OH⁻ từ NaOH tạo thành H₂O. Na⁺ và Cl⁻ là ion khán giả, không tham gia phản ứng.",
advancedExplanation: "Phương trình ion rút gọn: H⁺(aq) + OH⁻(aq) → H₂O(l). ΔG < 0, phản ứng tự phát. Ka × Kb >> 1.",
```

**Verify:**
- [ ] `getMockReaction(['HCl','NaOH']).basicExplanation` có giá trị
- [ ] `npx tsc --noEmit` → 0 errors

---

### TASK 5-2 — ExplanationPanel component

**Files:**
- `src/components/chemlab/panels/ExplanationPanel.tsx` *(create)*
- `src/components/chemlab/PropertiesPanel.tsx` *(modify — tích hợp vào ReactionResultPanel)*

**Checklist:**
- [ ] 3 tabs: **Cơ bản** | **Trung cấp** | **Nâng cao**
- [ ] Dùng Radix `<Tabs>` từ `src/components/ui/tabs.tsx`
- [ ] Đọc `lastReaction` từ store
- [ ] Mỗi tab hiển thị field tương ứng: `basicExplanation`, `intermediateExplanation`, `advancedExplanation`
- [ ] Khi field đó là `undefined` → hiển thị placeholder "Không có giải thích cho cấp này"
- [ ] Khi `lastReaction === null` → hiển thị "Chạy phản ứng để xem giải thích"
- [ ] Integrate vào `PropertiesPanel`: thay thế block `<details>` "Giải thích chi tiết" hiện tại bằng `<ExplanationPanel />`

**Verify:**
- [ ] Chạy phản ứng HCl+NaOH → 3 tabs hiển thị đúng content
- [ ] Switch tab không mất data
- [ ] `npx tsc --noEmit` → 0 errors

---

### TASK 5-3 — Polish: Font + Dark mode check

**Files:**
- `src/app/globals.css` *(modify)*
- `src/app/layout.tsx` *(modify)*

**Checklist:**
- [ ] Thêm `DM_Sans` vào `layout.tsx`:
  ```ts
  import { Inter, Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
  const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
  // Thêm dmSans.variable vào className của <html>
  ```
- [ ] Trong `globals.css`, đổi `--font-sans`:
  ```css
  --font-sans: var(--font-dm-sans, "DM Sans", system-ui, sans-serif);
  ```
  (Giữ nguyên `--font-display` là Plus Jakarta Sans)
- [ ] Kiểm tra `globals.css` có đủ `@keyframes` sau không, nếu thiếu thì thêm:
  - `@keyframes shake` — dùng cho ExplosionEffect nếu cần CSS fallback
  - `@keyframes particle-fall` — dùng cho PrecipitateEffect nếu cần CSS fallback
- [ ] Kiểm tra class `.thin-scroll` (đang dùng trong PropertiesPanel, SearchPanel) hoạt động đúng ở dark mode

**Verify:**
- [ ] Font chữ body đổi sang DM Sans (inspect element confirm)
- [ ] `npx tsc --noEmit` → 0 errors

---

### ✅ Phase 5 — Acceptance Criteria

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] Tab Cơ bản / Trung cấp / Nâng cao switch đúng content
- [ ] Content khác nhau rõ rệt giữa 3 cấp
- [ ] Font body đổi sang DM Sans
- [ ] `Space` → reaction, `Z` → undo, `R` → reset (từ phase 4, vẫn phải pass)

---

## 📋 Master Checklist

### Phase 3
- [x] `getMockReaction(['HCl','NaOH'])` → `hasReaction: true, effectType: 'COLOR_CHANGE'`
- [x] `getMockReaction(['HCl','HCl'])` → `hasReaction: false`
- [x] Tắt BE → Play → mock result hiển thị (không crash, không error toast)
- [x] Catalyst dropdown: chọn MnO₂ → store cập nhật
- [x] Click preset "Sinh khí H₂" → HCl + Zn load vào beaker tuần tự

### Phase 4
- [x] Drop chemical → timeline có chip ADD mới
- [x] Play → timeline có chip REACT mới
- [x] Undo → timeline có chip UNDO mới
- [x] Reset → timeline xóa sạch + chip RESET
- [x] Space → trigger reaction (đủ điều kiện)
- [x] Z → undo
- [x] R → reset
- [x] Shortcuts không trigger khi focus vào search input

### Phase 5
- [ ] 3 tabs explanation switch đúng
- [ ] Content 3 cấp khác nhau rõ ràng
- [ ] Font DM Sans active

---

## ❌ Những thứ KHÔNG làm (đã có sẵn)

Danh sách component/logic đã implement trong Phase 1-2, **không được sửa**:

| Đã có | Vị trí |
|---|---|
| DnD context, DragOverlay, PouringAnimation | `ChemLabShell.tsx` |
| BeakerHero (SVG beaker + liquid fill + droppable) | `scene/BeakerHero.tsx` |
| GasBubbleEffect, PrecipitateEffect, ColorChangeEffect, HeatEffect, ExplosionEffect | `effects/` |
| ReactionEffect dispatcher | `effects/ReactionEffect.tsx` |
| PropertiesPanel (Play button, BeakerTray, ReactionResultPanel) | `PropertiesPanel.tsx` |
| SearchPanel + DraggableChemicalCard + API search | `SearchPanel.tsx` |
| Toolbar (Temperature slider, Pressure slider, catalyst button, Reset) | `Toolbar.tsx` |
| CATEGORY_GROUPS, CHEMICAL_COLORS, BOTTLE_COLORS | `constants/chemicals.ts` |
| ChatbotWidget, ChatbotStore | `chatbot/` |
| runReaction, mixVessels, mixChemicalIntoVessel, addChemicalToVessel, undoLastChemical, resetBoard | `lab-store.ts` |
| Tất cả BE: LabController, AiController, ChemicalController, LabMixService, ReactionPredictionService | `backend/` |

---

## 🐛 Lưu ý kỹ thuật

**Về store mutations:**
- Luôn dùng `set((state) => ({...}))` form khi đọc state cũ
- `nanoid` đã import sẵn trong lab-store.ts, dùng lại

**Về DnD data shape:**
```ts
// Chemical từ SearchPanel có data:
{ type: "chemical", chemicalId, name, formula, category, color }

// Vessel drag có data:
{ type: "vessel", vesselId }

// Drop target (BeakerHero) có data:
{ type: "vessel-target", vesselId }
```

**Về Radix UI:**
- DropdownMenu: `src/components/ui/dropdown-menu.tsx` ✅
- Tabs: `src/components/ui/tabs.tsx` ✅
- Không cài thêm package nào

**Về font DM Sans:**
- `next/font/google` hỗ trợ sẵn — không cần cài thêm
- Thêm variable CSS `--font-dm-sans` rồi reference trong globals.css

**Về offline fallback:**
- Chỉ fallback khi `catch` — không fallback nếu BE trả `{ status: "error" }`
- Mock không cần delay (instant), không gọi setTimeout