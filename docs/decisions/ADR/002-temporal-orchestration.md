# ADR-002: Temporal as the Distributed Durable Orchestrator

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** OVRA Engineering / Architecture

## Context
Building an ad-hoc distributed job scheduler with durable state machines, timers, retries, jitter, task queue routing, signals, and checkpoints is prone to race conditions, split-brain executions, and state loss upon worker crash.

## Decision
OVRA adopts **Temporal** as its durable distributed orchestration engine.
1. OVRA implements a custom **Workflow Interpreter** written in TypeScript as a deterministic Temporal Workflow.
2. The Workflow Interpreter takes an immutable compiled workflow run snapshot and manages DAG branch evaluation, condition checks, bounded loops, and dependency tracking deterministically.
3. Every external interaction, I/O operation, database query, credential resolution, HTTP request, or node execution MUST be delegated to Temporal Activities.
4. Temporal handles workflow state persistence, execution history, activity retries, durable timers, and human approval signals.

## Consequences
- **Positive:** Out-of-the-box durability, crash recovery without re-running completed nodes, transparent history replay, and robust timer/signal primitives.
- **Negative:** Strict determinism requirements for Temporal workflow code; requires running and operating a Temporal server cluster in production.
