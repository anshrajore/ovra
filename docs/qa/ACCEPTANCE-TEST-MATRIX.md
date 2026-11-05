# OVRA — Quality Assurance & Acceptance Test Matrix

## 1. End-to-End Acceptance Test Scenarios

| Test ID | User Flow / Scenario | Expected Outcome | Verification Method |
| :--- | :--- | :--- | :--- |
| **E2E-01** | User signup via Google OAuth or Email | Profile record created in Supabase `profiles` with DPDP legal acceptance timestamp. | Browser / Auth API |
| **E2E-02** | 8-step onboarding wizard completion | Provisioned workspace, starter template DAG cloned, state persisted in `user_onboarding`. | Onboarding runner |
| **E2E-03** | In-Canvas HTTP Request Node configuration | User adds `core.http_request`, configures headers/params, and runs in-canvas test. Status `200 OK` and inferred schema displayed. | Studio Inspector |
| **E2E-04** | Dynamic expression interpolation | `{{outputs.riskScore > 0.8}}` evaluated safely by `@ovra/expression-engine` without `eval()`. | Expression Testkit |
| **E2E-05** | Credential Vault lease lifecycle | Secret encrypted with AES-256-GCM. Credential broker leases secret to worker; audit record created in `credential_audit`. | Credential API |
| **E2E-06** | Inbound webhook trigger with HMAC | Webhook payload verified with HMAC-SHA256 and anti-replay timestamp. DAG execution scheduled. | Webhook test endpoint |
| **E2E-07** | >64 KiB Payload Storage offload | Step generating 180 KiB payload offloaded to Supabase Storage `ovra-execution-payloads` with signed URL pointer. | TestLab runner |
| **E2E-08** | Multi-tenant RLS negative test | User from Workspace A attempting to read workflow from Workspace B receives `PGRST116` / empty record. | Database RLS tests |
| **E2E-09** | Chaos failure injection | TestLab simulating 429 Rate Limit triggers exponential backoff; 30s timeout aborts to Dead Letter Queue (DLQ). | TestLab simulation |
| **E2E-10** | Production build compilation | Next.js 15 App Router compiles all static and dynamic routes with 0 TypeScript or linting errors. | `pnpm build` |

---

## 2. Regression & Production Gate Verification

- **Lint & Typecheck**: `pnpm build`
- **Node SDK Conformance**: `src/lib/node-platform/testkit`
- **Security Audit**: Zero plaintext secrets committed to git or logged in execution traces.
