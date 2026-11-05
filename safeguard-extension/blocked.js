// SafeGuard AI Blocked Screen Handler (MV3 CSP Compliant)

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const rawDomain = params.get('domain');
  const rawUrl = params.get('url');
  const rawQuery = params.get('query');

  const targetEl = document.getElementById('blocked-target');
  const categoryEl = document.getElementById('blocked-category');
  const timeEl = document.getElementById('blocked-time');
  const statusEl = document.getElementById('blocked-status');

  // Set accurate current timestamp
  if (timeEl) {
    timeEl.textContent = new Date().toLocaleTimeString();
  }

  // Determine if it was a search query or a website domain
  let displayTarget = 'Restricted Content';
  let displayCategory = 'Sorry, Vulgar Content Found (Strict Policy Enforced)';

  if (rawQuery) {
    displayTarget = `Search Query: "${rawQuery}"`;
    if (rawQuery.toLowerCase().includes('vpn') || rawQuery.toLowerCase().includes('proxy') || rawQuery.toLowerCase().includes('bypass')) {
      displayCategory = 'Bypass & Security Violation (VPN Evasion)';
    } else {
      displayCategory = 'AI Transformer: Vulgar / Explicit Content Intercepted';
    }
  } else if (rawDomain) {
    displayTarget = rawDomain;
    displayCategory = 'Vulgar / Adult Website (Enforced GPO Rule)';
  } else if (rawUrl) {
    try {
      displayTarget = new URL(rawUrl).hostname;
    } catch (e) {
      displayTarget = rawUrl;
    }
    displayCategory = 'Vulgar / Adult Material Blocked';
  }

  if (targetEl) targetEl.textContent = displayTarget;
  if (categoryEl) categoryEl.textContent = displayCategory;

  // Send notification to extension service worker
  try {
    chrome.runtime.sendMessage({
      action: 'NOTIFY_BLOCK',
      domain: displayTarget,
      query: rawQuery || '',
      url: window.location.href
    });
  } catch (e) {
    console.log('Runtime message note:', e);
  }

  // Ping local backend decision engine if online
  fetch('http://localhost:3000/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain: displayTarget,
      searchQuery: rawQuery || '',
      url: window.location.href
    })
  }).catch(() => {});
});
