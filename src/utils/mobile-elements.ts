/**
 * Mobile element detection utilities for iOS and Android
 */

/**
 * Check if a string value is valid (not null, undefined, empty, or the string "null")
 */
const isValid = (value: string | null | undefined): boolean => {
  return value != null && value !== 'null' && value.trim() !== '';
};

interface MobileElementInfo {
  tagName?: string;
  text?: string;
  resourceId?: string;
  contentDesc?: string;
  accessibilityId?: string;
  label?: string;
  value?: string;
  className?: string;
  selector: string;
  alternativeSelectors?: string[]; // Additional selector options
  isInViewport: boolean;
  isEnabled: boolean;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Build all available selectors for a mobile element
 * Returns array of selectors in priority order
 */
export function buildAllMobileSelectors(
  platform: 'ios' | 'android',
  attributes: {
    resourceId?: string;
    contentDesc?: string;
    accessibilityId?: string;
    text?: string;
    className?: string;
  },
): string[] {
  const {resourceId, contentDesc, accessibilityId, text, className} = attributes;
  const selectors: string[] = [];

  if (platform === 'android') {
    // Priority 1: Resource ID (most stable and unique)
    if (isValid(resourceId)) {
      selectors.push(`android=new UiSelector().resourceId("${resourceId}")`);
    }

    // Priority 2: Content Description (accessibility identifier)
    if (isValid(contentDesc)) {
      selectors.push(`~${contentDesc}`);
    }

    // Priority 3: Text (visible and usually stable)
    if (isValid(text) && text!.length < 100) {
      // Limit text length to avoid overly long selectors
      selectors.push(`android=new UiSelector().text("${text}")`);
    }

    // Priority 4: Class name (least specific, only if nothing else available)
    if (isValid(className)) {
      selectors.push(`android=new UiSelector().className("${className}")`);
    }
  } else {
    // iOS platform
    // Priority 1: Accessibility ID (most stable)
    if (isValid(accessibilityId)) {
      selectors.push(`~${accessibilityId}`);
    }

    // Priority 2: Text/Label (visible and usually stable)
    if (isValid(text) && text!.length < 100) {
      selectors.push(`-ios predicate string:label == "${text}"`);
    }

    // Priority 3: Class chain (least specific)
    if (isValid(className)) {
      selectors.push(`-ios class chain:**/${className}`);
    }
  }

  return selectors;
}

/**
 * Get all visible elements from a mobile app
 */
export async function getMobileVisibleElements(
  browser: WebdriverIO.Browser,
  platform: 'ios' | 'android',
): Promise<MobileElementInfo[]> {
  try {
    // Use XPath to find interactive elements only (more performant)
    const xpathQuery =
      platform === 'android'
        ? '//*[@clickable="true" or @long-clickable="true" or @focusable="true" or @checkable="true" or @scrollable="true"]'
        : '//*[@accessible="true" or @enabled="true"]';

    const allElements = await browser.$$(xpathQuery);

    // Get viewport size
    let viewportWidth = 0;
    let viewportHeight = 0;
    try {
      const windowSize = await browser.getWindowSize();
      viewportWidth = windowSize.width;
      viewportHeight = windowSize.height;
    } catch (e) {
      // If getWindowSize fails, set large defaults
      viewportWidth = 9999;
      viewportHeight = 9999;
    }

    const visibleElements: MobileElementInfo[] = [];

    // Process elements in parallel batches to improve performance
    const batchSize = 10;
    for (let i = 0; i < await allElements.length; i += batchSize) {
      const batch = [...allElements].slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(async (element: WebdriverIO.Element) => {
          try {
            // Check if displayed
            const isDisplayed = await element.isDisplayed();
            if (!isDisplayed) return null;

            // Get basic attributes
            const [
              tagName,
              text,
              resourceId,
              contentDesc,
              accessibilityId,
              label,
              value,
              className,
              isEnabled,
              location,
              size,
            ] = await Promise.all([
              element.getTagName().catch(() => undefined),
              element.getText().catch(() => undefined),
              element.getAttribute('resource-id').catch(() => undefined),
              element.getAttribute('content-desc').catch(() => undefined),
              element.getAttribute('name').catch(() => undefined),
              element.getAttribute('label').catch(() => undefined),
              element.getAttribute('value').catch(() => undefined),
              element.getAttribute('class').catch(() => undefined),
              element.isEnabled().catch(() => true),
              element.getLocation().catch(() => ({ x: 0, y: 0 })),
              element.getSize().catch(() => ({ width: 0, height: 0 })),
            ]);

            // Check if in viewport
            const isInViewport =
              location.x >= 0 &&
              location.y >= 0 &&
              location.x + size.width <= viewportWidth &&
              location.y + size.height <= viewportHeight;

            // Build all available selectors
            const allSelectors = buildAllMobileSelectors(platform, {
              resourceId,
              contentDesc,
              accessibilityId,
              text,
              className,
            });

            // Skip elements with no useful selector
            if (allSelectors.length === 0) {
              return null;
            }

            const selector = allSelectors[0]; // Best selector
            const alternativeSelectors = allSelectors.slice(1, 2); // Other options

            // Build element info with only relevant (non-null/undefined) data using inline object
            return {
              selector,
              isInViewport,
              isEnabled,
              bounds: {
                x: location.x,
                y: location.y,
                width: size.width,
                height: size.height,
              },
              alternativeSelectors: alternativeSelectors.length > 0 ? alternativeSelectors : undefined,
              // Only include properties with actual values (not undefined, null, or "null" string)
              tagName: isValid(tagName) ? tagName : undefined,
              text: isValid(text) ? text : undefined,
              resourceId: isValid(resourceId) && platform === 'android' ? resourceId : undefined,
              contentDesc: isValid(contentDesc) && platform === 'android' ? contentDesc : undefined,
              accessibilityId: isValid(accessibilityId) && platform === 'ios' ? accessibilityId : undefined,
              label: isValid(label) && platform === 'ios' ? label : undefined,
              value: isValid(value) ? value : undefined,
              className: isValid(className) ? className : undefined,
            };
          } catch {
            // Element became stale or inaccessible
            return null;
          }
        }),
      );

      for (const batchResult of batchResults) {
        if (batchResult.status === 'fulfilled' && batchResult.value) {
          visibleElements.push(batchResult.value);
        }
      }
    }

    return visibleElements;
  } catch (e) {
    throw new Error(`Failed to get mobile visible elements: ${e}`);
  }
}
