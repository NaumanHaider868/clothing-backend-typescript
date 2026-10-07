import { Router } from 'express';
import { listDeletions } from '../controllers';
import { ORDER_MANAGERS } from '../enums';
import { authenticate, requireRoles } from '../middlewares';

const router = Router();

router.get('/', authenticate, requireRoles(...ORDER_MANAGERS), listDeletions);

export default router;
