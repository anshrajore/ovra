# Execution Failure & Recovery Test Matrix

**Milestone:** 2.7  
**Test Suite:** Automated Runtime Contracts & Regression Tests

---

## Test Cases

| Test Case | Scenario | Expected Outcome | Status |
|---|---|---|---|
| `TC-FAIL-01` | Node throws unhandled HTTP 500 error | Node status marked `failed`, workflow marked `FAILED`, spinner stops | PASS |
| `TC-FAIL-02` | Node throws error with `continue_error_output` | Error envelope routed to `error` port, downstream recovery runs, status `SUCCEEDED_WITH_ERRORS` | PASS |
| `TC-FAIL-03` | Node throws error with `stop_workflow` | Downstream nodes aborted, workflow terminalizes as `FAILED`, error persisted | PASS |
| `TC-FAIL-04` | AbortSignal cancellation triggered mid-run | Active nodes aborted, workflow marked `CANCELED`, no lingering tasks | PASS |
| `TC-FAIL-05` | Parallel branch failure with convergence | Failing branch stops, surviving branch finishes, workflow marked `FAILED` | PASS |
