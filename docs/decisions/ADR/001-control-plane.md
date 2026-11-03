# ADR-001: Control Plane and Execution Plane Separation

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** OVRA Engineering / Architecture

## Context
A monolithic architecture where a single web process handles user authentication, workflow editing, incoming webhooks, queue management, AI calls, and arbitrary user task execution suffers from severe blast radius, security boundary collapse, noisy-neighbor contention, and inability to scale execution independently from API operations.

## Decision
OVRA adopts a strict separation between the **Control Plane** and the **Execution Plane**:
1. The **Control Plane** (Web Studio, API Gateway, Identity, Workspace Management, Workflow Registry, Trigger Ingress, Credential Broker, Audit, and Projection Store) manages tenant data, metadata, authorizations, and coordinates workflow triggers. It never executes arbitrary node logic or untrusted user scripts.
2. The **Execution Plane** (Temporal Cluster, Workflow Interpreter Workers, Activity Task Workers, and Sandboxed Code Runtimes) is dedicated exclusively to running DAG planning, scheduling activities, executing connector logic, and running sandboxed code under strict quotas and network egress controls.
3. The browser application only edits, configures, and observes workflows; it never executes workflows directly.

## Consequences
- **Positive:** Failure or high load in workflow execution does not bring down the API or Web Studio. Untrusted execution cannot easily access control plane internal memory or keys. Worker fleets can autoscale based on queue backlog independently of HTTP traffic.
- **Negative:** Introduces inter-service communication overhead and requires robust asynchronous state projections.
