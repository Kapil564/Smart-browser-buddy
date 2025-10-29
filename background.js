chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

console.log('background.js loaded');

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    chrome.sidePanel.setOptions({
      tabId: tabs.id,
      path: "popup.html",
      enabled: true,
    });
  });
});
const tabSessions = {};

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    if (tab && tab.url) {
      console.log("Tab changed. URL:", tab.url);
      try {
        const session = await LanguageModel.create({ pageUrl: tab.url, outputLanguage: "en", type: "text" });
        tabSessions[activeInfo.tabId] = session;
      } catch (err) {
        console.error('Failed to create session for tab', activeInfo.tabId, err);
      }
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    console.log("Tab updated. URL:", tab.url);
    // create or refresh session for this tab
    (async () => {
      try {
        const session = await LanguageModel.create({ pageUrl: tab.url, outputLanguage: "en", type: "text" });
        tabSessions[tabId] = session;
      } catch (err) {
        console.error('Failed to create session on update for tab', tabId, err);
      }
    })();
  }
});

// the popup asks the background to run prompt on behalf of the tab and return the result.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request && request.type === 'prompt') {
    const { tabId, prompt } = request;
    (async () => {
      try {
        let session = tabSessions[tabId];
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          const tab = tabs.find(t => t.id === tabId) || tabs[0];
          const pageUrl = tab && tab.url ? tab.url : undefined;
        if (!session) {
          // Try to create a session if missing
          session = await LanguageModel.create({ pageUrl, outputLanguage: 'en', type: 'text' });
          tabSessions[tabId] = session;
        }

        if (!session || typeof session.prompt !== 'function') {
          sendResponse({ error: 'No valid session available' });
          return;
        }
        await session.prompt("this is page url"+tab.url)
        console.log("this is page url"+tab.url)
        const result = await session.prompt(prompt);
        sendResponse({ result });
      } catch (err) {
        console.error('Error handling prompt request:', err);
        sendResponse({ error: String(err) });
      }
    })();

    // Indicate we will call sendResponse asynchronously
    return true;
  }

  // Unknown message
  return false;
});