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
    images: {
      create: data.images.map((image) => ({
        imageUrl: image,
      })),
    },
    variants: {
      create: data.variants.map((variant) => ({
        color: variant.color,
        size: variant.size,
        stockCount: variant.stockCount,
      })),
    },
  };
};

export { transformProduct };
