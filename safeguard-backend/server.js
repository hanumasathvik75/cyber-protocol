const http = require('http');
const { exec } = require('child_process');
const path = require('path');

const PORT = 3000;
const TOAST_SCRIPT = path.join(__dirname, 'toast.ps1');

// Send Windows Desktop Notification
function sendWindowsToast(title, message) {
  const safeTitle = title.replace(/"/g, '`"');
  const safeMessage = message.replace(/"/g, '`"');
  const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -File "${TOAST_SCRIPT}" -Title "${safeTitle}" -Message "${safeMessage}"`;
  
  exec(cmd, (err) => {
    if (!err) {
      console.log(`[+] Windows Toast dispatched: "${title}"`);
    }
  });
}

// Send Real-Time Cloud Notification to Parent Mobile Portal & Android App
async function notifyParentPortal(title, message, priority = 'high', tags = 'warning') {
  try {
    const safeTitle = title.replace(/[^\x00-\x7F]/g, '').trim();
    await fetch('https://ntfy.sh/cyber_protocol_parent_alerts_7575/publish', {
      method: 'POST',
      headers: {
        'Title': safeTitle || 'Security Alert',
        'Priority': priority,
        'Tags': tags
      },
      body: message
    });
    console.log(`[+] Parent Android Portal alert dispatched: "${safeTitle}"`);
  } catch (err) {
    console.warn(`[!] Note on parent portal dispatch:`, err.message);
  }
}

// -------------------------------------------------------------
// SOTA ON-DEVICE TRANSFORMER INITIALIZATION (all-MiniLM-L6-v2)
// -------------------------------------------------------------
let extractor = null;
let cos_sim = null;
let adultAnchorVec = null;
let vpnAnchorVec = null;

const SAFETY_ANCHORS = {
  ADULT_EXPLICIT: "watching explicit pornographic adult sex nude videos",
  VPN_BYPASS: "download free vpn proxy to unblock restricted websites"
};

async function initTransformerEngine() {
  try {
    console.log("[*] Initializing Pre-Trained On-Device Transformer: Xenova/all-MiniLM-L6-v2...");
    const transformers = await import('@xenova/transformers');
    extractor = await transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    cos_sim = transformers.cos_sim;

    // Pre-compute intent anchor embeddings into RAM
    adultAnchorVec = await extractor(SAFETY_ANCHORS.ADULT_EXPLICIT, { pooling: 'mean', normalize: true });
    vpnAnchorVec = await extractor(SAFETY_ANCHORS.VPN_BYPASS, { pooling: 'mean', normalize: true });

    console.log("[✓] Transformer Decision Engine Ready! (Sub-15ms Local Inference Active)");
  } catch (err) {
    console.error("[!] Warning: Could not initialize transformer engine, fallback to fast rules:", err.message);
  }
}

// -------------------------------------------------------------
// AUTONOMOUS AI HYBRID DECISION AGENT
// (Fast Rules + Deep Semantic Transformer Cosine Similarity)
// -------------------------------------------------------------
async function autonomousDecisionAgent(payload) {
  const query = (payload.searchQuery || '').toLowerCase();
  const url = (payload.url || '').toLowerCase();
  const domain = (payload.domain || '').toLowerCase();
  const fullContext = `${query} ${url} ${domain}`.trim();

  // 1. FAST RULE-BASED TIER 3: CRITICAL EXPLICIT PHRASES (< 1ms)
  const criticalPhrases = [
    'i want nude', 'i want hot video', 'i want porn', 'hot naked',
    'nude video', 'nude photo', 'naked girl', 'xxx video', 'sex video',
    'sexy video', 'free porn', 'pornhub', 'xhamster', 'xvideos',
    'xnxx', 'stripchat', 'chaturbate', 'onlyfans'
  ];

  for (const phrase of criticalPhrases) {
    if (fullContext.includes(phrase)) {
      return {
        decision: 'IMMEDIATE_BLOCK',
        riskScore: 0.99,
        confidence: 'HIGH',
        category: 'Rule Engine: Explicit Sexual Intent',
        matchedRule: phrase,
        reason: `Immediate rule matched explicit intent: "${phrase}"`
      };
    }
  }

  // 2. FAST RULE-BASED TIER 2: SUSPICIOUS / BORDERLINE (< 1ms)
  const fishyPhrases = [
    'hot girl', 'hot video', 'sexy photo', 'bikini photo', 'underwear girl',
    'girls kissing', 'hot dance', 'free vpn', 'bypass block', 'bypass parental',
    'hide ip', 'proxy unblock'
  ];

  for (const phrase of fishyPhrases) {
    if (fullContext.includes(phrase)) {
      return {
        decision: 'FISHY_WARNING_10S',
        riskScore: 0.75,
        confidence: 'MEDIUM',
        category: 'Rule Engine: Suspicious Evasion/Borderline',
        matchedRule: phrase,
        reason: `Rule flagged suspicious activity: "${phrase}"`
      };
    }
  }

  // 3. DEEP SEMANTIC TRANSFORMER INTENT CLASSIFICATION (~15ms)
  // Evaluates natural language queries without relying on hardcoded words!
  if (extractor && cos_sim && adultAnchorVec && vpnAnchorVec && query.length > 3) {
    try {
      const qVec = await extractor(query, { pooling: 'mean', normalize: true });
      const adultSim = cos_sim(qVec.data, adultAnchorVec.data);
      const vpnSim = cos_sim(qVec.data, vpnAnchorVec.data);

      console.log(`[AI Transformer] Query: "${query}" | Adult Sim: ${(adultSim * 100).toFixed(1)}% | VPN Sim: ${(vpnSim * 100).toFixed(1)}%`);

      if (adultSim >= 0.58) {
        return {
          decision: 'IMMEDIATE_BLOCK',
          riskScore: parseFloat(adultSim.toFixed(2)),
          confidence: 'HIGH',
          category: 'AI Transformer: Explicit Adult Intent',
          matchedRule: `Semantic Similarity: ${(adultSim * 100).toFixed(1)}%`,
          reason: `On-Device Transformer detected explicit adult semantic intent`
        };
      }

      if (vpnSim >= 0.60) {
        return {
          decision: 'FISHY_WARNING_10S',
          riskScore: parseFloat(vpnSim.toFixed(2)),
          confidence: 'HIGH',
          category: 'AI Transformer: VPN / Proxy Bypass Intent',
          matchedRule: `Semantic Similarity: ${(vpnSim * 100).toFixed(1)}%`,
          reason: `On-Device Transformer detected network bypass/evasion intent`
        };
      }
    } catch (e) {
      console.warn("[!] Error during transformer inference:", e.message);
    }
  }

  // 4. TIER 1: BENIGN / SAFE (Homework, Gaming, Normal Web)
  return {
    decision: 'ALLOW',
    riskScore: 0.05,
    confidence: 'HIGH',
    category: 'Educational / Benign',
    reason: 'Content complies with safety policies'
  };
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'active', 
      agent: 'Cyber-Protocol Autonomous Agent v2.5',
      transformer_engine: extractor ? 'Online (all-MiniLM-L6-v2)' : 'Initializing'
    }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/evaluate') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const assessment = await autonomousDecisionAgent(payload);

        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Evaluation for "${payload.searchQuery || payload.domain || payload.url}":`);
        console.log(`             Decision: ${assessment.decision} | Score: ${assessment.riskScore} | ${assessment.category}`);

        if (assessment.decision === 'IMMEDIATE_BLOCK') {
          const target = payload.searchQuery || assessment.matchedRule || payload.domain || 'Explicit URL';
          sendWindowsToast(
            '🚨 Cyber-Protocol: Vulgar Content Intercepted',
            `Sorry, vulgar content found: "${target}". Navigation terminated immediately.`
          );
          notifyParentPortal(
            '🚨 Vulgar Content Intercepted on Kid PC',
            `Kid typed/requested: "${target}"\nAI Safety Score: ${assessment.riskScore}\nAction: Block screen shown & page killed.`,
            'urgent',
            'rotating_light,no_entry'
          );
        } else if (assessment.decision === 'FISHY_WARNING_10S') {
          const target = payload.searchQuery || assessment.matchedRule || payload.domain || 'Suspicious URL';
          sendWindowsToast(
            '⚠️ Cyber-Protocol: Warning Activity Flagged',
            `AI Transformer monitoring suspicious activity: "${target}"`
          );
          notifyParentPortal(
            '⚠️ Warning: Suspicious Search on Kid PC',
            `Kid typed: "${target}"\nAI Intent: ${assessment.category}\nAction: 10-second warning HUD active.`,
            'default',
            'warning,eyes'
          );
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ...assessment,
          timestamp: new Date().toISOString()
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid payload' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, async () => {
  console.log('====================================================');
  console.log('   🛡️  Cyber-Protocol: Autonomous Decision Agent v2.5');
  console.log(`   Listening at: http://localhost:${PORT}`);
  console.log('====================================================');
  await initTransformerEngine();
});
