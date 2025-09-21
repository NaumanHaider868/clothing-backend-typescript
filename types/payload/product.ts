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
  images: string[];
  variants: ProductVariantInput[];
}

export { createProduct, Gender, CollectionType, ProductVariantInput };
