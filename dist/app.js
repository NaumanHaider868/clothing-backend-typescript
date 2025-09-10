'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var _a;
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const body_parser_1 = __importDefault(require('body-parser'));
const morgan_1 = __importDefault(require('morgan'));
const dotenv_1 = require('dotenv');
const routes_1 = __importDefault(require('./routes'));
const utils_1 = require('./utils');
const path_1 = __importDefault(require('path'));
const process_1 = __importDefault(require('process'));
// ENV config
(0, dotenv_1.config)();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.set('view engine', 'pug');
app.set('views', path_1.default.join(__dirname, 'views'));
app.get('/favicon.ico', (_, res) => {
  res.sendFile(path_1.default.join(__dirname, 'public', 'favicon.ico'));
});
(0, routes_1.default)(app);
// Server init
const port = (_a = process_1.default.env.PORT) !== null && _a !== void 0 ? _a : 8000;
const server = app.listen(port, () => {
  console.log('🚀 App running on port', port);
});
const shutdown = () => {
  console.log('🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process_1.default.exit(0);
  });
};
process_1.default.on('SIGINT', shutdown);
process_1.default.on('SIGTERM', shutdown);
process_1.default.on('unhandledRejection', (err) => {
  console.error('unhandledRejection', (0, utils_1.formatError)(err));
  server.close(() => {
    process_1.default.exit(1);
  });
});
process_1.default.on('uncaughtException', (err) => {
  console.error('uncaughtException', (0, utils_1.formatError)(err));
  server.close(() => {
    process_1.default.exit(1);
  });
});
exports.default = app;
//# sourceMappingURL=app.js.map
