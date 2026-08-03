// Content script for Visual AI Agent
console.log('[Visual AI Agent] Content script loaded successfully');

// Can listen for page-specific events or requests
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'GET_DOM_METADATA') {
    sendResponse({
      title: document.title,
      url: window.location.href,
      referrer: document.referrer,
    });
  }
  return true;
});
