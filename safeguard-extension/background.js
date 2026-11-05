// SafeGuard AI Background Service Worker (MV3)

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

  fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain: message,
      searchQuery: message
    })
  }).catch(() => {});
}

// Intercept critical explicit intent before network request
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) { // Top-level
    const url = details.url.toLowerCase();
    for (const phrase of CRITICAL_EXPLICIT_PHRASES) {
      if (url.includes(phrase.replace(/\s+/g, '+')) || url.includes(phrase)) {
        triggerNotification('🚨 AI Kill-Switch Triggered', `Terminated explicit request: "${phrase}"`);
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL(`blocked.html?query=${encodeURIComponent(phrase)}&domain=${encodeURIComponent(phrase)}`)
        });
        break;
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

console.log('🛡️ Cyber-Protocol: Autonomous Decision Engine is active.');
