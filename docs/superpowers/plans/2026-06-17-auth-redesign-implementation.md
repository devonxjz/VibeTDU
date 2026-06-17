# Auth Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real Google and email/password auth, remove the nickname prompt, and derive the displayed nickname from `users.name`.

**Architecture:** The backend owns identity, JWT creation, Google token verification, and journal ownership. The frontend stores the returned JWT/user profile, attaches bearer tokens through the existing HTTP client, and gates the lab behind a premium auth screen.

**Tech Stack:** Spring Boot 3.2, JPA, JJWT, Google API Client, Spring `OncePerRequestFilter`, BCrypt via `spring-security-crypto`, Next.js 16, React 19, Tailwind v4, Framer Motion, Vitest, React Testing Library.

---

## File Structure

- Modify: `backend/pom.xml` — add `spring-security-crypto` for BCrypt.
- Modify: `backend/src/main/resources/schema.sql` — add `users.password_hash` and `lab_journals.user_id`.
- Create: `backend/src/main/java/com/virtualchemistrylab/entity/User.java` — JPA mapping for `users`.
- Create: `backend/src/main/java/com/virtualchemistrylab/repository/UserRepository.java` — lookup by id, email, and Google subject.
- Create: `backend/src/main/java/com/virtualchemistrylab/dto/auth/AuthRequests.java` — request DTOs.
- Create: `backend/src/main/java/com/virtualchemistrylab/dto/auth/AuthResponse.java` — auth response DTO.
- Create: `backend/src/main/java/com/virtualchemistrylab/service/auth/JwtService.java` — token issue/parse.
- Create: `backend/src/main/java/com/virtualchemistrylab/service/auth/GoogleTokenVerifier.java` — Google ID token verification boundary.
- Create: `backend/src/main/java/com/virtualchemistrylab/service/auth/AuthService.java` — register/login/google/me business logic.
- Create: `backend/src/main/java/com/virtualchemistrylab/config/AuthFilter.java` — request authentication for `/api/auth/me` and `/api/journal`.
- Create: `backend/src/main/java/com/virtualchemistrylab/config/AuthUser.java` — request attribute helper.
- Create: `backend/src/main/java/com/virtualchemistrylab/controller/AuthController.java` — auth endpoints.
- Modify: `backend/src/main/java/com/virtualchemistrylab/entity/LabJournal.java` — add `user`.
- Modify: `backend/src/main/java/com/virtualchemistrylab/repository/LabJournalRepository.java` — query by user id.
- Modify: `backend/src/main/java/com/virtualchemistrylab/service/LabJournalService.java` — save/list for current user.
- Modify: `backend/src/main/java/com/virtualchemistrylab/controller/LabJournalController.java` — require current user.
- Create: `backend/src/test/java/com/virtualchemistrylab/controller/AuthControllerTest.java` — backend auth integration tests.
- Create: `backend/src/test/java/com/virtualchemistrylab/controller/LabJournalAuthTest.java` — journal ownership tests.
- Create: `frontend/src/api/client/auth.ts` — auth API client.
- Modify: `frontend/src/api/client/http.ts` — attach bearer token.
- Modify: `frontend/src/api/client/journal.ts` — use backend journal API with auth token.
- Create: `frontend/src/stores/auth-store.ts` — token/user persistence and nickname sync.
- Create: `frontend/src/components/auth/AuthGate.tsx` — renders auth screen or lab.
- Create: `frontend/src/components/auth/AuthPanel.tsx` — visual login/register panel.
- Modify: `frontend/src/components/WelcomeModal.tsx` — remove nickname modal behavior, keep or replace only exported storage helper if still needed.
- Modify: `frontend/src/app/page.tsx` — use `AuthGate`.
- Create: `frontend/src/api/client/auth.test.ts` — auth client/storage tests.
- Create: `frontend/src/components/auth/AuthGate.test.tsx` — auth gate behavior tests.
- Modify: `frontend/src/components/hydration-regression.test.tsx` — remove old WelcomeModal expectation and assert auth gate server safety.

---

### Task 1: Backend Auth RED Tests

**Files:**
- Create: `backend/src/test/java/com/virtualchemistrylab/controller/AuthControllerTest.java`

- [ ] **Step 1: Write failing tests**

Create tests that call endpoints that do not exist yet:

```java
package com.virtualchemistrylab.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.virtualchemistrylab.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;

    @BeforeEach
    void clean() {
        userRepository.deleteAll();
    }

    @Test
    void registerCreatesLocalUserAndReturnsToken() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "name", "Nguyen Van A",
                        "email", "student@example.com",
                        "password", "secret123"
                ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", not(blankOrNullString())))
                .andExpect(jsonPath("$.user.email").value("student@example.com"))
                .andExpect(jsonPath("$.user.name").value("Nguyen Van A"))
                .andExpect(jsonPath("$.user.provider").value("local"));
    }

    @Test
    void loginRejectsInvalidPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", "student@example.com",
                        "password", "wrong"
                ))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meReturnsProfileForBearerToken() throws Exception {
        String body = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "name", "Tran Le Thai",
                        "email", "thai@example.com",
                        "password", "secret123"
                ))))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String token = objectMapper.readTree(body).get("token").asText();

        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("thai@example.com"))
                .andExpect(jsonPath("$.name").value("Tran Le Thai"));
    }
}
```

