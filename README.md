# 🛡️ Cyber-Protocol (SafeGuard AI)
### Un-Bypassable Parental Safety & Endpoint Hardening System

> **An AI-powered digital guardrail that combines browser extension enforcement, real-time content triage, and Windows Group Policy (GPO) lockdown to make parental filtering un-bypassable.**

---

## ⚡ The Core Problem It Solves

Most consumer parental controls (Bark, Qustodio, Norton) are easily circumvented by tech-savvy kids:
1. **Incognito Mode:** Chrome & Edge disable extensions in Incognito by default.
2. **Extension Deletion:** Kids navigate to `chrome://extensions` and click "Remove".
3. **Alternate Browsers:** Kids switch to Edge, Firefox, or portable browsers.
4. **Alert Fatigue:** Keyword filters flag history homework or Bible study notes with false positives.

**Cyber-Protocol fixes all four by taking an enterprise IT security approach.**

---

## 🏗️ The 4-Layer Defense Architecture

```
 ┌─────────────────────────────────────────────────────────────┐
 │ 1. Windows GPO & Registry Hardening                         │
 │    • Disables Incognito mode permanently (Ctrl+Shift+N dead)│
 │    • Enforces ExtensionInstallForcelist (cannot be deleted) │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 2. Manifest V3 Browser Extension                            │
 │    • Zero-latency declarativeNetRequest domain interception │
 │    • webNavigation & DOM freeze for immediate threat halt   │
 │    • High-tech locked splash screen (blocked.html)          │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 3. Decision Agent Backend & Alerts                          │
 │    • Contextual AI evaluation of suspicious queries         │
 │    • Native Windows 10/11 Desktop Toast notifications       │
 │    • Telegram / WhatsApp webhook alerting pipeline          │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 4. Anti-Tamper System Watchdog                              │
 │    • Standard User privilege enforcement                    │
 │    • Process monitoring for unsigned portable executables   │
 └─────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
cyber-protocol/
├── scripts/
│   ├── lock_incognito.bat     # 1-Click script to disable Chrome Incognito
│   ├── lock_incognito.ps1     # Windows Registry GPO policy injector
│   ├── unlock_incognito.bat   # 1-Click script to restore normal settings
│   └── unlock_incognito.ps1   # Policy revert script
├── safeguard-backend/
│   ├── server.js              # Decision Agent & Event Dispatcher (port 3000)
│   ├── toast.ps1              # Native Windows Action Center toast generator
│   └── start_backend.bat      # 1-Click backend launcher
└── safeguard-extension/
    ├── manifest.json          # Chrome Manifest V3 configuration
    ├── rules.json             # DeclarativeNetRequest network interception rules
    ├── content.js             # Real-time search query & navigation inspector
    ├── background.js          # Service worker coordinating alerts & webNavigation
    ├── blocked.html & .css    # Cybersecurity-grade locked shield interface
    ├── popup.html             # Status dashboard in Chrome toolbar
    └── icons/                 # Extension icons
```

---

## 🚀 Quick Start / Local Testing

### 1. Disable Incognito in Chrome
Run `scripts/lock_incognito.bat` as **Administrator**.  
Restart Google Chrome. Pressing `Ctrl + Shift + N` is now completely disabled.

### 2. Load the Extension
1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked** and select `safeguard-extension/`.

### 3. Launch the Decision Backend
Double-click `safeguard-backend/start_backend.bat` (or run `node server.js`).  
The server listens at `http://localhost:3000`.

### 4. Test Navigation
Navigate to any restricted domain (e.g. `xhamster.com` or `pornhub.com`) or search for bypass terms:
- The browser instantly intercepts navigation and displays the **SafeGuard Shield**.
- A native **Windows Desktop Toast notification** appears in the bottom-right corner.

---

## 🔒 Enterprise Policy Specifications

| Registry Key | Value | Purpose |
| :--- | :---: | :--- |
| `HKLM\SOFTWARE\Policies\Google\Chrome\IncognitoModeAvailability` | `1` | Disables Incognito across all windows & shortcuts |
| `HKLM\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist` | `[ID]` | Silently installs extension from Web Store & prevents removal |
| `HKLM\SOFTWARE\Policies\Microsoft\Edge\InPrivateModeAvailability` | `1` | Enforces identical InPrivate lock on Microsoft Edge |

---

## 📜 License
MIT License. Built for family safety and digital device hardening.
