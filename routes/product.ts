import { Router } from 'express';
import { createProduct } from '../controllers';

const router = Router();
router.post('/create', createProduct);
// router.get('/all', allProducts);

export default router;
