# ADR-005: Event Delivery, Realtime Updates, and Projection Architecture

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** OVRA Engineering / Architecture

## Context
Workflow executions produce a high volume of execution events, step state changes, logs, and UI notifications. Directly streaming from Temporal or relying on volatile WebSocket memory creates consistency issues, data loss upon client disconnection, and potential database write bottlenecks.

## Decision
OVRA adopts a **Durable Outbox & Projection Model**:
1. **Authoritative Orchestration:** Temporal maintains the authoritative history of workflow execution.
2. **Execution Projections:** An event projector service projects workflow and node status updates into PostgreSQL `executions`, `execution_nodes`, and `execution_events` tables for fast API querying.
3. **Transactional Outbox:** Any domain mutation that produces external events uses a transactional outbox in PostgreSQL to guarantee atomic commit with domain data.
4. **Realtime WebSockets with Durable Replay:** WebSocket gateways push live updates to connected Web Studio clients. Each event carries an immutable event ID and a monotonically increasing per-execution sequence number. Reconnecting clients request missed events via a REST replay endpoint using the last acknowledged sequence number.
5. **Separation of Concerns:** WebSockets are not treated as durable storage. Redis serves as the pub/sub adapter across multiple WebSocket gateway pods. NATS JetStream is reserved for high-volume cross-service event streaming when multi-service scale warrants it.

## Consequences
- **Positive:** UI clients can seamlessly disconnect and reconnect without missing execution events. Decouples fast UI notifications from core database transactions.
- **Negative:** Requires maintaining projection logic and managing event sequence cursors.
