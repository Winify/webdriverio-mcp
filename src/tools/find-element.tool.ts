import {getBrowser} from './browser.tool';
import {z} from 'zod';
import {ToolCallback} from '@modelcontextprotocol/sdk/server/mcp';
import {ToolAnnotations} from '@modelcontextprotocol/sdk/types';

const defaultTimeout: number = 3000;

export const findElementToolArguments = {
  selector: z.string().describe('Value for the selector, in the form of css selector or xpath ("button.my-class" or "//button[@class=\'my-class\']")'),
  timeout: z.number().optional().describe('Maximum time to wait for element in milliseconds'),
};

export const findElementTool: ToolCallback = async ({selector, timeout = defaultTimeout}: { selector: string; timeout?: number }) => {
  try {
    const browser = getBrowser();
    await browser.waitUntil(browser.$(selector).isExisting, {timeout});
    return {
      content: [{type: 'text', text: 'Element found'}],
    };
  } catch (e) {
    return {
      content: [{type: 'text', text: `Error finding element: ${e}`}],
    };
  }
};