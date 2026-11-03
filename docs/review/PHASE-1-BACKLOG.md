# Phase 1 Work Breakdown & Technical Backlog

**Document ID:** OVRA-BKL-001  
**Version:** 1.0.0  
**Phase:** Phase 1 — Project Foundation & Development Infrastructure  
**Status:** Approved for Implementation (Pending Phase 0 Sign-Off)  

---

## 1. Overview & Objectives
Phase 1 establishes the production-grade engineering foundation for OVRA. It delivers:
- Turborepo + pnpm monorepo structure.
- NestJS (Fastify) modular API skeleton.
- Next.js (App Router + React 19) Web Studio shell.
- PostgreSQL schema migrations with Row-Level Security (RLS) setup.
- Shared TypeScript packages (`@ovra/workflow-schema`, `@ovra/execution-contracts`, `@ovra/database`).
- Docker Compose local development environment (PostgreSQL, Redis, MinIO, Temporal Dev Server).
- Unified linting, formatting, type checking, and GitHub Actions CI pipeline.
- Verified health check endpoints across all services.

**Strict Rule:** No business workflow execution code is written in this phase.

---

## 2. Bounded Task Breakdown

### TASK-101: Monorepo Scaffolding & Workspace Tooling
- **Description:** Initialize Turborepo with pnpm workspaces, strict TypeScript configuration, ESLint, Prettier, and root scripts.
- **Dependencies:** None.
- **Deliverables:**
  - `pnpm-workspace.yaml`, `turbo.json`, `package.json`, `tsconfig.base.json`.
  - Workspace directory skeleton: `apps/web`, `apps/api`, `packages/workflow-schema`, `packages/execution-contracts`, `packages/database`, `packages/ui`.
- **Acceptance Criteria:**
  - `pnpm install` succeeds cleanly with zero peer dependency warnings.
  - `pnpm run build`, `pnpm run lint`, and `pnpm run test` execute across all packages via Turborepo caching.
- **Verification Tests:**
  - Monorepo dependency resolution smoke test.
  - Turborepo cache hit validation test.

---

### TASK-102: Shared Contracts Package (`@ovra/workflow-schema`)
- **Description:** Define the canonical JSON Schema and TypeScript types for workflow definitions, nodes, ports, connections, triggers, and execution policies using Zod and TypeScript.
- **Dependencies:** TASK-101.
- **Deliverables:**
  - `packages/workflow-schema/src/workflow.ts`
  - `packages/workflow-schema/src/node.ts`
  - `packages/workflow-schema/src/connection.ts`
  - `packages/workflow-schema/src/trigger.ts`
  - `packages/workflow-schema/src/validation.ts` (Zod schemas for graph cycle detection and schema validation).
- **Acceptance Criteria:**
  - Validates correct workflow JSON definitions.
  - Throws descriptive validation errors on circular dependencies, invalid port linkages, or missing metadata.
- **Verification Tests:**
  - Unit tests verifying validation of linear DAGs, branching DAGs, and rejection of cycles.

---

### TASK-103: Execution Contracts Package (`@ovra/execution-contracts`)
- **Description:** Define the typed interfaces and serialization envelopes for messages exchanged between Control Plane, Temporal Workflows, and Activity Workers (`FlowData`, `NodeExecutionRequest`, `NodeExecutionResult`, `ExecutionEvent`).
- **Dependencies:** TASK-101.
- **Deliverables:**
  - `packages/execution-contracts/src/flow-data.ts`
  - `packages/execution-contracts/src/events.ts`
  - `packages/execution-contracts/src/activities.ts`
- **Acceptance Criteria:**
  - Exported interfaces are strictly typed and compatible with Temporal payload converters.
  - Payload serialization handles Date, BigInt, and JSON-safe objects cleanly.
- **Verification Tests:**
  - Enveloping and unwrapping round-trip serialization tests.

---

