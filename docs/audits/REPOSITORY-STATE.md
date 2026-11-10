# OVRA Repository State and Baseline Audit
**Audit Date:** 10 November 2026  
**Auditor:** Antigravity (Principal Workflow Runtime Engineer)  
**Plan Version:** 2.6  

---

## 1. Git State and Commit Baseline
- **Actual HEAD Commit SHA:** `56104e88f72323d213b87aff235e805e5f4da210`
- **Current Active Branch:** `main`
- **Remote Origin:** `https://github.com/anshrajore/ovra.git` (`## main...origin/main`, clean working tree)
- **Reported Baseline in Work Order:** `afc99be`
- **Delta Commits since Reported Baseline:**
  1. `9ee77fb` — `docs: complete OVRA Node Platform 2.5 Phase 0 repository audit and backlog`
  2. `19a33fb` — `feat(runtime): complete Phase 1 universal runtime contracts, multi-parent lineage, error ports, and golden test suite`
  3. `56104e8` — `feat(connectors): add real working Google Sheets and Email nodes with REST APIs, lineage, and tests`

---

## 2. Environment and Dependency Manifest
- **Framework:** Next.js `15.5.28` (App Router)
- **UI Runtime:** React `19.3.1`, React DOM `19.3.1`
- **Package Manager:** `pnpm` (lockfile version 9.0)
- **Styling:** Tailwind CSS `4.1.18` with custom theme tokens (`#2342FF` cobalt, obsidian, clean dark/light surfaces)
- **Database:** Supabase PostgreSQL with 36 normalized tables, RLS, Drizzle ORM (`0.45.1`), `@supabase/ssr` (`0.8.0`)
- **Canvas Engine:** `@xyflow/react` (`12.4.2`)
- **Animation Baseline:** Native `IntersectionObserver` with CSS transitions (`ScrollRevealObserver.tsx`). **Target:** GSAP `3.x` with `@gsap/react` and `ScrollTrigger`.
- **Runtime Port:** `http://localhost:3000` (Next.js server daemon running)

---

## 3. High-Level Reality Classification Summary

| Layer | Verified Real | Partial / Unverified | Mock / Simulation | Static / Hardcoded | Missing |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **App Routes (33)** | 14 | 11 | 4 | 4 | 0 |
| **API Endpoints (9)** | 5 | 3 | 1 | 0 | 0 |
| **Node Operations (25)**| 8 | 4 | 7 | 6 | 0 |
| **Database Tables (36)**| 36 (Schema exists) | 8 (active CRUD) | 28 (unwired UI) | 0 | 0 |
| **Scroll Animation** | 0 (CSS only) | 1 (IntersectionObserver)| 0 | 0 | GSAP Missing |
| **Canvas Seeding** | 0 | 0 | 1 (Hardcoded demo) | 0 | Blank-first required |

---

## 4. Key Findings & Critical Deviations

1. **Preloaded Workflow Seeding in Canvas (Violation of Product Direction):**
   - [`src/lib/data/initial-workflow.ts`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/lib/data/initial-workflow.ts) defines a 4-node mock workflow (`Webhook Ingestion` -> `AI Sentiment Classifier` -> `Confidence Check` -> `Escalate to Slack`).
   - [`src/app/studio/page.tsx`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/app/studio/page.tsx) and [`src/lib/store/app-store.ts`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/lib/store/app-store.ts) automatically instantiate this workflow for every new visitor.
   - **Resolution:** Migrate to a **blank-first canvas** with a deliberate empty state, offering explicit opt-in buttons: "Create Blank Workflow", "Explore Template Library", or "Import JSON".

2. **GSAP Motion Missing:**
   - Previous pass used CSS transitions with `ScrollRevealObserver.tsx`. The owner specifically requested genuine GSAP (`gsap`, `@gsap/react`, `ScrollTrigger`) with scrubbed storytelling timelines, responsive breakpoints (`gsap.matchMedia()`), and `prefers-reduced-motion` compliance.

3. **Node Runtime Status:**
   - Real working nodes: `core.manual_trigger`, `core.webhook`, `core.http_request`, `logic.if`, `data.set`, `logic.merge`, `comm.slack`, `app.google_sheets`, `comm.email`.
   - Remaining mock nodes: `ai.model`, `ai.agent`, `db.postgres`, `logic.switch`, `logic.loop`.
   - 46 automated contract tests currently pass 100% on `GET /api/v1/test/runtime`.
