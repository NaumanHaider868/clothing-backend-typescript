import { Request, Response } from 'express';
import { OrderStatus } from '@prisma/client';
import { getAuth } from '../middlewares';
import {
  addCartItem,
  checkout,
  earningsSummary,
  getCart,
  listMyOrders,
  listOrders,
  removeCartItem,
  updateCartItem,
  updateOrderStatus,
} from '../services';
import { asyncHandler, sendSuccessResponse, toSafeNumber } from '../utils';

const readCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getCart(getAuth(req).id);
  sendSuccessResponse(res, 200, cart, 'Cart loaded');
});

const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const item = await addCartItem(getAuth(req).id, req.body);
  sendSuccessResponse(res, 200, item, 'Added to cart');
});

const changeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await updateCartItem(getAuth(req).id, toSafeNumber(req.params.id), req.body.quantity);
  sendSuccessResponse(res, 200, item, 'Cart updated');
});

const deleteCartItem = asyncHandler(async (req: Request, res: Response) => {
  await removeCartItem(getAuth(req).id, toSafeNumber(req.params.id));
  sendSuccessResponse(res, 200, null, 'Removed from cart');
});

const placeOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await checkout(getAuth(req).id);
  sendSuccessResponse(res, 201, order, 'Order placed. Payment will be added later.');
});

const myOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await listMyOrders(getAuth(req).id);
  sendSuccessResponse(res, 200, orders, 'Orders loaded');
});

const allOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await listOrders();
  sendSuccessResponse(res, 200, orders, 'Orders loaded');
});

const changeOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await updateOrderStatus(toSafeNumber(req.params.id), req.body.status as OrderStatus);
  sendSuccessResponse(res, 200, order, 'Order updated');
});

const earnings = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await earningsSummary();
  sendSuccessResponse(res, 200, summary, 'Earnings loaded');
});

export {
  readCart,
  addToCart,
  changeCartItem,
  deleteCartItem,
  placeOrder,
  myOrders,
  allOrders,
  changeOrderStatus,
  earnings,
};
