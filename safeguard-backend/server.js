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

// -------------------------------------------------------------
// AUTONOMOUS AI DECISION AGENT
// -------------------------------------------------------------
function autonomousDecisionAgent(payload) {
  const query = (payload.searchQuery || '').toLowerCase();
  const url = (payload.url || '').toLowerCase();
  const domain = (payload.domain || '').toLowerCase();
  const fullContext = `${query} ${url} ${domain}`.trim();

  // 1. TIER 3: CRITICAL EXPLICIT INTENT (Score: 0.95 - 1.0)
  // Sentences kids type when seeking explicit material
  const criticalPhrases = [
    'i want nude',
    'i want hot video',
    'i want porn',
    'hot naked',
    'nude video',
    'nude photo',
    'naked girl',
    'xxx video',
    'sex video',
    'sexy video',
    'free porn',
    'pornhub',
    'xhamster',
    'xvideos',
    'xnxx',
    'stripchat',
    'chaturbate',
    'onlyfans'
  ];

  for (const phrase of criticalPhrases) {
    if (fullContext.includes(phrase)) {
      return {
        decision: 'IMMEDIATE_BLOCK',
        riskScore: 0.98,
        confidence: 'HIGH',
        category: 'Explicit Sexual Intent',
        matchedRule: phrase,
        reason: `AI Agent detected explicit intent: "${phrase}"`
      };
    }
  }

  // 2. TIER 2: FISHY / BORDERLINE CONTENT (Score: 0.60 - 0.84)
  // "Too fishy" - triggers 10-second warning banner and parent notification
  const fishyPhrases = [
    'hot girl',
    'hot video',
    'sexy photo',
    'bikini photo',
    'underwear girl',
    'girls kissing',
    'hot dance',
    'free vpn',
    'bypass block',
    'bypass parental',
    'hide ip',
    'proxy unblock'
  ];

  for (const phrase of fishyPhrases) {
    if (fullContext.includes(phrase)) {
      return {
        decision: 'FISHY_WARNING_10S',
        riskScore: 0.72,
        confidence: 'MEDIUM',
        category: 'Fishy / Borderline Material',
        matchedRule: phrase,
        reason: `AI Agent flagged suspicious/borderline content: "${phrase}"`
      };
    }
  }

  // 3. TIER 1: BENIGN / SAFE (Score: 0.0 - 0.20)
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
    res.end(JSON.stringify({ status: 'active', agent: 'Cyber-Protocol Autonomous Agent v2.0' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/evaluate') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const assessment = autonomousDecisionAgent(payload);

        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Autonomous Evaluation: "${payload.searchQuery || payload.domain || payload.url}"`);
        console.log(`           Decision: ${assessment.decision} | Risk Score: ${assessment.riskScore} | Category: ${assessment.category}`);

        if (assessment.decision === 'IMMEDIATE_BLOCK') {
          sendWindowsToast(
            '🚨 Cyber-Protocol: Immediate Kill-Switch',
            `AI Agent terminated search/page: "${assessment.matchedRule}"`
          );
        } else if (assessment.decision === 'FISHY_WARNING_10S') {
          sendWindowsToast(
            '⚠️ Cyber-Protocol: Fishy Activity Detected',
            `AI Agent monitoring borderline content: "${assessment.matchedRule}"`
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

server.listen(PORT, () => {
  console.log('====================================================');
  console.log('   🛡️  Cyber-Protocol: Autonomous Decision Agent v2.0');
  console.log(`   Listening at: http://localhost:${PORT}`);
  console.log('====================================================');
});
