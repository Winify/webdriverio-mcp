#!/usr/bin/env node

import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {closeSessionTool, startBrowserTool, startBrowserToolArguments} from './tools/browser.tool';
import {navigateTool, navigateToolArguments} from './tools/navigate.tool';
import {clickTool, clickToolArguments, clickToolViaText} from './tools/click.tool';
import {setValueTool, setValueToolArguments} from './tools/set-value.tool';
import {findElementTool, findElementToolArguments} from './tools/find-element.tool';
import {getElementTextTool, getElementTextToolArguments} from './tools/get-element-text.tool';
import {isDisplayedTool, isDisplayedToolArguments} from './tools/is-displayed.tool';
import {scrollDownTool, scrollDownToolArguments} from './tools/scroll-down.tool';
import {scrollUpTool, scrollUpToolArguments} from './tools/scroll-up.tool';
import {getVisibleElementsTool} from './tools/get-visible-elements.tool';
import {takeScreenshotTool, takeScreenshotToolArguments} from './tools/take-screenshot.tool';
import {getCookiesTool, getCookiesToolArguments, setCookieTool, setCookieToolArguments, deleteCookiesTool, deleteCookiesToolArguments} from './tools/cookies.tool';
import {getAccessibilityTreeTool} from './tools/get-accessibility-tree.tool';

// IMPORTANT: Redirect all console output to stderr to avoid messing with MCP protocol (Chrome writes to console)
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleDebug = console.debug;

console.log = (...args) => console.error('[LOG]', ...args);
console.info = (...args) => console.error('[INFO]', ...args);
console.warn = (...args) => console.error('[WARN]', ...args);
console.debug = (...args) => console.error('[DEBUG]', ...args);

const server = new McpServer({
  name: 'MCP WebdriverIO',
  version: '1.0.0',
}, {
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool('start_browser', 'starts a browser session and sets it to the current state', startBrowserToolArguments, startBrowserTool);
server.tool('close_session', 'closes the current browser session', closeSessionTool);
server.tool('navigate', 'navigates to a URL', navigateToolArguments, navigateTool);

server.tool('get_visible_elements', 'get a list of visible (in viewport & displayed) elements on the page, must prefer this to take_screenshot for interactions', {}, getVisibleElementsTool);
server.tool('get_accessibility', 'gets accessibility tree snapshot with semantic information about page elements (roles, names, states)', {}, getAccessibilityTreeTool);

server.tool('scroll_down', 'scrolls the page down by specified pixels', scrollDownToolArguments, scrollDownTool);
server.tool('scroll_up', 'scrolls the page up by specified pixels', scrollUpToolArguments, scrollUpTool);

server.tool('find_element', 'finds an element', findElementToolArguments, findElementTool);
server.tool('click_element', 'clicks an element', clickToolArguments, clickTool);
server.tool('click_via_text', 'clicks an element', clickToolArguments, clickToolViaText);
server.tool('set_value', 'set value to an element, aka typing', setValueToolArguments, setValueTool);

server.tool('get_element_text', 'gets the text content of an element', getElementTextToolArguments, getElementTextTool);
server.tool('is_displayed', 'checks if an element is displayed', isDisplayedToolArguments, isDisplayedTool);

server.tool('take_screenshot', 'captures a screenshot of the current page', takeScreenshotToolArguments, takeScreenshotTool);

server.tool('get_cookies', 'gets all cookies or a specific cookie by name', getCookiesToolArguments, getCookiesTool);
server.tool('set_cookie', 'sets a cookie with specified name, value, and optional attributes', setCookieToolArguments, setCookieTool);
server.tool('delete_cookies', 'deletes all cookies or a specific cookie by name', deleteCookiesToolArguments, deleteCookiesTool);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('WebdriverIO MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
