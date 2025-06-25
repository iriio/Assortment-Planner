/**
 * Generates a unique ID with an optional prefix
 * @param prefix Optional prefix for the ID (e.g., 'style', 'category', 'program')
 * @returns A unique ID string
 */
export const generateId = (prefix?: string): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  const id = `${timestamp}-${randomStr}`;
  return prefix ? `${prefix}-${id}` : id;
};
