
document.addEventListener("DOMContentLoaded", () => {
  const summarizeBtn = document.getElementById("summarizeBtn");
  const resultArea = document.getElementById("result");
  const loadingIndicator = document.getElementById("loading");
  const statusElement = document.getElementById("status");
  summarizeBtn.addEventListener("click", async () => {
    summarizeBtn.disabled = true;
    loadingIndicator.classList.add("show");
    resultArea.value = "";
    statusElement.textContent = "Extracting text...";
  
    try {
      const tabs = await chrome.tabs.query({active: true,currentWindow: true,});
      const tab = tabs[0];

      if (!tab) {
        throw new Error("No active tab found.");
      }
      
      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getFormattedContent,
      });

      if (chrome.runtime.lastError) {
        throw new Error(chrome.runtime.lastError.message);
      }

      if (
        injectionResults &&
        injectionResults[0] &&
        injectionResults[0].result
      ) {
        const extractedData = injectionResults[0].result;

        streamTextToTextarea(extractedData, resultArea);
        if (resultArea.value.length > 0) {
          resultArea.className = "filled";
        }
        statusElement.textContent = "Text extracted successfully!";
      } else {
        throw new Error("Failed to get data from the page.");
      }
    } catch (error) {
      console.error(error);
      resultArea.value = `Error: ${error.message}`;
      statusElement.textContent = "Failed to extract text.";
    } finally {
      summarizeBtn.disabled = false;
      loadingIndicator.classList.remove("show");
    }
  });
});

// Function to stream text to textarea for faster perceived performance
function streamTextToTextarea(text, textareaElement) {
  const chunkSize = 500; // Process text in chunks for smoother display
  let index = 0;

  function writeNextChunk() {
    if (index < text.length) {
      const chunk = text.substring(
        index,
        Math.min(index + chunkSize, text.length)
      );
      textareaElement.value += chunk;
      textareaElement.scrollTop = textareaElement.scrollHeight; // Auto-scroll to bottom
      index += chunkSize;

      // Use requestAnimationFrame for better performance
      requestAnimationFrame(writeNextChunk);
    }
  }

  // Start streaming
  writeNextChunk();
}