import Joi from 'joi';
import { OrderStatus } from '@prisma/client';
import ValidatorHelper from '../helpers/validator';

enum OrderSchema {
  CartItem = 'CartItem',
  CartQuantity = 'CartQuantity',
  OrderStatus = 'OrderStatus',
}

const validationSchema = {
  [OrderSchema.CartItem]: Joi.object({
    productId: Joi.number().integer().positive().required(),
    variantId: Joi.number().integer().positive().required(),
    sizeId: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).required(),
  }),
  [OrderSchema.CartQuantity]: Joi.object({
    quantity: Joi.number().integer().min(1).required(),
  }),
  [OrderSchema.OrderStatus]: Joi.object({
    status: Joi.string().valid(OrderStatus.FULFILLED, OrderStatus.CANCELLED).required(),
  }),
};

const orderValidator = new ValidatorHelper<OrderSchema>(validationSchema);

export { orderValidator, OrderSchema };
