import { Router } from 'express';
import { allOrders, changeOrderStatus, myOrders, placeOrder } from '../controllers';
import { ORDER_MANAGERS } from '../enums';
import { authenticate, requireRoles } from '../middlewares';
import { OrderSchema, orderValidator } from '../validators';

const router = Router();

router.use(authenticate);
router.post('/checkout', placeOrder);
router.get('/mine', myOrders);
router.get('/', requireRoles(...ORDER_MANAGERS), allOrders);
router.patch(
  '/:id/status',
  requireRoles(...ORDER_MANAGERS),
  orderValidator.getMiddleware(OrderSchema.OrderStatus),
  changeOrderStatus
);

export default router;
