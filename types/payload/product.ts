import { CollectionType, Gender } from '../../enums';

interface ProductVariantInput {
  color: string;
  size: string;
  stockCount: number;
}

interface createProduct {
  name: string;
  description: string;
  price: number;
  collection?: string;
  modelDetail?: string;
  isPublic: boolean;
  gender: Gender;
  collectionType: CollectionType;
  onSale: boolean;
  discountPercentage?: number;
  inStock: boolean;
  stock: number;
  category: string;
  type: string;
  images: { url: string; color: string }[];
  variants: ProductVariantInput[];
}

interface FetchProducts {
  search?: string;
  size?: string;
  type?: string;
}

export { createProduct, Gender, CollectionType, ProductVariantInput, FetchProducts };
