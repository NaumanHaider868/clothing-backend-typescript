import { Express, Request, Response } from 'express';
import { appErrorResponse, sendErrorResponse } from '../utils';
import auth from './auth';
import product from './product';
import user from './user';
import order from './order';
import cart from './cart';
import dashboard from './dashboard';
import audit from './audit';

const routes = Object.freeze({
  auth: [auth],
  product: [product],
  user: [user],
  order: [order],
  cart: [cart],
  dashboard: [dashboard],
  audit: [audit],
});

/**
 * Sets up the application routes.
 * @param {Express} app - The Express application instance.
 */
const appRouter = (app: Express) => {
  // Middleware to parse JSON and URL-encoded data
  Object.entries(routes).forEach(([key, routes]) =>
    routes.forEach((router) => {
      app.use(`/${key}`, router);
    })
  );
  defaultRoutes(app);
};

const defaultRoutes = (app: Express) => {
  // Default route
  app.get('/', (_req: Request, res: Response) => {
    res.send('Hello from server');
  });
  app.use((_req: Request, res: Response) => {
    sendErrorResponse(res, 404, 'Not Found', 'The requested resource was not found');
  });
  app.use((err: Error, _req: Request, res: Response) => {
    appErrorResponse(res, err);
  });
};
export default appRouter;
