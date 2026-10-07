import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../config';
import { TokenIdentifier } from '../enums';
import { AuthUser } from '../types/authUser';
import { checkJwtToken, sendErrorResponse } from '../utils';
import { HttpError } from '../utils/httpError';

const readAuth = (req: Request): AuthUser | undefined =>
  (req as Request & { auth?: AuthUser }).auth;

const setAuth = (req: Request, auth: AuthUser) => {
  (req as Request & { auth?: AuthUser }).auth = auth;
};

const getAuth = (req: Request): AuthUser => {
  const auth = readAuth(req);
  if (!auth) throw new HttpError(401, 'Authentication required');
  return auth;
};

const userFromToken = async (token: string) => {
  const { isValid, payload } = checkJwtToken<{ userId: string }>(token, ['userId'], {
    reference: TokenIdentifier.Auth,
    expiredMessage: 'Session expired. Please log in again.',
    invalidMessage: 'Invalid session. Please log in again.',
  });
  if (!isValid || !payload?.userId) return null;

  const user = await prisma.users.findUnique({ where: { userId: payload.userId } });
  if (!user || !user.isVerified) return null;

  return {
    id: user.id,
    userId: user.userId,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  } satisfies AuthUser;
};

const bearerToken = (req: Request) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
};

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = bearerToken(req);
  if (!token) return sendErrorResponse(res, 401, 'Authentication required');

  const auth = await userFromToken(token);
  if (!auth) return sendErrorResponse(res, 401, 'Invalid session. Please log in again.');

  setAuth(req, auth);
  next();
};

const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = bearerToken(req);
  if (!token) return next();

  const auth = await userFromToken(token);
  if (!auth) return sendErrorResponse(res, 401, 'Invalid session. Please log in again.');

  setAuth(req, auth);
  next();
};

const requireRoles =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const auth = readAuth(req);
    if (!auth || !roles.includes(auth.role)) {
      return sendErrorResponse(res, 403, 'You do not have permission for this action');
    }
    next();
  };

const currentAuth = (req: Request) => readAuth(req);

export { authenticate, optionalAuth, requireRoles, getAuth, currentAuth };
