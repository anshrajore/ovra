# OVRA — Security, Credential Broker & Zero-Trust Architecture

## 1. Credential Vault & Envelope Encryption

Sensitive credentials (API keys, OAuth refresh tokens, database connection strings) are protected via two-tier envelope encryption:
- **Key Encryption Key (KEK)**: 256-bit root master key managed in server-side KMS/environment (`ENCRYPTION_MASTER_KEY`).
- **Data Encryption Key (DEK)**: Unique 256-bit key generated per workspace credential record.
- **Cipher**: AES-256-GCM with a 96-bit cryptographic nonce and 128-bit authentication tag.
- **Credential Broker**: Decrypts secrets only inside server-side worker context for ephemeral leases with a 60-second TTL. Plaintext credentials are **never** returned to the browser or written to execution logs.

---

## 2. Server-Side Request Forgery (SSRF) Defenses

The `core.http_request` node implements strict IP validation before socket connection:
- Prohibits loopback destinations: `127.0.0.0/8`, `::1`.
- Prohibits cloud metadata endpoints: `169.254.169.254`.
- Prohibits private RFC 1918 subnets: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
- Re-resolves DNS records upon every HTTP redirect to prevent DNS rebinding attacks.

---

## 3. Webhook Authentication & Anti-Replay

Inbound webhooks enforce cryptographic authenticity:
- **Algorithm**: HMAC-SHA256 signature verification over `${timestamp}.${rawBody}`.
- **Timestamp Drift Protection**: Rejects payloads with timestamps deviating by more than 300 seconds (5 minutes) from current UTC time.
- **Timing-Safe Comparison**: `crypto.timingSafeEqual` prevents side-channel timing attacks.

---

## 4. PostgreSQL Row-Level Security (RLS) Isolation

All 36 database tables enforce multi-tenant isolation via PostgreSQL RLS:
- Tenant context is set per transaction:
  ```sql
  SELECT set_config('ovra.user_id', $1, true);
  SELECT set_config('ovra.workspace_id', $2, true);
  ```
- RLS policies restrict all `SELECT`, `INSERT`, `UPDATE`, and `DELETE` queries to active workspace members (`workspace_members.user_id = auth.uid()`).
- Supabase Service Role and Secret keys are restricted to server-side background queues and never bundled into client-side JavaScript.
