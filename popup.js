async function checkAIAvailability() {
  try {
    const availability = await window.LanguageModel.availability();
    console.log("Availability:", availability);
    if (
      availability === "available" ||
      availability === "downloadable" ||
      availability === "downloading"
    ) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking AI availability:", error);
    return false;
  }
}

const button = document.getElementById("summarizeBtn");

button.addEventListener("click", async () => {
  const isAIAvailable = await checkAIAvailability();
  if (!isAIAvailable) {
    console.log("Chrome AI not detected. Enable in chrome://flags");
    return;
  }

  console.log("button clicked");

  try {
    // ✅ create the summarizer with output language
    const summarizer = await window.LanguageModel.create({
      task: "summarization",
      output: { language: "en" } // 🔥 required param
    });

    const text =
      "Chrome built-in AI provides Summarizer, Prompt, and other APIs to developers directly inside the browser.";
    const result = await summarizer.summarize(text);

    console.log("Summary:", result);
  } catch (err) {
    console.error("Error using summarizer:", err);
  }
});
