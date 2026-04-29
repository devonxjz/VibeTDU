# VibeTDU — Virtual Chemistry Lab

<div align="center">

### 👥 Contributors

<table>
  <tr>
    <td align="center" width="300">
      <img src="https://img.shields.io/badge/🧑‍💻-Trần_Lê_Thái-0D1117?style=for-the-badge&labelColor=1a1b27&color=38bdae" /><br/>
      <img src="https://img.shields.io/badge/MSSV-24110331-blue?style=flat-square&logo=bookstack&logoColor=white" />
    </td>
    <td align="center" width="300">
      <img src="https://img.shields.io/badge/🧑‍💻-Lương_Viết_Vĩ_Đông-0D1117?style=for-the-badge&labelColor=1a1b27&color=7c3aed" /><br/>
      <img src="https://img.shields.io/badge/MSSV-24110202-blue?style=flat-square&logo=bookstack&logoColor=white" />
    </td>
  </tr>
</table>

</div>

---

## ⚠️ Agent — Đọc phần này trước khi làm bất cứ thứ gì

```
STACK:        Next.js 15 + TypeScript + Tailwind CSS v4 + Zustand + dnd-kit + Framer Motion
ENTRY POINT:  src/app/page.tsx → <ChemLabShell />
STATE:        src/stores/lab-store.ts  (Zustand)
TYPES:        src/types/lab.ts | src/types/api.ts
CONSTANTS:    src/constants/chemicals.ts
STYLES:       src/app/globals.css  (design tokens — đừng override, chỉ extend)
BACKEND URL:  http://localhost:8080  (local) | xem .env.local
DATABASE:     Supabase PostgreSQL (hosted) — KHÔNG phải local PostgreSQL
```

**Quy tắc bắt buộc:**
- Sau mỗi task chạy `npx tsc --noEmit`. Không pass → không tiếp.
- Chỉ touch file được liệt kê trong task.
- Không xóa code đang hoạt động — chỉ extend.
- Không cài thêm package nếu không có trong task.
- Phase 1–2 đã DONE — không sửa.

---

## 🔬 About the Project

**VibeTDU (Virtual Chemistry Lab)** là nền tảng web mô phỏng thí nghiệm hoá học tương tác. Thiết kế cho mục đích giáo dục, cung cấp môi trường ảo an toàn để kéo-thả hoá chất và quan sát phản ứng theo thời gian thực.

Tích hợp cơ sở dữ liệu hoá chất bên ngoài (PubChem, Cactus, OPSIN) và AI assistant (Google Gemini) để giải thích phản ứng bằng tiếng Việt.

---

## ✨ Features

- **Drag & Drop Interface** — `@dnd-kit`, kéo hoá chất từ thư viện vào beaker
- **Pouring Animation** — chai hoá chất đổ vào beaker có animation thực tế
- **Real-time Reaction Simulation** — `GAS_BUBBLE`, `PRECIPITATE`, `COLOR_CHANGE`, `HEAT`, `EXPLOSION`
- **Dynamic Chemical Resolution** — DB Cache → PubChem → Cactus → OPSIN
- **AI Chatbot** — Google Gemini, context-aware, tiếng Việt, multi-turn
- **Experiment Logging** — lưu toàn bộ action theo session trên Supabase
- **Offline Mock Mode** — `reaction-mock.ts` chạy không cần backend

---

## 🛠️ Tech Stack

### Frontend
| | |
|---|---|
| Framework | Next.js 15 / React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + tw-animate-css |
| Components | Radix UI + Lucide React |
| State | Zustand |
| Animation | Framer Motion |
| Drag & Drop | @dnd-kit |

### Backend
| | |
|---|---|
| Framework | Spring Boot 3.2.5 |
| Language | Java 17 |
| Database | Supabase PostgreSQL (prod) / H2 (dev) |
| API Docs | SpringDoc OpenAPI / Swagger UI |
| AI | Google Gemini via WebClient (key rotation tự động) |
| External APIs | PubChem, NCI/Cactus, OPSIN |

---

## 🗂️ Cấu trúc thư mục Frontend

