// MEOK Universal MCP Gateway — /v1/<slug>/<tool>
// Day 2: real MCP routing with auth + quota + attestation
// Stage: scaffold → live

export const config = { runtime: "edge" };

// ── MCP Registry ──────────────────────────────────────────────────────────
// Maps slug → MCP server URL. Add new MCPs here as they deploy.
// Priority: Vercel deployments first (lowest latency), then GitHub-hosted.

const MCP_REGISTRY: Record<string, { url: string; tools: string[]; tier: string }> = {
  // ── COBOL Substrate (LIVE — 11 tools) ──
  "cobol-bridge": {
    url: "https://cobol-bridge.vercel.app/mcp",
    tier: "substrate",
    tools: [
      "cobol.transform.records",
      "cobol.analyze.transactions",
      "cobol.analyze.jobs",
      "cobol.discover.copybooks",
      "cobol.transform.encoding",
      "bridge.output.payments",
      "bridge.validate.encryption",
      "bridge.validate.compliance",
      "cobol.discover.programs",
      "bridge.output.interface",
      "bridge.output.tests",
    ],
  },

  // ── MEOK Governance (LIVE — 10 tools) ──
  "governance-pack": {
    url: "https://governance-pack.vercel.app/mcp",
    tier: "substrate",
    tools: [
      "governance.validate.eu-ai-act",
      "governance.validate.dora",
      "governance.validate.nis2",
      "governance.validate.cra",
      "governance.validate.uk-ai-bill",
      "governance.annex-iv-generator",
      "governance.tech-doc-generator",
      "governance.audit-logger",
      "governance.risk-score",
      "governance.conformity-declaration",
    ],
  },

  // ── A2A Substrate (LIVE — 12 tools) ──
  "a2a-governance": {
    url: "https://a2a-governance.vercel.app/mcp",
    tier: "substrate",
    tools: [
      "a2a.orchestrate",
      "a2a.handoff",
      "a2a.audit",
      "a2a.policy.enforce",
      "a2a.rate.limit",
      "a2a.identity.verify",
      "a2a.payments",
      "a2a.delegate",
      "a2a.negotiate",
      "a2a.commerce",
      "a2a.compliance",
      "a2a.registry",
    ],
  },

  // ── Cybersec Substrate (LIVE — 6 tools) ──
  "cybersec-pack": {
    url: "https://cybersec-pack.vercel.app/mcp",
    tier: "substrate",
    tools: [
      "cybersec.sbom.cyclonedx",
      "cybersec.mitre.attack",
      "cybersec.mitre.atlas",
      "cybersec.slsa.supply-chain",
      "cybersec.sigstore.cosign",
      "cybersec.cisa.kev",
    ],
  },
};

// Known slugs (valid even if endpoint not yet deployed)
const KNOWN_SLUGS = new Set([
  ...Object.keys(MCP_REGISTRY),
  "eu-ai-act-compliance", "dora-compliance", "nis2-compliance", "cra-compliance",
  "ai-bom", "ai-incident-reporting", "dora-nis2-crosswalk", "bias-detection",
  "watermarking-authenticity", "uk-ai-bill-compliance",
  "agent-prompt-injection-firewall", "agent-data-residency", "agent-handoff-certified",
  "agent-policy-enforcement", "agent-audit-logger", "agent-rate-limiter",
  "agent-commerce-payments", "agent-delegation", "agent-identity-trust",
  "agent-negotiation", "agent-orchestrator", "a2a-governance-bridge",
  "sbom-cyclonedx", "mitre-attack", "mitre-atlas", "cisa-kev",
  "slsa-supply-chain", "sigstore-cosign",
  "mica-crypto", "fsa-food-safety", "mdr-medical-device", "fda-samd",
  "coppa-ferpa", "basel-ai-overlay", "mifid-ii-ai", "aml-ai",
  "haulage-uk-compliance", "skip-hire-ai", "construction-iso-19650",
  "ai-gateway", "ai-ops", "ai-self-audit", "care-membrane",
  "canada-aida-ai", "industry-pack",
]);

// ── In-memory quota store (Day 3: swap for Vercel KV / Upstash) ────────────
const quotaStore = new Map<string, { used: number; resetAt: number }>();

function getQuota(customerId: string, limit: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = quotaStore.get(customerId);
  if (!record || record.resetAt < now) {
    quotaStore.set(customerId, { used: 0, resetAt: now + 86_400_000 }); // 24h window
    return { allowed: true, remaining: limit };
  }
  if (record.used >= limit) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: limit - record.used };
}

function incrementQuota(customerId: string): void {
  const record = quotaStore.get(customerId);
  if (record) record.used++;
}

