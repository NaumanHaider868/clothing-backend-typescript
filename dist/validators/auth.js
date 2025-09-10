'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.authValidator = void 0;
const joi_1 = __importDefault(require('joi'));
const enums_1 = require('../enums');
const validator_1 = __importDefault(require('../helpers/validator'));
const validationSchema = {
  [enums_1.AuthSchema.Login]: joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
  }),
  [enums_1.AuthSchema.Register]: joi_1.default.object({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
  }),
  [enums_1.AuthSchema.Forgot_Password]: joi_1.default.object({
    email: joi_1.default.string().required().email(),
  }),
  [enums_1.AuthSchema.Reset_Password]: joi_1.default.object({
    token: joi_1.default.string().required(),
    password: joi_1.default.string().required().min(8),
  }),
  [enums_1.AuthSchema.Verify_Email]: joi_1.default.object({
    token: joi_1.default.string().required(),
  }),
  [enums_1.AuthSchema.Verify_User]: joi_1.default.object({
    token: joi_1.default.string().required(),
  }),
  [enums_1.AuthSchema.Send_Email_Again]: joi_1.default.object({
    token: joi_1.default.string().required(),
  }),
  [enums_1.AuthSchema.Verification_Code]: joi_1.default.object({
    token: joi_1.default.string().required(),
    pin: joi_1.default.string().required().length(6),
  }),
};
const authValidator = new validator_1.default(validationSchema);
exports.authValidator = authValidator;
//# sourceMappingURL=auth.js.map