```
frontend/src/
├── app/
│   ├── layout.tsx              # Root layout, font imports (Inter + Plus Jakarta Sans)
│   ├── page.tsx                # Entry → <ChemLabShell />
│   └── globals.css             # Design tokens, CSS vars, keyframes
├── components/
│   └── chemlab/
│       ├── ChemLabShell.tsx    # DndContext, DragOverlay, PouringAnimation
│       ├── Board.tsx           # Canvas chính: LabScene2D + BeakerHero + floating vessels
│       ├── Toolbar.tsx         # Top bar: Temperature, Pressure, Catalyst, Reset
│       ├── PropertiesPanel.tsx # Left panel: Play button, BeakerTray, ReactionResultPanel
│       ├── SearchPanel.tsx     # Right panel: thư viện hoá chất, DraggableChemicalCard
│       ├── Vessel.tsx          # Floating vessel component (non-center)
│       ├── Formula.tsx         # Render công thức hoá học với subscript
│       ├── PouringAnimation.tsx# Animation đổ hoá chất vào beaker
│       ├── scene/
│       │   ├── LabScene2D.tsx  # Background lab 2.5D (kệ, bàn, thiết bị)
│       │   ├── BeakerHero.tsx  # Beaker SVG trung tâm + liquid fill + droppable
│       │   ├── ChemicalBottle2D.tsx
│       │   └── LabEquipment2D.tsx
│       ├── effects/
│       │   ├── ReactionEffect.tsx    # Dispatcher → chọn effect theo effectType
│       │   ├── GasBubbleEffect.tsx   # Bọt khí nổi lên
│       │   ├── PrecipitateEffect.tsx # Hạt kết tủa rơi xuống
│       │   ├── ColorChangeEffect.tsx # Đổi màu dung dịch
│       │   ├── HeatEffect.tsx        # Hơi nóng + glow cam đỏ
│       │   └── ExplosionEffect.tsx   # Flash + sparks + smoke
│       ├── panels/
│       │   └── ExplanationPanel.tsx  # [Phase 5] 3-level learning tabs
│       └── timeline/
│           └── ExperimentTimeline.tsx # [Phase 4] Timeline thao tác
├── stores/
│   ├── lab-store.ts            # Zustand: vessels, reaction, effects, session
│   └── chatbot-store.ts        # Zustand: chat messages, persist to localStorage
├── types/
│   ├── lab.ts                  # Vessel, ActiveEffect, Position, DragData, TimelineEvent
│   └── api.ts                  # MixRequest, MixResponse, ReactionResult, VesselContent
├── constants/
│   └── chemicals.ts            # CATEGORY_GROUPS, CHEMICAL_COLORS, BOTTLE_COLORS,
│                               # getChemicalColor(), getBottleColor(), formatFormula()
├── api/
│   └── client/
│       ├── http.ts             # fetch wrapper: get(), post(), HttpError
│       ├── lab.ts              # mixChemicals(), resetSession(), getSessionLogs(), healthCheck()
│       ├── chemical.ts         # resolveChemical()
│       └── ai.ts               # askAi(), chatAi()
└── utils/
    ├── cn.ts                   # clsx + tailwind-merge
    ├── collision.ts            # Custom DnD collision detection
    └── reaction-mock.ts        # [Phase 3] getMockReaction() — offline data
```

---

## 🔄 System Flow — User → UI → State → API → Backend → UI

> Đây là bức tranh toàn cảnh: mỗi action của user kéo theo gì trong hệ thống.

### Thí nghiệm đầy đủ (happy path)

