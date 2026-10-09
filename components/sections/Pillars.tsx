import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { countByCategory } from "@/lib/products";
import { FloatingPhoto } from "@/components/ui/FloatingPhoto";
import { GALLERY } from "@/lib/gallery";

const ICONS: Record<string, string> = {
  "pestanas-cejas": "/products/category-icon-1.svg",
  maquillaje: "/products/category-icon-2.svg",
  skincare: "/products/category-icon-3.svg",
  cabello: "/products/category-icon-4.svg",
  "cuerpo-bano": "/products/category-icon-5.svg",
  perfumeria: "/products/category-icon-6.svg",
  unas: "/products/category-icon-7.svg",
  accesorios: "/products/category-icon-8.svg",
  bienestar: "/products/category-icon-9.svg",
};

export function Pillars() {
  const flagship = categories.find((c) => c.flagship)!;
  const rest = categories.filter((c) => !c.flagship);

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      <FloatingPhoto
        src={GALLERY.lashes}
        objectPosition="60% 45%"
        rotate={-4}
        className="-left-12 top-24 h-32 w-28 sm:-left-8 sm:h-44 sm:w-36 lg:left-4 lg:h-60 lg:w-44 xl:left-10"
      />
      <FloatingPhoto
        src={GALLERY.brushesFlatlay}
        objectPosition="30% 60%"
        rotate={5}
        delay="1.3s"
        className="-right-12 bottom-16 h-28 w-24 sm:-right-8 sm:h-40 sm:w-32 lg:right-4 lg:h-52 lg:w-40 xl:right-10"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold text-noir sm:text-4xl">
            Explora por categoría
          </h2>
          <p className="mt-3 text-sm text-mauve">
            Todo lo que necesitas para tu ritual de belleza, en un solo lugar.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href={`/tienda?categoria=${flagship.slug}`}
            className="group relative col-span-1 flex flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br from-blush to-blush-light p-6 shadow-sm ring-1 ring-blush transition-shadow hover:shadow-glow-rose sm:col-span-2 sm:row-span-2 sm:min-h-[280px]"
          >
            <Image
              src={ICONS[flagship.slug]}
              alt=""
              width={56}
              height={56}
              className="absolute right-6 top-6 h-14 w-14 opacity-90"
              aria-hidden="true"
            />
            <span className="mb-2 inline-block w-fit rounded-full bg-noir px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blush">
              Categoría insignia
            </span>
            <h3 className="font-display text-2xl font-semibold text-noir sm:text-3xl">
              {flagship.name}
            </h3>
            <p className="mt-1 text-sm text-noir/70">
              +{countByCategory(flagship.slug)} productos
            </p>
          </Link>

          {rest.map((category) => (
            <Link
              key={category.slug}
              href={`/tienda?categoria=${category.slug}`}
              className="group flex flex-col justify-between rounded-2xl bg-blush-light/60 p-5 shadow-sm ring-1 ring-blush transition-shadow hover:shadow-glow-rose"
            >
              <Image
                src={ICONS[category.slug]}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10"
                aria-hidden="true"
              />
              <div className="mt-4">
                <h3 className="font-display text-base font-semibold text-noir">
                  {category.shortName}
                </h3>
                <p className="text-xs text-mauve">+{countByCategory(category.slug)} productos</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
