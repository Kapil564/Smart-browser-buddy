function getFormattedContent() {
  let data = document.body.innerText;
  return {
    content: data,
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractText") {
    let data = getFormattedContent();
    sendResponse(data);
  }
});
