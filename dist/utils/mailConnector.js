'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.mailConnector = void 0;
const nodemailer_1 = __importDefault(require('nodemailer'));
exports.mailConnector = nodemailer_1.default.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_NAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});
//# sourceMappingURL=mailConnector.js.map
