// Service worker for Visual AI Agent Chrome Extension

// Listen for messages from popup or other scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'START_MONITORING') {
    const { sessionId, interval, token, serverUrl } = message.payload;
    
    chrome.storage.local.set({
      monitoringStatus: 'monitoring',
      sessionId,
      interval,
      token,
      serverUrl,
      lastCaptureTime: Date.now()
    }, () => {
      // Setup chrome alarm for periodic capture
      // interval is in seconds, periodInMinutes needs to be double (interval / 60)
      const periodInMinutes = interval / 60;
      chrome.alarms.create('screenshot_alarm', { periodInMinutes });
      
      console.log(`[Background] Started monitoring alarm every ${interval}s (${periodInMinutes} mins)`);
      
      // Perform an immediate initial capture
      captureAndSendScreen();
      
      sendResponse({ success: true });
    });
    return true; // async response
  }
  
  if (message.action === 'STOP_MONITORING') {
    chrome.alarms.clear('screenshot_alarm', () => {
      chrome.storage.local.set({ monitoringStatus: 'idle' }, () => {
        console.log('[Background] Stopped monitoring alarm');
        sendResponse({ success: true });
      });
    });
    return true; // async response
  }
  
  if (message.action === 'GET_STATUS') {
    chrome.storage.local.get([
      'monitoringStatus',
      'sessionId',
      'interval',
      'serverUrl',
      'lastCaptureTime'
    ], (data) => {
      sendResponse({
        status: data.monitoringStatus || 'idle',
        sessionId: data.sessionId || null,
        interval: data.interval || 10,
        serverUrl: data.serverUrl || 'http://localhost:5000',
        lastCaptureTime: data.lastCaptureTime || null
      });
    });
    return true; // async response
  }
  return false;
});

// Alarm firing handler
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'screenshot_alarm') {
    captureAndSendScreen();
  }
});

// Core function to capture visible tab and post to server
async function captureAndSendScreen() {
  chrome.storage.local.get([
    'monitoringStatus',
    'sessionId',
    'token',
    'serverUrl'
  ], async (data) => {
    if (data.monitoringStatus !== 'monitoring' || !data.sessionId || !data.token) {
      console.log('[Background] Capture skipped. Session is not active or token is missing.');
      return;
    }

    try {
      // Find the active tab in current window
      const [activeTab] = await new Promise<chrome.tabs.Tab[]>((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, resolve);
      });

      if (!activeTab || !activeTab.id) {
        console.log('[Background] No active tab detected to capture.');
        return;
      }

      // Check if the URL is a chrome system page (capturing these throws an error)
      const url = activeTab.url || '';
      if (
        url.startsWith('chrome://') || 
        url.startsWith('chrome-extension://') || 
        url.startsWith('edge://') ||
        url.startsWith('about:')
      ) {
        console.log('[Background] Capture skipped for internal browser page:', url);
        return;
      }

      // Capture screen as Base64 Data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        chrome.tabs.captureVisibleTab(
          activeTab.windowId,
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

      // Update last capture timestamp
      chrome.storage.local.set({ lastCaptureTime: Date.now() });

      // Convert Base64 Data URL to Blob
      const base64Data = dataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const fileBlob = new Blob([bytes], { type: 'image/jpeg' });

      // Assemble Multipart Request body
      const formData = new FormData();
      formData.append('screenshot', fileBlob, 'screenshot.jpg');
      formData.append('sessionId', data.sessionId);
      formData.append('pageTitle', activeTab.title || 'Active Tab');
      formData.append('url', url);

      const serverUrl = data.serverUrl || 'http://localhost:5000';
      console.log(`[Background] Sending screen capture to backend... URL: ${url}`);
      
      const response = await fetch(`${serverUrl}/api/activities/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${data.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.message || `Server response error status ${response.status}`);
      }

      const result = await response.json();
      console.log('[Background] Capture processed successfully:', result.activity.pageTitle);
    } catch (error) {
      console.error('[Background] Screenshot capture/upload error:', (error as Error).message);
    }
  });
}
