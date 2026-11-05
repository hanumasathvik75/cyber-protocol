// SafeGuard AI Content Script
// Inspects early navigation, search queries, and bypass keywords

(function() {
  const currentUrl = (window.location.href || '').toLowerCase();
  const hostname = (window.location.hostname || '').toLowerCase();

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

  const BYPASS_SEARCH_TERMS = [
    'how to bypass parental controls',
    'disable parental control',
    'remove parental control',
    'disable safeguard',
    'how to turn off incognito block',
    'xhamster',
    'pornhub',
    'xvideos',
    'free vpn chrome',
    'bypass school block',
    'unblock adult sites'
  ];

  // 1. Immediate domain inspection
  for (const pattern of BLOCKED_PATTERNS) {
    if (hostname.includes(pattern) || currentUrl.includes(pattern)) {
      try {
        window.stop(); // Stop page rendering immediately
      } catch (e) {}
      window.location.replace(chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(hostname || pattern)}`));
      return;
    }
  }

  // 2. Search engine query inspection (Google, Bing, DuckDuckGo)
  const isSearchEngine = hostname.includes('google.') || hostname.includes('bing.') || hostname.includes('duckduckgo.');
  if (isSearchEngine) {
    const urlParams = new URLSearchParams(window.location.search);
    const query = (urlParams.get('q') || urlParams.get('query') || '').toLowerCase();

    if (query) {
      for (const term of BYPASS_SEARCH_TERMS) {
        if (query.includes(term)) {
          try {
            window.stop();
          } catch (e) {}
          window.location.replace(chrome.runtime.getURL(`blocked.html?query=${encodeURIComponent(query)}`));
          return;
        }
      }
    }
  }
})();
