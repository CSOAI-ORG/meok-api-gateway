// MEOK API Gateway root — handles /
export const config = { runtime: "edge" };
export default async function handler() {
  return new Response(JSON.stringify({
    service: "meok-api-gateway",
    version: "0.1.0",
    docs: "https://meok.ai/protocols",
    catalogue: "https://meok.ai/anthropic-registry",
    pricing: "https://meok.ai/pricing",
    council: "https://councilof.ai",
    routes: {
      "/v1/<slug>/<tool>": "Call any of 47 MEOK MCPs (bearer token required)",
    },
    legal_entity: "CSOAI LTD · UK Companies House 16939677",
    founder: "Nicholas Templeman <nicholas@meok.ai>",
  }, null, 2), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
