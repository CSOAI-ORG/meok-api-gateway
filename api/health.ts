// MEOK API Gateway health check — /health
export const config = { runtime: "edge" };
export default async function handler() {
  return new Response(JSON.stringify({
    status: "ok",
    service: "meok-api-gateway",
    stage: "scaffold",
    ts: new Date().toISOString(),
  }), { status: 200, headers: { "content-type": "application/json" } });
}
