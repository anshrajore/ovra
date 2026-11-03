# OVRA Delivery Strategy & Implementation Gates

**Document ID:** OVRA-DEL-001  
**Version:** 1.0.0  
**Status:** Baseline locked  
**Date:** 2026-11-03  

## 1. Phased Delivery Roadmap

The platform must be built sequentially. Advancing to a subsequent phase requires meeting 100% of the preceding phase's acceptance criteria and passing all security and reliability gates.

| Phase | Milestone | Primary Deliverable | Exit Gate |
|---|---|---|---|
| **Phase 0** | **Architecture & Security Review** | Specifications, ADR validation, threat modeling, backlog | Complete Phase 0 sign-off; no code written |
| **Phase 1** | **Repository & Product Foundation** | Monorepo (pnpm + Turbo), NestJS Fastify API skeleton, Next.js Web Studio shell, PostgreSQL migrations, Docker Compose | Clean build, lint, CI pipeline, healthy local containers |
| **Phase 2** | **Authentication & Tenancy** | OIDC/Argon2id auth, Workspace RBAC, PostgreSQL RLS, audit logs | 100% negative cross-tenant test pass |
| **Phase 3** | **Workflow Studio (Editor)** | React Flow visual canvas, schema-driven forms, autosave, draft validation, immutable publishing | Complete graph authoring and JSON schema validation |
| **Phase 4** | **Core Execution Engine** | Temporal integration, DAG interpreter, Activity workers, retry/backoff, checkpoints, cancellation | Fault recovery and worker crash tests passing |
| **Phase 5** | **Trigger & Realtime Infrastructure** | Webhook ingress, cron schedules, WebSocket gateway, sequence replay | Webhook idempotency and reconnect replay verified |
| **Phase 6** | **Connector SDK & First-Party Integrations** | Node SDK, Credential Broker, HTTP Request (SSRF protected), Postgres, Sheets, WhatsApp | Connector contract tests and credential lease tests pass |
| **Phase 7** | **Security Hardening & Sandboxing** | Vault/KMS envelope encryption, SSRF gateway, isolated gVisor runtime (gated) | External penetration and sandbox breakout tests pass |
| **Phase 8** | **TestLab & Observability** | Execution debugger, node simulator, OpenTelemetry, Grafana dashboards, k6 load tests | SLO verification and trace redaction verified |
| **Phase 9** | **AI Studio** | AI Gateway, model router, prompt boundary enforcement, agent tool scopes, human approval gates | Prompt injection and token budget safety tests pass |
| **Phase 10** | **Cloud & Production Operations** | Kubernetes Helm charts, Terraform IaC, HPA, backup/restore verification, DPDP compliance | Full staging disaster recovery and failover verification |

## 2. Release-Blocking Quality Gates
- **Zero Cross-Tenant Leakage:** Any test showing data access across tenant boundaries immediately fails the build.
- **Zero Cleartext Credentials:** Any secret appearing in application logs, traces, or WebSocket streams blocks deployment.
- **SSRF Validation:** Outbound requests targeting non-public IP ranges without explicit allowlisting fail execution immediately.
- **Deterministic Replay Guarantee:** Any change to Temporal workflow code that breaks event replay compatibility is rejected.
