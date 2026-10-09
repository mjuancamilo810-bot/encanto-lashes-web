import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { FloatingPhoto } from "@/components/ui/FloatingPhoto";
import { GALLERY } from "@/lib/gallery";

export function FeaturedProducts() {
  const products = getFeaturedProducts(12);

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      <FloatingPhoto
        src={GALLERY.brushesGlam}
        objectPosition="40% 50%"
        rotate={-6}
        className="-left-12 top-1/3 h-28 w-24 sm:-left-8 sm:h-40 sm:w-32 lg:left-2 lg:h-52 lg:w-40 xl:left-8"
      />
      <FloatingPhoto
        src={GALLERY.brushesFlatlay}
        objectPosition="70% 30%"
        rotate={5}
        delay="2.1s"
        className="-right-12 bottom-24 h-28 w-24 sm:-right-8 sm:h-40 sm:w-32 lg:right-2 lg:h-52 lg:w-40 xl:right-8"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <h2 className="font-display text-3xl font-semibold text-noir sm:text-4xl">
              Lo más querido
            </h2>
            <p className="mt-2 text-sm text-mauve">
              Nuestra selección de pestañas, cejas y favoritos de la tienda.
            </p>
          </div>
          <Link
            href="/tienda"
            className="rounded-full border border-rose-gold px-5 py-2.5 text-sm font-medium text-noir hover:bg-rose-gold/10"
          >
            Ver todo el catálogo
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
