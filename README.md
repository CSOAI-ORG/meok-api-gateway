# MEOK API Gateway

Universal MCP gateway routing `api.meok.ai/v1/<slug>/<tool>` to any of MEOK's 47 MCPs.

**Stage:** scaffold (0.1.0). Real MCP routing lands Day 2 per `Q3_33DAY_DOMINATION_PLAN_2026-05-21.md`.

## Routes

- `GET /` — service info JSON
- `GET /health` — health check
- `* /v1/<slug>/<tool>` — call any MEOK MCP (Bearer token required)

## Pricing

See https://meok.ai/pricing — Free MIT self-host · £29 PAYG + £0.0002/call · £499 Substrate · £1,499 Universe · £4,990 Defence.

## Auth

Bearer token in `Authorization` header. Token resolves to customer + tier + quota state (Day-2 wiring).

## Architecture

```
Agent client
   │ Authorization: Bearer <token>
   ▼
api.meok.ai/v1/<slug>/<tool>
   │
   ▼
Edge Function (this repo)
   ├── Token verify (Day 2: KV lookup)
   ├── Quota count (Day 2: Upstash increment)
   ├── Stripe Meter (Day 3: usage_record over-quota)
   ├── Route to MCP container (Day 2: backend FAN-OUT)
   ├── HMAC-sign response (Day 2: customer's signing key)
   ▼
JSON response + X-MEOK-Attestation header
```

By MEOK AI Labs (CSOAI LTD, UK Companies House 16939677). MIT.
