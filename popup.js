// controller used to cancel an in-progress summarization when user starts a search
let summarizeAbortController = null;

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

       
        function chunkTextBySize(text, maxSize = 15000) {
          const chunks = [];
          let start = 0;
          while (start < text.length) {
            let end = Math.min(start + maxSize, text.length);
            if (end < text.length) {
              const slice = text.substring(start, end);
             
              const lastDoubleNewline = slice.lastIndexOf('\n\n');
              const lastNewline = slice.lastIndexOf('\n');
              const lastPeriod = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
              const splitPos = Math.max(lastDoubleNewline, lastNewline, lastPeriod);
              if (splitPos > Math.floor(maxSize * 0.5)) {
                end = start + splitPos + 1;
              }
            }
            chunks.push(text.substring(start, end));
            start = end;
          }
          return chunks;
        }

       
        async function summarizeLargeText(summarizer, text, signal) {
          const MAX_CHARS = 15000; 
          if (!text || text.length === 0) return '';
          if (text.length <= MAX_CHARS) {
            if (signal && signal.aborted) return '';
            const single = await summarizer.summarize(text);
            return signal && signal.aborted ? '' : single;
          }

          const chunks = chunkTextBySize(text, MAX_CHARS);
          const partialSummaries = [];

          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            
            if (signal && signal.aborted) {
              streamTextToTextarea(`\n--- Summarization aborted before chunk ${i + 1} ---\n`, resultArea);
              break;
            }

            streamTextToTextarea(`\n--- Summarizing chunk ${i + 1} of ${chunks.length} ---\n`, resultArea);
            try {
              const partial = await summarizer.summarize(chunk);
              if (signal && signal.aborted) {
                streamTextToTextarea(`(chunk ${i + 1} completed but overall summarization aborted)\n`, resultArea);
                break;
              }
              partialSummaries.push(partial);
              streamTextToTextarea(partial + "\n", resultArea);
            } catch (err) {
              streamTextToTextarea(`(chunk ${i + 1} failed: ${err.message})\n`, resultArea);
            }
          }

        
          const combined = partialSummaries.join('\n\n');
          if (!combined || combined.trim() === '') return combined;
          if (signal && signal.aborted) {
            streamTextToTextarea('\n--- Summarization aborted before final summary ---\n', resultArea);
            return combined; 
          }
          
          const finalSummary = await summarizer.summarize(combined);
          if (signal && signal.aborted) {
            streamTextToTextarea('\n--- Summarization aborted after final summary ---\n', resultArea);
            return combined;
          }
          return finalSummary;
        }
        summarizeAbortController = new AbortController();
        const summery = await summarizeLargeText(summarizer, pageContent, summarizeAbortController.signal);
        streamTextToTextarea(summery, resultArea);
        resultArea.classList.add("filled");
      } else {
        console.log("activate the summarizer in chrome");
      }
    } catch (error) {
      console.error("Script injection failed: ", error.message);
      resultArea.value = error.message;
      
    } finally {
      loadingIndicator.classList.remove("show");
      summarizeBtn.disabled = false;
      summarizeAbortController = null;
    }
  });
});

const searchInputEl = document.getElementById("searchInput");
if (searchInputEl) {
  searchInputEl.addEventListener('input', () => {
    if (summarizeAbortController) {
      try {
        summarizeAbortController.abort();
      } catch (e) {
        // ignore
      }
      const loadingIndicator = document.getElementById("loading");
      const summarizeBtn = document.getElementById("summarizeBtn");
      const resultArea = document.getElementById("result");
      streamTextToTextarea("\n--- Summarization canceled by search input ---\n", resultArea);
      if (loadingIndicator) loadingIndicator.classList.remove("show");
      if (summarizeBtn) summarizeBtn.disabled = false;
      summarizeAbortController = null;
    }
  });
}


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

  if (typeof summarizeAbortController !== 'undefined' && summarizeAbortController) {
    try {
      summarizeAbortController.abort();
    } catch (e) {
      // ignore
    }
    streamTextToTextarea("\n--- Summarization canceled by new search ---\n", resultArea);
    const loadingIndicator = document.getElementById("loading");
    const summarizeBtn = document.getElementById("summarizeBtn");
    if (loadingIndicator) loadingIndicator.classList.remove("show");
    if (summarizeBtn) summarizeBtn.disabled = false;
    summarizeAbortController = null;
  }

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