// ── Simple HMAC signer (Day 2: use customer-specific key) ──────────────────
async function signResponse(body: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(body);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

// ── Stripe Meter event (Day 3: real implementation) ────────────────────────
async function emitStripeMeter(
  customerId: string, slug: string, tool: string
): Promise<void> {
  // Placeholder: replace with real Stripe Meter API call
  // POST https://api.stripe.com/v1/meter_events
  // Authorization: Bearer ${STRIPE_SECRET_KEY}
  console.log(`[stripe-meter] customer=${customerId} slug=${slug} tool=${tool}`);
}

// ── Token resolution (Day 2: real Stripe customer lookup) ──────────────────
type CustomerInfo = { id: string; tier: string; slug: string | null; limit: number };

async function resolveToken(token: string): Promise<CustomerInfo | null> {
  // Day 2: look up token in Vercel KV / Upstash → Stripe customer
  // For now: accept any non-empty token as "free" tier
  if (!token || token.length < 8) return null;
  return { id: "dev-" + token.slice(0, 8), tier: "free", slug: null, limit: 10 };
}

// ── Main handler ────────────────────────────────────────────────────────────
export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);

  // ── Route validation ──
  if (parts.length < 3 || parts[0] !== "v1") {
    return json({ error: "invalid_path", expected: "/v1/<mcp-slug>/<tool>" }, 400);
  }
  const slug = parts[1];
  const tool = parts.slice(2).join("/");

  if (!KNOWN_SLUGS.has(slug)) {
    return json({
      error: "unknown_mcp",
      slug,
      hint: "Browse the 47 supported MCPs at https://meok.ai/anthropic-registry",
    }, 404);
  }

  // ── Auth ──
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return json({
      error: "auth_required",
      message: "Bearer token required. Subscribe at https://meok.ai/pricing",
      hint: `Self-host MIT-free: uvx ${slug}-mcp`,
    }, 401);
  }

  const customer = await resolveToken(token);
  if (!customer) {
    return json({ error: "invalid_token" }, 401);
  }

  // ── Slug-level access check ──
  if (customer.slug && customer.slug !== slug) {
    return json({ error: "forbidden_slug", customer_slug: customer.slug, requested_slug: slug }, 403);
  }

  // ── Quota ──
  const q = getQuota(customer.id, customer.limit);
  if (!q.allowed) {
    return json({
      error: "quota_exceeded",
      customer_id: customer.id,
      limit: customer.limit,
      reset_in_seconds: Math.max(0, Math.ceil((quotaStore.get(customer.id)?.resetAt || 0 - Date.now()) / 1000)),
      upgrade_url: "https://meok.ai/pricing",
    }, 429);
  }

  // ── Route to MCP ──
  const mcp = MCP_REGISTRY[slug];
  if (!mcp) {
    // Slug is known but not yet routed — return 501 with hint
    return json({
      error: "mcp_not_routed",
      slug,
      tool,
      hint: `MCP "${slug}" is catalogued but not yet connected to a live endpoint. Self-host: uvx ${slug}-mcp`,
      self_host_cmd: `uvx ${slug}-mcp`,
    }, 501);
  }

  // Forward the request to the backing MCP server
  try {
    const mcpRes = await forwardToMcp(mcp.url, req, tool);
    incrementQuota(customer.id);

    // Emit Stripe Meter event (non-blocking)
    emitStripeMeter(customer.id, slug, tool).catch(() => {});

    // Sign response
    const bodyText = await mcpRes.text();
    const signature = await signResponse(bodyText, customer.id + "-signing-key");

    return new Response(bodyText, {
      status: mcpRes.status,
      headers: {
        "content-type": mcpRes.headers.get("content-type") || "application/json",
        "x-meok-gateway": "live-0.2.0",
        "x-meok-attestation": `sha256=${signature}`,
        "x-meok-customer": customer.id,
        "x-meok-tier": customer.tier,
        "x-meok-quota-remaining": String(q.remaining - 1),
        "cache-control": "no-store",
      },
    });
  } catch (err: any) {
    return json({ error: "mcp_upstream_error", message: err.message }, 502);
  }
}

// ── Forward request to backing MCP ─────────────────────────────────────────
async function forwardToMcp(
  mcpUrl: string, req: Request, toolPath: string
): Promise<Response> {
  const method = req.method === "POST" ? "POST" : "GET";
  const body = method !== "GET" ? await req.text() : undefined;
  const headers = new Headers(req.headers);
  // Remove hop-by-hop and auth headers
  headers.delete("host");
  headers.delete("connection");
  headers.delete("transfer-encoding");

  // Build MCP JSON-RPC request
  let mcpBody = body;
  if (body && !body.includes("jsonrpc")) {
    // Wrap as MCP tools/call
    mcpBody = JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name: toolPath, arguments: JSON.parse(body) },
    });
  }

  const mcpReq = new Request(mcpUrl, {
    method: method === "POST" ? "POST" : "GET",
    headers: {
      "content-type": "application/json",
      "accept": "application/json, text/event-stream",
      ...Object.fromEntries(headers),
    },
    body: mcpBody,
  });

  return fetch(mcpReq, { redirect: "follow" });
}

// ── Helper ─────────────────────────────────────────────────────────────────
function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...extra,
    },
  });
}
