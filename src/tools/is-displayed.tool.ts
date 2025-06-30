import {getBrowser} from './browser.tool';
import {z} from 'zod';
import {ToolCallback} from '@modelcontextprotocol/sdk/server/mcp';

const defaultTimeout: number = 3000;

export const isDisplayedToolArguments = {
  selector: z.string().describe('Value for the selector, in the form of css selector or xpath ("button.my-class" or "//button[@class=\'my-class\']")'),
  timeout: z.number().optional().describe('Maximum time to wait for element in milliseconds'),
};

export const isDisplayedTool: ToolCallback = async ({selector, timeout = defaultTimeout}: { selector: string; timeout?: number }) => {
  try {
    const browser = getBrowser();
    await browser.waitUntil(browser.$(selector).isExisting, {timeout});
    const displayed = await browser.$(selector).isDisplayed();
    return {
      content: [{type: 'text', text: `Element with selector "${selector}" is ${displayed ? 'displayed' : 'not displayed'}`}],
    };
  } catch (e) {
    return {
      content: [{type: 'text', text: `Error checking if element is displayed: ${e}`}],
    };
  }
};