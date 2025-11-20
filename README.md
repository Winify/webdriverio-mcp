# WebDriverIO MCP Server

A Model Context Protocol (MCP) server that enables Claude Desktop to interact with web browsers and mobile applications using WebDriverIO. Automate Chrome browsers, iOS apps, and Android apps—all through a unified interface.

## Features

### Browser Automation
- **Session Management**: Start and close Chrome browser sessions with headless/headed modes
- **Navigation & Interaction**: Navigate URLs, click elements, fill forms, and retrieve content
- **Page Analysis**: Get visible elements, accessibility trees, take screenshots
- **Cookie Management**: Get, set, and delete cookies
- **Scrolling**: Smooth scrolling with configurable distances

### Mobile App Automation (iOS/Android)
- **Native App Testing**: Test iOS (.app/.ipa) and Android (.apk) apps via Appium
- **Touch Gestures**: Tap, swipe, long-press, drag-and-drop
- **App Lifecycle**: Launch, background, terminate, check app state
- **Context Switching**: Seamlessly switch between native and webview contexts for hybrid apps
- **Device Control**: Rotate, lock/unlock, geolocation, keyboard control, notifications
- **Cross-Platform Selectors**: Accessibility IDs, XPath, UiAutomator (Android), Predicates (iOS)

## Available Tools

### Session Management
| Tool | Description |
| --- | --- |
| `start_browser` | Start a Chrome browser session (headless/headed, custom dimensions) |
| `start_app_session` | Start an iOS or Android app session via Appium |
| `close_session` | Close the current browser or app session |

### Navigation & Page Interaction (Web & Mobile)
| Tool | Description |
| --- | --- |
| `navigate` | Navigate to a URL |
| `get_visible_elements` | Get visible, interactable elements on the page |
| `get_accessibility` | Get accessibility tree with semantic element information |
| `scroll_down` | Scroll down by specified pixels |
| `scroll_up` | Scroll up by specified pixels |
| `take_screenshot` | Capture a screenshot |

### Element Interaction (Web & Mobile)
| Tool | Description |
| --- | --- |
| `find_element` | Find an element using CSS selectors, XPath, or mobile selectors |
| `click_element` | Click an element |
| `click_via_text` | Click an element by text content |
| `set_value` | Type text into input fields |
| `get_element_text` | Get text content of an element |
| `is_displayed` | Check if an element is displayed |

### Cookie Management (Web)
| Tool | Description |
| --- | --- |
| `get_cookies` | Get all cookies or a specific cookie by name |
| `set_cookie` | Set a cookie with name, value, and optional attributes |
| `delete_cookies` | Delete all cookies or a specific cookie |

### Mobile Gestures (iOS/Android)
| Tool | Description |
| --- | --- |
| `tap_element` | Tap an element by selector or coordinates |
| `swipe` | Swipe in a direction (up/down/left/right) |
| `long_press` | Long press an element or coordinates |
| `drag_and_drop` | Drag from one location to another |

### App Lifecycle (iOS/Android)
| Tool | Description |
| --- | --- |
| `get_app_state` | Check app state (installed, running, background, foreground) |
| `activate_app` | Bring app to foreground |
| `terminate_app` | Terminate a running app |

### Context Switching (Hybrid Apps)
| Tool | Description |
| --- | --- |
| `get_contexts` | List available contexts (NATIVE_APP, WEBVIEW_*) |
| `get_current_context` | Show the currently active context |
| `switch_context` | Switch between native and webview contexts |

### Device Control (iOS/Android)
| Tool | Description |
| --- | --- |
| `get_device_info` | Get device platform, version, screen size |
| `rotate_device` | Rotate to portrait or landscape orientation |
| `get_orientation` | Get current device orientation |
| `lock_device` / `unlock_device` | Lock or unlock device screen |
| `is_device_locked` | Check if device is locked |
| `shake_device` | Shake the device (iOS only) |
| `send_keys` | Send keyboard input (Android only) |
| `press_key_code` | Press Android key code (BACK=4, HOME=3, etc.) |
| `hide_keyboard` / `is_keyboard_shown` | Control on-screen keyboard |
| `open_notifications` | Open notifications panel (Android only) |
| `get_geolocation` / `set_geolocation` | Get or set device GPS location |

