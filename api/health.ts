// MEOK API Gateway health check — reports superseded scaffold status honestly
export const config = { runtime: "edge" };
export default async function handler() {
  return new Response(JSON.stringify({
    status: "superseded_scaffold",
    service: "meok-api-gateway",
    canonical_gateway: "https://councilof.ai/mcp",
    board: "https://councilof.ai/api/gspc",
    ts: new Date().toISOString(),
  }), { status: 200, headers: { "content-type": "application/json" } });
}
