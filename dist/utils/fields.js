'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.deepSanitize = exports.sanitizeFields = void 0;
exports.isEmpty = isEmpty;
function isEmpty(fields) {
  for (const field of fields) {
    if (field === undefined || field === null || field === '') {
      return true;
    }
  }
  return false;
}
const sanitizeFields = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, val]) => val !== undefined && val !== '' && val !== null)
  );
exports.sanitizeFields = sanitizeFields;
const deepSanitize = (obj) => {
  const isEmpty = (val) => {
    if (val === undefined || val === null || val === '') return true;
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === 'object') return Object.keys(val).length === 0;
    return false;
  };
  if (Array.isArray(obj)) {
    const sanitizedArray = obj
      .map((item) => (0, exports.deepSanitize)(item))
      .filter((item) => !isEmpty(item));
    return sanitizedArray;
  }
  if (obj !== null && typeof obj === 'object') {
    const entries = Object.entries(obj)
      .map(([key, val]) => [key, (0, exports.deepSanitize)(val)])
      .filter(([, val]) => !isEmpty(val));
    return Object.fromEntries(entries);
  }
  return obj;
};
exports.deepSanitize = deepSanitize;
//# sourceMappingURL=fields.js.map
