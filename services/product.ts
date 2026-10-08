import { CollectionType, Gender, Prisma, Role } from '@prisma/client';
import { prisma } from '../config';
import { enqueueImageUrl } from './imageQueue';
import { isStaff } from '../enums/role';
import { ProductInput, ProductListQuery } from '../types';
import { HttpError } from '../utils/httpError';

const GENDERS = Object.values(Gender);
const COLLECTION_TYPES = Object.values(CollectionType);

const productInclude = {
  variants: {
    include: {
      images: true,
      sizes: true,
    },
  },
} satisfies Prisma.ProductInclude;

const textOrNull = (value: unknown) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text ? text : null;
};

const asBoolean = (value: unknown, fallback: boolean, label: string) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const text = String(value).trim().toLowerCase();
  if (text === 'true' || text === '1') return true;
  if (text === 'false' || text === '0') return false;
  throw new HttpError(422, `${label} must be true or false`);
};

const asNumber = (value: unknown, label: string) => {
  const number = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(number)) throw new HttpError(422, `${label} must be a number`);
  return number;
};

const imageUrlOf = (image: unknown) => {
  if (typeof image === 'string') return image.trim();
  if (image && typeof image === 'object' && 'imageUrl' in image) {
    const url = (image as { imageUrl?: unknown }).imageUrl;
    if (typeof url === 'string') return url.trim();
  }
  throw new HttpError(422, 'Each image must be a URL');
};

const parseProductInput = (raw: Record<string, unknown>): ProductInput => {
  const name = textOrNull(raw.name);
  if (!name) throw new HttpError(422, 'Product name is required');

  const price = asNumber(raw.price, 'Price');
  if (price <= 0) throw new HttpError(422, 'Price must be greater than 0');

  const gender = textOrNull(raw.gender);
  if (!gender || !GENDERS.includes(gender as Gender)) {
    throw new HttpError(422, `Gender must be one of: ${GENDERS.join(', ')}`);
  }

  const collectionType = textOrNull(raw.collectionType);
  if (!collectionType || !COLLECTION_TYPES.includes(collectionType as CollectionType)) {
    throw new HttpError(422, `Collection type must be one of: ${COLLECTION_TYPES.join(', ')}`);
  }

  const discountPercent = raw.discountPercent === undefined || raw.discountPercent === ''
    ? 0
    : asNumber(raw.discountPercent, 'Discount');
  if (discountPercent < 0 || discountPercent > 80) {
    throw new HttpError(422, 'Discount must be between 0 and 80');
  }

  const variantsRaw = Array.isArray(raw.variants) ? raw.variants : [];
  if (!variantsRaw.length) throw new HttpError(422, 'Add at least one color variant');

  const variants = variantsRaw.map((variant, index) => {
    if (!variant || typeof variant !== 'object') {
      throw new HttpError(422, `Variant ${index + 1} is invalid`);
    }
    const record = variant as Record<string, unknown>;
    const color = textOrNull(record.color);
    if (!color) throw new HttpError(422, `Variant ${index + 1} needs a color`);

    const imagesRaw = Array.isArray(record.images) ? record.images : [];
    const images = imagesRaw.map(imageUrlOf).filter(Boolean);
    if (!images.length) throw new HttpError(422, `Variant ${color} needs at least one image URL`);
    images.forEach((url) => {
      if (!/^https?:\/\//i.test(url) && !url.startsWith('/uploads/')) {
        throw new HttpError(422, `Image for ${color} must be an http(s) URL`);
      }
    });

    const sizesRaw = Array.isArray(record.sizes) ? record.sizes : [];
    if (!sizesRaw.length) throw new HttpError(422, `Variant ${color} needs at least one size`);

    const seen = new Set<string>();
    const sizes = sizesRaw.map((size) => {
      if (!size || typeof size !== 'object') {
        throw new HttpError(422, `A size for ${color} is invalid`);
      }
      const sizeRecord = size as Record<string, unknown>;
      const label = textOrNull(sizeRecord.size);
      if (!label) throw new HttpError(422, `Each size for ${color} needs a label`);
      const key = label.toLowerCase();
      if (seen.has(key)) throw new HttpError(422, `Size ${label} is duplicated for ${color}`);
      seen.add(key);
      const stockCount = asNumber(sizeRecord.stockCount, `Stock for ${label}`);
      if (!Number.isInteger(stockCount) || stockCount < 0) {
        throw new HttpError(422, `Stock for ${label} must be a whole number of 0 or more`);
      }
      return { size: label, stockCount };
    });

    return { color, images, sizes };
  });

  const onSale = asBoolean(raw.onSale, false, 'On sale');

  return {
    name,
    description: textOrNull(raw.description),
    price,
    collection: textOrNull(raw.collection),
    modelDetail: textOrNull(raw.modelDetail),
    isPublic: asBoolean(raw.isPublic, true, 'Public'),
    gender: gender as Gender,
    collectionType: collectionType as CollectionType,
    onSale,
    discountPercent: onSale ? discountPercent : 0,
    inStock: asBoolean(raw.inStock, true, 'In stock'),
    type: textOrNull(raw.type),
    variants,
  };
};

