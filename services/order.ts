import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../config';
import { HttpError } from '../utils/httpError';

const money = (value: number) => Math.round(value * 100) / 100;

const unitPriceOf = (price: Prisma.Decimal | number, onSale: boolean, discountPercent: Prisma.Decimal | number | null) => {
  const base = Number(price);
  if (!onSale) return money(base);
  const discount = Number(discountPercent ?? 0);
  return money(base - (base * discount) / 100);
};

const cartInclude = {
  product: true,
  variant: { include: { images: true } },
  size: true,
} satisfies Prisma.CartItemInclude;

const orderInclude = {
  items: true,
  user: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
} satisfies Prisma.OrderInclude;

const loadSize = async (productId: number, variantId: number, sizeId: number) => {
  const size = await prisma.productSize.findUnique({
    where: { id: sizeId },
    include: { variant: { include: { product: true } } },
  });
  if (!size || size.variantId !== variantId || size.variant.productId !== productId) {
    throw new HttpError(404, 'That size is not part of this product');
  }
  if (!size.variant.product.isPublic) {
    throw new HttpError(400, 'This product is not available');
  }
  return size;
};

const syncStockFlag = async (tx: Prisma.TransactionClient, productId: number) => {
  const sizes = await tx.productSize.findMany({
    where: { variant: { productId } },
  });
  await tx.product.update({
    where: { id: productId },
    data: { inStock: sizes.some((size) => size.stockCount > 0) },
  });
};

const getCart = (userId: number) =>
  prisma.cartItem.findMany({
    where: { userId },
    include: cartInclude,
    orderBy: { createdAt: 'desc' },
  });

const addCartItem = async (
  userId: number,
  input: { productId: number; variantId: number; sizeId: number; quantity: number }
) => {
  const size = await loadSize(input.productId, input.variantId, input.sizeId);
  const existing = await prisma.cartItem.findUnique({
    where: { userId_sizeId: { userId, sizeId: input.sizeId } },
  });
  const nextQuantity = (existing?.quantity ?? 0) + input.quantity;
  if (nextQuantity > size.stockCount) {
    throw new HttpError(400, `Only ${size.stockCount} left in size ${size.size}`);
  }

  return prisma.cartItem.upsert({
    where: { userId_sizeId: { userId, sizeId: input.sizeId } },
    create: {
      userId,
      productId: input.productId,
      variantId: input.variantId,
      sizeId: input.sizeId,
      quantity: input.quantity,
    },
    update: { quantity: nextQuantity },
    include: cartInclude,
  });
};

const updateCartItem = async (userId: number, cartItemId: number, quantity: number) => {
  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId },
    include: { size: true },
  });
  if (!item) throw new HttpError(404, 'Cart item not found');
  if (quantity > item.size.stockCount) {
    throw new HttpError(400, `Only ${item.size.stockCount} left in size ${item.size.size}`);
  }
  return prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
    include: cartInclude,
  });
};

const removeCartItem = async (userId: number, cartItemId: number) => {
  const item = await prisma.cartItem.findFirst({ where: { id: cartItemId, userId } });
  if (!item) throw new HttpError(404, 'Cart item not found');
  await prisma.cartItem.delete({ where: { id: item.id } });
};

const checkout = async (userId: number) => {
  const cart = await prisma.cartItem.findMany({
    where: { userId },
    include: cartInclude,
  });
  if (!cart.length) throw new HttpError(400, 'Your cart is empty');

  return prisma.$transaction(async (tx) => {
    let total = 0;
    const items: Prisma.OrderItemCreateWithoutOrderInput[] = [];
    const productIds = new Set<number>();

    for (const item of cart) {
      const size = await tx.productSize.findUnique({ where: { id: item.sizeId } });
      if (!size || size.stockCount < item.quantity) {
        throw new HttpError(400, `${item.product.name} in size ${item.size.size} does not have enough stock`);
      }
      const unitPrice = unitPriceOf(item.product.price, item.product.onSale, item.product.discountPercent);
      const lineTotal = money(unitPrice * item.quantity);
      total = money(total + lineTotal);
      productIds.add(item.productId);
      items.push({
        productId: item.productId,
        sizeId: item.sizeId,
        productName: item.product.name,
        color: item.variant.color,
        size: item.size.size,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
      await tx.productSize.update({
        where: { id: item.sizeId },
        data: { stockCount: { decrement: item.quantity } },
      });
    }

    for (const productId of productIds) {
      await syncStockFlag(tx, productId);
    }

    const order = await tx.order.create({
      data: {
        userId,
        total,
        status: OrderStatus.PLACED,
        items: { create: items },
      },
      include: orderInclude,
    });

    await tx.cartItem.deleteMany({ where: { userId } });
    return order;
  });
};

const listMyOrders = (userId: number) =>
  prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });

const listOrders = () =>
  prisma.order.findMany({
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });

const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new HttpError(404, 'Order not found');
    if (order.status !== OrderStatus.PLACED) {
      throw new HttpError(400, 'Only a placed order can be fulfilled or cancelled');
    }

    if (status === OrderStatus.CANCELLED) {
      const productIds = new Set<number>();
      for (const item of order.items) {
        if (!item.sizeId) continue;
        const size = await tx.productSize.findUnique({
          where: { id: item.sizeId },
          include: { variant: true },
        });
        if (!size) continue;
        await tx.productSize.update({
          where: { id: size.id },
          data: { stockCount: { increment: item.quantity } },
        });
        productIds.add(size.variant.productId);
      }
      for (const productId of productIds) {
        await syncStockFlag(tx, productId);
      }
    }

    return tx.order.update({
      where: { id: order.id },
      data: { status },
      include: orderInclude,
    });
  });
};

const earningsSummary = async () => {
  const [fulfilled, placed, cancelledOrders, productCount] = await Promise.all([
    prisma.order.aggregate({
      where: { status: OrderStatus.FULFILLED },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: OrderStatus.PLACED },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
    prisma.product.count(),
  ]);

  return {
    earned: Number(fulfilled._sum.total ?? 0),
    pending: Number(placed._sum.total ?? 0),
    fulfilledOrders: fulfilled._count,
    placedOrders: placed._count,
    cancelledOrders,
    productCount,
  };
};

export {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  checkout,
  listMyOrders,
  listOrders,
  updateOrderStatus,
  earningsSummary,
};