```
① USER chọn hoá chất từ SearchPanel (right panel)
   └─ SearchPanel.tsx → DraggableChemicalCard
      data: { type: "chemical", chemicalId, name, formula, category }

② USER kéo (drag) chai hoá chất
   └─ ChemLabShell: onDragStart → setDraggedChemical → DragOverlay hiện bottle

③ USER thả (drop) vào BeakerHero
   └─ ChemLabShell: onDragEnd
      over.data.type === "vessel-target"
      → setPouringChemical({ chemical, targetVesselId })
      → PouringAnimation bắt đầu (2.2s)

④ PouringAnimation hoàn tất
   └─ onComplete → addChemicalToVessel(chemical, vesselId)
      [Zustand] vessel.contents.push(chemical)
               vessel.displayColor = getDisplayColor(...)
               vessel.label = formulas.join(" + ")
      ⚠️ KHÔNG gọi API ở bước này — chỉ update state local

⑤ USER bấm nút ▶ Play (PropertiesPanel)
   └─ runReaction(centerBeakerId)
      [Zustand] isLoading = true
      → mixChemicals(MixRequest) → POST /api/lab/mix

⑥ BACKEND xử lý (Spring Boot :8080)
   ├─ Validate request (@NotBlank, @NotEmpty)
   ├─ Rate limit check (2000ms cooldown / session)
   ├─ Resolve chemicals: Supabase cache → PubChem → Cactus → OPSIN
   ├─ Predict reaction: Supabase cache → Google Gemini → validate JSON
   ├─ Save: ReactionApiCache + ExperimentLog → Supabase
   └─ Return MixResponse { status, source, result, newTargetVesselState }

⑦ FRONTEND nhận response
   └─ [Zustand] parse result:
      → vessel.displayColor = newTargetVesselState.displayColor hoặc effectColor
      → vessel.label = productFormula
      → lastReaction = result  (→ PropertiesPanel render equation, messageVi, explanationVi)
      → activeEffect = { type, vesselId, color, ... } (→ ReactionEffect trigger)
      → isLoading = false

⑧ UI cập nhật đồng thời
   ├─ BeakerHero: màu liquid thay đổi (spring animation)
   ├─ ReactionEffect: GasBubble / Precipitate / ColorChange / Heat / Explosion
   ├─ PropertiesPanel: hiển thị equation + observation + safety note
   └─ Effect auto-clear sau N ms (GAS_BUBBLE: 3s, PRECIPITATE: 2.5s, EXPLOSION: 4s)

⑨ USER hỏi AI Chatbot
   └─ ChatbotWidget → useChatbotStore.sendMessage(text)
      → buildReactionContext(labState) — đính kèm equation, messageVi, temperature, ...
      → chatAi(AiChatRequest) → POST /api/ai/chat
      → BE gọi Gemini với context → trả answerVi
      → ChatPanel hiển thị câu trả lời
```

### Offline fallback (khi BE tắt)

```
⑤ USER bấm Play
   └─ runReaction() → mixChemicals() → network error (throw)
      catch → getMockReaction(formulas)  [reaction-mock.ts]
      → set lastReaction + activeEffect từ mock
      ⚠️ Không hiện error — user không biết đang offline
```

### Vessel-to-vessel mix

```
USER kéo floating vessel → thả lên BeakerHero
└─ ChemLabShell: onDragEnd
   active.type === "vessel", over.type === "vessel-target"
   → mixVessels(sourceId, targetId)
   → POST /api/lab/mix (sourceContents + targetContents)
   → source vessel bị xóa sau khi đổ xong
```

---

## 🏗️ Kiến trúc Backend

```
Spring Boot (:8080)
├── controller/
│   ├── LabController       → /api/health, /api/lab/mix, /api/session/*
│   ├── ChemicalController  → /api/chemicals/resolve
│   └── AiController        → /api/ai/ask, /api/ai/chat
├── service/
│   ├── LabMixService           → orchestrate toàn bộ mix flow
│   ├── ReactionPredictionService → cache check + Gemini predict
│   ├── ChemicalResolverService  → fallback chain: DB→PubChem→Cactus→OPSIN
│   ├── AiInterpretationService  → single/multi-turn chat với Gemini
│   ├── ExperimentLogService     → ghi log mọi action vào Supabase
│   ├── CacheService             → read/write ReactionApiCache
│   └── RateLimitService         → 2000ms cooldown per session
├── client/
│   ├── AiClient        → Google Gemini API + key rotation tự động khi 429
│   ├── PubChemClient   → PubChem REST API
│   ├── CactusClient    → NCI/Cactus API
│   └── OpsinClient     → OPSIN (IUPAC name → formula)
├── config/
│   ├── CorsConfig              → đọc app.cors.allowed-origins
│   ├── AppProperties           → strongly-typed config từ application.properties
│   ├── DataSourceConfig        → Supabase connection (không dùng Spring auto-config)
│   └── DatabaseConnectionSingleton → singleton pattern cho DB connection
└── entity/
    ├── ChemicalCache       → cache kết quả resolve chemical
    ├── ReactionApiCache    → cache kết quả predict reaction (tránh gọi Gemini lại)
    ├── ExperimentSession   → session metadata
    └── ExperimentLog       → log từng action (MIX, AI_ASK, AI_CHAT, SESSION_RESET)
```

