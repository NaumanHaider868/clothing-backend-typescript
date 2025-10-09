import { createProduct, Gender, CollectionType } from '../types';

const transformProduct = (data: createProduct, isUpdate?: boolean) => {
  return {
    name: data.name,
    description: data.description,
    price: data.price,
    collection: data.collection,
    modelDetail: data.modelDetail,
    isPublic: data.isPublic,
    gender: data.gender as Gender,
    collectionType: data.collectionType as CollectionType,
    onSale: data.onSale,
    discountPercentage: data.discountPercentage,
    inStock: data.inStock,
    type: data.type,
    variants: {
      ...(isUpdate ? { deleteMany: {} } : {}),
      create: data.variants.map((v) => ({
        color: v.color,
        size: v.size,
        stockCount: v.stockCount,
      })),
    },
    images: {
      ...(isUpdate ? { deleteMany: {} } : {}),
      create: data.images.map((img) => ({ imageUrl: img.url, color: img.color })),
    },
  };
};

export { transformProduct };
