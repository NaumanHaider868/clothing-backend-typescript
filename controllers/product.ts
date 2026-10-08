import { Request, Response } from 'express';
import { currentAuth, getAuth } from '../middlewares';
import {
  createProductRecord,
  deleteProductRecord,
  getProductRecord,
  importProductsFromXml,
  listProducts,
  parseProductInput,
  PRODUCT_IMPORT_SAMPLE,
  updateProductRecord,
} from '../services';
import { ProductListQuery } from '../types';
import { asyncHandler, HttpError, sendSuccessResponse, toSafeNumber } from '../utils';
import { uploadStoredImage } from '../utils/r2';

const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await createProductRecord(parseProductInput(req.body));
  sendSuccessResponse(res, 201, product, 'Product created successfully');
});

const fetchProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await listProducts(req.query as ProductListQuery, currentAuth(req)?.role);
  sendSuccessResponse(res, 200, products, 'Products fetched successfully');
});

const fetchProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await getProductRecord(toSafeNumber(req.params.id), currentAuth(req)?.role);
  sendSuccessResponse(res, 200, product, 'Product fetched successfully');
});

const editProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await updateProductRecord(
    toSafeNumber(req.params.id),
    parseProductInput(req.body)
  );
  sendSuccessResponse(res, 200, product, 'Product updated successfully');
});

const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await deleteProductRecord(toSafeNumber(req.params.id), getAuth(req).id);
  sendSuccessResponse(res, 200, null, 'Product deleted successfully');
});

const uploadProductImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files;
  if (!Array.isArray(files) || files.length === 0) {
    throw new HttpError(400, 'Choose at least one image');
  }
  const urls = [];
  for (const file of files) {
    urls.push(await uploadStoredImage(file));
  }
  sendSuccessResponse(res, 200, { urls }, 'Images uploaded');
});

const importProducts = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new HttpError(400, 'Upload an XML file in the file field');
  const result = await importProductsFromXml(req.file.buffer.toString('utf8'));
  sendSuccessResponse(res, 200, result, 'Bulk import finished');
});

const importSample = asyncHandler(async (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="product-import-sample.xml"');
  res.status(200).send(PRODUCT_IMPORT_SAMPLE);
});

export {
  createProduct,
  fetchProducts,
  fetchProduct,
  editProduct,
  deleteProduct,
  uploadProductImages,
  importProducts,
  importSample,
};
