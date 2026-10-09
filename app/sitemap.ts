import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products";
import { techniques } from "@/lib/categories";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://encantolashes.co";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/tienda", "/para-lashistas", "/contacto", "/carrito"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = getAllProducts().map((p) => ({
    url: `${siteUrl}/producto/${p.slug}`,
    lastModified: new Date(),
  }));

  const techniqueRoutes = techniques.map((t) => ({
    url: `${siteUrl}/tecnica/${t.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes, ...techniqueRoutes];
}
