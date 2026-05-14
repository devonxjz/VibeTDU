# CI/CD Setup Guide — VibeTDU

## Flow tổng quan

```
Pull Request  →  Lint + Test  (block merge nếu fail)
Push to main  →  Lint + Test  →  Deploy Production
```

Workflow chỉ deploy khi **test pass** và **push thẳng lên `main`** (hoặc merge PR).

---

## Bước 1 — Copy files vào repo

```
.github/
  workflows/
    frontend-deploy.yml
    backend-deploy.yml
```

---

## Bước 2 — Cấu hình GitHub Secrets & Variables

Vào repo → **Settings → Secrets and variables → Actions**

### Frontend (Vercel)

| Secret | Cách lấy |
|--------|----------|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Chạy `cd frontend && npx vercel link`, xem file `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | Cùng file trên → `projectId` |

```bash
# Chạy 1 lần để lấy orgId + projectId
cd frontend
npx vercel link
cat .vercel/project.json
```

### Backend (Render)

| Secret | Cách lấy |
|--------|----------|
| `RENDER_SERVICE_ID` | Render dashboard → Service → Settings → Deploy Hook → lấy phần `srv-xxxx` |
| `RENDER_API_KEY` | Cùng Deploy Hook URL → lấy phần `?key=xxxx` |

Deploy Hook URL có dạng:
```
https://api.render.com/deploy/srv-abc123?key=xyz789
                              ^^^^^^^^^^       ^^^^^^^
                        RENDER_SERVICE_ID   RENDER_API_KEY
```

| Variable (không phải Secret) | Giá trị |
|------------------------------|---------|
| `BACKEND_URL` | URL Render của bạn, vd: `https://vibetdu-api.onrender.com` |

> Tạo **Variable** (không phải Secret) tại: Settings → Secrets and variables → Actions → **Variables tab**

---

## Bước 3 — Thêm Actuator vào Spring Boot

Workflow sẽ gọi `/actuator/health` sau deploy để kiểm tra service đã lên chưa.

**`pom.xml`:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**`application.properties`:**
```properties
management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=never
```

---

## Bước 4 — Cấu hình Render

Trên Render, service Spring Boot cần build bằng:

- **Build Command:** `cd backend && mvn clean package -DskipTests`
- **Start Command:** `java -jar backend/target/*.jar`
- **Root Directory:** *(để trống, vì workflow push từ root repo)*

> Render tự pull code từ GitHub và build lại — workflow chỉ **trigger** deploy hook, Render làm phần còn lại.

---

## Checklist

- [ ] Copy 2 file `.yml` vào `.github/workflows/`
- [ ] `npx vercel link` trong thư mục `frontend`, lấy orgId + projectId
- [ ] Lấy Deploy Hook trên Render
- [ ] Điền đủ 5 secrets/variables vào GitHub
- [ ] Thêm `spring-boot-starter-actuator` vào `pom.xml`
- [ ] Push lên `main` và xem Actions tab