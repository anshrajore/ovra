# OVRA Phase 2 Implementation Backlog (Plan 2.6)

**Audit Date:** 10 November 2026  
**Auditor:** Antigravity  

---

## 1. Phase B — Blank-First Workspace & Onboarding Correction
- [ ] **B.1: Canvas Blank State:**
  - Remove automatic instantiation of `initialWorkflow` in [`src/app/studio/page.tsx`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/app/studio/page.tsx) and [`src/components/studio/WorkflowCanvas.tsx`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/components/studio/WorkflowCanvas.tsx).
  - Implement `<BlankCanvasState />` with:
    - Primary Button: "Create Blank Workflow" (adds starter manual trigger node).
    - Secondary Button: "Choose From Templates" (opens template drawer).
    - Tertiary Button: "Import Workflow JSON".
- [ ] **B.2: Guard appStore Fallbacks:**
  - Guard `appStore.getWorkflows()`: if empty, return empty array `[]` rather than fallback to demo workflow.
- [ ] **B.3: Explicit Template Cloning:**
  - Update [`src/app/templates/page.tsx`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/app/templates/page.tsx): clicking "Use Template" clones template into current active workspace and opens `/studio` with the newly created workflow ID.
- [ ] **B.4: Blank Canvas Tests:**
  - Unit/Contract test verifying new accounts receive 0 workflows by default.

---

## 2. Phase C — GSAP Motion System
- [ ] **C.1: Install Dependencies:**
  - Install `gsap` and `@gsap/react` via `pnpm add gsap @gsap/react`.
- [ ] **C.2: Client Animation Module:**
  - Create `src/animation/gsap-client.ts` registering `ScrollTrigger` and `useGSAP` in client-only boundaries.
- [ ] **C.3: Landing Page Motion:**
  - Create `src/components/marketing/LandingMotion.tsx` targeting landing page elements with `data-gsap-reveal`, `data-gsap-hero`, `data-gsap-story`.
  - Implement scrubbed workflow edge draw and layered card entrances.
  - Implement `prefers-reduced-motion` fallback.
- [ ] **C.4: Verification:**
  - Ensure 0 hydration warnings, 0 layout shifts, and full cleanup on unmount.

---

## 3. Phase D — Product Interaction & Usability
- [ ] **D.1: Interactive Controls:**
  - Remove dead buttons; wire real modal handlers and disable unavailable operations truthfully.
- [ ] **D.2: Loading / Error States:**
  - Add real feedback states to Studio Header, Credentials Vault, and Developer Portal.

---

## 4. Phase E & F — P0 Capabilities & Quality Gate
- [ ] **E.1: Command Palette / Global Search:**
  - Add quick action search (`Ctrl+K` / `Cmd+K`) across workflows, nodes, and docs.
- [ ] **E.2: Production Build & Diagnostics:**
  - Verify `pnpm build` passes with 0 errors across all routes.
