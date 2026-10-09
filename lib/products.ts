import productsData from "@/data/products.json";
import testimonialsData from "@/data/testimonials.json";
import type { Product, Testimonial } from "./types";
import type { CategorySlug } from "./categories";

/**
 * La forma de estas funciones imita la Shopify Storefront API a propósito:
 * migrar a Shopify real (ver lib/shopify.ts) es cambiar el data source
 * de estas funciones, no los componentes que las consumen.
 */
const allProducts = productsData.products as Product[];
const allTestimonials = testimonialsData.testimonials as Testimonial[];

export function getAllProducts(): Product[] {
  return allProducts;
}

export function getFeaturedProducts(limit = 12): Product[] {
  return allProducts.filter((p) => p.featured).slice(0, limit);
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return allProducts.filter((p) => p.category === category);
}

export function getKitProducts(): Product[] {
  return allProducts.filter((p) => p.tags.includes("kit"));
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return allProducts
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, limit);
}

export function countByCategory(category: CategorySlug): number {
  return allProducts.filter((p) => p.category === category).length;
}

export function getAllTestimonials(): Testimonial[] {
  return allTestimonials;
}
