document.getElementById('summarizeBtn').addEventListener('click', () => {

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    
    if (!tab) {
      console.error("No active tab found.");
      return;
    }

    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getFormattedContent 
    }, (injectionResults) => {
     
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        document.getElementById('result').value = "Failed to extract text. Please try again or refresh the page.";
        return;
      }

      if (injectionResults && injectionResults[0] && injectionResults[0].result) {
        const extractedData = injectionResults[0].result;
        const textareaTab = document.getElementById('result');
        textareaTab.value = extractedData; // Display the text in the textarea
      } else {
        document.getElementById('result').value = "Failed to get data from the page.";
      }
    });
  });
});


function getFormattedContent() {
  return document.body.innerText;
}