## Installation & Setup

### Prerequisites

**For Browser Automation:**
- Node.js (version 18 or higher)
- Claude Desktop application
- Chrome browser (automatically managed by WebDriverIO)

**For Mobile App Automation (Optional):**
- **Appium Server**: Install globally with `npm install -g appium`
- **Platform Drivers**:
  - iOS: `appium driver install xcuitest` (requires Xcode on macOS)
  - Android: `appium driver install uiautomator2` (requires Android Studio)
- **Devices/Emulators**:
  - iOS Simulator (macOS) or physical device
  - Android Emulator or physical device

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

3. **For Mobile Automation (Optional):**
   Start the Appium server before using mobile features:
   ```bash
   appium
   # Server runs at http://127.0.0.1:4723 by default
   ```

## Usage Examples

### Browser Automation

**Basic web testing prompt:**
```
You are a Testing expert, and want to assess the basic workflows of a web application:
- Open World of Books (accept all cookies)
- Search for a fiction book
- Choose one and validate if there are NEW and used book options
- Report your findings at the end
```

**Browser configuration options:**
```javascript
// Default settings (headed mode, 1280x1080)
start_browser()

// Headless mode
start_browser({ headless: true })

// Custom dimensions
start_browser({ windowWidth: 1920, windowHeight: 1080 })

// Headless with custom dimensions
start_browser({ headless: true, windowWidth: 1920, windowHeight: 1080 })
```

### Mobile App Automation

**Testing an iOS app:**
```
Test my iOS app located at /path/to/MyApp.app on iPhone 15 Pro simulator:
1. Start the app session
2. Tap the login button
3. Enter "testuser" in the username field
4. Take a screenshot of the home screen
5. Close the session
```

**Testing an Android app:**
```
Test my Android app /path/to/app.apk on the Pixel_6_API_34 emulator:
1. Start the app with auto-grant permissions
2. Swipe up to scroll
3. Tap on the "Settings" button using text matching
4. Verify the settings screen is displayed
```

**Hybrid app testing (switching contexts):**
```
Test my hybrid app:
1. Start the Android app session
2. Tap "Open Web" button in native context
3. List available contexts
4. Switch to WEBVIEW context
5. Click the login button using CSS selector
6. Switch back to NATIVE_APP context
7. Verify we're back on the home screen
```

## Important Notes

⚠️ **Session Management:**
- Only one session (browser OR app) can be active at a time
- Always close sessions when done to free system resources
- To switch between browser and mobile, close the current session first

⚠️ **Task Planning:**
- Break complex automation into smaller, focused operations
- Claude may consume message limits quickly with extensive automation

⚠️ **Mobile Automation:**
- Appium server must be running before starting mobile sessions
- Ensure emulators/simulators are running and devices are connected
- iOS automation requires macOS with Xcode installed

## Selector Syntax Quick Reference

**Web (CSS/XPath):**
- CSS: `button.my-class`, `#element-id`
- XPath: `//button[@class='my-class']`
- Text: `button=Exact text`, `a*=Contains text`

**Mobile (Cross-Platform):**
- Accessibility ID: `~loginButton` (works on both iOS and Android)
- Android UiAutomator: `android=new UiSelector().text("Login")`
- iOS Predicate: `-ios predicate string:label == "Login" AND visible == 1`
- XPath: `//android.widget.Button[@text="Login"]`

## Technical Details

- **Built with:** TypeScript, WebDriverIO, Appium
- **Browser Support:** Chrome (headed/headless, automated driver management)
- **Mobile Support:** iOS (XCUITest) and Android (UiAutomator2/Espresso)
- **Protocol:** Model Context Protocol (MCP) for Claude Desktop integration
- **Session Model:** Single active session (browser or mobile app)
- **Data Format:** TOON (Token-Oriented Object Notation) for efficient LLM communication

## Troubleshooting

**Browser automation not working?**
- Ensure Chrome is installed
- Try restarting Claude Desktop completely
- Check that no other WebDriver instances are running

**Mobile automation not working?**
- Verify Appium server is running: `appium`
- Check device/emulator is running: `adb devices` (Android) or Xcode Devices (iOS)
- Ensure correct platform drivers are installed
- Verify app path is correct and accessible

**Found issues or have suggestions?** Please share your feedback!