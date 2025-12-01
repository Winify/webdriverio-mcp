/**
 * Locators module
 * Provides XML parsing and locator generation for mobile elements
 */

export { xmlToJSON, parseAndroidBounds, parseIOSBounds, flattenElementTree } from './source-parsing';
export type { JSONElement, ElementAttributes } from './source-parsing';

export {
  shouldIncludeElement,
  isInteractableElement,
  isLayoutContainer,
  hasMeaningfulContent,
  getDefaultFilters,
  ANDROID_INTERACTABLE_TAGS,
  ANDROID_LAYOUT_CONTAINERS,
  IOS_INTERACTABLE_TAGS,
  IOS_LAYOUT_CONTAINERS,
} from './element-filter';
export type { FilterOptions } from './element-filter';

export {
  getSuggestedLocators,
  getBestLocator,
  locatorsToObject,
} from './locator-generation';
export type { LocatorStrategy } from './locator-generation';

export { generateAllElementLocators } from './generate-all-locators';
export type { ElementWithLocators, GenerateLocatorsOptions } from './generate-all-locators';
