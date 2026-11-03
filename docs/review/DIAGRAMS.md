# OVRA System Architecture Diagrams

**Document ID:** OVRA-DIA-001  
**Version:** 1.0.0  
**Date:** 2026-11-03  
**Status:** Approved Specification Baseline  

---

## 1. System Context Diagram (C4 Level 1)

```mermaid
flowchart TB
  subgraph Users["Users & External Clients"]
    U_OP["Business User (Visual Operator)"]
    U_DEV["Developer / API Client"]
    EXT_SYS["External SaaS Webhook (e.g. WhatsApp, Razorpay)"]
  end

  subgraph OVRA["OVRA Automation Platform"]
    WEB_STUDIO["OVRA Web Studio (Next.js React Flow)"]
    API_GW["API Gateway & Webhook Edge (Fastify)"]
    CTRL_PLANE["OVRA Control Plane (NestJS)"]
    EXEC_PLANE["OVRA Execution Plane (Temporal + Workers)"]
    DATA_PLANE["Data Plane (PostgreSQL + S3 + Redis)"]
  end

  subgraph ExternalSaaS["Third-Party Services"]
    PAYMENTS["Payment Gateways (Razorpay, Stripe)"]
    COMMS["Comms (WhatsApp Business, Telegram)"]
    AI_PROVIDERS["AI Providers (OpenAI, Gemini, Anthropic)"]
    DATABASES["External Databases (Postgres, MySQL)"]
  end

  U_OP -->|Visual authoring & monitoring| WEB_STUDIO
  U_DEV -->|REST API, CLI, SDK| API_GW
  EXT_SYS -->|Inbound Webhook Events| API_GW

  WEB_STUDIO -->|HTTPS & WSS| API_GW
  API_GW -->|Internal routing & auth| CTRL_PLANE
  CTRL_PLANE -->|Trigger execution & dispatch| EXEC_PLANE
  CTRL_PLANE -->|Store metadata, users, versions| DATA_PLANE
  EXEC_PLANE -->|Fetch assets & persist projections| DATA_PLANE

  EXEC_PLANE -->|Outbound API calls via SSRF Gateway| PAYMENTS
  EXEC_PLANE -->|Send alerts & messages| COMMS
  EXEC_PLANE -->|Model inference & RAG| AI_PROVIDERS
  EXEC_PLANE -->|Execute queries| DATABASES
```

---

## 2. Container Diagram (C4 Level 2)

```mermaid
flowchart TB
  subgraph Client_Tier["Client Tier"]
    FE["Web Studio UI (Next.js 15, React 19, React Flow)"]
    CLI["Developer CLI / SDK (TypeScript)"]
  end

  subgraph Edge_Tier["Edge & Gateway Tier"]
    EDGE["Egress WAF & Reverse Proxy"]
  end

  subgraph Control_Plane_Services["Control Plane Services (Modular Monolith)"]
    API["Control Plane API (NestJS + Fastify)"]
    WS["Realtime Gateway (WebSocket Server)"]
    VAULT["Credential Broker (Envelope Encryption KMS)"]
    TRIG["Trigger & Schedule Manager"]
  end

  subgraph Orchestration_Tier["Orchestration Tier"]
    TEMPORAL["Temporal Cluster (Server + Persistence)"]
  end

  subgraph Execution_Worker_Fleet["Execution Plane Worker Fleet"]
    ORCH_WORKER["Workflow Interpreter Workers (Deterministic)"]
    INT_WORKER["Integration Activity Workers (HTTP, SaaS)"]
    AI_WORKER["AI Agent Workers (LLM Gateway, Tools)"]
    SANDBOX_WORKER["Isolated Code Runners (gVisor runsc) - Gated"]
  end

  subgraph Network_Protection["Egress Security Layer"]
    SSRF["SSRF Egress Gateway (DNS Pinning & IP Filter)"]
  end

  subgraph Data_Tier["Data & Persistence Tier"]
    PG[(PostgreSQL 16 HA + RLS)]
    REDIS[(Redis 7.4 Cluster)]
    S3[(S3-Compatible Object Storage)]
  end

  FE -->|HTTPS / WSS| EDGE
  CLI -->|HTTPS| EDGE
  EDGE --> API
  EDGE --> WS

  API --> PG
  API --> REDIS
  API --> TEMPORAL
  TRIG --> TEMPORAL

  WS --> REDIS
  WS --> PG

  TEMPORAL <--> ORCH_WORKER
  ORCH_WORKER -->|Schedule Activities| TEMPORAL
  TEMPORAL <--> INT_WORKER
  TEMPORAL <--> AI_WORKER
  TEMPORAL <--> SANDBOX_WORKER

  INT_WORKER -->|Short-lived secret lease| VAULT
  VAULT --> PG

  INT_WORKER --> SSRF
  AI_WORKER --> SSRF
  SANDBOX_WORKER --> SSRF

  SSRF -->|External HTTPS| Internet["Internet / External APIs"]

  INT_WORKER --> S3
  ORCH_WORKER --> PG
```

---

## 3. Workflow Execution Sequence Diagram