- [ ] **Step 2: Run RED**

Run: `cd backend; .\mvnw.cmd -Dtest=AuthControllerTest test`

Expected: compile or test failure because `UserRepository` and `/api/auth/*` are not implemented. This is the intended RED signal.

- [ ] **Step 3: Commit RED checkpoint**

Run:

```powershell
git add backend/src/test/java/com/virtualchemistrylab/controller/AuthControllerTest.java
git commit -m "test: add backend auth endpoint coverage"
```

---

### Task 2: Backend Auth GREEN Implementation

**Files:**
- Modify: `backend/pom.xml`
- Modify: `backend/src/main/resources/schema.sql`
- Create: backend auth files listed in File Structure

- [ ] **Step 1: Add minimal auth implementation**

Implement:

- `User` with fields matching `users`: `id`, `email`, `provider`, `googleSub`, `name`, `pictureUrl`, `passwordHash`, `aiQuotaRemaining`, `lastResetDate`, `createdAt`.
- `UserRepository` methods: `findByEmailIgnoreCase`, `findByGoogleSub`, `findById`.
- `AuthRequests` records: `RegisterRequest(name,email,password)`, `LoginRequest(email,password)`, `GoogleLoginRequest(credential)`.
- `AuthResponse` record: `token`, nested `UserProfile(id,email,name,pictureUrl,provider,aiQuotaRemaining)`.
- `JwtService` issuing HS256 tokens with user id as subject.
- `AuthService.register` hashing passwords with BCrypt and rejecting duplicate email with 409.
- `AuthService.login` validating password and returning 401 for invalid credentials.
- `AuthController` endpoints from the spec.
- `AuthFilter` protecting `/api/auth/me` and `/api/journal`.

- [ ] **Step 2: Run GREEN**

Run: `cd backend; .\mvnw.cmd -Dtest=AuthControllerTest test`

Expected: all `AuthControllerTest` tests pass.

- [ ] **Step 3: Commit GREEN checkpoint**

Run:

```powershell
git add backend/pom.xml backend/src/main/resources/schema.sql backend/src/main/java/com/virtualchemistrylab/entity/User.java backend/src/main/java/com/virtualchemistrylab/repository/UserRepository.java backend/src/main/java/com/virtualchemistrylab/dto/auth backend/src/main/java/com/virtualchemistrylab/service/auth backend/src/main/java/com/virtualchemistrylab/config/AuthFilter.java backend/src/main/java/com/virtualchemistrylab/config/AuthUser.java backend/src/main/java/com/virtualchemistrylab/controller/AuthController.java
git commit -m "feat: add backend auth endpoints"
```

---

### Task 3: Journal Ownership TDD

**Files:**
- Create: `backend/src/test/java/com/virtualchemistrylab/controller/LabJournalAuthTest.java`
- Modify: `backend/src/main/java/com/virtualchemistrylab/entity/LabJournal.java`
- Modify: `backend/src/main/java/com/virtualchemistrylab/repository/LabJournalRepository.java`
- Modify: `backend/src/main/java/com/virtualchemistrylab/service/LabJournalService.java`
- Modify: `backend/src/main/java/com/virtualchemistrylab/controller/LabJournalController.java`
- Modify: `backend/src/main/resources/schema.sql`

- [ ] **Step 1: Write failing ownership tests**

Test:

- `GET /api/journal` without token returns 401.
- User A creates a journal, User B does not see it.
- User A sees their own journal.

- [ ] **Step 2: Run RED**

Run: `cd backend; .\mvnw.cmd -Dtest=LabJournalAuthTest test`

Expected: failure because journal currently has no user ownership.

- [ ] **Step 3: Implement minimal ownership**

Add `@ManyToOne(fetch = FetchType.LAZY)` from `LabJournal` to `User`, add `findAllByUserIdOrderByCreatedAtDesc(UUID userId)`, pass the authenticated request user into service save/list, and return only the current user's rows.

- [ ] **Step 4: Run GREEN**

Run: `cd backend; .\mvnw.cmd -Dtest=LabJournalAuthTest,AuthControllerTest test`

Expected: both test classes pass.

- [ ] **Step 5: Commit checkpoint**

Run:

```powershell
git add backend/src/test/java/com/virtualchemistrylab/controller/LabJournalAuthTest.java backend/src/main/java/com/virtualchemistrylab/entity/LabJournal.java backend/src/main/java/com/virtualchemistrylab/repository/LabJournalRepository.java backend/src/main/java/com/virtualchemistrylab/service/LabJournalService.java backend/src/main/java/com/virtualchemistrylab/controller/LabJournalController.java backend/src/main/resources/schema.sql
git commit -m "feat: scope journals to authenticated users"
```

---

### Task 4: Frontend Auth State and API TDD

