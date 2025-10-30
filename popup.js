document.getElementById("summarizeBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    if (!tab) {
      console.error("No active tab found");
    }

    const loadingIndicator = document.getElementById("loading");
    const summarizeBtn = document.getElementById("summarizeBtn");
    const resultArea = document.getElementById("result");
    resultArea.value = "";
    summarizeBtn.disabled = true;
    loadingIndicator.classList.add("show");
    try {
      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getFormattedContent,
      });

      const pageContent = injectionResults[0].result;
      const option = {
        expectedContextLanguage: "en",
        expectedOutputLanguages: "en",
        format: "markdown",
        length: "long",
        type: "tldr",
        outputLanguage: "en",
      };
      if (navigator.userActivation.isActive) {
        const summarizer = await Summarizer.create(option);
        const summery = await summarizer.summarize(pageContent);
        streamTextToTextarea(summery, resultArea);
        resultArea.classList.add("filled");
      } else {
        console.log("activate the summarizer in chrome");
      }
    } catch (error) {
      console.error("Script injection failed: ", error.message);
    } finally {
      loadingIndicator.classList.remove("show");
      summarizeBtn.disabled = false;
    }
  });
});

// function to get formatted content
function getFormattedContent() {
  const data = document.body;
  const clonedata = data.cloneNode(true);
  excludeElements = ["script","style","noscript","iframe","img","svg",
    "canvas","video","audio","input","button","select",
    "nav","footer","aside",];
  excludeElements.forEach((tag) => {
    const elements = clonedata.querySelectorAll(tag);
    elements.forEach((el) => el.remove());
  });
  return clonedata.innerText;
}

// stream content in chunk
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
      autoResizeTextarea(textareaElement);
      textareaElement.scrollTop = textareaElement.scrollHeight; 
      index += chunkSize;
      requestAnimationFrame(writeNextChunk);
    }
  }

  writeNextChunk();
}


function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  const maxHeight = 400; 
  textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
}

document.getElementById("searchBtn").addEventListener("click", async () => {
  await handleSearch();
});

document.getElementById("searchInput").addEventListener("keydown", async (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    await handleSearch();
  }
});


async function handleSearch() {
  const searchInput = document.getElementById("searchInput").value;
  if (!searchInput || searchInput.trim() === "") {
    return;
  }
  const resultArea = document.getElementById("result");
  resultArea.value = "";
  resultArea.placeholder = "generating.....";
  autoResizeTextarea(resultArea);
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab || !tab.id) {
      console.error("No active tab or tab id found.");
      return;
    }

    // Ask background to run the prompt on behalf of this tab and return the result
    chrome.runtime.sendMessage({ type: 'prompt', tabId: tab.id, prompt: searchInput }, (response) => {
      if (!response) {
        console.error('No response from background');
        return;
      }
      if (response.error) {
        console.error('Background error:', response.error);
        resultArea.placeholder = '';
        return;
      }
      const data= response.result;
      const result =data;
      resultArea.value = result || '';
      resultArea.classList.add('filled');
      autoResizeTextarea(resultArea);
    });
  } catch (error) {
    console.error("Error during search:", error);
  }
};

console.log('popup.js loaded');
