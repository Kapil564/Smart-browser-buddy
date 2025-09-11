// this function is used to extract text from the webpage
function getVisibleText() {
    return document.body.innerText;
}

// Send the text to the background or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractText") {
        sendResponse({ text : getVisibleText() });
    }
});