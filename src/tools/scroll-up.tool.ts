import {getBrowser} from './browser.tool';
import {z} from 'zod';
import {ToolCallback} from '@modelcontextprotocol/sdk/server/mcp';

export const scrollUpToolArguments = {
  pixels: z.number().optional().default(500),
};

export const scrollUpTool: ToolCallback = async ({pixels = 500}: { pixels?: number }) => {
  try {
    const browser = getBrowser();
    await browser.execute((scrollPixels) => {
      window.scrollBy(0, -scrollPixels);
    }, pixels);
    return {
      content: [{type: 'text', text: `Scrolled up ${pixels} pixels`}],
    };
  } catch (e) {
    return {
      content: [{type: 'text', text: `Error scrolling up: ${e}`}],
    };
  }
};