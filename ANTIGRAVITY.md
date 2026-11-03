# OVRA — System Engineering Master Specification

**Project Identity:** OVRA (formerly BharatFlow)  
**Motto:** Build once. Automate anything. Scale infinitely.  
**Core Pillars:** AI-native · India-built · Developer-first · Enterprise-ready  
**Current Phase:** Phase 0 — Architecture Review and Security Specification (Strictly No Application Code)

---

## 1. Governance and Engineering Rules

1. **Architecture Before Code:** No application code, package manifests, or infrastructure definitions may be written until Phase 0 review is approved.
2. **Immutable ADRs:** Accepted Architecture Decision Records (ADRs) cannot be modified directly. Any proposed deviation must be submitted as a formal proposal in `docs/decisions/proposals/` and approved by the owner.
3. **No Fake Implementations:** Never generate dummy mock logic and label it production-ready.
4. **Deterministic Workflows:** Temporal workflow functions must remain strictly deterministic. All I/O, randomness, time checks, and external API requests must execute inside Activities.
5. **Security by Architecture:**
   - Multi-tenancy must be enforced at application and database layers (PostgreSQL Row-Level Security as defense-in-depth).
   - Arbitrary user code is untrusted and must never execute in trusted services.
   - Credentials must never be transmitted to client browsers or arbitrary code nodes.
   - Outbound HTTP requests must be guarded by an SSRF Egress Gateway.
6. **Explicit Boundaries:** Control plane and execution plane must be strictly decoupled.

---

## 2. Directory Structure

```
ovra/
├── ANTIGRAVITY.md
├── docs/
│   ├── architecture/
│   │   ├── SYSTEM-ARCHITECTURE.md
│   │   └── EXECUTION-ENGINE.md
│   ├── security/
│   │   └── THREAT-MODEL.md
│   ├── contracts/
│   ├── data/
│   ├── decisions/
│   │   ├── ADR/
│   │   │   ├── 001-control-plane.md
│   │   │   ├── 002-temporal-orchestration.md
│   │   │   ├── 003-tenant-isolation.md
│   │   │   ├── 004-execution-sandbox.md
│   │   │   └── 005-event-delivery.md
│   │   └── proposals/
│   ├── delivery/
│   │   └── IMPLEMENTATION-GATES.md
│   └── review/
│       ├── PHASE-0-REVIEW.md
│       ├── OPEN-QUESTIONS.md
│       ├── RISK-REGISTER.md
│       ├── DIAGRAMS.md
│       └── PHASE-1-BACKLOG.md
```