const toProductData = (input: ProductInput, isUpdate = false): Prisma.ProductUpdateInput => ({
  name: input.name,
  description: input.description,
  price: input.price,
  collection: input.collection,
  modelDetail: input.modelDetail,
  isPublic: input.isPublic,
  gender: input.gender,
  collectionType: input.collectionType,
  onSale: input.onSale,
  discountPercent: input.discountPercent,
  inStock: input.inStock,
  type: input.type,
  variants: {
    ...(isUpdate ? { deleteMany: {} } : {}),
    create: input.variants.map((variant) => ({
      color: variant.color,
      images: { create: variant.images.map((imageUrl) => ({ imageUrl })) },
      sizes: { create: variant.sizes },
    })),
  },
});

const createProductRecord = (input: ProductInput) =>
  prisma.product.create({
    data: toProductData(input) as Prisma.ProductCreateInput,
    include: productInclude,
  });

const imageUrlsOf = (product: {
  variants: { images: { imageUrl: string }[] }[];
}) => product.variants.flatMap((variant) => variant.images.map((image) => image.imageUrl));

const updateProductRecord = async (id: number, input: ProductInput) => {
  const current = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  const updated = await prisma.product.update({
    where: { id },
    data: toProductData(input, true),
    include: productInclude,
  });
  if (current) imageUrlsOf(current).forEach(enqueueImageUrl);
  return updated;
};

const listProducts = async (query: ProductListQuery, role?: Role) => {
  const gender = textOrNull(query.gender);
  const collectionType = textOrNull(query.collectionType);
  if (gender && !GENDERS.includes(gender as Gender)) {
    throw new HttpError(422, `Gender must be one of: ${GENDERS.join(', ')}`);
  }
  if (collectionType && !COLLECTION_TYPES.includes(collectionType as CollectionType)) {
    throw new HttpError(422, `Collection type must be one of: ${COLLECTION_TYPES.join(', ')}`);
  }

  const onSale = textOrNull(query.onSale);
  const where: Prisma.ProductWhereInput = {
    ...(isStaff(role) ? {} : { isPublic: true }),
    ...(textOrNull(query.search) ? { name: { contains: textOrNull(query.search)! } } : {}),
    ...(gender ? { gender: gender as Gender } : {}),
    ...(collectionType ? { collectionType: collectionType as CollectionType } : {}),
    ...(textOrNull(query.type) ? { type: textOrNull(query.type)! } : {}),
    ...(onSale === 'true' ? { onSale: true } : {}),
    ...(onSale === 'false' ? { onSale: false } : {}),
    ...(textOrNull(query.color) || textOrNull(query.size)
      ? {
          variants: {
            some: {
              ...(textOrNull(query.color) ? { color: textOrNull(query.color)! } : {}),
              ...(textOrNull(query.size)
                ? { sizes: { some: { size: textOrNull(query.size)! } } }
                : {}),
            },
          },
        }
      : {}),
  };

  return prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  });
};

const getProductRecord = async (id: number, role?: Role) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  if (!product || (!product.isPublic && !isStaff(role))) {
    throw new HttpError(404, 'Product not found');
  }
  return product;
};

const deleteProductRecord = async (id: number, actorId: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  if (!product) throw new HttpError(404, 'Product not found');

  await prisma.$transaction([
    prisma.deletionRecord.create({
      data: {
        entityType: 'PRODUCT',
        entityId: product.id,
        summary: product.name,
        snapshot: {
          name: product.name,
          price: product.price.toString(),
          gender: product.gender,
          collectionType: product.collectionType,
          collection: product.collection,
          type: product.type,
        },
        deletedById: actorId,
      },
    }),
    prisma.product.delete({ where: { id } }),
  ]);
  imageUrlsOf(product).forEach(enqueueImageUrl);
};

export {
  productInclude,
  parseProductInput,
  createProductRecord,
  updateProductRecord,
  listProducts,
  getProductRecord,
  deleteProductRecord,
};
