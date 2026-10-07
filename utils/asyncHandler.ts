import { NextFunction, Request, Response } from 'express';
import { HttpError } from './httpError';
import { appErrorResponse, sendErrorResponse } from './response';

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error: unknown) => {
      if (error instanceof HttpError) {
        sendErrorResponse(res, error.status, error.message);
        return;
      }
      appErrorResponse(res, error as Error);
    });
  };

export { asyncHandler };
