import {getBrowser} from './browser.tool';
import getInteractableElements from '../scripts/get-interactable-elements';
import {getMobileVisibleElements} from '../utils/mobile-elements';
import {ToolCallback} from '@modelcontextprotocol/sdk/server/mcp';
import { encode } from '@toon-format/toon'

export const getVisibleElementsTool: ToolCallback = async () => {
  try {
    const browser = getBrowser();

    // Handle mobile apps differently from web browsers
    if (browser.isAndroid || browser.isIOS) {
      const platform = browser.isAndroid ? 'android' : 'ios';
      const elements = await getMobileVisibleElements(browser, platform);
      return {
        content: [{type: 'text', text: encode(elements)}],
      };
    }

    // Web browser - use existing implementation
    const elements = await browser.execute(getInteractableElements);
    return {
      content: [{type: 'text', text: encode(elements)}],
    };
  } catch (e) {
    return {
      content: [{type: 'text', text: `Error getting visible elements: ${e}`}],
    };
  }
};