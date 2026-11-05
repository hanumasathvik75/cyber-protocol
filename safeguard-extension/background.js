// SafeGuard AI Background Service Worker (MV3)
// Real-Time Transformer Intent Interception & Deep Defense

const BACKEND_URL = 'http://localhost:3000/api/evaluate';

const CRITICAL_EXPLICIT_PHRASES = [
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
  'onlyfans',
  'spankbang',
  'tube8',
  'redtube',
  'youporn'
];

function extractSearchQuery(urlStr) {
  try {
    const decoded = decodeURIComponent(urlStr);
    const m = decoded.match(/[?&;](?:p|q|query|k|wd|search_query)=([^&;?#]+)/i);
    if (m && m[1]) {
      return m[1].replace(/\+/g, ' ').trim();
    }
  } catch (e) {}
  return null;
}

function triggerNotification(title, message, priority = 2) {
  try {
    chrome.notifications.create(`safeguard-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: title,
      message: message,
      priority: priority
    });
  } catch (e) {}
}

// Intercept navigations before network requests go out
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Top-level frames only
  const url = (details.url || '').toLowerCase();

  // 1. Instant check for known explicit adult domains and critical phrases
  for (const phrase of CRITICAL_EXPLICIT_PHRASES) {
    if (url.includes(phrase.replace(/\s+/g, '+')) || url.includes(phrase)) {
      triggerNotification('🚨 Cyber-Protocol: Immediate Block', `Terminated explicit request: "${phrase}"`);
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(`blocked.html?query=${encodeURIComponent(phrase)}&vulgar=true`)
      });
      return;
    }
  }

  // 2. Extract search engine queries (Google, Yahoo, Bing, DuckDuckGo, YouTube, etc.)
  const query = extractSearchQuery(details.url);
  if (query && query.length >= 3) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600);

    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQuery: query,
          url: details.url,
          domain: new URL(details.url).hostname
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const assessment = await res.json();

      if (assessment.decision === 'IMMEDIATE_BLOCK') {
        triggerNotification('🚨 Cyber-Protocol: Vulgar Content Intercepted', `Terminated: "${query}"`);
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL(`blocked.html?query=${encodeURIComponent(query)}&vulgar=true`)
        });
      } else if (assessment.decision === 'FISHY_WARNING_10S') {
        triggerNotification('⚠️ Cyber-Protocol: Warning Flagged', `AI Warning active for search: "${query}"`);
      }
    } catch (e) {
      // 🛡️ Fail-Closed Security: If backend was killed, block evasive searches
      const lower = query.toLowerCase();
      const hasEvasionOrVulgar = ['vpn', 'proxy', 'bypass', 'unblock', 'porn', 'sex', 'nude', 'xxx', 'horny'].some(w => lower.includes(w));
      if (hasEvasionOrVulgar) {
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL(`blocked.html?query=${encodeURIComponent(query)}&vulgar=true`)
        });
      }
    }
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'NOTIFY_BLOCK') {
    triggerNotification('🚨 Cyber-Protocol: Immediate Block', `Blocked: ${message.domain || message.query}`);
    sendResponse({ status: 'blocked' });
  } else if (message.action === 'NOTIFY_FISHY') {
    triggerNotification('⚠️ Cyber-Protocol: Fishy Activity Flagged', `AI Warning active for: "${message.term}" (10s session timer)`);
    sendResponse({ status: 'warned' });
  }
  return true;
});

// -------------------------------------------------------------
// ANTI-TAMPER WATCHDOG HEARTBEAT (Every 10 seconds)
// -------------------------------------------------------------
function sendWatchdogHeartbeat() {
  fetch('http://localhost:3000/api/heartbeat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'alive', timestamp: Date.now() })
  }).catch(() => {});
}
sendWatchdogHeartbeat();
setInterval(sendWatchdogHeartbeat, 10000);

console.log('🛡️ Cyber-Protocol: Deep Defense Autonomous Worker active.');
