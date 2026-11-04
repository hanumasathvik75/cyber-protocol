// SafeGuard AI Background Service Worker (MV3)

const BACKEND_URL = 'http://localhost:3000/api/evaluate';

const BLOCKED_PATTERNS = [
  'pornhub',
  'xhamster',
  'xvideos',
  'xnxx',
  'redtube',
  'youporn',
  'chaturbate',
  'onlyfans'
];

function triggerAlert(domain, url) {
  // 1. Chrome / Windows Notification
  try {
    chrome.notifications.create(`safeguard-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🚨 SafeGuard Parental Alert',
      message: `Blocked access to ${domain || url} on this PC.`,
      priority: 2
    });
  } catch (e) {
    console.log('Notification error:', e);
  }

  // 2. Dispatch to local Node.js Decision Backend
  fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain: domain,
      url: url,
      searchQuery: ''
    })
  })
    .then(res => res.json())
    .then(data => console.log('[SafeGuard Agent Response]', data))
    .catch(err => console.log('Backend notification note:', err.message));
}

// 1. Intercept before navigation happens (WebNavigation API)
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) { // Main frame navigation
    const url = details.url.toLowerCase();
    for (const pattern of BLOCKED_PATTERNS) {
      if (url.includes(pattern)) {
        console.log(`[SafeGuard] Blocking navigation to: ${url}`);
        triggerAlert(pattern, url);
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(pattern)}`)
        });
        break;
      }
    }
  }
});

// 2. Fallback tab URL watcher
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const targetUrl = (changeInfo.url || tab.url || '').toLowerCase();
  if (targetUrl && !targetUrl.includes(chrome.runtime.id)) {
    for (const pattern of BLOCKED_PATTERNS) {
      if (targetUrl.includes(pattern)) {
        console.log(`[SafeGuard] Tab watcher triggered for: ${targetUrl}`);
        triggerAlert(pattern, targetUrl);
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(pattern)}`)
        });
        break;
      }
    }
  }
});

// 3. Listen for direct messages from blocked.html or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'NOTIFY_BLOCK') {
    triggerAlert(message.domain, message.url);
    sendResponse({ status: 'dispatched' });
  }
  return true;
});

console.log('🛡️ SafeGuard AI Service Worker is active and monitoring.');
