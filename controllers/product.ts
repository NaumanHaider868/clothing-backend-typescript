import { Response } from 'express';
import { prisma } from '../config';
import { transformProduct } from '../transforms';
import type { createProduct as CreateProductBody } from '../types';
import { appErrorResponse, RequestWithBody, sendSuccessResponse } from '../utils';

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

const allProducts = async (_req: Request, res: Response) => {
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

export { createProduct, allProducts };
