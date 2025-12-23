export interface Event {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  products: Product[];
}

export interface Product {
  id: string;
  eventId: string;
  name: string;
  price: number;
  stock: number;
  quantity?: number;
  link: string;
  source: "shopee" | "tokopedia" | "manual";
  variantId?: string;
  variantName?: string;
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

export interface ProductFetchResult {
  name: string;
  price: number;
  stock: number;
  variants?: ProductVariant[];
  selectedVariantId?: string;
  success: boolean;
  error?: string;
}

