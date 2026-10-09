import type { CategorySlug } from "./categories";

export type SourceType = "own_stock" | "dropi";

export interface ProductVariant {
  name: string;
  sku: string;
  stock: number;
}

/** Datos de abastecimiento del proveedor. Uso interno, no se muestra al público. */
export interface Sourcing {
  supplier: string;
  /** Cantidad mínima de pedido que exige el proveedor. */
  moq: number;
  moqUnit: string;
  /** Costo unitario en USD (extremo alto del rango: lo que se paga en pedidos pequeños). */
  costUsd: number;
  supplierUrl: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CategorySlug;
  subcategory: string;
  sourceType: SourceType;
  tags: string[];
  badges: string[];
  /** null mientras el producto no tenga reseñas reales verificadas. */
  rating: number | null;
  reviewCount: number;
  shortDescription: string;
  description: string;
  price: number;
  priceWholesale: number | null;
  priceUnit: "COP";
  images: string[];
  variants: ProductVariant[];
  shopifyVariantId: string;
  featured: boolean;
  inStock: boolean;
  sourcing?: Sourcing;
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  quote: string;
  type: "clienta" | "lashista";
}
