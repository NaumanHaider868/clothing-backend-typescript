import { Request, Response } from 'express';
import { prisma } from '../config';
import { transformProduct } from '../transforms';
import type { createProduct as CreateProductBody } from '../types';
import {
  appErrorResponse,
  RequestWithBody,
  RequestWithParams,
  sendSuccessResponse,
  toSafeNumber,
} from '../utils';

const createProduct = async (req: RequestWithBody<CreateProductBody>, res: Response) => {
  try {
    const data = transformProduct(req.body);

    const product = await prisma.product.create({
      data,
      include: {
        images: true,
        variants: true,
      },
    });
    return sendSuccessResponse(res, 200, product, 'Product created successfully');
  } catch (error) {
    return appErrorResponse(res, error);
  }
};

const fetchProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        variants: true,
      },
    });
    return sendSuccessResponse(res, 200, products, 'Products fetched successfully');
  } catch (error) {
    return appErrorResponse(res, error);
  }
};

const editProduct = async (req: RequestWithParams<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const data = transformProduct(req.body);
    const product = await prisma.product.update({
      where: { id: toSafeNumber(id) },
      data,
      include: {
        images: true,
        variants: true,
      },
    });
    return sendSuccessResponse(res, 200, product, 'Product updated successfully');
  } catch (error) {
    return appErrorResponse(res, error);
  }
};

const fetchProduct = async (req: RequestWithParams<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: toSafeNumber(id) },
      include: { images: true, variants: true },
    });
    return sendSuccessResponse(res, 200, product, 'Product fetched successfully');
  } catch (error) {
    return appErrorResponse(res, error);
  }
};

const deleteProduct = async (req: RequestWithParams<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: toSafeNumber(id) },
    });
    return sendSuccessResponse(res, 200, null, 'Product deleted successfully');
  } catch (error) {
    return appErrorResponse(res, error);
  }
};

export { createProduct, fetchProducts, fetchProduct, deleteProduct, editProduct };
