// MEOK API Gateway root — superseded scaffold notice pointing to canonical Council gateway
export const config = { runtime: "edge" };
export default async function handler() {
  return new Response(JSON.stringify({
    service: "meok-api-gateway",
    status: "superseded_scaffold",
    canonical_gateway: "https://councilof.ai/mcp",
    board: "https://councilof.ai/api/gspc",
    stdio_package: "csoai-gspc-mcp",
    setup_cli: "npx meok-setup --pack gspc",
    meok: "https://meok.ai",
    doctrine: "Measurement, not certification. MEOK operates no second remote MCP gateway.",
    legal_entity: "CSOAI LTD · UK Companies House 16939677",
  }, null, 2), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
