# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebDriverIO MCP Server is a Model Context Protocol (MCP) server that enables Claude Desktop to interact with web browsers using WebDriverIO for browser automation. The server is published as an npm package (`webdriverio-mcp`) and runs via stdio transport.

## Development Commands

### Build and Package
```bash
npm run bundle           # Clean, build with tsup, make executable, and create .tgz package
npm run prebundle        # Clean lib directory and .tgz files
npm run postbundle       # Create npm package tarball
```

### Run Server
```bash
npm run dev              # Run development server with tsx (no build)
npm start                # Run built server from lib/server.js
```

## Architecture

### Core Components

**Server Entry Point** (`src/server.ts`)
- Initializes MCP server using `@modelcontextprotocol/sdk`
- Redirects console output to stderr to avoid interfering with MCP protocol (Chrome writes to stdout)
- Registers all tool handlers with the MCP server
- Uses StdioServerTransport for communication with Claude Desktop

**Browser State Management** (`src/tools/browser.tool.ts`)
- Maintains global state with `browsers` Map and `currentSession` tracking
- `getBrowser()` helper retrieves the current active browser instance
- `startBrowserTool` creates new WebDriverIO remote session with configurable options:
  - Headless mode support
  - Custom window dimensions (400-3840 width, 400-2160 height)
  - Chrome-specific arguments (sandbox, security, media stream, etc.)
- `closeSessionTool` properly cleans up browser sessions

**Tool Pattern**
All tools follow a consistent pattern:
1. Export Zod schema for arguments validation (e.g., `navigateToolArguments`)
2. Export ToolCallback function (e.g., `navigateTool`)
3. Use `getBrowser()` to access current session
4. Return `CallToolResult` with text content
5. Wrap operations in try-catch and return errors as text content

**Browser Script Execution** (`src/scripts/get-interactable-elements.ts`)
- Returns a function that executes in the browser context (not Node.js)
- `getInteractableElements()` finds all visible, interactable elements on the page
- Uses modern `element.checkVisibility()` API with fallback for older browsers
- Generates CSS selectors using IDs, classes, or nth-child path-based selectors
- Returns element metadata: tagName, type, id, className, textContent, value, placeholder, href, ariaLabel, role, cssSelector, isInViewport

### Build Configuration

**TypeScript** (`tsconfig.json`)
- Target: ES2022, Module: ESNext
- Source: `src/`, Output: `build/` (but not used for distribution)
- Strict mode disabled
- Includes types for Node.js and `@wdio/types`

**Bundler** (`tsup.config.ts`)
- Entry: `src/server.ts`
- Output: `lib/` directory (ESM format only)
- Generates declaration files and sourcemaps
- Externalizes `zod` dependency
- The shebang `#!/usr/bin/env node` in server.ts is preserved for CLI execution

### Selector Syntax

The project uses WebDriverIO selector strategies:
- CSS selectors: `button.my-class`, `#element-id`
- XPath: `//button[@class='my-class']`
- Text matching: `button=Exact text` (exact match), `a*=Link containing` (partial match)

### Key Implementation Details

1. **Console Output Redirection**: All console methods (log, info, warn, debug) are redirected to stderr because Chrome writes to stdout, which would corrupt the MCP stdio protocol.

2. **Element Visibility**: The `get-interactable-elements.ts` script runs in the browser and must be completely self-contained (no external dependencies). It filters for visible, non-disabled elements and returns all of them regardless of viewport status.

3. **Scroll Behavior**: Click operations default to scrolling elements into view (`scrollIntoView` with center alignment) before clicking.

4. **Session Management**: The server maintains a Map of browser sessions keyed by sessionId, but only tracks one `currentSession` at a time. All tools operate on the current session.

5. **Error Handling**: Tools catch errors and return them as text content rather than throwing, ensuring the MCP protocol remains stable.

## Adding New Tools

To add a new tool:

1. Create a new file in `src/tools/` (e.g., `my-tool.tool.ts`)
2. Define Zod schema for arguments: `export const myToolArguments = { ... }`
3. Implement the tool callback: `export const myTool: ToolCallback = async ({ args }) => { ... }`
4. Import and register in `src/server.ts`: `server.tool('my_tool', 'description', myToolArguments, myTool)`

Example:
```typescript
import { getBrowser } from './browser.tool';
import { z } from 'zod';
import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp';

export const myToolArguments = {
  param: z.string().describe('Description of parameter'),
};

export const myTool: ToolCallback = async ({ param }: { param: string }) => {
  try {
    const browser = getBrowser();
    // ... implementation
    return {
      content: [{ type: 'text', text: `Success: ${result}` }],
    };
  } catch (e) {
    return {
      content: [{ type: 'text', text: `Error: ${e}` }],
    };
  }
};
```
