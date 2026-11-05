// SafeGuard AI Content Script
// Real-time URL & Search Query Watcher

(function() {
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

  function evaluateCurrentPage() {
    const currentUrl = (window.location.href || '').toLowerCase();
    const hostname = (window.location.hostname || '').toLowerCase();

    // 1. Direct Adult Domain Navigation
    for (const pattern of ADULT_PATTERNS) {
      if (hostname.includes(pattern) || currentUrl.includes(pattern)) {
        try { window.stop(); } catch (e) {}
        window.location.replace(chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(hostname || pattern)}`));
        return;
      }
    }

    // 2. Search Engines & Chrome Web Store
    const isSearch = hostname.includes('google.') || 
                     hostname.includes('bing.') || 
                     hostname.includes('duckduckgo.') || 
                     hostname.includes('yahoo.') ||
                     hostname.includes('chromewebstore.google.com');

    if (isSearch) {
      const urlParams = new URLSearchParams(window.location.search);
      const query = (urlParams.get('q') || urlParams.get('query') || urlParams.get('p') || window.location.pathname).toLowerCase();

      if (query) {
        for (const term of BYPASS_SEARCH_TERMS) {
          if (query.includes(term.replace(/\s+/g, '+')) || query.includes(term)) {
            try { window.stop(); } catch (e) {}
            window.location.replace(chrome.runtime.getURL(`blocked.html?query=${encodeURIComponent(term)}`));
            return;
          }
        }
      }
    }
  }

  // Initial execution
  evaluateCurrentPage();

  // Watch for single-page dynamic updates
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      evaluateCurrentPage();
    }
  }, 200);

  window.addEventListener('popstate', evaluateCurrentPage);
})();
