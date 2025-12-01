/**
 * Appium server configuration and capability builders
 */

export interface AppiumServerConfig {
  hostname: string;
  port: number;
  path: string;
}

export interface IOSCapabilityOptions {
  deviceName: string;
  platformVersion?: string;
  automationName?: 'XCUITest';
  autoGrantPermissions?: boolean;
  autoAcceptAlerts?: boolean;
  autoDismissAlerts?: boolean;
  [key: string]: any;
}

export interface AndroidCapabilityOptions {
  deviceName: string;
  platformVersion?: string;
  automationName?: 'UiAutomator2' | 'Espresso';
  autoGrantPermissions?: boolean;
  autoAcceptAlerts?: boolean;
  autoDismissAlerts?: boolean;
  appWaitActivity?: string;
  [key: string]: any;
}

/**
 * Get Appium server configuration from environment variables or defaults
 */
export function getAppiumServerConfig(overrides?: Partial<AppiumServerConfig>): AppiumServerConfig {
  return {
    hostname: overrides?.hostname || process.env.APPIUM_URL || '127.0.0.1',
    port: overrides?.port || Number(process.env.APPIUM_URL_PORT) || 4723,
    path: overrides?.path || process.env.APPIUM_PATH || '/',
  };
}

/**
 * Build iOS capabilities for Appium session
 */
export function buildIOSCapabilities(
  appPath: string,
  options: IOSCapabilityOptions,
): Record<string, any> {
  const capabilities: Record<string, any> = {
    platformName: 'iOS',
    'appium:platformVersion': options.platformVersion,
    'appium:deviceName': options.deviceName,
    'appium:automationName': options.automationName || 'XCUITest',
    'appium:app': appPath,
  };

  capabilities['appium:autoGrantPermissions'] = options.autoGrantPermissions ?? true;
  capabilities['appium:autoAcceptAlerts'] = options.autoAcceptAlerts ?? true;

  if (options.autoDismissAlerts !== undefined) {
    capabilities['appium:autoDismissAlerts'] = options.autoDismissAlerts;
    capabilities['appium:autoAcceptAlerts'] = undefined;
  }

  // Add any additional custom options
  for (const [key, value] of Object.entries(options)) {
    if (
      !['deviceName', 'platformVersion', 'automationName', 'autoAcceptAlerts', 'autoDismissAlerts'].includes(
        key,
      )
    ) {
      capabilities[`appium:${key}`] = value;
    }
  }

  return capabilities;
}

/**
 * Build Android capabilities for Appium session
 */
export function buildAndroidCapabilities(
  appPath: string,
  options: AndroidCapabilityOptions,
): Record<string, any> {
  const capabilities: Record<string, any> = {
    platformName: 'Android',
    'appium:platformVersion': options.platformVersion,
    'appium:deviceName': options.deviceName,
    'appium:automationName': options.automationName || 'UiAutomator2',
    'appium:app': appPath,
  };

  // Optional Android-specific settings
  capabilities['appium:autoGrantPermissions'] = options.autoGrantPermissions ?? true;
  capabilities['appium:autoAcceptAlerts'] = options.autoAcceptAlerts ?? true;

  if (options.autoDismissAlerts !== undefined) {
    capabilities['appium:autoDismissAlerts'] = options.autoDismissAlerts;
    capabilities['appium:autoAcceptAlerts'] = undefined;
  }

  if (options.appWaitActivity) {
    capabilities['appium:appWaitActivity'] = options.appWaitActivity;
  }

  // Add any additional custom options
  for (const [key, value] of Object.entries(options)) {
    if (
      !['deviceName', 'platformVersion', 'automationName', 'autoGrantPermissions', 'appWaitActivity'].includes(
        key,
      )
    ) {
      capabilities[`appium:${key}`] = value;
    }
  }

  return capabilities;
}
