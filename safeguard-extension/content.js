// SafeGuard AI Content Script
// Real-time URL & Search Query Watcher

(function() {
  const RESTRICTED_TERMS = [
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
    'xhamster',
    'pornhub',
    'xvideos'
  ];

  function evaluateCurrentPage() {
    const currentUrl = (window.location.href || '').toLowerCase();
    const hostname = (window.location.hostname || '').toLowerCase();

    // Check Search Engines & Chrome Web Store
    const isSearch = hostname.includes('google.') || 
                     hostname.includes('bing.') || 
                     hostname.includes('duckduckgo.') || 
                     hostname.includes('yahoo.') ||
                     hostname.includes('chromewebstore.google.com');

    if (isSearch) {
      const urlParams = new URLSearchParams(window.location.search);
      const query = (urlParams.get('q') || urlParams.get('query') || urlParams.get('p') || window.location.pathname).toLowerCase();

      if (query) {
        for (const term of RESTRICTED_TERMS) {
          if (query.includes(term.replace(/\s+/g, '+')) || query.includes(term)) {
            try { window.stop(); } catch (e) {}
            window.location.replace(chrome.runtime.getURL(`blocked.html?query=${encodeURIComponent(term)}&domain=${encodeURIComponent(term)}`));
            return;
          }
        }
      }
    }
  }

  // 1. Run immediately on document start
  evaluateCurrentPage();

  // 2. Continuous lightweight watcher for Single Page Applications (Google AJAX searches)
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      evaluateCurrentPage();
    }
  }, 200);

  window.addEventListener('popstate', evaluateCurrentPage);
})();
