# OVRA — India's Next-Generation Workflow Automation Platform

> **Build once. Automate anything. Scale infinitely.**  
> AI-native · India-built · Developer-first · Enterprise-ready

---

## 🌟 Overview

**OVRA** is an open, distributed workflow automation and agentic orchestration platform engineered for both visual operators and developers. It unifies:
- **Visual Workflow Builder:** Drag-and-drop node graph canvas powered by React Flow (`@xyflow/react`).
- **Durable Orchestration:** Designed with pluggable execution providers (`BoundedExecutionSimulator` for serverless Vercel testing, with seamless drop-in Temporal engine compatibility).
- **AI-Native Studio:** Natural-language workflow generation and autonomous AI Agent nodes with bounded tool scopes.
- **Enterprise Multi-Tenancy:** PostgreSQL Row-Level Security (RLS) defense-in-depth, envelope-encrypted credentials, and SSRF egress enforcement.

---

## 🎨 UI & Design Implementation

Built faithfully to the provided design references:

### 1. Landing Page (`/`)
- Luxurious beveled dark device frame with a warm cream card interior (`#FAF5EE`).
- High-impact typography, 4 capability feature badges, and 3D geometric clay/glass/star visual composition.
- Live platform statistics shelf: 10K+ Active Workflows, 500+ Integrations, 50K+ Builders, and 99.9% Uptime.

### 2. Workflow Studio (`/studio` or `/workflows`)
- **Top Navigation:** Brand logo, central navigation pills (`Workflows`, `AI Studio`, `Templates`, `Integrations`, `AI Agents`), global search (`⌘K`), and user profile.
- **Left Sidebar:** Team Workspace dropdown, navigation menu, project directories (`SanjeevaniX`, `NayaMarg`, `Research`, `General`), and gradient "Upgrade to Pro" card.
- **Canvas Area:**
  - Dotted grid canvas with smooth bezier connections.
  - Custom nodes:
    - **Webhook:** Inbound trigger badge with orange lightning bolt.
    - **AI Agent:** Purple sparkle badge with qualification analysis.
    - **IF Condition:** Conditional branch node with distinct **Yes** (emerald pill) and **No** (rose pill) output ports.
    - **Slack:** Team alert notification node.
    - **Email:** Transactional/nurture mailer node.
  - **Interactive Test Run:** Real-time simulated execution with animated node state transitions, live step highlighting, and celebratory confetti.
  - **Floating Toolbar & Controls:** Select, pan, add node, link, delete, zoom controls, and wireframe minimap.
  - **Node Inspector Drawer:** Slide-over panel displaying inputs, outputs, configuration parameters, and single-step testing.
  - **Code Modal:** Immutable compiled workflow JSON viewer with one-click copy and download.

---

## 🏗️ Architecture & Core Provider Abstraction

To ensure agility without sacrificing future enterprise scale, OVRA decouples business logic from infrastructure using core provider interfaces:

```
                 ┌────────────────────────────────┐
                 │       OVRA Application         │
                 │   (Next.js App Router UI/API)  │
                 └───────────────┬────────────────┘
                                 │
                 ┌───────────────▼────────────────┐
                 │         Core Interfaces        │
                 ├────────────────────────────────┤
                 │ 1. ExecutionProvider           │
                 │ 2. RealtimeProvider            │
                 │ 3. DatabaseProvider            │
                 │ 4. CredentialProvider          │
                 │ 5. StorageProvider             │
                 └───────┬────────────────┬───────┘
                         │                │
            Vercel-First │                │ Future Production
          Implementation │                │ Implementation
                         │                │
       ┌─────────────────▼────────┐     ┌─▼──────────────────────────┐
       │ - BoundedSimulator       │     │ - Temporal Orchestrator    │
       │ - Server-Sent / WS Replay│     │ - NATS JetStream Pub/Sub   │
       │ - Drizzle + Managed PG   │     │ - PostgreSQL HA + RLS      │
       │ - AES-256 Envelope KMS   │     │ - HashiCorp Vault Transit  │
       │ - S3 / Local Object Blob │     │ - Distributed S3 Storage   │
       └──────────────────────────┘     └────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (Active LTS)
- pnpm 9+

### Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) for the Landing Page or [http://localhost:3000/studio](http://localhost:3000/studio) for the Visual Workflow Studio.

3. **Production build:**
   ```bash
   pnpm build
   ```

---

## 🔒 Security Principles

- **Zero Cleartext Secrets:** All sensitive credentials use envelope encryption.
- **SSRF Defense:** Outbound HTTP requests are filtered against non-routable IP ranges (`10.0.0.0/8`, `127.0.0.0/8`, `169.254.169.254`).
- **Gated Sandboxes:** Arbitrary user scripts are restricted in multi-tenant environments.
- **Data Sovereignty:** Engineered with Indian data sovereignty (DPDP Rules 2025) and local business ecosystems (WhatsApp Business Cloud, Razorpay, UPI) at the forefront.

---

## 📄 License

Proprietary © 2026 OVRA. All rights reserved.
