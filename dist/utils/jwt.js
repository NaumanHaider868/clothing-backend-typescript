'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getVerifyCode = exports.checkJwtToken = exports.getJWTToken = void 0;
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const getJWTToken = (payload, { reference, ...options }) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jsonwebtoken_1.default.sign({ ...payload, reference }, process.env.JWT_SECRET, options);
};
exports.getJWTToken = getJWTToken;
const checkJwtToken = (
  token,
  payloadCheck = [],
  { expiredMessage = 'Expired token', invalidMessage = 'Invalid or expired token', reference } = {}
) => {
  var _a;
  try {
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const checks = ['reference', ...payloadCheck];
    for (const key of checks) {
      if (!(key in decoded)) {
        return {
          isValid: false,
          payload: decoded,
          error: invalidMessage,
        };
      }
    }
    if (reference && decoded.reference !== reference) {
      return {
        isValid: false,
        payload: decoded,
        error: 'This token is not valid for the expected purpose',
      };
    }
    return {
      isValid: true,
      payload: decoded,
      error: null,
    };
  } catch (err) {
    return {
      isValid: false,
      payload: null,
      error:
        (_a =
          expiredMessage !== null && expiredMessage !== void 0
            ? expiredMessage
            : err === null || err === void 0
              ? void 0
              : err.message) !== null && _a !== void 0
          ? _a
          : invalidMessage,
    };
  }
};
exports.checkJwtToken = checkJwtToken;
const getVerifyCode = () => {
  const token = Math.floor(100000 + Math.random() + 900000).toString();
  return token;
};
exports.getVerifyCode = getVerifyCode;
//# sourceMappingURL=jwt.js.map
