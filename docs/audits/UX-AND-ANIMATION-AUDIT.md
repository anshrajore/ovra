# OVRA UX and Motion System Audit

**Audit Date:** 10 November 2026  
**Auditor:** Antigravity  

---

## 1. Existing Animation Baseline Inspection
- **Implementation:** [`ScrollRevealObserver.tsx`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/components/landing/ScrollRevealObserver.tsx) and CSS classes in [`src/app/globals.css`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/app/globals.css).
- **Mechanism:** Browser-native `IntersectionObserver` adding `.scroll-reveal-visible` to elements marked `.scroll-reveal`.
- **Finding:**
  - Owner reports that animations are not sufficiently visible or dynamic.
  - CSS opacity/translate entrance lacks scrub-tied progress, timeline sequencing, responsive breakpoints, and fine-grained easing.
  - No continuous scrub interaction or pin capability exists.

---

## 2. GSAP Architecture Blueprint (Per Plan 2.6 Section 4)

1. **Packages to Install:**
   - `gsap` (pinned version `^3.12.7`)
   - `@gsap/react` (pinned version `^2.1.2`)
2. **Client-Only Animation Modules:**
   - `src/animation/gsap-client.ts`: Registers `ScrollTrigger` and `useGSAP` in client boundaries only.
   - `src/components/marketing/LandingMotion.tsx`: Houses the GSAP timelines for landing page hero, feature cards, and storytelling scrub.
3. **Motion Storyboard:**
   - **Hero:** Word/line stagger reveal (`opacity: 0, y: 24` -> `1, 0`) with smooth ease `power3.out`.
   - **Product Architecture Scrub:** SVG edge connection line drawn smoothly as the user scrolls past the workflow preview.
   - **Feature & Integration Cards:** Staggered scale and upward drift.
   - **Reduced Motion:** Automatic detection via `gsap.matchMedia("(prefers-reduced-motion: reduce)")` ensuring full immediate visibility with 0 layout disruption.
   - **Strict React Cleanup:** Every `useGSAP` invocation returns `mm.revert()` to eliminate orphaned listeners on route transitions.
