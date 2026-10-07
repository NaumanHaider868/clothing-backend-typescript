import { CollectionType, Gender } from '@prisma/client';

interface ProductSizeInput {
  size: string;
  stockCount: number;
}

interface ProductVariantInput {
  color: string;
  images: string[];
  sizes: ProductSizeInput[];
}

interface ProductInput {
  name: string;
  description: string | null;
  price: number;
  collection: string | null;
  modelDetail: string | null;
  isPublic: boolean;
  gender: Gender;
  collectionType: CollectionType;
  onSale: boolean;
  discountPercent: number;
  inStock: boolean;
  type: string | null;
  variants: ProductVariantInput[];
}

interface ProductListQuery {
  search?: string;
  gender?: string;
  collectionType?: string;
  type?: string;
  size?: string;
  color?: string;
  onSale?: string;
}

export type { ProductInput, ProductVariantInput, ProductSizeInput, ProductListQuery };
