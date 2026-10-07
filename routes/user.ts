import { Router } from 'express';
import { Role } from '@prisma/client';
import { addStaff, changeRole, listTeam } from '../controllers';
import { authenticate, requireRoles } from '../middlewares';
import { UserSchema, userValidator } from '../validators';

const router = Router();

router.use(authenticate, requireRoles(Role.ADMIN));
router.get('/', listTeam);
router.post('/', userValidator.getMiddleware(UserSchema.CreateStaff), addStaff);
router.patch('/:id/role', userValidator.getMiddleware(UserSchema.UpdateRole), changeRole);

export default router;
