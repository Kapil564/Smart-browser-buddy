chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url&& tab.url.startsWith("https://")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId[0].id },
            files: ["contentScript.js"]
        }).catch(error => {
            console.log("Error injecting content script:", error);
        });
    }
});