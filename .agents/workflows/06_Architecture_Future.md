## Post-MVP / Future Enhancements

These features are **out of scope** for MVP. Build them after all 5 phases ship:

| Feature | Priority | Notes |
|---------|----------|-------|
| Notebook (save experiments) | High | Save to localStorage, list view |
| PDF export | Medium | `jsPDF` or browser print |
| Advanced explanation tab | Medium | Full ionic equations, thermodynamics |
| Real AI explanations (Gemini) | Medium | Replace mock explanations with live AI |
| Ion view mode | Low | Animated ion separation |
| Particle/molecular view | Low | Simplified molecular animation |
| Full smart suggestion engine | Low | ML-based compatible reactant suggestions |
| Onboarding tour | Low | First-time user walkthrough |
| Mobile responsive layout | Low | Currently desktop-only |
| User accounts & cloud sync | Low | Authentication + Supabase persistence |
| Multiplayer experiments | Very Low | Real-time collaboration |

---

## Architecture Guidelines

### File Structure
```
frontend/src/
├── app/                    # Next.js App Router
├── api/client/             # API client functions
├── components/
│   ├── chemlab/
│   │   ├── effects/        # Visual effect components
│   │   ├── panels/         # Side panels (Library, Controls, Explanation)
│   │   ├── tray/           # Current Tray components
│   │   └── scene/          # 2.5D lab scene (SVG)
│   ├── chatbot/            # AI chatbot widget
│   └── ui/                 # Radix-based primitives
├── constants/              # Chemical data, presets
├── hooks/                  # Custom hooks
├── stores/                 # Zustand stores
├── types/                  # TypeScript types
├── utils/                  # Utilities + reaction-mock.ts
└── themes/                 # Design tokens
```

### Key Principles
1. **Mock-first:** `reaction-mock.ts` is the primary reaction source. Never block on backend.
2. **Incremental refactor:** Don't rewrite `lab-store.ts` in one shot. Add slices per phase.
3. **Component modularity:** One component = one job. Compose in Shell/Layout.
4. **Type safety:** All props, store, and API payloads fully typed.
5. **Performance:** Zustand selectors, `React.memo`, virtualized lists, lazy panels.

### Phase Dependency
```
Phase 1 (Shell + Scene)
   └──▶ Phase 2 (Library + Tray)
           └──▶ Phase 3A (DnD MVP)
                   └──▶ Phase 3B (Controls + Mock Reactions)
                           └──▶ Phase 4 (Effects + Presets)
                                   └──▶ Phase 5 (Learning + Safety + Polish)
```

Each phase produces a **deployable increment**. No phase breaks previous work.

---

> **Last Updated:** April 28, 2026
> **Status:** Phase 1 ready to begin.
> **Critical path:** `reaction-mock.ts` (Phase 3B) is the most important new file — it unblocks the entire MVP from backend dependency.
