# meok-api-gateway (Historical Scaffold — Superseded by `councilof.ai/mcp`)

[![MEOK](https://img.shields.io/badge/MEOK-meok.ai-0ea5e9)](https://meok.ai)
[![GSPC](https://img.shields.io/badge/GSPC-live%20GET%20%2Fapi%2Fgspc-0ea5e9)](https://councilof.ai/api/gspc)
[![Measurement](https://img.shields.io/badge/Measurement-not%20certification-64748b)](https://councilof.ai/api/gspc)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Status:** Retained historical prototype. Per Council of AI single-gateway policy, **MEOK operates no second remote MCP gateway**. All remote MCP traffic connects to **`https://councilof.ai/mcp`**.

---

## Use the Canonical Council of AI × MEOK × GSPC Stack

```bash
# 1. Configure Cursor, Claude Desktop, Claude Code, VS Code, Windsurf, or Gemini CLI
npx meok-setup --pack gspc

# 2. Or run the local stdio GSPC board & Ed25519 receipt verifier directly
npx -y csoai-gspc-mcp

# 3. Install Layer-0 client SDKs
npm i @csoai/layer0
pip install csoai-gspc
```

### Canonical Live Endpoints

| Surface | URL | Notes |
| --- | --- | --- |
| **Single Remote MCP Gateway** | `https://councilof.ai/mcp` | Streamable HTTP MCP gateway |
| **Live GSPC Measurement Board** | [`https://councilof.ai/api/gspc`](https://councilof.ai/api/gspc) | Free forever; quote `totals.public_count` & `totals.lid` verbatim |
| **Corrections Ledger** | [`https://councilof.ai/api/corrections`](https://councilof.ai/api/corrections) | Public corrections ledger (free forever) |
| **Ed25519 Receipt Verifier** | [`https://councilof.ai/gspc-verify`](https://councilof.ai/gspc-verify) | Browser & offline Ed25519 verification |
| **MEOK Workspace & H.I.M.** | [`https://meok.ai`](https://meok.ai) · [`/him/`](https://meok.ai/him/) | Human-in-command frontend (`CSOAI-ORG/meok-ai-site`) |

## Honesty Register

- **Measurement, not certification.** CSOAI Ltd (UK Companies House `16939677`) measures and publishes signed artifacts; it does not certify, accredit, or act as a notified body under the EU AI Act or any other framework.
- **Single Remote Gateway:** `https://councilof.ai/mcp` is the sole remote MCP gateway for the estate.
- **No Fake Stamps:** Always cite live `GET https://councilof.ai/api/gspc` (`totals.public_count` + `totals.lid`). Prefer honest `UNCHECKABLE` when offline or unverified.

## License

MIT © [CSOAI Ltd](https://councilof.ai)
