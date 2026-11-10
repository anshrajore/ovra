# Queue Lease, Watchdog & Failure Recovery Specification

**Milestone:** 2.7  
**Architecture Layer:** Distributed Worker Leases & State Reconciliation  
**Status:** Canonical Reference

---

## 1. Worker Leases & Heartbeat Invariants

To eliminate phantom `RUNNING` executions in serverless or distributed environments:

1. **Explicit Leases:**
   - Every active task claims a worker lease with an expiration timestamp (`leaseExpiresAt = now() + 60s`).
   - Active workers periodically extend the lease heartbeat.
2. **Watchdog Reconciliation:**
   - A periodic reconciler scans for executions in `RUNNING` where:
     `now() > max(node_executions.leaseExpiresAt) + grace_period`
   - Stale executions without heartbeats are transitioned to `FAILED` or `INTERNAL_ERROR` with structured diagnostic payload:
     `error = "WORKER_LEASE_EXPIRED: Worker heartbeat lost"`
3. **Idempotent Queue Acknowledgement:**
   - Tasks are only acknowledged (deleted from queue) AFTER the state transition is committed to PostgreSQL / Supabase storage.