**Fallback chain resolve chemical:**
```
Input (tên/formula)
  → Supabase ChemicalCache (B-Tree index, O(log n))
  → PubChem REST API
  → NCI/Cactus API
  → OPSIN (IUPAC name parser)
  → AI fallback (Gemini)
```

**Fallback chain predict reaction:**
```
reactants
  → Supabase ReactionApiCache
  → Google Gemini (với key rotation: key[0] → key[1] → key[2] khi gặp 429)
  → Validate JSON output
  → Save cache
```

---

## 📡 API Reference

Base URL: `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger-ui.html`

### Lab

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/lab/mix` | Simulate reaction — endpoint chính |
| GET | `/api/session/{sessionCode}/logs` | Lấy log thí nghiệm |
| POST | `/api/session/reset` | Reset session (log vẫn giữ trong DB) |

**POST `/api/lab/mix` — Request:**
```json
{
  "sessionCode": "session-abc12345",
  "sourceVesselId": "vessel-xyz-source",
  "targetVesselId": "vessel-xyz",
  "sourceContents": [{ "inputName": "HCl", "formula": "HCl", "amountMl": 10 }],
  "targetContents": [{ "inputName": "NaOH", "formula": "NaOH", "amountMl": 10 }],
  "temperature": 25,
  "pressure": 1,
  "catalyst": "Không"
}
```

**POST `/api/lab/mix` — Response:**
```json
{
  "status": "success",
  "source": "AI_PREDICTION",
  "cached": false,
  "confidence": 0.95,
  "result": {
    "hasReaction": true,
    "equation": "HCl + NaOH → NaCl + H₂O",
    "productFormula": "NaCl + H₂O",
    "effectType": "COLOR_CHANGE",
    "effectColor": "#e8f5e9",
    "messageVi": "Phản ứng trung hòa tạo muối NaCl và nước.",
    "explanationVi": "Axit HCl tác dụng với bazơ NaOH...",
    "safetyNoteVi": "Phản ứng tỏa nhiệt, cẩn thận khi thao tác.",
    "confidence": 0.95
  },
  "newTargetVesselState": {
    "vesselId": "vessel-xyz",
    "displayColor": "#e8f5e9",
    "contents": [
      { "formula": "NaCl", "state": "AQUEOUS" },
      { "formula": "H2O", "state": "LIQUID" }
    ]
  }
}
```

**`source` field:**

| Value | Nghĩa |
|---|---|
| `CACHE` | Lấy từ Supabase cache |
| `AI_PREDICTION` | Gemini dự đoán lần đầu |
| `API_PREDICTION` | Từ external chemical API |
| `MOCK` | Mock mode (BE dev/test) |

**`effectType` values:**

| Value | Hiệu ứng FE |
|---|---|
| `NONE` | Không có hiệu ứng |
| `GAS_BUBBLE` | `GasBubbleEffect` — bọt khí nổi lên |
| `PRECIPITATE` | `PrecipitateEffect` — hạt rơi xuống |
| `COLOR_CHANGE` | `ColorChangeEffect` — đổi màu dung dịch |
| `HEAT` | `HeatEffect` — hơi nóng, glow cam |
| `EXPLOSION` | `ExplosionEffect` — flash + sparks + warning |

**Error responses:**

| HTTP | Khi nào |
|---|---|
| `400` | Thiếu `sessionCode`, `sourceContents` rỗng, ... |
| `429` | Gọi `/api/lab/mix` quá nhanh (< 2s per session) |
| `500` | Gemini timeout, Supabase không kết nối được, ... |

### Chemical

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/chemicals/resolve?query=H2SO4` | Resolve tên/công thức hoá chất |

