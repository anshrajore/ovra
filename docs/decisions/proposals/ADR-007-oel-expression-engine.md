# ADR-007 (Proposal): OEL v1 (OVRA Expression Language) Specification

- **Status:** Proposed (Awaiting Owner Review)
- **Date:** 2026-11-03
- **Proposed By:** Principal Architect & Security Reviewer

## Context
Automation users frequently need to transform data, map fields between nodes, extract nested properties, and evaluate branching conditions (e.g., `{{ $trigger.body.amount > 1000 }}`).
Using JavaScript `eval`, `new Function()`, or Node `vm` introduces catastrophic Remote Code Execution (RCE) vulnerabilities. Sandboxing libraries like `vm2` have a long history of sandbox breakouts.

## Decision Proposal
OVRA will implement **OEL v1 (OVRA Expression Language)** as a custom, pure, deterministic expression parser:
1. **Parser Architecture:** A recursive descent parser that parses expressions into an Abstract Syntax Tree (AST).
2. **Safe AST Evaluation:** An AST interpreter that walks nodes without executing native JavaScript bytecode.
3. **Execution Limits:**
   - Maximum expression length: 2,048 characters.
   - Maximum AST recursion depth: 32 levels.
   - Maximum operation count: 10,000 steps (prevents ReDoS or infinite CPU loops).
4. **Sandboxed Scope:** The evaluation context only exposes immutable JSON data:
   - `$trigger`: The trigger payload envelope.
   - `$nodes`: Dictionary of upstream node outputs.
   - `$env`: Safe, allowlisted workspace variables (secrets are strictly excluded).
   - `$execution`: Read-only execution metadata (ID, timestamp, attempt).
5. **Allowlisted Pure Standard Library:** Only pure, side-effect-free functions are available (string manipulation, math, array map/filter, pure date formatting). Zero access to network, filesystem, timers, or global environment.

## Consequences
- **Positive:** Immune to Node.js prototype pollution, vm escape, and arbitrary code execution vulnerabilities. Fast in-memory execution inside both the Temporal Workflow interpreter and the Web Studio client for live preview.
- **Negative:** Users cannot write arbitrary multi-line procedural scripts in simple expressions; complex logic requires dedicated code nodes.
