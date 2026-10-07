import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  editProduct,
  fetchProduct,
  fetchProducts,
  importProducts,
  importSample,
  uploadProductImages,
} from '../controllers';
import { PRODUCT_DELETERS, PRODUCT_WRITERS } from '../enums';
import { authenticate, optionalAuth, requireRoles, uploadImages, uploadXml } from '../middlewares';

const router = Router();

router.get('/import/sample', authenticate, requireRoles(...PRODUCT_WRITERS), importSample);
router.post(
  '/import',
  authenticate,
  requireRoles(...PRODUCT_WRITERS),
  uploadXml,
  importProducts
);
router.post(
  '/images',
  authenticate,
  requireRoles(...PRODUCT_WRITERS),
  uploadImages,
  uploadProductImages
);
router.post('/create', authenticate, requireRoles(...PRODUCT_WRITERS), createProduct);
router.get('/all', optionalAuth, fetchProducts);
router.get('/fetch/:id', optionalAuth, fetchProduct);
router.patch('/edit/:id', authenticate, requireRoles(...PRODUCT_WRITERS), editProduct);
router.delete('/delete/:id', authenticate, requireRoles(...PRODUCT_DELETERS), deleteProduct);

export default router;