### AI Assistant

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/ai/ask` | Single-turn Q&A về phản ứng |
| POST | `/api/ai/chat` | Multi-turn conversation |

---

## 🔐 CORS & Session

**CORS** — config tại `CorsConfig.java`, đọc từ `application.properties`:
```properties
# Dev (hiện tại — cho phép tất cả):
app.cors.allowed-origins=*

# Production — đổi thành:
app.cors.allowed-origins=https://yourdomain.com,http://localhost:3000
```
Áp dụng cho `/api/**`, methods: `GET, POST, PUT, DELETE, OPTIONS`.

**Session Code** — do FE generate, không phải BE:
```typescript
// lab-store.ts — khởi tạo khi load page
sessionCode: `session-${nanoid(8)}`
// Lưu trong Zustand in-memory → mất khi F5 → session mới
// Gửi kèm mọi request để BE group logs đúng session
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- Java 17
- Tài khoản Supabase (hoặc dùng H2 in-memory cho dev không cần DB)

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev    # http://localhost:3000
```

`.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend

```bash
cd backend
./mvnw spring-boot:run    # http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
```

`application.properties` (các key quan trọng):
```properties
# Supabase
app.supabase.url=https://<project-ref>.supabase.co
app.supabase.anon-key=<anon-key>

# Gemini — nhiều key tự động xoay vòng khi quota 429
app.ai.api-keys[0]=AIzaSy...
app.ai.api-keys[1]=AIzaSy...
app.ai.model=gemini-2.0-flash
app.ai.mock-mode=false    # true = dùng mock, không gọi Gemini

# CORS
app.cors.allowed-origins=*

# Rate limit
app.rate-limit.mix-cooldown-ms=2000
```

> ⚠️ Schema DB được quản lý thủ công — chạy `schema.sql` trên Supabase Dashboard lần đầu.
> `spring.jpa.hibernate.ddl-auto=none` — Spring KHÔNG tự tạo bảng.

### Chạy offline (không cần backend)

```bash
# Chỉ chạy frontend — mock reactions sẽ tự động được dùng khi BE không respond
cd frontend && npm run dev
```

Mock mode hoạt động nhờ `src/utils/reaction-mock.ts` — không cần network, không cần config.

---

## 🧪 Kiểm tra nhanh

```bash
# Health check
curl http://localhost:8080/api/health

# Test mix HCl + NaOH
curl -X POST http://localhost:8080/api/lab/mix \
  -H "Content-Type: application/json" \
  -d '{
    "sessionCode": "test-001",
    "sourceVesselId": "s1",
    "targetVesselId": "t1",
    "sourceContents": [{"inputName":"HCl","formula":"HCl","amountMl":10}],
    "targetContents": [{"inputName":"NaOH","formula":"NaOH","amountMl":10}]
  }'

# Resolve hoá chất
curl "http://localhost:8080/api/chemicals/resolve?query=H2SO4"

# Swagger UI
open http://localhost:8080/swagger-ui.html
```

---

## 🌳 Architecture Notes

- **Supabase PostgreSQL** — hosted DB, B-Tree index trên chemical registry (O(log n) lookup)
- **Reaction cache** — `ReactionApiCache` lưu kết quả Gemini, tránh gọi lại cho cùng reactants
- **AI key rotation** — `AiClient` tự xoay sang key tiếp theo khi gặp HTTP 429
- **Rate limiting** — 2000ms cooldown per `sessionCode` tại BE
- **Offline mode** — FE fallback sang `reaction-mock.ts` khi `mixChemicals()` throw error
- **Session-based logging** — mọi action (MIX, AI_ASK, RESET) được log vào `ExperimentLog` theo `sessionCode`
- **No SSR for lab** — toàn bộ lab UI là `"use client"`, Zustand store khởi tạo phía browser
