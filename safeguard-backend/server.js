const http = require('http');
const { exec } = require('child_process');
const path = require('path');

const PORT = 3000;
const TOAST_SCRIPT = path.join(__dirname, 'toast.ps1');

// Adult domains list (Tier 0 denylist)
const BLOCKED_DOMAINS = [
  'xhamster.com',
  'xhamster',
  'pornhub.com',
  'xvideos.com',
  'xnxx.com',
  'redtube.com',
  'youporn.com',
  'chaturbate.com',
  'onlyfans.com'
];

// Suspicious / Bypass search terms
const BYPASS_TERMS = [
  'how to bypass parental controls',
  'disable parental control',
  'remove parental controls',
  'disable chrome extension',
  'how to open incognito',
  'xhamster',
  'porn'
];

// Send Windows Desktop Notification
function sendWindowsToast(title, message) {
  const safeTitle = title.replace(/"/g, '`"');
  const safeMessage = message.replace(/"/g, '`"');
  const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -File "${TOAST_SCRIPT}" -Title "${safeTitle}" -Message "${safeMessage}"`;
  
  exec(cmd, (err) => {
    if (err) {
      console.error('[-] Error triggering Windows Toast:', err.message);
    } else {
      console.log(`[+] Windows Toast dispatched: "${title}" - "${message}"`);
    }
  });
}

// Agent Classification Logic
function evaluateTraffic(payload) {
  const url = (payload.url || '').toLowerCase();
  const domain = (payload.domain || '').toLowerCase();
  const searchQuery = (payload.searchQuery || '').toLowerCase();

  // 1. Check for adult domains
  for (const blocked of BLOCKED_DOMAINS) {
    if (url.includes(blocked) || domain.includes(blocked)) {
      return {
        verdict: 'BLOCKED',
        category: 'Adult Content',
        threatLevel: 'HIGH',
        reason: `Restricted adult content detected (${blocked})`,
        matched: blocked
      };
    }
  }

  // 2. Check for bypass searches or keywords
  for (const term of BYPASS_TERMS) {
    if (searchQuery.includes(term) || url.includes(encodeURIComponent(term))) {
      return {
        verdict: 'BLOCKED',
        category: 'Bypass / Sensitive Query',
        threatLevel: 'MEDIUM',
        reason: `Bypass attempt or sensitive query detected: "${term}"`,
        matched: term
      };
    }
  }

  return {
    verdict: 'SAFE',
    category: 'General Browsing',
    threatLevel: 'LOW',
    reason: 'Content complies with safety policies'
  };
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'active', agent: 'SafeGuard AI Decision Engine v1.0' }));
    return;
  }

  // Evaluation endpoint
  if (req.method === 'POST' && req.url === '/api/evaluate') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const assessment = evaluateTraffic(payload);

        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Incoming Request: ${payload.url || payload.domain || payload.searchQuery || 'unknown'}`);
        console.log(`           Verdict: ${assessment.verdict} | Category: ${assessment.category}`);

        if (assessment.verdict === 'BLOCKED') {
          console.log(`🚨 [ALERT] Blocking navigation! Triggering Windows desktop toast...`);
          sendWindowsToast(
            '🚨 SafeGuard Parental Alert',
            `Blocked access to ${assessment.matched || payload.domain || payload.url} on this PC.`
          );
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ...assessment,
          timestamp: new Date().toISOString()
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log('   🛡️  SafeGuard AI: Decision Agent Backend Active');
  console.log(`   Listening at: http://localhost:${PORT}`);
  console.log('   Waiting for traffic from Chrome Extension...');
  console.log('====================================================');
});
