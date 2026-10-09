import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { getAllProducts } from "@/lib/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Pestañas, maquillaje, skincare, cabello, cuerpo, perfumería, uñas y accesorios. El catálogo completo de Encanto Lashes.",
};

interface TiendaPageProps {
  searchParams: Promise<{ categoria?: string; tag?: string }>;
}

export default async function TiendaPage({ searchParams }: TiendaPageProps) {
  const { categoria, tag } = await searchParams;
  const allProducts = getAllProducts();

  const products = allProducts.filter((p) => {
    if (categoria && p.category !== categoria) return false;
    if (tag && !p.tags.includes(tag)) return false;
    return true;
  });

  const activeCategory = categories.find((c) => c.slug === categoria);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-noir sm:text-4xl">
          {tag === "kit" ? "Kits y sets de regalo" : activeCategory ? activeCategory.name : "Toda la tienda"}
        </h1>
        <p className="mt-2 text-sm text-mauve">
          {products.length} producto{products.length !== 1 && "s"}
        </p>
      </div>

      <nav
        aria-label="Filtrar por categoría"
        className="mt-8 flex flex-wrap justify-center gap-2 overflow-x-auto"
      >
        <FilterPill href="/tienda" active={!categoria && !tag}>
          Todos
        </FilterPill>
        {categories.map((c) => (
          <FilterPill key={c.slug} href={`/tienda?categoria=${c.slug}`} active={categoria === c.slug}>
            {c.shortName}
          </FilterPill>
        ))}
        <FilterPill href="/tienda?tag=kit" active={tag === "kit"}>
          Kits
        </FilterPill>
      </nav>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-sm text-mauve">
          Todavía no hay productos en esta categoría. Vuelve pronto.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-noir text-blush" : "bg-blush-light text-noir hover:bg-blush"
      )}
    >
      {children}
    </Link>
  );
}