### TASK-104: Database Layer & RLS Migration Infrastructure (`@ovra/database`)
- **Description:** Implement PostgreSQL schema models and migration engine using Drizzle ORM. Configure base tables (`organizations`, `workspaces`, `users`, `workflows`, `workflow_versions`, `credentials`, `executions`) and RLS policies.
- **Dependencies:** TASK-101.
- **Deliverables:**
  - `packages/database/src/schema/*.ts`
  - `packages/database/drizzle/` migrations.
  - `packages/database/src/client.ts` with helper `withTenantContext(workspaceId, callback)` executing `SELECT set_config('app.current_workspace_id', $1, true)`.
- **Acceptance Criteria:**
  - Schema migrations run cleanly on fresh PostgreSQL 16+ instance.
  - RLS policies block cross-workspace reads and writes at the database layer.
- **Verification Tests:**
  - Integration test suite using Testcontainers:
    - Insert Workspace A and Workspace B records.
    - Set transaction GUC to Workspace A and verify zero records from Workspace B are visible.
    - Verify connection pool reuse clears the transaction-local GUC.

---

### TASK-105: Control Plane API Skeleton (`apps/api`)
- **Description:** Scaffold NestJS application using Fastify adapter. Implement configuration management, health check endpoints (`/healthz`, `/readyz`), global error handling filter, request correlation ID middleware, and OpenAPI Swagger generator.
- **Dependencies:** TASK-101, TASK-104.
- **Deliverables:**
  - `apps/api/src/main.ts` (Fastify bootstrap).
  - `apps/api/src/health/` module (`/healthz`, `/readyz` checking PostgreSQL and Redis).
  - `apps/api/src/common/filters/` (standard response envelope and error mapping).
  - `apps/api/src/common/middleware/correlation-id.middleware.ts`.
- **Acceptance Criteria:**
  - Server starts up with Fastify engine.
  - `GET /healthz` returns `200 OK` with status `healthy`.
  - `GET /api/docs` serves interactive OpenAPI Swagger UI.
- **Verification Tests:**
  - Supertest e2e tests for `/healthz` and error envelope formatting.

---

### TASK-106: Web Studio Frontend Skeleton (`apps/web`)
- **Description:** Initialize Next.js App Router application with React 19, TypeScript, Tailwind CSS, shadcn/ui components, and TanStack Query provider.
- **Dependencies:** TASK-101.
- **Deliverables:**
  - `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`.
  - App shell layout (Sidebar, Header, Main Canvas Placeholder).
  - API client wrapper for Control Plane communication.
- **Acceptance Criteria:**
  - Next.js application compiles with zero TypeScript or hydration errors.
  - Accessible basic layout adhering to WCAG 2.1 AA contrast standards.
- **Verification Tests:**
  - Playwright browser test verifying page title, layout rendering, and responsive sidebar.

---

### TASK-107: Local Development Infrastructure (`docker-compose.yml`)
- **Description:** Configure reproducible Docker Compose stack for local development containing PostgreSQL 16, Redis 7.4, MinIO (S3 compatible), and Temporal Dev Server.
- **Dependencies:** None.
- **Deliverables:**
  - `infrastructure/compose/docker-compose.yml`
  - `.env.example` with documented local secrets and ports.
  - `scripts/dev-setup.sh` initializing buckets, databases, and health verification.
- **Acceptance Criteria:**
  - `docker compose up -d` starts all services within 20 seconds.
  - Zero internal administration ports exposed to host unless explicitly configured for local developer tooling.
- **Verification Tests:**
  - Shell health-probe script verifying readiness of PostgreSQL, Redis, MinIO, and Temporal endpoints.

---

### TASK-108: Continuous Integration Pipeline (`.github/workflows/ci.yml`)
- **Description:** Implement GitHub Actions CI pipeline executing linting, formatting check, type checking, unit tests, integration tests (Testcontainers), and container image vulnerability scans (Trivy).
- **Dependencies:** TASK-101 through TASK-107.
- **Deliverables:**
  - `.github/workflows/ci.yml`
- **Acceptance Criteria:**
  - Pipeline executes on every pull request.
  - Any lint failure, type check error, or broken test strictly blocks PR merge.
- **Verification Tests:**
  - Successful dry-run execution of CI workflow steps.
