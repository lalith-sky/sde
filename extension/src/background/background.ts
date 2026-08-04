// Service worker for Visual AI Agent Chrome Extension

// Chrome MV3 alarms have a minimum period of 0.5 minutes (30 seconds)
const MIN_INTERVAL_SECONDS = 30;
const ALARM_NAME = 'screenshot_alarm';

// On service worker startup: re-register alarm if monitoring was active
chrome.runtime.onStartup.addListener(() => {
  restoreAlarmIfMonitoring();
});

chrome.runtime.onInstalled.addListener(() => {
  restoreAlarmIfMonitoring();
});

function restoreAlarmIfMonitoring() {
  chrome.storage.local.get(['monitoringStatus', 'interval'], (data) => {
    if (data.monitoringStatus === 'monitoring') {
      const interval = Math.max(data.interval || 30, MIN_INTERVAL_SECONDS);
      const periodInMinutes = interval / 60;
      chrome.alarms.get(ALARM_NAME, (alarm) => {
        if (!alarm) {
          chrome.alarms.create(ALARM_NAME, { periodInMinutes });
          console.log(`[Background] Restored alarm after restart: every ${interval}s`);
        }
      });
    }
  });
}

// Listen for messages from popup or other scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'START_MONITORING') {
    const { sessionId, interval, token, serverUrl } = message.payload;

    // Enforce minimum 30s interval (Chrome alarm minimum)
    const effectiveInterval = Math.max(interval, MIN_INTERVAL_SECONDS);
    const periodInMinutes = effectiveInterval / 60;

    chrome.storage.local.set({
      monitoringStatus: 'monitoring',
      sessionId,
      interval: effectiveInterval,
      token,
      serverUrl,
      lastCaptureTime: Date.now()
    }, () => {
      // Clear any existing alarm then create fresh
      chrome.alarms.clear(ALARM_NAME, () => {
        chrome.alarms.create(ALARM_NAME, { periodInMinutes });
        console.log(`[Background] Started monitoring alarm every ${effectiveInterval}s (${periodInMinutes} mins)`);
        // Perform an immediate initial capture
        captureAndSendScreen();
        sendResponse({ success: true, effectiveInterval });
      });
    });
    return true;
  }

  if (message.action === 'STOP_MONITORING') {
    chrome.alarms.clear(ALARM_NAME, () => {
      chrome.storage.local.set({ monitoringStatus: 'idle', sessionId: null }, () => {
        console.log('[Background] Stopped monitoring alarm');
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (message.action === 'GET_STATUS') {
    chrome.storage.local.get([
      'monitoringStatus', 'sessionId', 'interval', 'serverUrl', 'lastCaptureTime'
    ], (data) => {
      sendResponse({
        status: data.monitoringStatus || 'idle',
        sessionId: data.sessionId || null,
        interval: data.interval || MIN_INTERVAL_SECONDS,
        serverUrl: data.serverUrl || 'http://localhost:5000',
        lastCaptureTime: data.lastCaptureTime || null
      });
    });
    return true;
  }
  return false;
});

// Alarm firing handler
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    captureAndSendScreen();
  }
});

// Core function to capture visible tab and post to server
async function captureAndSendScreen(retryCount = 0) {
  chrome.storage.local.get([
    'monitoringStatus', 'sessionId', 'token', 'serverUrl'
  ], async (data) => {
    if (data.monitoringStatus !== 'monitoring' || !data.sessionId || !data.token) {
      console.log('[Background] Capture skipped — session not active or token missing.');
      return;
    }

    try {
      // Find the active tab
      const [activeTab] = await new Promise<chrome.tabs.Tab[]>((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, resolve);
      });

      if (!activeTab || !activeTab.id) {
        console.log('[Background] No active tab detected.');
        return;
      }

      const url = activeTab.url || '';

      // Skip internal browser pages
      if (
        url.startsWith('chrome://') ||
        url.startsWith('chrome-extension://') ||
        url.startsWith('edge://') ||
        url.startsWith('about:') ||
        url === ''
      ) {
        console.log('[Background] Skipping internal page:', url);
        return;
      }

      // Capture screenshot as JPEG data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        chrome.tabs.captureVisibleTab(
          activeTab.windowId!,
          { format: 'jpeg', quality: 80 },
          (capturedUrl) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (!capturedUrl) {
              reject(new Error('Captured image data is empty'));
            } else {
              resolve(capturedUrl);
            }
          }
        );
      });

      // Update last capture time
      chrome.storage.local.set({ lastCaptureTime: Date.now() });

      // Convert data URL to Blob directly (avoids deprecated atob)
      const blob = await fetch(dataUrl).then(r => r.blob());

      const formData = new FormData();
      formData.append('screenshot', blob, 'screenshot.jpg');
      formData.append('sessionId', data.sessionId);
      formData.append('pageTitle', activeTab.title || 'Active Tab');
      formData.append('url', url);

      const serverUrl = data.serverUrl || 'http://localhost:5000';
      console.log(`[Background] Sending capture to backend — URL: ${url}`);

      const response = await fetch(`${serverUrl}/api/activities/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${data.token}` },
        body: formData
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));

        // If 401 — token expired, stop monitoring and notify user
        if (response.status === 401) {
          console.warn('[Background] Token expired — stopping monitoring session');
          chrome.storage.local.set({ monitoringStatus: 'idle', tokenExpired: true });
          chrome.alarms.clear(ALARM_NAME);
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Visual AI Agent',
            message: 'Session expired. Please log in again to continue monitoring.'
          });
          return;
        }

        throw new Error(errorJson.message || `Server error ${response.status}`);
      }

      const result = await response.json();
      console.log('[Background] Capture processed:', result.activity?.pageTitle);

    } catch (error) {
      const msg = (error as Error).message;
      console.error('[Background] Capture error:', msg);

      // Retry up to 2 times with 5s delay for transient errors
      if (retryCount < 2) {
        console.log(`[Background] Retrying capture in 5s (attempt ${retryCount + 1}/2)...`);
        setTimeout(() => captureAndSendScreen(retryCount + 1), 5000);
      } else {
        console.error('[Background] All retries exhausted. Capture dropped.');
      }
    }
  });
}
