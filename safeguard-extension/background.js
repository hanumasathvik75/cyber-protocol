// SafeGuard AI Background Service Worker (MV3)

const BACKEND_URL = 'http://localhost:3000/api/evaluate';

// Comprehensive Adult Content & Network Patterns
const ADULT_PATTERNS = [
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
  'heavy-r',
  'tnaflix',
  'drtuber',
  'empflix',
  'nuvid',
  'pornmd',
  'youjizz',
  'rule34',
  'gelbooru',
  'danbooru',
  'nhentai',
  'hanime',
  'luscious',
  'redgifs',
  'erome',
  'fapello',
  'thothub',
  'coomer',
  'kemono',
  'bdsmlr',
  'adultfriendfinder',
  'camwhores',
  'porntrex',
  'anyporn',
  'porn'
];

// Restricted search terms (VPNs, proxies, bypass queries)
const BYPASS_SEARCH_TERMS = [
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
  'xxx',
  'adult video',
  'nsfw',
  'nude',
  'hentai',
  'sex video'
];

function checkUrlForViolations(rawUrl) {
  if (!rawUrl) return null;
  const urlLower = rawUrl.toLowerCase();

  // 1. Check Adult Domain Patterns
  for (const pattern of ADULT_PATTERNS) {
    if (urlLower.includes(pattern)) {
      let matchedHost = pattern;
      try {
        matchedHost = new URL(rawUrl).hostname || pattern;
      } catch (e) {}
      return { type: 'domain', target: matchedHost, category: 'Adult Content' };
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

      for (const term of BYPASS_SEARCH_TERMS) {
        const regex = new RegExp('(^|\\+|\\s|_|-)' + term.replace(/\s+/g, '[\\s\\+]') + '($|\\+|\\s|_|-)', 'i');
        if (regex.test(query) || query.includes(term.replace(/\s+/g, '+')) || query.includes(term)) {
          return { type: 'search', target: term, category: 'Bypass / Sensitive Search' };
        }
      }
    } catch (e) {}
  }

  return null;
}

function triggerAlert(target, category, rawUrl) {
  // 1. Chrome / Windows Action Center notification
  try {
    chrome.notifications.create(`safeguard-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🚨 SafeGuard Alert: Restricted Attempt',
      message: `Blocked [${category}]: ${target}`,
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
      domain: target,
      url: rawUrl,
      searchQuery: category.includes('Search') ? target : ''
    })
  }).catch(() => {});
}

// 1. WebNavigation API: Catch before network request
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) { // Top-level frame
    const violation = checkUrlForViolations(details.url);
    if (violation) {
      console.log(`[SafeGuard] Intercepting: ${details.url}`);
      triggerAlert(violation.target, violation.category, details.url);
      
      const paramName = violation.type === 'search' ? 'query' : 'domain';
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(`blocked.html?${paramName}=${encodeURIComponent(violation.target)}`)
      });
    }
  }
});

// 2. Tabs API: Catch instant address bar typing & tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const targetUrl = changeInfo.url || tab.url || '';
  if (targetUrl && !targetUrl.includes(chrome.runtime.id)) {
    const violation = checkUrlForViolations(targetUrl);
    if (violation) {
      console.log(`[SafeGuard] Tab watcher intercepting: ${targetUrl}`);
      triggerAlert(violation.target, violation.category, targetUrl);
      
      const paramName = violation.type === 'search' ? 'query' : 'domain';
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL(`blocked.html?${paramName}=${encodeURIComponent(violation.target)}`)
      });
    }
  }
});

// 3. Listen for direct messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'NOTIFY_BLOCK') {
    triggerAlert(message.domain, 'Restricted Navigation', message.url);
    sendResponse({ status: 'dispatched' });
  }
  return true;
});

console.log('🛡️ SafeGuard AI Service Worker is active and monitoring all traffic.');
