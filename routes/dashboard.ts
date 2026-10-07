import { Router } from 'express';
import { Role } from '@prisma/client';
import { earnings } from '../controllers';
import { authenticate, requireRoles } from '../middlewares';

const router = Router();

router.get('/earnings', authenticate, requireRoles(Role.ADMIN), earnings);

export default router;
