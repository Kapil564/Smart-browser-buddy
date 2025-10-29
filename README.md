# Smart Prompt Buddy

A Chrome extension that leverages Chrome's built-in AI capabilities to summarize web pages and answer questions about their content. Get instant AI-powered summaries and ask any questions about the current page you're viewing.

## Features

- **AI-Powered Summarization**: Instantly summarize any web page using Chrome's built-in AI
- **Interactive Q&A**: Ask questions about the current page content and get AI-powered answers
- **Side Panel Interface**: Clean and modern side panel that stays accessible while browsing
- **Streaming Responses**: Watch AI responses stream in real-time for a smooth experience
- **Smart Content Extraction**: Automatically filters out unnecessary elements (scripts, navbars, etc.) for cleaner summaries

## Requirements

- Chrome Browser (Chrome 124+ recommended for best AI feature support)
- Chrome must have AI features enabled

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd ChromeAi
```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in the top right)

4. Click "Load unpacked" and select the `ChromeAi` folder

5. The extension icon should now appear in your Chrome toolbar

## Usage

### Summarizing a Page

1. Navigate to any webpage you want to summarize
2. Click the Smart Prompt Buddy extension icon in your toolbar
3. Click the "Summarize with Chrome AI" button
4. Wait for the AI to process and summarize the page content
5. The summary will appear in the text area below

### Asking Questions

1. Navigate to the webpage you want to ask about
2. Click the extension icon to open the side panel
3. Type your question or prompt in the input field at the bottom
4. Press Enter or click the search button (🔍)
5. The AI will analyze the page content and provide an answer

## Project Structure

```
ChromeAi/
├── manifest.json       # Extension configuration
├── background.js       # Service worker (handles AI sessions)
├── popup.html         # Side panel UI
├── popup.js           # Side panel functionality
├── contentScript.js   # Runs on web pages
└── images/            # Extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## How It Works

### Background Service Worker
- Manages AI sessions for each tab
- Creates `LanguageModel` sessions when tabs are activated or updated
- Handles prompt requests and forwards them to Chrome's AI APIs

### Side Panel
- Provides the user interface for interaction
- Handles summarization using `Summarizer.create()`
- Sends prompts to the background worker for processing
- Streams responses back for smooth display

### Content Script
- Extracts and formats page content
- Filters out unnecessary elements (scripts, styles, etc.)
- Prepares clean text for AI processing

## Technologies Used

- **Chrome Extensions Manifest V3**: Latest extension architecture
- **Chrome AI APIs**:
  - `LanguageModel`: For interactive Q&A
  - `Summarizer`: For page summarization
- **JavaScript**: Vanilla JS for all functionality
- **HTML/CSS**: Modern, gradient-based UI

## Permissions

The extension requires the following permissions:
- `activeTab`: To access the current tab's content
- `scripting`: To inject content scripts
- `storage`: To manage extension data
- `sidePanel`: To display the side panel interface
- `tabs`: To track tab changes and manage sessions
- `host_permissions`: To access web page content

## Troubleshooting

### AI Features Not Working
- Ensure you're using Chrome 124 or later
- Make sure Chrome's AI features are enabled in settings
- Check the browser console for error messages

### Extension Not Loading
- Verify Developer mode is enabled in `chrome://extensions/`
- Check for manifest errors in the extension details
- Try reloading the extension

### No Summaries Available
- The page must have text content
- Some pages with dynamic content may not work properly
- Check if the page uses iframes or complex JavaScript

## Development

### Testing Changes
1. Make your code changes
2. Go to `chrome://extensions/`
3. Find "Smart Prompt Buddy" and click the reload icon
4. Test your changes

### Debugging
- Open DevTools for the side panel: Right-click the extension icon → Inspect popup
- Check background service worker logs in `chrome://extensions/` → Service Worker link
- Use console.log statements throughout the code for debugging

## Version

Current Version: 1.0

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Author

Created as part of the ChromeAi project.

## Notes

- This extension requires Chrome's built-in AI capabilities to function
- Privacy-conscious: All processing happens locally or through Chrome's secure AI infrastructure
- No external API keys or API calls required

