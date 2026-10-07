import { Router } from 'express';
import { addToCart, changeCartItem, deleteCartItem, readCart } from '../controllers';
import { authenticate } from '../middlewares';
import { OrderSchema, orderValidator } from '../validators';

const router = Router();

router.use(authenticate);
router.get('/', readCart);
router.post('/', orderValidator.getMiddleware(OrderSchema.CartItem), addToCart);
router.patch('/:id', orderValidator.getMiddleware(OrderSchema.CartQuantity), changeCartItem);
router.delete('/:id', deleteCartItem);

export default router;
