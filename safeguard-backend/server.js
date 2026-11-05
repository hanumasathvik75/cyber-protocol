const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const PORT = 3000;
const TOAST_SCRIPT = path.join(__dirname, 'toast.ps1');

// Global State for Remote Parent Phone Control
let isProtectionActive = true;
let adminWindowExpiry = 0;
let recentKidActivity = [];
const FAMILY_CODE = process.env.FAMILY_CODE || 'CYBER-7575';
const FAMILY_SALT = '_safemind_secure_salt_v1_';
const DEVICE_NAME = process.env.COMPUTERNAME ? `${process.env.COMPUTERNAME} (Windows 11)` : "Sathvik's Laptop (Windows 11)";

// Replay Attack Cache (Nonce deduplication)
const seenNonces = new Set();

// Cryptographically derive private salted topics
function getPrivateTopic(code, suffix) {
  return 'sm_' + crypto.createHash('sha256').update(code + FAMILY_SALT + suffix).digest('hex').substring(0, 24);
}

const PRIVATE_COMMAND_TOPIC = getPrivateTopic(FAMILY_CODE, 'cmd');
const PRIVATE_ALERT_TOPIC = getPrivateTopic(FAMILY_CODE, 'alert');

// -------------------------------------------------------------
// CRYPTOGRAPHIC HMAC-SHA256 SIGNATURE VERIFIER
// -------------------------------------------------------------
function verifyParentCommand(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, reason: 'Invalid payload structure' };
  }

  const { action, timestamp, nonce, signature } = payload;
  if (!action || !timestamp || !nonce || !signature) {
    return { valid: false, reason: 'Missing required cryptographic fields' };
  }

  // Anti-Replay: Window of 60 seconds
  const now = Date.now();
  if (Math.abs(now - Number(timestamp)) > 60000) {
    return { valid: false, reason: `Expired timestamp (${Math.abs(now - timestamp)}ms skew)` };
  }

  // Anti-Replay: Nonce freshness
  if (seenNonces.has(nonce)) {
    return { valid: false, reason: 'Duplicate nonce detected (replay attack blocked)' };
  }
  seenNonces.add(nonce);
  if (seenNonces.size > 2000) seenNonces.clear();

  // Compute expected HMAC-SHA256 signature
  const message = `${action}:${timestamp}:${nonce}`;
  const expectedSig = crypto.createHmac('sha256', FAMILY_CODE).update(message).digest('hex');

  const sigBuf = Buffer.from(signature, 'hex');
  const expBuf = Buffer.from(expectedSig, 'hex');

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false, reason: 'Cryptographic signature mismatch (unauthorized source)' };
  }

  return { valid: true };
}

// -------------------------------------------------------------
// SECONDARY BROWSER PROCESS SUPERVISOR WATCHDOG
// (Whitelists Developer Brave Browser; Blocks Tor/Firefox/Opera)
// -------------------------------------------------------------
const UNAUTHORIZED_BROWSERS = [
  'firefox.exe',
  'opera.exe',
  'tor.exe',
  'vivaldi.exe'
];

let isWatchdogActive = false;
function startProcessWatchdog() {
  if (isWatchdogActive) return;
  isWatchdogActive = true;
  console.log('[*] Process Supervisor Watchdog active: Monitoring unauthorized browsers every 3s...');

  setInterval(() => {
    exec('tasklist /FO CSV /NH', (err, stdout) => {
      if (err || !stdout) return;
      const lowerOut = stdout.toLowerCase();

      for (const browser of UNAUTHORIZED_BROWSERS) {
        if (lowerOut.includes(browser.toLowerCase())) {
          console.warn(`[🚨 WATCHDOG ALERT] Unauthorized browser detected: ${browser}! Terminating immediately...`);
          exec(`taskkill /F /IM ${browser} >nul 2>&1`);

          sendWindowsToast(
            '🚨 SafeMind: Unauthorized Browser Blocked',
            `Access to ${browser} is restricted by parental policy.`
          );

          notifyParentPortal(
            '🚨 Evasion Attempt Blocked on Kid PC',
            `Kid launched unauthorized browser (${browser}). Process terminated automatically by Process Watchdog.`,
            'urgent',
            'no_entry,warning'
          );
        }
      }
    });
  }, 3000);
}

