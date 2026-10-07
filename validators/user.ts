import Joi from 'joi';
import { Role } from '@prisma/client';
import ValidatorHelper from '../helpers/validator';

enum UserSchema {
  CreateStaff = 'CreateStaff',
  UpdateRole = 'UpdateRole',
  UpdateProfile = 'UpdateProfile',
}

const staffRoles = [Role.ADMIN, Role.MANAGER, Role.EDITOR];

const validationSchema = {
  [UserSchema.CreateStaff]: Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().trim().allow('', null),
    role: Joi.string()
      .valid(...staffRoles)
      .required(),
  }),
  [UserSchema.UpdateRole]: Joi.object({
    role: Joi.string()
      .valid(...Object.values(Role))
      .required(),
  }),
  [UserSchema.UpdateProfile]: Joi.object({
    firstName: Joi.string().trim().allow('', null),
    lastName: Joi.string().trim().allow('', null),
    phone: Joi.string().trim().allow('', null),
    address: Joi.string().trim().allow('', null),
  }),
};

const userValidator = new ValidatorHelper<UserSchema>(validationSchema);

export { userValidator, UserSchema };
