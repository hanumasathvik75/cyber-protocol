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
  'onlyfans',
  'spankbang',
  'tube8',
  'stripchat',
  'livejasmin',
  'cam4',
  'beeg',
  'hqporner',
  'eporner',
  'motherless',
  'daftsex',
  'brazzers',
  'heavy-r'
];

// Block searches trying to install VPNs or bypass security
const RESTRICTED_SEARCH_TERMS = [
  'free vpn',
  'vpn',
  'proxy',
  'touchvpn',
  'holavpn',
  'protonvpn',
  'nordvpn',
  'unblock websites',
  'bypass block',
  'bypass parental',
  'disable parental',
  'how to turn off incognito',
  'hide ip',
  'porn',
  'xhamster',
  'pornhub',
  'xvideos'
];

function checkUrlForBypasses(rawUrl) {
  if (!rawUrl) return null;
  const urlLower = rawUrl.toLowerCase();

  // 1. Check Adult Domains
  for (const pattern of BLOCKED_PATTERNS) {
    if (urlLower.includes(pattern)) {
      return { type: 'domain', target: pattern };
    }
  }

  // 2. Check Search Engines & Chrome Web Store searches
  const isSearch = urlLower.includes('google.') || 
                   urlLower.includes('bing.') || 
                   urlLower.includes('duckduckgo.') || 
                   urlLower.includes('yahoo.') ||
                   urlLower.includes('chromewebstore.google.com') ||
                   urlLower.includes('chrome.google.com/webstore');

  if (isSearch) {
    try {
      const parsed = new URL(rawUrl);
      const query = (parsed.searchParams.get('q') || 
                     parsed.searchParams.get('query') || 
                     parsed.searchParams.get('p') || 
                     parsed.pathname).toLowerCase();

      // Check if search query contains restricted terms
      for (const term of RESTRICTED_SEARCH_TERMS) {
        // Regex word boundary or direct match
        const regex = new RegExp('(^|\\+|\\s|_|-)' + term.replace(/\s+/g, '[\\s\\+]') + '($|\\+|\\s|_|-)', 'i');
        if (regex.test(query) || query.includes(term.replace(/\s+/g, '+')) || query.includes(term)) {
          return { type: 'search', target: term };
        }
      }
    } catch (e) {}
  }

  return null;
}

function triggerAlert(target, rawUrl) {
  // 1. Chrome / Windows Notification
  try {
    chrome.notifications.create(`safeguard-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🚨 SafeGuard Alert: Restricted Attempt',
      message: `Blocked search/navigation for: "${target}"`,
      priority: 2
    });
  } catch (e) {
    console.log('Notification note:', e);
  }

  // 2. Dispatch to local Node.js Decision Backend
  fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain: target,
      url: rawUrl,
      searchQuery: target
    })
  })
    .then(res => res.json())
    .then(data => console.log('[SafeGuard Agent Response]', data))
    .catch(err => console.log('Backend notification note:', err.message));
}

// 1. Deep network interception before navigation starts
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) { // Main frame
    const violation = checkUrlForBypasses(details.url);
    if (violation) {
      console.log(`[SafeGuard] Intercepting: ${details.url}`);
      triggerAlert(violation.target, details.url);
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(`blocked.html?query=${encodeURIComponent(violation.target)}&domain=${encodeURIComponent(violation.target)}`)
      });
    }
  }
});

// 2. Tab URL watcher (catches instant address bar typing & updates)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const targetUrl = changeInfo.url || tab.url || '';
  if (targetUrl && !targetUrl.includes(chrome.runtime.id)) {
    const violation = checkUrlForBypasses(targetUrl);
    if (violation) {
      console.log(`[SafeGuard] Tab watcher intercepting: ${targetUrl}`);
      triggerAlert(violation.target, targetUrl);
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL(`blocked.html?query=${encodeURIComponent(violation.target)}&domain=${encodeURIComponent(violation.target)}`)
      });
    }
  }
});

// 3. Listen for direct messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'NOTIFY_BLOCK') {
    triggerAlert(message.domain, message.url);
    sendResponse({ status: 'dispatched' });
  }
  return true;
});

console.log('🛡️ SafeGuard AI Service Worker is active and monitoring all traffic.');
