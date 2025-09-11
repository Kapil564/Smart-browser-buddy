chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url && tab.url.startsWith("https://*/*")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["contentScript.js"]
        });
    }else{
        console.log("there is no text in this webpage");
    }
});