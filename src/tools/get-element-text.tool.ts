import {getBrowser} from './browser.tool';
import {z} from 'zod';
import {ToolCallback} from '@modelcontextprotocol/sdk/server/mcp';

const defaultTimeout: number = 3000;

export const getElementTextToolArguments = {
  selector: z.string().describe('Value for the selector, in the form of css selector or xpath ("button.my-class" or "//button[@class=\'my-class\']")'),
  timeout: z.number().optional().describe('Maximum time to wait for element in milliseconds'),
};

export const getElementTextTool: ToolCallback = async ({selector, timeout = defaultTimeout}: { selector: string; timeout?: number }) => {
  try {
    const browser = getBrowser();
    await browser.waitUntil(browser.$(selector).isExisting, {timeout});
    const text = await browser.$(selector).getText();
    return {
      content: [{type: 'text', text: `Text from element "${selector}": ${text}`}],
    };
  } catch (e) {
    return {
      content: [{type: 'text', text: `Error getting element text: ${e}`}],
    };
  }
};