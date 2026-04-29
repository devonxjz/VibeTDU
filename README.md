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
DATA:         src/data/chemicals.ts
STYLES:       src/app/globals.css  (design tokens — đừng override, chỉ extend)
BACKEND URL:  http://localhost:8080  (local) | xem .env.local
```

**Quy tắc bắt buộc:**
- Sau mỗi task chạy `npx tsc --noEmit`. Không pass → không tiếp.
- Chỉ touch file được liệt kê trong task.
- Không xóa code đang hoạt động — chỉ extend.
- Không cài thêm package nếu không có trong task.
- Phase 1–2 đã DONE — không sửa.

---

## 🗂️ Cấu trúc thư mục Frontend

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, font imports
│   │   ├── page.tsx            # Entry → <ChemLabShell />
│   │   └── globals.css         # Design tokens, lab scene CSS
│   ├── components/
│   │   └── chemlab/
│   │       ├── AppShell.tsx    # Layout wrapper, DnD context
│   │       ├── TopBar.tsx      # App header, Undo/Reset buttons
│   │       ├── CurrentTray.tsx # Chemical tray (bottom)
│   │       ├── ChemBottle.tsx  # Bottle component
│   │       ├── scene/
│   │       │   ├── LabWorkbench.tsx      # Center lab scene (SVG beaker)
│   │       │   ├── BeakerDropZone.tsx    # [3A-1] Drop target wrapper
│   │       │   └── ReactionResultCard.tsx# [3B-4] Reaction overlay card
│   │       ├── panels/
│   │       │   ├── ReactionControlPanel.tsx # [3B-2] Temp/pH/Catalyst
│   │       │   ├── ReactionInfoPanel.tsx    # [3B-5] Observation/Explanation
│   │       │   └── ExplanationPanel.tsx     # [5-1] 3-level learning tabs
│   │       ├── effects/
│   │       │   ├── GasBubbleEffect.tsx   # [4-1]
│   │       │   ├── PrecipitateEffect.tsx # [4-2]
│   │       │   └── ExplodeEffect.tsx     # [4-3]
│   │       ├── timeline/
│   │       │   └── ExperimentTimeline.tsx # [5-2]
│   │       └── PresetSelector.tsx         # [4-4]
│   ├── stores/
│   │   └── lab-store.ts        # Zustand store — state + actions
│   ├── types/
│   │   ├── lab.ts              # Vessel, Position, ActiveEffect...
│   │   └── api.ts              # MixRequest, MixResponse, ReactionResult...
│   ├── data/
│   │   └── chemicals.ts        # Chemical list + CHEMICAL_COLORS
│   ├── utils/
│   │   ├── color.ts            # [3A-5] blendColors()
│   │   └── reaction-mock.ts    # [3B-1] getMockReaction(), offline data
│   └── api/
│       └── client/
│           ├── lab.ts          # mixChemicals(), resetSession()
│           ├── chemical.ts     # resolveChemical()
│           └── http.ts         # fetch wrapper
```

> File đánh dấu `[3A-1]`, `[3B-2]`... = tạo mới ở task đó. File không có tag = đã tồn tại.

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- Java 17 (cho backend)
- PostgreSQL hoặc để H2 in-memory (dev)

### Frontend

```bash
cd frontend
cp .env.example .env.local   # Xem phần Environment bên dưới
npm install
npm run dev                  # http://localhost:3000
```

### Backend

```bash
cd backend
./mvnw spring-boot:run       # http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Environment Variables

Tạo file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Tạo file `backend/src/main/resources/application-local.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/chemlab
spring.datasource.username=postgres
spring.datasource.password=your_password
gemini.api.key=YOUR_GEMINI_API_KEY
```

> Để chạy offline (không cần backend): mock reactions trong `src/utils/reaction-mock.ts` hoạt động độc lập, không cần API.

---

## 🔬 About the Project

**VibeTDU (Virtual Chemistry Lab)** là nền tảng web mô phỏng thí nghiệm hoá học tương tác. Thiết kế cho mục đích giáo dục, cung cấp môi trường ảo an toàn để kéo-thả hoá chất và quan sát phản ứng theo thời gian thực.

Tích hợp cơ sở dữ liệu hoá chất bên ngoài (PubChem, Cactus, OPSIN) và AI assistant (Google Gemini) để giải thích phản ứng bằng tiếng Việt.

---

## ✨ Features

- **Drag & Drop Interface** — `@dnd-kit`, kéo hoá chất vào beaker
- **Real-time Reaction Simulation** — `GAS_BUBBLE`, `PRECIPITATE`, `COLOR_CHANGE`, `HEAT`, `EXPLOSION`
- **Dynamic Chemical Resolution** — DB Cache → PubChem → Cactus → OPSIN
- **AI Chatbot** — Google Gemini, context-aware, tiếng Việt
- **Experiment Logging** — lưu toàn bộ action theo session
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
| Database | PostgreSQL (prod) / H2 (dev) |
| API Docs | SpringDoc OpenAPI / Swagger UI |
| AI | Google Gemini via WebClient |
| External APIs | PubChem, NCI/Cactus, OPSIN |

---

## 📡 API Endpoints

Base URL: `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

### Lab Operations

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/lab/mix` | Simulate reaction giữa 2 vessels |

**POST `/api/lab/mix` payload:**
```json
{
  "sessionCode": "session-abc123",
  "sourceVesselId": "vessel-1",
  "targetVesselId": "vessel-2",
  "sourceContents": [{ "inputName": "HCl", "formula": "HCl", "amountMl": 10 }],
  "targetContents": [{ "inputName": "NaOH", "formula": "NaOH", "amountMl": 10 }],
  "temperature": 25,
  "pressure": 1,
  "catalyst": "Không"
}
```

### Chemical Resolution

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/chemicals/resolve?query=H2SO4` | Resolve tên/công thức hoá chất |

### AI Assistant

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/ai/ask` | Hỏi về phản ứng cụ thể |
| POST | `/api/ai/chat` | Multi-turn conversation |

### Session Management

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/session/{sessionCode}/logs` | Lấy log thí nghiệm |
| POST | `/api/session/reset` | Reset session |

---

## 🌳 Architecture Notes

- **B-Tree indexing** trên PostgreSQL cho chemical registry — O(log n) lookup
- **Fallback chain**: DB Cache → PubChem → Cactus → OPSIN → AI
- **Offline mode**: `reaction-mock.ts` không cần network, dùng cho dev/test
- **Session-based**: mỗi browser session có `sessionCode` riêng (nanoid)