# WebDriverIO MCP Server
A Model Context Protocol (MCP) server that enables Claude Desktop to interact with web browsers using WebDriverIO. This allows Claude to perform web automation tasks like clicking elements, filling forms, taking screenshots, and more.

## Features
- **Browser Management**: Start and close browser sessions with configurable options
- **Navigation**: Navigate to URLs and interact with web pages
- **Element Interaction**: Click elements, fill forms, and retrieve text content
- **Page Analysis**: Get visible elements, take screenshots, and check element visibility
- **Scrolling**: Scroll up and down on web pages
- **Flexible Configuration**: Support for headless mode and custom window dimensions

## Available Tools

| Tool | Description |
| --- | --- |
| `start_browser` | Start a browser session (supports headless mode and custom dimensions) |
| `close_session` | Close the current browser session |
| `navigate` | Navigate to a specific URL |
| `get_visible_elements` | Get a list of all visible elements on the page |
| `find_element` | Find a specific element using CSS selectors or XPath |
| `click_element` | Click on an element |
| `click_via_text` | Click on an element by its text content |
| `set_value` | Set value in input fields (typing) |
| `get_element_text` | Get the text content of an element |
| `is_displayed` | Check if an element is currently displayed |
| `scroll_down` | Scroll down by specified pixels |
| `scroll_up` | Scroll up by specified pixels |
| `take_screenshot` | Capture a screenshot of the current page |

## Installation & Setup

### Prerequisites
- Node.js (version 18 or higher)
- Claude Desktop application
- Chrome browser (automatically managed by WebDriverIO)

### Installation

1. **Configure Claude Desktop:**
   Add the following configuration to your Claude Desktop MCP settings:
   ```json
   {
     "mcpServers": {
       "webdriverio-mcp": {
         "command": "npx",
         "args": ["-y", "webdriverio-mcp"]
       }
     },
     "globalShortcut": ""
   }
   ```
   📖 **Need help with MCP configuration?** Read the [official MCP configuration guide](https://modelcontextprotocol.io/quickstart/user)

2. **Restart Claude Desktop:**
   ⚠️ **Important:** You may need to fully restart Claude Desktop. On Windows, use Task Manager to ensure it's completely closed before restarting.

## Usage Examples

### Basic Web Testing
Here's a sample prompt to test the functionality:
```
You are a Testing expert, and want to assess the basic workflows of a web application:
- Open World of Books (accept all cookies)
- Search for a fiction book
- Choose one and validate if there are NEW and used book options
- Report your findings at the end
```

### Browser Configuration Options

**Start browser with default settings:**
```
start_browser()
```

**Start browser in headless mode:**
```
start_browser({ headless: true })
```

**Start browser with custom dimensions:**
```
start_browser({ windowWidth: 1920, windowHeight: 1080 })
```

**Start browser in headless mode with custom dimensions:**
```
start_browser({ headless: true, windowWidth: 1920, windowHeight: 1080 })
```

## Important Notes

⚠️ **Keep tasks focused:** Claude can consume message limits quickly when performing web automation. Break complex tasks into smaller, focused operations.

⚠️ **Browser sessions:** Remember to close browser sessions when done to free up system resources.

**Found issues or have suggestions?** Please share your feedback!

## Technical Details

- Built with TypeScript and WebDriverIO
- Uses Chrome browser with automated driver management
- Implements MCP (Model Context Protocol) for Claude Desktop integration
- Supports both headed and headless browser modes
- Includes proper error handling and session management