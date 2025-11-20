/**
 * Mobile-specific selector utilities for iOS and Android
 */

/**
 * Create an accessibility ID selector
 * Works on both iOS and Android
 * @param id - The accessibility identifier
 * @returns Selector string
 * @example accessibilityId('loginButton') // '~loginButton'
 */
export function accessibilityId(id: string): string {
  return `~${id}`;
}

/**
 * Create an Android UiAutomator selector
 * @param selector - UiAutomator selector string
 * @returns Selector string
 * @example uiAutomator('new UiSelector().text("Login")')
 */
export function uiAutomator(selector: string): string {
  return `android=${selector}`;
}

/**
 * Create an iOS class chain selector
 * @param chain - Class chain string
 * @returns Selector string
 * @example iOSClassChain('**\/XCUIElementTypeButton[`label == "Login"`]')
 */
export function iOSClassChain(chain: string): string {
  return `-ios class chain:${chain}`;
}

/**
 * Create an iOS predicate string selector
 * @param predicate - Predicate string
 * @returns Selector string
 * @example iOSPredicateString('label == "Login" AND visible == 1')
 */
export function iOSPredicateString(predicate: string): string {
  return `-ios predicate string:${predicate}`;
}

/**
 * Create an XPath selector
 * @param xpath - XPath expression
 * @returns Selector string
 * @example xpath('//android.widget.Button[@text="Login"]')
 */
export function xpath(xpath: string): string {
  return xpath.startsWith('//') ? xpath : `//${xpath}`;
}

/**
 * Common Android UiAutomator selector builders
 */
export const androidSelectors = {
  /**
   * Select by text
   * @example androidSelectors.text('Login')
   */
  text: (text: string) => uiAutomator(`new UiSelector().text("${text}")`),

  /**
   * Select by text containing
   * @example androidSelectors.textContains('Log')
   */
  textContains: (text: string) => uiAutomator(`new UiSelector().textContains("${text}")`),

  /**
   * Select by resource ID
   * @example androidSelectors.resourceId('com.example.app:id/loginButton')
   */
  resourceId: (id: string) => uiAutomator(`new UiSelector().resourceId("${id}")`),

  /**
   * Select by class name
   * @example androidSelectors.className('android.widget.Button')
   */
  className: (className: string) => uiAutomator(`new UiSelector().className("${className}")`),

  /**
   * Select by description
   * @example androidSelectors.description('Login button')
   */
  description: (description: string) => uiAutomator(`new UiSelector().description("${description}")`),

  /**
   * Select by description containing
   * @example androidSelectors.descriptionContains('Login')
   */
  descriptionContains: (description: string) =>
    uiAutomator(`new UiSelector().descriptionContains("${description}")`),

  /**
   * Combine multiple selectors
   * @example androidSelectors.text('Login').className('android.widget.Button')
   */
  combine: (...selectors: string[]) => {
    const combined = selectors
      .map((s) => s.replace('android=', '').replace('new UiSelector().', ''))
      .join('.');
    return uiAutomator(`new UiSelector().${combined}`);
  },
};

/**
 * Common iOS selector builders
 */
export const iOSSelectors = {
  /**
   * Select by label
   * @example iOSSelectors.label('Login')
   */
  label: (label: string) => iOSPredicateString(`label == "${label}"`),

  /**
   * Select by label containing
   * @example iOSSelectors.labelContains('Log')
   */
  labelContains: (label: string) => iOSPredicateString(`label CONTAINS "${label}"`),

  /**
   * Select by name
   * @example iOSSelectors.name('loginButton')
   */
  name: (name: string) => iOSPredicateString(`name == "${name}"`),

  /**
   * Select by value
   * @example iOSSelectors.value('Username')
   */
  value: (value: string) => iOSPredicateString(`value == "${value}"`),

  /**
   * Select visible elements only
   * @example iOSSelectors.visible()
   */
  visible: () => iOSPredicateString('visible == 1'),

  /**
   * Select enabled elements only
   * @example iOSSelectors.enabled()
   */
  enabled: () => iOSPredicateString('enabled == 1'),

  /**
   * Select by type (element class)
   * @example iOSSelectors.type('XCUIElementTypeButton')
   */
  type: (type: string) => iOSClassChain(`**/XCUIElementType${type}`),

  /**
   * Combine predicates with AND
   * @example iOSSelectors.and(iOSSelectors.label('Login'), iOSSelectors.visible())
   */
  and: (...predicates: string[]) => {
    const combined = predicates
      .map((p) => p.replace('-ios predicate string:', ''))
      .join(' AND ');
    return iOSPredicateString(combined);
  },

  /**
   * Combine predicates with OR
   * @example iOSSelectors.or(iOSSelectors.label('Login'), iOSSelectors.label('Sign In'))
   */
  or: (...predicates: string[]) => {
    const combined = predicates
      .map((p) => p.replace('-ios predicate string:', ''))
      .join(' OR ');
    return iOSPredicateString(combined);
  },
};

/**
 * Selector documentation for reference
 */
export const selectorDocs = {
  description: 'Mobile selector strategies for WebDriverIO with Appium',
  strategies: [
    {
      name: 'Accessibility ID',
      syntax: '~identifier',
      platforms: ['iOS', 'Android'],
      example: '~loginButton',
      notes: 'Uses accessibility identifier on iOS, content-desc on Android',
    },
    {
      name: 'CSS Selector',
      syntax: 'button.my-class, #element-id',
      platforms: ['Webview only'],
      example: '#username',
      notes: 'Only works in WEBVIEW context, not NATIVE_APP',
    },
    {
      name: 'XPath',
      syntax: '//element[@attribute="value"]',
      platforms: ['iOS', 'Android'],
      example: '//android.widget.Button[@text="Login"]',
      notes: 'Works across platforms but can be slow',
    },
    {
      name: 'Android UiAutomator',
      syntax: 'android=UiSelector',
      platforms: ['Android'],
      example: 'android=new UiSelector().text("Login")',
      notes: 'Powerful Android-specific selector strategy',
    },
    {
      name: 'iOS Class Chain',
      syntax: '-ios class chain:query',
      platforms: ['iOS'],
      example: '-ios class chain:**/XCUIElementTypeButton[`label == "Login"`]',
      notes: 'Faster than XPath for iOS',
    },
    {
      name: 'iOS Predicate String',
      syntax: '-ios predicate string:predicate',
      platforms: ['iOS'],
      example: '-ios predicate string:label == "Login" AND visible == 1',
      notes: 'Supports complex logical conditions',
    },
    {
      name: 'Text Match (Exact)',
      syntax: 'element=Exact text',
      platforms: ['iOS', 'Android'],
      example: 'button=Login',
      notes: 'Finds element by exact text match',
    },
    {
      name: 'Text Match (Partial)',
      syntax: 'element*=Partial text',
      platforms: ['iOS', 'Android'],
      example: 'a*=Learn more',
      notes: 'Finds element by partial text match',
    },
  ],
};
