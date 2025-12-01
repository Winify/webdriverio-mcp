import { remote } from 'webdriverio';
import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp';
import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import { z } from 'zod';
import {
  getAppiumServerConfig,
  buildIOSCapabilities,
  buildAndroidCapabilities,
} from '../config/appium.config';
import { getBrowser } from './browser.tool';

export const startAppToolArguments = {
  platform: z.enum(['iOS', 'Android']).describe('Mobile platform'),
  appPath: z.string().describe('Path to the app file (.app/.apk/.ipa)'),
  deviceName: z.string().describe('Device/emulator/simulator name'),
  platformVersion: z.string().optional().describe('OS version (e.g., "17.0", "14")'),
  automationName: z
    .enum(['XCUITest', 'UiAutomator2', 'Espresso'])
    .optional()
    .describe('Automation driver name'),
  appiumHost: z.string().optional().describe('Appium server hostname (overrides APPIUM_URL env var)'),
  appiumPort: z.number().optional().describe('Appium server port (overrides APPIUM_URL_PORT env var)'),
  appiumPath: z.string().optional().describe('Appium server path (overrides APPIUM_PATH env var)'),
  autoGrantPermissions: z.boolean().optional().describe('Auto-grant app permissions (default: true)'),
  autoAcceptAlerts: z.boolean().optional().describe('Auto-accept alerts (default: true)'),
  autoDismissAlerts: z.boolean().optional().describe('Auto-dismiss alerts (default: false, will override "autoAcceptAlerts" to undefined if set)'),
  appWaitActivity: z.string().optional().describe('Activity to wait for on launch (Android only)'),
};

// Access shared state from browser.tool.ts
const getState = () => {
  const sharedState = (getBrowser as any).__state;
  if (!sharedState) {
    throw new Error('Browser state not initialized');
  }
  return sharedState as {
    browsers: Map<string, WebdriverIO.Browser>;
    currentSession: string | null;
    sessionMetadata: Map<string, { type: 'browser' | 'ios' | 'android'; capabilities: any }>;
  };
};

export const startAppTool: ToolCallback = async (args: {
  platform: 'iOS' | 'Android';
  appPath: string;
  deviceName: string;
  platformVersion?: string;
  automationName?: 'XCUITest' | 'UiAutomator2' | 'Espresso';
  appiumHost?: string;
  appiumPort?: number;
  appiumPath?: string;
  autoGrantPermissions?: boolean;
  autoAcceptAlerts?: boolean;
  autoDismissAlerts?: boolean;
  appWaitActivity?: string;
}): Promise<CallToolResult> => {
  try {
    const {
      platform,
      appPath,
      deviceName,
      platformVersion,
      automationName,
      appiumHost,
      appiumPort,
      appiumPath,
      autoGrantPermissions = true,
      autoAcceptAlerts,
      autoDismissAlerts,
      appWaitActivity,
    } = args;

    // Get Appium server configuration
    const serverConfig = getAppiumServerConfig({
      hostname: appiumHost,
      port: appiumPort,
      path: appiumPath,
    });

    // Build platform-specific capabilities
    let capabilities: Record<string, any>;

    if (platform === 'iOS') {
      capabilities = buildIOSCapabilities(appPath, {
        deviceName,
        platformVersion,
        automationName: (automationName as 'XCUITest') || 'XCUITest',
        autoGrantPermissions,
        autoAcceptAlerts,
        autoDismissAlerts,
      });
    } else {
      // Android
      capabilities = buildAndroidCapabilities(appPath, {
        deviceName,
        platformVersion,
        automationName: (automationName as 'UiAutomator2' | 'Espresso') || 'UiAutomator2',
        autoGrantPermissions,
        autoAcceptAlerts,
        autoDismissAlerts,
        appWaitActivity,
      });
    }

    // Create Appium session
    const browser = await remote({
      protocol: 'http',
      hostname: serverConfig.hostname,
      port: serverConfig.port,
      path: serverConfig.path,
      capabilities,
    });

    const {sessionId} = browser;

    // Store session and metadata
    const state = getState();
    state.browsers.set(sessionId, browser);
    state.currentSession = sessionId;
    state.sessionMetadata.set(sessionId, {
      type: platform.toLowerCase() as 'ios' | 'android',
      capabilities,
    });

    return {
      content: [
        {
          type: 'text',
          text: `${platform} app session started with sessionId: ${sessionId}\nDevice: ${deviceName}\nApp: ${appPath}\nAppium Server: ${serverConfig.hostname}:${serverConfig.port}${serverConfig.path}`,
        },
      ],
    };
  } catch (e) {
    return {
      content: [{type: 'text', text: `Error starting app session: ${e}`}],
    };
  }
};
