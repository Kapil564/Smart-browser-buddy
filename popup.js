
document.getElementById("summarizeBtn").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: "extractText" }, (response) => {
        if (response && response.text) {
            document.getElementById("result").value = response.text;
        } else {
            document.getElementById("result").value = "Could not extract text.";
        }
    });
});