// Connect to Remote Parent Mobile Command Stream (24/7 Bi-directional Sync)
function connectToParentCommandStream() {
  const url = `https://ntfy.sh/${PRIVATE_COMMAND_TOPIC}/sse`;
  console.log(`[*] Connecting to Private Authenticated Command Stream: ${url}`);
  
  https.get(url, (res) => {
    console.log('[✓] Connected to Private Parent Command Stream!');
    res.on('data', (chunk) => {
      const text = chunk.toString();
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const raw = JSON.parse(line.substring(5).trim());
            let cmd = raw.message;
            if (typeof cmd === 'string' && cmd.startsWith('{')) {
              cmd = JSON.parse(cmd);
            }
            if (cmd && cmd.action) {
              // Cryptographic authentication gate
              const verification = verifyParentCommand(cmd);
              if (!verification.valid) {
                console.warn(`[⚠️ SECURITY WARNING] Rejected unauthorized parent command: ${verification.reason}`);
                continue;
              }
              handleRemoteParentCommand(cmd);
            }
          } catch (e) {}
        }
      }
    });

    res.on('end', () => {
      console.warn('[!] Command stream disconnected, reconnecting in 5s...');
      setTimeout(connectToParentCommandStream, 5000);
    });
  }).on('error', (err) => {
    console.warn('[!] Command stream error, retrying in 5s:', err.message);
    setTimeout(connectToParentCommandStream, 5000);
  });
}

