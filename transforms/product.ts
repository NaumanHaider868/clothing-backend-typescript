import { createProduct, Gender, CollectionType } from '../types';

const transformProduct = (data: createProduct) => {
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
    variants: {
      deleteMany: {}, // remove old
      create: data.variants.map((v) => ({
        color: v.color,
        size: v.size,
        stockCount: v.stockCount,
      })),
    },
    images: {
      deleteMany: {},
      create: data.images.map((img) => ({ imageUrl: img })),
    },
  };
};

export { transformProduct };
