# ADR-004: Arbitrary User-Code Execution Isolation

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** OVRA Engineering / Architecture

## Context
Users may submit arbitrary Python or JavaScript/TypeScript code nodes within workflows. Running untrusted user scripts inside standard Node.js processes (`eval`, `vm`, `vm2`), regular Docker containers, or shared worker hosts exposes the platform to container breakout, host compromise, SSRF against cloud metadata, and cross-tenant data theft.

## Decision
OVRA mandates strict runtime isolation for arbitrary user-written code:
1. **Feature Gating:** Arbitrary code nodes are disabled by default for public multi-tenant environments until the isolated runtime architecture is formally deployed and pentested.
2. **Userspace / MicroVM Isolation:** Code execution must utilize userspace sandboxing (such as Google gVisor `runsc`) or microVM virtualization (such as Kata Containers / Firecracker) on dedicated Kubernetes worker node pools.
3. **No Privileged Capabilities:** Sandboxes run as non-root with read-only root filesystems, strict PID limits, per-execution memory/CPU limits, and temporary in-memory scratch storage.
4. **Network Restrictions:** Deny-by-default network policies. Arbitrary code has no direct access to internal VPCs, Kubernetes APIs, cloud metadata endpoints (`169.254.169.254`), or database instances.
5. **Credential Shielding:** Code runtimes never receive raw credential secrets or ambient environment variables; external calls must be mediated through explicit, audited proxy interfaces.

## Consequences
- **Positive:** High security boundary resisting privilege escalation and host takeover.
- **Negative:** Adds infrastructure complexity, warm-pool overhead, and execution cold-start latency for code nodes.
