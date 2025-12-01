/**
 * XML page source parsing utilities
 * Converts Appium page source XML to traversable JSON tree
 *
 * Based on: https://github.com/appium/appium-mcp/blob/main/src/locators/source-parsing.ts
 */

import { DOMParser } from '@xmldom/xmldom';

export interface ElementAttributes {
  // Android attributes
  'resource-id'?: string;
  'content-desc'?: string;
  text?: string;
  class?: string;
  package?: string;
  clickable?: string;
  'long-clickable'?: string;
  focusable?: string;
  checkable?: string;
  scrollable?: string;
  enabled?: string;
  displayed?: string;
  bounds?: string; // Format: "[x1,y1][x2,y2]"

  // iOS attributes
  type?: string;
  name?: string;
  label?: string;
  value?: string;
  accessible?: string;
  visible?: string;
  x?: string;
  y?: string;
  width?: string;
  height?: string;

  // Generic
  [key: string]: string | undefined;
}

export interface JSONElement {
  children: JSONElement[];
  tagName: string;
  attributes: ElementAttributes;
  path: string; // Dot-separated index path for tree traversal
}

/**
 * Get child nodes that are elements (not text nodes, comments, etc.)
 */
function childNodesOf(node: Node): Node[] {
  const children: Node[] = [];
  if (node.childNodes) {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes.item(i);
      if (child?.nodeType === 1) {
        // ELEMENT_NODE
        children.push(child);
      }
    }
  }
  return children;
}

/**
 * Recursively translate DOM node to JSONElement
 */
function translateRecursively(
  domNode: Node,
  parentPath: string = '',
  index: number | null = null,
): JSONElement {
  const attributes: ElementAttributes = {};

  // Extract attributes if this is an element node
  const element = domNode as Element;
  if (element.attributes) {
    for (let attrIdx = 0; attrIdx < element.attributes.length; attrIdx++) {
      const attr = element.attributes.item(attrIdx);
      if (attr) {
        // Replace newlines in attribute values
        attributes[attr.name] = attr.value.replace(/(\n)/gm, '\\n');
      }
    }
  }

  // Build path: dot-separated index chain (e.g., "0.2.1")
  const path = index === null ? '' : `${parentPath ? parentPath + '.' : ''}${index}`;

  return {
    children: childNodesOf(domNode).map((childNode, childIndex) =>
      translateRecursively(childNode, path, childIndex),
    ),
    tagName: domNode.nodeName,
    attributes,
    path,
  };
}

/**
 * Convert XML page source to JSON tree structure
 * @param sourceXML - The XML string from getPageSource()
 * @returns JSONElement tree or null if parsing fails
 */
export function xmlToJSON(sourceXML: string): JSONElement | null {
  try {
    const parser = new DOMParser();
    const sourceDoc = parser.parseFromString(sourceXML, 'text/xml');

    // Handle parsing errors
    const parseErrors = sourceDoc.getElementsByTagName('parsererror');
    if (parseErrors.length > 0) {
      console.error('[xmlToJSON] XML parsing error:', parseErrors[0].textContent);
      return null;
    }

    // Get the first element child
    const children = childNodesOf(sourceDoc);
    const firstChild =
      children[0] ||
      (sourceDoc.documentElement ? childNodesOf(sourceDoc.documentElement)[0] : null);

    return firstChild
      ? translateRecursively(firstChild)
      : { children: [], tagName: '', attributes: {}, path: '' };
  } catch (e) {
    console.error('[xmlToJSON] Failed to parse XML:', e);
    return null;
  }
}

/**
 * Parse Android bounds string "[x1,y1][x2,y2]" to coordinates
 * @param bounds - Bounds string in format "[x1,y1][x2,y2]"
 * @returns Object with x, y, width, height
 */
export function parseAndroidBounds(bounds: string): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const match = bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  if (!match) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const x1 = parseInt(match[1], 10);
  const y1 = parseInt(match[2], 10);
  const x2 = parseInt(match[3], 10);
  const y2 = parseInt(match[4], 10);

  return {
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1,
  };
}

/**
 * Parse iOS element bounds from individual x, y, width, height attributes
 * @param attributes - Element attributes
 * @returns Object with x, y, width, height
 */
export function parseIOSBounds(attributes: ElementAttributes): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  return {
    x: parseInt(attributes.x || '0', 10),
    y: parseInt(attributes.y || '0', 10),
    width: parseInt(attributes.width || '0', 10),
    height: parseInt(attributes.height || '0', 10),
  };
}

/**
 * Flatten JSON element tree to array (depth-first)
 * @param root - Root JSONElement
 * @returns Array of all elements in tree
 */
export function flattenElementTree(root: JSONElement): JSONElement[] {
  const result: JSONElement[] = [];

  function traverse(element: JSONElement) {
    result.push(element);
    for (const child of element.children) {
      traverse(child);
    }
  }

  traverse(root);
  return result;
}

/**
 * Count occurrences of an attribute value in the source XML
 * Used to determine if a selector would be unique
 */
export function countAttributeOccurrences(
  sourceXML: string,
  attribute: string,
  value: string,
): number {
  // Escape special regex characters in value
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match attribute="value" pattern
  const pattern = new RegExp(`${attribute}=["']${escapedValue}["']`, 'g');
  const matches = sourceXML.match(pattern);
  return matches ? matches.length : 0;
}

/**
 * Check if an attribute value is unique in the source
 */
export function isAttributeUnique(
  sourceXML: string,
  attribute: string,
  value: string,
): boolean {
  return countAttributeOccurrences(sourceXML, attribute, value) === 1;
}
