# OVRA — Execution Engine, Queue Dispatch & Reliability Specification

## 1. Vercel-First Bounded Execution Stage

### 1.1 Architecture & Boundaries
The initial stage of OVRA uses Vercel for the control plane and Supabase for transactional state, Queues (pgmq), and Storage:
- **Serverless Limits**: Next.js route handlers enforce a 15-second per-step execution deadline.
- **Queue Dispatch**: Asynchronous tasks are enqueued into Supabase Queues (`ovra_execution_queue`).
- **Bounded Worker**: Batch consumers claim up to 10 tasks with a 30-second visibility timeout.
- **DAG Dependency Resolver**: Downstream nodes are enqueued only when all incoming upstream dependencies have reached `SUCCEEDED`. Branch pruning marks inactive branches as `SKIPPED`.

### 1.2 Dedicated Temporal Worker Plane (Production Gate)
Long-running workflows (>15 seconds), arbitrary user code execution, high-concurrency event streaming, and exactly-once external side effects require the dedicated worker gate:
- Architecture: Temporal Go/TypeScript worker fleet running in private VPCs with gVisor/microVM isolation.
- Seam: The `ExecutionProvider` interface abstracts the runtime engine so transitioning to Temporal does not alter workflow schemas or canvas logic.

---

## 2. Execution State Model

```
                    ┌───────────┐
                    │  CREATED  │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │  QUEUED   │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
              ┌─────┤  RUNNING  ├─────┐
              │     └─────┬─────┘     │
        Wait for Human    │         Error / Timeout
              │           │           │
        ┌─────▼─────┐     │     ┌─────▼─────┐
        │  WAITING  │     │     │RETRY_WAIT │
        └─────┬─────┘     │     └─────┬─────┘
              │           │           │ (Exhausted)
        Resume Event      │     ┌─────▼──────────┐
              │           │     │OUTCOME_UNKNOWN │
              │           │     └─────┬──────────┘
              │     ┌─────▼─────┐     │
              └────►│ SUCCEEDED │     ▼
                    └───────────┘  DEAD_LETTER
```

---

## 3. Reliability & Idempotency Rules

1. **At-Least-Once Delivery**: Every task carries a deterministic idempotency key derived from `hash(executionId + nodeId + attempt)`.
2. **Side-Effect Reconciliation**: External APIs without native idempotency headers must enter `OUTCOME_UNKNOWN` on network drops rather than blind automatic retries.
3. **Payload Offloading (>64 KiB Policy)**: Step outputs exceeding 64 KiB are uploaded directly to private Supabase Storage (`ovra-execution-payloads`). The execution record stores `{ $ref: "storage://..." }`, avoiding queue message bloat and memory exhaustion.
4. **Exponential Backoff**: Failed nodes retry with jittered exponential backoff: `delay = min(maxDelay, baseDelay * 2^attempt + randomJitter)`.
