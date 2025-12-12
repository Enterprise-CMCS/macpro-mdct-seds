import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const windowEmulator = new JSDOM("").window;
const DOMPurify = createDOMPurify(windowEmulator);

/*
 * DOMPurify prevents all XSS attacks by default. With these settings, it also
 * prevents "deception" attacks. If an attacker could put <div style="...">
 * into the site's admin banner, they could make give the banner any appearance,
 * overlaid anywhere on the page. For example, a fake "session expired" modal
 * with a malicious link. Thus, this very strict DOMPurify config.
 */
DOMPurify.setConfig({
  // Only these tags will be allowed through
  ALLOWED_TAGS: ["b", "strong", "i", "em", "p", "ul", "ol", "li", "a", "#text"],
  // On those tags, only these attributes are allowed
  ALLOWED_ATTR: ["href", "alt"],
  // If a tag is removed, so will all its child elements & text
  KEEP_CONTENT: false,
});

// sanitize string
export const sanitizeString = (string: string) => {
  if (DOMPurify.isSupported) {
    return DOMPurify.sanitize(string);
  }
};

// iterates over array items, sanitizing items recursively
export const sanitizeArray = (array: unknown[]): unknown[] =>
  array.map((entry: unknown) => sanitizeEntry(entry));

// iterates over object key-value pairs, sanitizing values recursively
export const sanitizeObject = <T extends object>(object: T): T => {
  if (object === null) {
    return null as unknown as T;
  }
  const entries = Object.entries(object);
  const sanitizedEntries = entries.map((entry: [string, unknown]) => {
    const [key, value] = entry;
    return [key, sanitizeEntry(value)];
  });
  return Object.fromEntries(sanitizedEntries);
};

// return sanitized entry, or if safe type, return entry
const sanitizeEntry = (entry: unknown) => {
  if (typeof entry === "string") {
    return sanitizeString(entry);
  } else if (Array.isArray(entry)) {
    return sanitizeArray(entry);
  } else if (entry === null) {
    return null;
  } else if (typeof entry === "object") {
    return sanitizeObject(entry);
  } else {
    return entry;
  }
};
