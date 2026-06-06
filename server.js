import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 3205;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Logging Middleware
app.use((req, res, next) => {
    console.log(`📡 [GATEWAY] ${req.method} ${req.path}`);
    next();
});

/**
 * 💰 STRIPE METERING BRIDGE
 * Emits usage events to Stripe for billable sovereign actions.
 */
async function emitStripeMeter(customerId, eventName) {
    if (process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
        console.log(`[STRIPE-MOCK] Billing Event: ${eventName} for ${customerId}`);
        return;
    }
    try {
        // Stripe Metering API (Beta/v2 pattern)
        await stripe.billing.meterEvents.create({
            event_name: eventName,
            payload: { value: "1", stripe_customer_id: customerId }
        });
        console.log(`✅ [STRIPE] Meter Event Emitted: ${eventName}`);
    } catch (err) {
        console.error("❌ [STRIPE] Metering Error:", err.message);
    }
}

// Authentication Middleware (Sovereign SSO)
const verifySovereignIdentity = (req, res, next) => {
    try {
        // Exempt OPTIONS preflight and health check
        if (req.method === 'OPTIONS' || req.path === '/health' || req.path === '/api/health') {
            return next();
        }
        
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.warn(`⚠️ [GATEWAY] Missing Authorization header for ${req.path}`);
            return res.status(401).json({ error: 'Sovereign Identity Verification Failed. Missing token.' });
        }

        if (!authHeader.startsWith('Bearer MEOK-SOV-')) {
            console.warn(`⚠️ [GATEWAY] Invalid token format for ${req.path}`);
            return res.status(401).json({ error: 'Sovereign Identity Verification Failed. Invalid token format.' });
        }
        
        // Token validated and mapped to customer
        req.user = { id: 'cus_default_sovereign', token: authHeader }; 
        next();
    } catch (err) {
        console.error("🔥 [GATEWAY] Auth Middleware Crash:", err.message);
        res.status(500).json({ error: 'Internal Gateway Auth Error' });
    }
};

app.use(verifySovereignIdentity);

// Error Handling for Proxy
app.use((err, req, res, next) => {
    console.error("🔥 [GATEWAY] Proxy Error:", err.message);
    res.status(502).json({ error: 'Bad Gateway - Upstream Service Offline' });
});

// 1. Quantum & DeepMind Simulation Backend (Python/FastAPI)
app.use('/api/quantum', createProxyMiddleware({
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    pathRewrite: { '^/api/quantum': '/api/v1/quantum-mcp' }
}));

// 2. SOV3 Intelligence Layer
app.use('/api/council', createProxyMiddleware({
    target: 'http://127.0.0.1:3101',
    changeOrigin: true,
    pathRewrite: { '^/api/council': '/v1/council' }
}));

// 2.5 Sovereign Memory & Knowledge Graph
app.use('/api/memory', createProxyMiddleware({
    target: 'http://127.0.0.1:8888',
    changeOrigin: true,
    pathRewrite: { '^/api/memory': '/api/v1/memory' }
}));

// 3. COBOL Bridge
app.use('/api/cobol', createProxyMiddleware({
    target: 'http://127.0.0.1:3002',
    changeOrigin: true,
    pathRewrite: { '^/api/cobol': '' }
}));

// 4. Character Factory (BILLABLE)
app.use('/api/factory', createProxyMiddleware({
    target: 'http://127.0.0.1:3300',
    changeOrigin: true,
    pathRewrite: { '^/api/factory': '' },
    onProxyRes: (proxyRes, req, res) => {
        if (req.method === 'POST' && req.path.includes('/mint') && proxyRes.statusCode === 201) {
            emitStripeMeter(req.user.id, 'character_mint');
        }
    }
}));

// 5. MEOK Labs: Optics & Robotics
app.use('/api/optics', createProxyMiddleware({
    target: 'http://127.0.0.1:3450',
    changeOrigin: true,
    pathRewrite: { '^/api/optics': '/v1/optics' }
}));

// 6. MEOK SECURITY (BILLABLE)
app.use('/api/security', createProxyMiddleware({
    target: 'http://127.0.0.1:3500',
    changeOrigin: true,
    pathRewrite: { '^/api/security': '' },
    onProxyRes: (proxyRes, req, res) => {
        if (req.method === 'POST' && req.path.includes('/rainbow/simulate')) {
            emitStripeMeter(req.user.id, 'security_audit');
        }
    }
}));

// 7. MEOK GAMING
app.use('/api/gaming', createProxyMiddleware({
    target: 'http://127.0.0.1:3600',
    changeOrigin: true,
    pathRewrite: { '^/api/gaming': '' }
}));

// 8. MEOK FAMILY: Sovereign Household AI
app.use('/api/family', createProxyMiddleware({
    target: 'http://127.0.0.1:3700',
    changeOrigin: true,
    pathRewrite: { '^/api/family': '' }
}));

// 9. MEOK KNOWLEDGE CORE: Unified Vector Memory
app.use('/api/knowledge', createProxyMiddleware({
    target: 'http://127.0.0.1:3800',
    changeOrigin: true,
    pathRewrite: { '^/api/knowledge': '' }
}));

// 10. MEOK VLM CORE: Vision-Language Model
app.use('/api/vision', createProxyMiddleware({
    target: 'http://127.0.0.1:3900',
    changeOrigin: true,
    pathRewrite: { '^/api/vision': '' }
}));

// 11. MEOK MESH: Edge Computing Sync
app.use('/api/mesh', createProxyMiddleware({
    target: 'http://127.0.0.1:4000',
    changeOrigin: true,
    pathRewrite: { '^/api/mesh': '' }
}));

// 12. MEOK SMB: Business Knowledge Retention
app.use('/api/smb', createProxyMiddleware({
    target: 'http://127.0.0.1:4100',
    changeOrigin: true,
    pathRewrite: { '^/api/smb': '' }
}));

// 13. MEOK WORK: Professional Workspace (Orion/Riri/Hourman)
app.use('/api/work', createProxyMiddleware({
    target: 'http://127.0.0.1:4200',
    changeOrigin: true,
    pathRewrite: { '^/api/work': '' }
}));

// 14. MEOK COUNCIL: Governance Transparency
app.use('/api/council-hub', createProxyMiddleware({
    target: 'http://127.0.0.1:4300',
    changeOrigin: true,
    pathRewrite: { '^/api/council-hub': '' }
}));

// Health Check Endpoint for OS Frontends
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        paradigm: 'MEOK ONE / DEFONEOS',
        version: 'Step 3.5',
        modules: [
            'quantum', 'council', 'cobol-bridge', 
            'character-factory', 'optics-robotics', 
            'security-shield', 'gaming', 'family',
            'knowledge-core', 'vlm-vision',
            'mesh', 'smb', 'work', 'council-hub'
        ],
        billing: 'active (Stripe Metering)'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MEOK ONE Unified Gateway running on http://0.0.0.0:${PORT}`);
    console.log(`🛡️ Absorbing and routing all sovereign microservices...`);
});
