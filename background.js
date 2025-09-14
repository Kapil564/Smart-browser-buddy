chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url&& tab.url.startsWith("https://")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["contentScript.js"]
        }).catch(error => {
            console.error("Error injecting content script:", error);
        });
    }
});