**Files:**
- Create: `frontend/src/api/client/auth.test.ts`
- Create: `frontend/src/api/client/auth.ts`
- Modify: `frontend/src/api/client/http.ts`
- Modify: `frontend/src/api/client/journal.ts`
- Create: `frontend/src/stores/auth-store.ts`

- [ ] **Step 1: Write failing frontend tests**

Test:

- `saveAuthSession` writes `vibetdu_auth_token`, `vibetdu_auth_user`, and `vibe_user_name`.
- `post` sends `Authorization: Bearer <token>` when a token exists.
- `loginWithPassword` posts to `/api/auth/login`.

- [ ] **Step 2: Run RED**

Run: `cd frontend; npm test -- src/api/client/auth.test.ts`

Expected: failure because auth client/store functions do not exist.

- [ ] **Step 3: Implement minimal frontend auth client/state**

Add typed auth API functions, localStorage persistence guards for SSR, and token attachment in `http.ts`.

- [ ] **Step 4: Run GREEN**

Run: `cd frontend; npm test -- src/api/client/auth.test.ts`

Expected: auth client tests pass.

- [ ] **Step 5: Commit checkpoint**

Run:

```powershell
git add frontend/src/api/client/auth.test.ts frontend/src/api/client/auth.ts frontend/src/api/client/http.ts frontend/src/api/client/journal.ts frontend/src/stores/auth-store.ts
git commit -m "feat: add frontend auth client state"
```

---

### Task 5: Image-First Auth Screen Reference

**Files:**
- No production files in this task.

- [ ] **Step 1: Generate visual reference**

Generate one standalone image for the first auth screen:

```text
Premium chemistry learning app authentication screen for VibeTDU, warm tactile cream and soft structural layout, editorial split composition, one precise double-bezel login panel on the right, cinematic lab bench visual on the left with glass beakers and gentle daylight, no nickname input, Google sign-in button, email/password login, register toggle, spacious first viewport, refined grotesk typography, no generic purple gradients, no clutter, no nested card stacks, implementation-friendly web UI screenshot.
```

- [ ] **Step 2: Analyze reference**

Extract the palette, spacing, typography, button shape, panel structure, mobile collapse, and copy rules before coding.

- [ ] **Step 3: Save analysis notes**

Add concise notes to the implementation work log or final response, not production code.

---

### Task 6: Frontend Auth Gate and UI TDD

**Files:**
- Create: `frontend/src/components/auth/AuthGate.test.tsx`
- Create: `frontend/src/components/auth/AuthGate.tsx`
- Create: `frontend/src/components/auth/AuthPanel.tsx`
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/components/WelcomeModal.tsx`
- Modify: `frontend/src/components/hydration-regression.test.tsx`

- [ ] **Step 1: Write failing UI tests**

Test:

- No token renders auth UI with "Tiếp tục với Google".
- Authenticated state renders children.
- Login success stores `vibe_user_name` from `user.name`.
- The old nickname placeholder does not appear.

- [ ] **Step 2: Run RED**

Run: `cd frontend; npm test -- src/components/auth/AuthGate.test.tsx src/components/hydration-regression.test.tsx`

Expected: failure because `AuthGate` does not exist and old WelcomeModal tests still expect nickname behavior.

- [ ] **Step 3: Implement UI from the generated reference**

Build a single full-screen auth gate with:

- Warm premium background tied to the current lab identity.
- One art-directed scene area, one auth panel.
- Google button using `@react-oauth/google`.
- Email/password login and register mode.
- No nickname input.
- Framer Motion transitions using transform/opacity.
- Responsive single-column mobile layout.

- [ ] **Step 4: Run GREEN**

Run: `cd frontend; npm test -- src/components/auth/AuthGate.test.tsx src/components/hydration-regression.test.tsx`

Expected: auth UI and hydration tests pass.

- [ ] **Step 5: Commit checkpoint**

Run:

```powershell
git add frontend/src/components/auth frontend/src/app/page.tsx frontend/src/components/WelcomeModal.tsx frontend/src/components/hydration-regression.test.tsx
git commit -m "feat: replace nickname prompt with auth gate"
```

---

### Task 7: Verification and Visual QA

**Files:**
- Modify only if verification reveals task-related issues.

- [ ] **Step 1: Backend verification**

Run: `cd backend; .\mvnw.cmd test`

Expected: backend test suite passes.

- [ ] **Step 2: Frontend verification**

Run:

```powershell
cd frontend
npm test
npm run lint
npm run build
```

Expected: test, lint, and build pass.

- [ ] **Step 3: Browser visual check**

Start frontend dev server and inspect:

- Desktop auth screen does not overflow.
- Mobile auth screen stacks cleanly.
- No nickname input is visible.
- Logged-in lab displays `users.name`.

- [ ] **Step 4: Final anti-slop check**

Confirm:

- No cards-inside-cards-inside-cards.
- No default purple-blue AI gradient.
- No decorative micro-label clutter.
- No manual nickname field.
- Buttons and inputs have stable dimensions and readable text on mobile.
