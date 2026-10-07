import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { getAuth } from '../middlewares';
import { createStaff, listUsers, updateProfile, updateUserRole } from '../services';
import { asyncHandler, sendSuccessResponse, toSafeNumber } from '../utils';

const listTeam = asyncHandler(async (_req: Request, res: Response) => {
  const users = await listUsers();
  sendSuccessResponse(res, 200, users, 'Users loaded');
});

const addStaff = asyncHandler(async (req: Request, res: Response) => {
  const user = await createStaff({
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    role: req.body.role as Role,
  });
  sendSuccessResponse(res, 201, user, 'Team member added');
});

const changeRole = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateUserRole(getAuth(req).id, toSafeNumber(req.params.id), req.body.role);
  sendSuccessResponse(res, 200, user, 'Role updated');
});

const saveProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateProfile(getAuth(req).id, req.body);
  sendSuccessResponse(res, 200, user, 'Profile updated');
});

export { listTeam, addStaff, changeRole, saveProfile };
