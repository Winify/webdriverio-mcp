import {getBrowser} from './browser.tool';
import getInteractableElements from '../scripts/get-interactable-elements';
import {ToolCallback} from '@modelcontextprotocol/sdk/server/mcp';

export const getVisibleElementsTool: ToolCallback = async () => {
  try {
    const browser = getBrowser();
    const elements = await browser.execute(getInteractableElements);
    return {
      content: [{
        type: 'text', text: JSON.stringify(elements),
      }],
    };
  } catch (e) {
    return {
      content: [{type: 'text', text: `Error getting interactable elements: ${e}`}],
    };
  }
};