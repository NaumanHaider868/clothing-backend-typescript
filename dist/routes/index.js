'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const utils_1 = require('../utils');
const auth_1 = __importDefault(require('./auth'));
const routes = Object.freeze({
  auth: [auth_1.default],
});
/**
 * Sets up the application routes.
 * @param {Express} app - The Express application instance.
 */
const appRouter = (app) => {
  // Middleware to parse JSON and URL-encoded data
  Object.entries(routes).forEach(([key, routes]) =>
    routes.forEach((router) => {
      app.use(`/${key}`, router);
    })
  );
  defaultRoutes(app);
};
const defaultRoutes = (app) => {
  // Default route
  app.get('/', (_req, res) => {
    res.send('Hello from server');
  });
  app.use((_req, res) => {
    (0, utils_1.sendErrorResponse)(res, 404, 'Not Found', 'The requested resource was not found');
  });
  app.use((err, _req, res) => {
    (0, utils_1.appErrorResponse)(res, err);
  });
};
exports.default = appRouter;
//# sourceMappingURL=index.js.map
