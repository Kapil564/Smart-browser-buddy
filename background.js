chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
      chrome.sidePanel.setOptions({
        tabId: tabs.id,
        path: 'popup.html',
        enabled: true
      });
  });
});