```mermaid
sequenceDiagram
  autonumber
  actor User as Webhook / User Trigger
  participant Edge as API & Trigger Gateway
  participant DB as PostgreSQL (Projections & Metadata)
  participant Temporal as Temporal Cluster
  participant Orch as Workflow Interpreter Worker
  participant Broker as Credential Broker
  participant Worker as Integration Activity Worker
  participant SSRF as SSRF Egress Proxy
  participant External as External SaaS / API
  participant WS as Realtime WebSocket Gateway
  actor UI as Web Studio Client

  User->>Edge: POST /api/v1/webhooks/:triggerId (Signed Payload)
  Edge->>Edge: Verify HMAC Signature & Deduplicate
  Edge->>DB: Record Inbound Webhook Event (Audit)
  Edge->>Temporal: StartWorkflowExecution (workflowId, runId, versionId)
  Edge-->>User: 202 Accepted (executionId, status: QUEUED)

  Temporal->>Orch: Dispatch Workflow Task (Interpreter)
  activate Orch
  Orch->>Orch: Load Compiled Immutable Graph
  Orch->>DB: Project Execution State (status: RUNNING)
  Orch->>WS: Push Event: execution.started
  WS-->>UI: Live UI Update (Node 1 Active)

  Orch->>Temporal: Schedule Activity: executeNode(node_1, inputs)
  deactivate Orch

  Temporal->>Worker: Dispatch Activity Task (executeNode)
  activate Worker
  Worker->>Broker: Request Credential Lease (node_1, execId)
  Broker-->>Worker: Short-Lived Decrypted Secret (TTL 60s)
  Worker->>SSRF: HTTP Request (Method, URL, Payload, IdempotencyKey)
  SSRF->>SSRF: Resolve DNS, Check Non-Routable IP Denylist, Pin IP
  SSRF->>External: Forward HTTP Request to Target API
  External-->>SSRF: HTTP Response (200 OK, JSON Body)
  SSRF-->>Worker: Return Validated Response Body
  Worker->>Worker: Zero In-Memory Credentials
  Worker-->>Temporal: Activity Completed (FlowData Output)
  deactivate Worker

  Temporal->>Orch: Notify Activity Complete
  activate Orch
  Orch->>DB: Project Node Completed State (duration, output)
  Orch->>WS: Push Event: node.execution.completed (node_1, output)
  WS-->>UI: Live Graph Transition (Node 1 Green, Node 2 Ready)
  Orch->>Orch: Evaluate Downstream DAG Edges & Advance
  Orch-->>Temporal: Complete Workflow Execution
  deactivate Orch

  Orch->>DB: Project Final Execution State (status: SUCCESS)
  Orch->>WS: Push Event: execution.completed (status: SUCCESS)
  WS-->>UI: Workflow Run Succeeded
```

---

## 4. Logical Entity-Relationship (ER) Diagram

```mermaid
erDiagram
  ORGANIZATIONS ||--o{ WORKSPACES : owns
  ORGANIZATIONS ||--o{ USERS : members
  WORKSPACES ||--o{ WORKFLOWS : contains
  WORKSPACES ||--o{ CREDENTIALS : contains
  WORKSPACES ||--o{ TRIGGERS : configures
  WORKSPACES ||--o{ EXECUTIONS : owns
  WORKSPACES ||--o{ AUDIT_LOGS : records

  WORKFLOWS ||--o{ WORKFLOW_VERSIONS : has_versions
  WORKFLOW_VERSIONS ||--o{ WORKFLOW_NODES : defines
  WORKFLOW_VERSIONS ||--o{ WORKFLOW_CONNECTIONS : defines

  WORKFLOW_VERSIONS ||--o{ EXECUTIONS : instantiated_as
  EXECUTIONS ||--o{ EXECUTION_NODES : executes
  EXECUTIONS ||--o{ EXECUTION_EVENTS : emits

  ORGANIZATIONS {
    uuid id PK
    string name
    string slug UK
    string billing_tier
    jsonb settings
    timestamp created_at
  }

  WORKSPACES {
    uuid id PK
    uuid organization_id FK
    string name
    string environment
    jsonb settings
    timestamp created_at
  }

  USERS {
    uuid id PK
    string email UK
    string password_hash
    string full_name
    string role
    boolean is_mfa_enabled
    timestamp created_at
  }

  WORKFLOWS {
    uuid id PK
    uuid organization_id FK
    uuid workspace_id FK
    string name
    string description
    string status
    uuid active_version_id
    timestamp created_at
    timestamp updated_at
  }

  WORKFLOW_VERSIONS {
    uuid id PK
    uuid organization_id FK
    uuid workspace_id FK
    uuid workflow_id FK
    integer version_number
    boolean is_published
    jsonb graph_definition
    string definition_hash
    timestamp created_at
  }

  CREDENTIALS {
    uuid id PK
    uuid organization_id FK
    uuid workspace_id FK
    string name
    string integration_type
    string auth_type
    text encrypted_data
    text encrypted_dek
    jsonb public_metadata
    timestamp created_at
  }

  TRIGGERS {
    uuid id PK
    uuid organization_id FK
    uuid workspace_id FK
    uuid workflow_id FK
    string trigger_type
    string webhook_slug UK
    string cron_expression
    boolean is_active
    jsonb configuration
    timestamp created_at
  }

  EXECUTIONS {
    uuid id PK
    uuid organization_id FK
    uuid workspace_id FK
    uuid workflow_id FK
    uuid workflow_version_id FK
    string temporal_workflow_id UK
    string temporal_run_id
    string status
    string trigger_type
    timestamp started_at
    timestamp finished_at
    integer duration_ms
  }

  EXECUTION_NODES {
    uuid id PK
    uuid organization_id FK
    uuid workspace_id FK
    uuid execution_id FK
    string node_id
    string node_type
    string status
    integer attempt
    jsonb input_payload
    jsonb output_payload
    string storage_ref
    text error_message
    integer duration_ms
    timestamp started_at
    timestamp finished_at
  }

  EXECUTION_EVENTS {
    uuid id PK
    uuid organization_id FK
    uuid workspace_id FK
    uuid execution_id FK
    integer sequence_number
    string event_type
    jsonb payload
    timestamp created_at
  }
```
