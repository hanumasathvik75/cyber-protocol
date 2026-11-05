// SafeGuard AI: Autonomous Content Script & Transformer Semantic Interception

(function() {
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
    'onlyfans'
  ];

  const SENSITIVE_MODIFIERS = [
    'dirty', 'unfiltered', 'uncensored', 'nsfw', '18+', 'erotic', 'naked', 
    'nude', 'strip', 'lewd', 'xxx', 'horny', 'sensual', 'hot girl', 'hot video', 
    'free vpn', 'bypass block', 'bypass parental', 'proxy unblock'
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

    if (document.body) {
      document.body.appendChild(hud);
    } else {
      document.documentElement.appendChild(hud);
    }

    try {
      chrome.runtime.sendMessage({
        action: 'NOTIFY_FISHY',
        term: matchedTerm,
        url: window.location.href
      });
    } catch (e) {}

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

  function redirectToBlockedScreen(query) {
    try { window.stop(); } catch (e) {}
    const targetUrl = chrome.runtime.getURL(`blocked.html?query=${encodeURIComponent(query)}&vulgar=true`);
    window.location.replace(targetUrl);
  }

  function extractQueryFromEverywhere() {
    // 1. From URL (Yahoo, Google, Bing, DuckDuckGo, YouTube, etc.)
    try {
      const decoded = decodeURIComponent(window.location.href);
      const match = decoded.match(/[?&;](?:p|q|query|k|wd|search_query)=([^&;?#]+)/i);
      if (match && match[1]) {
        return match[1].replace(/\+/g, ' ').trim().toLowerCase();
      }
    } catch (e) {}

    // 2. From standard URLSearchParams
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || params.get('p') || params.get('query');
      if (q) return q.trim().toLowerCase();
    } catch (e) {}

    // 3. From page search input field (Yahoo #yschsp, Google textarea[name=q], Bing #sb_form_q)
    try {
      const searchBox = document.querySelector('input#yschsp, input[name="p"], input[name="q"], textarea[name="q"], input[name="query"], input#search');
      if (searchBox && searchBox.value) {
        return searchBox.value.trim().toLowerCase();
      }
    } catch (e) {}

    return '';
  }

  let isEvaluating = false;
  function evaluateContext() {
    if (isEvaluating) return;
    const currentUrl = (window.location.href || '').toLowerCase();
    const hostname = (window.location.hostname || '').toLowerCase();
    const query = extractQueryFromEverywhere();
    const fullText = `${query} ${currentUrl} ${hostname}`;

    // 1. Check if search engine is showing restricted words message (e.g. Yahoo / Google SafeSearch)
    const pageText = document.body ? (document.body.innerText || '') : '';
    if (pageText.includes('contains some restricted word') || pageText.includes('restricted word(s)')) {
      const q = query || 'show me dirty unfiltered streaming clips';
      redirectToBlockedScreen(q);
      return;
    }

    // 2. Critical Explicit Intent check
    for (const phrase of CRITICAL_EXPLICIT_PHRASES) {
      if (fullText.includes(phrase)) {
        redirectToBlockedScreen(phrase);
        return;
      }
    }

    // 3. Fishy / Borderline (10-Second Warning Overlay)
    for (const phrase of FISHY_BORDERLINE_PHRASES) {
      if (fullText.includes(phrase)) {
        show10SecondWarningHUD(phrase);
        return;
      }
    }

    // 4. On-Device Transformer Semantic Verification
    if (query && query.length >= 4) {
      isEvaluating = true;
      fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery: query, url: currentUrl, domain: hostname })
      })
      .then(res => res.json())
      .then(assessment => {
        isEvaluating = false;
        if (assessment.decision === 'IMMEDIATE_BLOCK') {
          redirectToBlockedScreen(query);
        } else if (assessment.decision === 'FISHY_WARNING_10S') {
          show10SecondWarningHUD(query);
        }
      })
      .catch(() => {
        isEvaluating = false;
      });
    }
  }

  // -------------------------------------------------------------
  // REAL-TIME ENTER KEY & FORM SUBMISSION INTERCEPTION
  // -------------------------------------------------------------
  function handleTypedSubmission(text, targetInput, originalEvent) {
    if (!text || text.length < 3) return;
    const lower = text.toLowerCase().trim();

    // Check if input is a search engine input or contains sensitive modifier tokens
    const isSearchEngine = /google\.|yahoo\.|bing\.|duckduckgo\.|youtube\./i.test(window.location.hostname);
    const hasModifier = SENSITIVE_MODIFIERS.some(mod => lower.includes(mod));

    // If it's a search or has sensitive keywords: synchronously halt navigation to evaluate
    if (isSearchEngine || hasModifier) {
      if (originalEvent) {
        originalEvent.preventDefault();
        originalEvent.stopPropagation();
      }

      // Fast check for critical phrases
      for (const phrase of CRITICAL_EXPLICIT_PHRASES) {
        if (lower.includes(phrase)) {
          redirectToBlockedScreen(text);
          return;
        }
      }

      // Evaluate through local on-device Transformer backend with Fail-Closed protection
      const controller = new AbortController();
      const timeoutTimer = setTimeout(() => controller.abort(), 500);

      fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          searchQuery: text, 
          url: window.location.href, 
          domain: window.location.hostname 
        }),
        signal: controller.signal
      })
      .then(res => {
        clearTimeout(timeoutTimer);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(assessment => {
        if (assessment.decision === 'IMMEDIATE_BLOCK') {
          redirectToBlockedScreen(text);
        } else if (assessment.decision === 'FISHY_WARNING_10S') {
          show10SecondWarningHUD(text);
          // Allow navigation after brief delay
          setTimeout(() => {
            if (targetInput && targetInput.form) {
              targetInput.form.submit();
            }
          }, 800);
        } else {
          // Allowed benign query: safely proceed
          if (targetInput && targetInput.form) {
            targetInput.form.submit();
          } else if (targetInput) {
            // Simulate form submission or reload with query
            const form = targetInput.closest('form');
            if (form) form.submit();
          }
        }
      })
      .catch((err) => {
        // 🛡️ FAIL-CLOSED PRINCIPLE:
        // If backend was killed, tampered with, or timed out, halt any sensitive attempt!
        console.warn('[SafeMind Security] Backend unreachable (Fail-Closed active):', err.message);
        if (hasModifier) {
          redirectToBlockedScreen(text);
        } else if (targetInput && targetInput.form) {
          targetInput.form.submit();
        }
      });
    }
  }

  // Capture Enter key on inputs
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const target = e.target;
      if (!target) return;
      const tag = (target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target.isContentEditable) {
        const val = (target.value || target.textContent || '').trim();
        if (val.length >= 3) {
          handleTypedSubmission(val, target, e);
        }
      }
    }
  }, true);

  // Capture form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (!form || typeof form.querySelectorAll !== 'function') return;
    const input = form.querySelector('input[type="text"], input[type="search"], input:not([type]), textarea');
    if (input) {
      const val = (input.value || '').trim();
      if (val.length >= 3) {
        handleTypedSubmission(val, input, e);
      }
    }
  }, true);

  // Initial evaluation at document_start
  evaluateContext();

  // Re-evaluate on DOMContentLoaded and full load
  document.addEventListener('DOMContentLoaded', evaluateContext);
  window.addEventListener('load', evaluateContext);

  // Dynamic DOM MutationObserver to detect search engine injection (e.g. Yahoo restricted words)
  const observer = new MutationObserver(() => {
    const bodyText = document.body ? (document.body.innerText || '') : '';
    if (bodyText.includes('contains some restricted word') || bodyText.includes('restricted word(s)')) {
      const q = extractQueryFromEverywhere() || 'Restricted / Vulgar Search';
      redirectToBlockedScreen(q);
    }
  });

  const attachObserver = () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      setTimeout(attachObserver, 50);
    }
  };
  attachObserver();

  // Watch for dynamic URL changes on SPAs
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      evaluateContext();
    }
  }, 250);

  window.addEventListener('popstate', evaluateContext);
})();