function handleRemoteParentCommand(cmd) {
  console.log(`[⚡ Remote Command Received from Parent Phone]:`, cmd.action);

  if (cmd.action === 'DISABLE_PROTECTION') {
    isProtectionActive = false;
    sendWindowsToast(
      'SafeMind Parent Notice',
      'Protection was temporarily PAUSED by Parent Phone.'
    );
    notifyParentPortal(
      'SafeMind Status Update',
      'Protection was successfully PAUSED from your phone.',
      'default',
      'pause'
    );
  } else if (cmd.action === 'ENABLE_PROTECTION') {
    isProtectionActive = true;
    sendWindowsToast(
      'SafeMind Parent Notice',
      'Full On-Device AI Protection was RE-ARMED by Parent Phone.'
    );
    notifyParentPortal(
      'SafeMind Status Update',
      'Full Protection is now ACTIVE on Kid PC.',
      'default',
      'shield'
    );
  } else if (cmd.action === 'UNLOCK_EXTENSIONS_15M') {
    adminWindowExpiry = Date.now() + 15 * 60 * 1000;
    sendWindowsToast(
      'SafeMind Admin Notice',
      'Extension management UNLOCKED for 15 minutes by Parent Phone.'
    );
    notifyParentPortal(
      'SafeMind Admin Window Active',
      'Extensions management unlocked on Kid PC for 15 minutes.',
      'default',
      'timer_clock'
    );
  } else if (cmd.action === 'EMERGENCY_LOCK') {
    sendWindowsToast(
      '🚨 SafeMind: Emergency Lockdown',
      'Parent remotely locked the browser from their mobile phone!'
    );
    exec('taskkill /F /IM chrome.exe >nul 2>&1');
    notifyParentPortal(
      '🚨 Browser Locked Remotely',
      'Chrome browser on Kid PC was terminated immediately.',
      'urgent',
      'lock'
    );
  }
}

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
    await fetch(`https://ntfy.sh/${PRIVATE_ALERT_TOPIC}/publish`, {
      method: 'POST',
      headers: {
        'Title': safeTitle || 'Security Alert',
        'Priority': priority,
        'Tags': tags
      },
      body: message
    });
    console.log(`[+] Parent Android Portal alert dispatched to ${PRIVATE_ALERT_TOPIC}: "${safeTitle}"`);
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
  // If parent remotely paused protection from phone:
  if (!isProtectionActive) {
    return {
      decision: 'ALLOW',
      riskScore: 0.0,
      confidence: 'HIGH',
      category: 'Parent Remote Bypass: Protection Temporarily Paused',
      reason: 'Parent paused filtering from mobile app'
    };
  }

  const query = (payload.searchQuery || '').toLowerCase();
  const url = (payload.url || '').toLowerCase();
  const domain = (payload.domain || '').toLowerCase();
  const fullContext = `${query} ${url} ${domain}`.trim();

  // 0. ANTI-TAMPER SHIELD: PREVENT EXTENSION DELETION
  if (fullContext.includes('tamper_attempt')) {
    return {
      decision: 'IMMEDIATE_BLOCK',
      riskScore: 0.99,
      confidence: 'CRITICAL',
      category: '🚨 Anti-Tamper: Kid Attempted to Delete Extension',
      matchedRule: 'Extension Tamper Lock',
      reason: 'Kid navigated to chrome://extensions in an attempt to disable or delete SafeMind'
    };
  }

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

      // Check explicit modifier tokens (e.g. dirty, unfiltered, uncensored, nsfw, 18+)
      const explicitModifiers = ['dirty', 'unfiltered', 'uncensored', 'nsfw', '18+', 'erotic', 'naked', 'nude', 'strip', 'lewd', 'xxx', 'horny', 'sensual'];
      const hasModifier = explicitModifiers.some(mod => query.includes(mod));

      if (adultSim >= 0.45 || (hasModifier && adultSim >= 0.35)) {
        return {
          decision: 'IMMEDIATE_BLOCK',
          riskScore: parseFloat(adultSim.toFixed(2)),
          confidence: 'HIGH',
          category: 'AI Transformer: Vulgar / Explicit Adult Intent',
          matchedRule: `Semantic Similarity: ${(adultSim * 100).toFixed(1)}%`,
          reason: `On-Device Transformer detected vulgar/adult semantic intent`
        };
      }

      if (vpnSim >= 0.42) {
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

let lastHeartbeatTime = Date.now();
let hasTamperAlertFired = false;
let extensionEverConnected = false;

// Anti-Tampering Watchdog: Detects if kid disables or deletes the extension
setInterval(() => {
  if (extensionEverConnected && !hasTamperAlertFired) {
    const elapsed = Date.now() - lastHeartbeatTime;
    if (elapsed > 35000) { // 35 seconds without heartbeat = extension was turned off/deleted
      hasTamperAlertFired = true;
      console.warn(`[!] TAMPER DETECTED: Extension heartbeat lost (${Math.round(elapsed / 1000)}s silent)!`);
      
      sendWindowsToast(
        '🚨 SafeMind: Anti-Tamper Warning',
        'Protection extension was disabled, closed, or removed! Checking computer integrity.'
      );
      
      notifyParentPortal(
        '🚨 TAMPER ALERT: Extension Disabled on Kid PC',
        'SafeMind extension heartbeat lost. The kid may have attempted to disable or delete the browser extension.',
        'urgent',
        'rotating_light,warning,stop_sign'
      );
    }
  }
}, 10000);

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

  if (req.method === 'GET' && req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      deviceName: DEVICE_NAME,
      familyCode: FAMILY_CODE,
      isProtectionActive: isProtectionActive,
      adminWindowActive: adminWindowExpiry > Date.now(),
      adminWindowRemainingSeconds: Math.max(0, Math.round((adminWindowExpiry - Date.now()) / 1000)),
      recentActivity: recentKidActivity,
      lastHeartbeat: lastHeartbeatTime
    }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/heartbeat') {
    lastHeartbeatTime = Date.now();
    extensionEverConnected = true;
    hasTamperAlertFired = false;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'alive', watchdog: 'monitoring' }));
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

        // Record live kid activity for parent mobile portal inspection
        recentKidActivity.unshift({
          query: payload.searchQuery || payload.domain || payload.url || 'Web Search',
          decision: assessment.decision,
          score: assessment.riskScore,
          category: assessment.category,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        if (recentKidActivity.length > 25) recentKidActivity.pop();

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
  console.log(`   Private Command Topic: ${PRIVATE_COMMAND_TOPIC}`);
  console.log(`   Private Alert Topic:   ${PRIVATE_ALERT_TOPIC}`);
  console.log('====================================================');
  await initTransformerEngine();
  connectToParentCommandStream();
  startProcessWatchdog();
});
