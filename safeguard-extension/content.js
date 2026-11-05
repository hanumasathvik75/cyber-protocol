// SafeGuard AI: Autonomous Content Script & Fishy Warning HUD

(function() {
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
    'onlyfans'
  ];

  const FISHY_BORDERLINE_PHRASES = [
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

  // Injects the 10-Second Fishy Warning HUD banner
  function show10SecondWarningHUD(matchedTerm) {
    if (document.getElementById('safeguard-fishy-hud')) return;

    const hud = document.createElement('div');
    hud.id = 'safeguard-fishy-hud';
    hud.style.cssText = `
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483647;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(234, 179, 8, 0.5);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(234, 179, 8, 0.2);
      border-radius: 12px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13.5px;
      animation: slideDown 0.3s ease-out;
    `;

    hud.innerHTML = `
      <div style="font-size: 20px;">⚠️</div>
      <div>
        <div style="font-weight: 700; color: #facc15; margin-bottom: 2px;">
          SafeGuard AI Warning: Sensitive Content Flagged
        </div>
        <div style="font-size: 12px; color: #94a3b8;">
          Flagged: "<span style="color: #e2e8f0; font-family: monospace;">${matchedTerm}</span>" &bull; Incident logged to parent dashboard.
        </div>
      </div>
      <div id="hud-timer" style="
        background: rgba(234, 179, 8, 0.15);
        color: #facc15;
        font-weight: 800;
        font-family: monospace;
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid rgba(234, 179, 8, 0.3);
        margin-left: 8px;
      ">10s</div>
    `;

    document.body.appendChild(hud);

    // Notify background worker
    try {
      chrome.runtime.sendMessage({
        action: 'NOTIFY_FISHY',
        term: matchedTerm,
        url: window.location.href
      });
    } catch (e) {}

    // 10-second live countdown
    let secondsLeft = 10;
    const timerInterval = setInterval(() => {
      secondsLeft--;
      const timerEl = document.getElementById('hud-timer');
      if (timerEl) {
        timerEl.textContent = `${secondsLeft}s`;
      }
      if (secondsLeft <= 0) {
        clearInterval(timerInterval);
        if (hud) hud.remove();
      }
    }, 1000);
  }

  function evaluateContext() {
    const currentUrl = (window.location.href || '').toLowerCase();
    const hostname = (window.location.hostname || '').toLowerCase();

    // Check search queries
    const urlParams = new URLSearchParams(window.location.search);
    const query = (urlParams.get('q') || urlParams.get('query') || urlParams.get('p') || '').toLowerCase();
    const fullText = `${query} ${currentUrl} ${hostname}`;

    // 1. TIER 3: Check Critical Explicit Intent (Immediate Kill-Switch)
    for (const phrase of CRITICAL_EXPLICIT_PHRASES) {
      if (fullText.includes(phrase)) {
        try { window.stop(); } catch (e) {}
        window.location.replace(chrome.runtime.getURL(`blocked.html?query=${encodeURIComponent(phrase)}&domain=${encodeURIComponent(phrase)}`));
        return;
      }
    }

    // 2. TIER 2: Check Fishy / Borderline (10-Second Warning Overlay)
    for (const phrase of FISHY_BORDERLINE_PHRASES) {
      if (fullText.includes(phrase)) {
        show10SecondWarningHUD(phrase);
        return;
      }
    }
  }

  // Initial evaluation
  evaluateContext();

  // Watch for dynamic URL updates on Google / SPA searches
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      evaluateContext();
    }
  }, 200);

  window.addEventListener('popstate', evaluateContext);
})();
