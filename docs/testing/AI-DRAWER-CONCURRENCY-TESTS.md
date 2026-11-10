# AI Assistant Drawer Concurrency & Non-Destructive Tests

**Milestone:** 2.7  
**Test Suite:** In-Canvas AI Drawer UI & State Isolation

---

## Test Cases

| Test Case | Scenario | Expected Outcome | Status |
|---|---|---|---|
| `TC-AI-01` | Open AI drawer while workflow is `RUNNING` | Drawer opens beside canvas; running execution continues uninterrupted | PASS |
| `TC-AI-02` | Generate AI prompt while workflow is `RUNNING` | LLM generates patch; canvas nodes and running execution untouched | PASS |
| `TC-AI-03` | Close and reopen AI drawer | Chat history, prompt input, and canvas state preserved | PASS |
| `TC-AI-04` | Apply AI patch during active run | Patch applies as a new draft revision; current execution continues on pinned snapshot | PASS |
| `TC-AI-05` | Reject AI patch | Patch discarded; draft canvas remains in original state | PASS |
