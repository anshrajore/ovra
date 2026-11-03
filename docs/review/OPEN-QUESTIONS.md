# OVRA Open Questions & Design Decisions

**Document ID:** OVRA-QST-001  
**Version:** 1.0.0  
**Date:** 2026-11-03  
**Status:** Awaiting Owner Review & Sign-Off  

---

## 1. Critical Design Decisions Awaiting Owner Approval

### Q1: Primary Database Access Layer — Drizzle ORM vs Prisma
- **Context:** The baseline specification mentions "Prisma or Drizzle". PostgreSQL Row-Level Security (RLS) is our primary defense-in-depth isolation layer. We require transaction-local session variables (`SELECT set_config('app.current_workspace_id', :id, true)`) to prevent context bleeding across pooled database connections (PgBouncer).
- **Analysis:**
  - *Drizzle ORM:* Provides lightweight, transparent SQL generation. Running `await tx.execute(sql`SELECT set_config('app.current_workspace_id', ${id}, true)`)` inside `db.transaction()` runs natively on the exact same checked-out client and clears upon transaction end. Zero query engine overhead.
  - *Prisma:* Abstracts connections behind a Rust query engine. Requires wrapping every query in interactive `$transaction` with raw SQL calls or custom Client Extensions, adding latency and complexity.
- **Architect Recommendation:** Formally accept **Drizzle ORM** as the standard database toolkit for the OVRA Control Plane.
- **Status:** *Proposal drafted in `docs/decisions/proposals/ADR-006-drizzle-orm-data-access.md`.*

---

### Q2: Arbitrary Code Node Policy for Multi-Tenant Cloud
- **Context:** Allowing end users to run arbitrary Python or JavaScript creates the single largest attack surface on the platform. Even with gVisor or microVMs, zero-day kernel vulnerabilities and configuration flaws pose risks.
- **Options:**
  - *Option A (Conservative / Recommended):* Disable Python/JS code execution in public multi-tenant Cloud plans entirely during Phase 1–6. Only allow curated first-party nodes and OEL expressions. Offer isolated code nodes exclusively in enterprise dedicated deployments or private on-prem installations.
  - *Option B (Aggressive):* Build the gVisor sandbox cluster immediately in Phase 7 and enable it for all tiers with strict CPU/memory limits.
- **Architect Recommendation:** Adopt **Option A**. Keep code nodes strictly gated until external penetration testing and red-teaming validate the sandbox boundary.

---

### Q3: Temporal Cluster Topology for Local Development vs Production
- **Context:** Temporal can be run locally using the lightweight `temporal server start-dev` CLI or via a multi-container Docker Compose stack (Temporal Server, Temporal UI, PostgreSQL, Elasticsearch).
- **Options:**
  - *Option A (Fast Developer Experience):* Use the official Temporal CLI dev server container for local development (`temporalio/admin-tools` or standalone CLI dev mode with in-memory or SQLite persistence). Fast startup (<5 seconds), minimal RAM overhead (<200MB).
  - *Option B (Full Production Parity):* Run full Temporal Server with PostgreSQL persistence in local Docker Compose. Higher RAM requirement (~1.5GB) and longer startup time.
- **Architect Recommendation:** Use **Option A** for local development and CI testing, and manage HA Temporal clusters in staging/production via official Helm charts.

---

### Q4: WebSocket Transport & Realtime Scale Strategy
- **Context:** Web Studio needs live execution updates, node status transitions, and collaborative presence.
- **Options:**
  - *Option A:* Fastify WebSocket plugin with Redis Pub/Sub adapter. Low complexity, single-port HTTP/WS server, highly performant for initial phase.
  - *Option B:* Dedicated Socket.IO Gateway. Built-in room management, automatic fallback to long-polling, and mature reconnection protocols, but higher protocol overhead.
- **Architect Recommendation:** Use **Fastify WebSocket** with a custom JSON protocol and Redis Pub/Sub for live push, coupled with the REST replay endpoint for missed messages.

---

### Q5: India Data Sovereignty & DPDP 2025 Compliance Verification
- **Context:** The platform targets Indian businesses, processing customer WhatsApp messages, Razorpay payments, and employee records. The DPDP Rules 2025 mandate data minimization, consent logging, and breach reporting.
- **Items Requiring Legal / Business Alignment:**
  1. Primary cloud hosting region: AWS `ap-south-1` (Mumbai) or `ap-south-2` (Hyderabad).
  2. Data retention defaults: Auto-purge execution payloads after 30 days unless explicitly extended by customer policy.
  3. PII Masking: Mandatory phone number and email redaction in execution preview logs.
- **Status:** Awaiting operational alignment with legal counsel.
