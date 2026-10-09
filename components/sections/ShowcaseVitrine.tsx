import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getAllProducts, getFeaturedProducts } from "@/lib/products";
import { getCategory, type CategorySlug } from "@/lib/categories";
import type { Product } from "@/lib/types";
import { Reveal } from "@/components/ui/Reveal";
import { VitrineMarquee, type VitrineCard } from "@/components/ui/VitrineMarquee";

/** Etiquetas cortas para el badge de la tarjeta. */
const SHORT_LABELS: Partial<Record<CategorySlug, string>> = {
  "pestanas-cejas": "Pestañas",
  accesorios: "Accesorios",
};

/**
 * La vitrina usa la misma imagen que el resto de la tienda
 * (`product.images[0]`, definida en data/products.json): al reemplazar los
 * placeholders por fotos reales de producto, la vitrina se actualiza sola,
 * sin tocar código.
 */
function toCard(product: Product): VitrineCard {
  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    price: product.price,
    categoryLabel:
      SHORT_LABELS[product.category] ?? getCategory(product.category)?.shortName ?? "Belleza",
    badge: product.badges[0] ?? null,
    art: product.images[0],
  };
}

function buildVitrineCards(): VitrineCard[] {
  // Se alternan categorías para que la vitrina no muestre dos productos
  // parecidos seguidos, tomando primero los destacados del catálogo.
  const porCategoria = new Map<string, Product[]>();
  for (const producto of [...getFeaturedProducts(60), ...getAllProducts()]) {
    const lista = porCategoria.get(producto.category) ?? [];
    if (!lista.some((p) => p.slug === producto.slug)) lista.push(producto);
    porCategoria.set(producto.category, lista);
  }

  const intercalados: Product[] = [];
  for (let ronda = 0; intercalados.length < 12 && ronda < 12; ronda += 1) {
    for (const lista of porCategoria.values()) {
      if (intercalados.length >= 12) break;
      if (lista[ronda]) intercalados.push(lista[ronda]);
    }
  }

  return intercalados.map(toCard);
}

/** Destellos decorativos: posiciones fijas, nada de aleatoriedad en render. */
const SPARKLES = [
  { left: "8%", top: "18%", size: 5, delay: "0s" },
  { left: "18%", top: "62%", size: 3, delay: "0.7s" },
  { left: "31%", top: "12%", size: 4, delay: "1.4s" },
  { left: "46%", top: "70%", size: 3, delay: "0.3s" },
  { left: "58%", top: "16%", size: 5, delay: "1.1s" },
  { left: "71%", top: "56%", size: 3, delay: "1.8s" },
  { left: "84%", top: "22%", size: 4, delay: "0.5s" },
  { left: "93%", top: "66%", size: 3, delay: "1.3s" },
];

export function ShowcaseVitrine() {
  const cards = buildVitrineCards();

  return (
    <section className="relative isolate overflow-hidden bg-noir pb-12 pt-7 sm:pb-16 sm:pt-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/*
          Fondo ambiental: dos fotos reales (brochas) alternan en un
          crossfade lento tipo "Ken Burns", estilo publicidad. Puramente
          decorativo — nunca se presentan como un producto específico.
        */}
        <div className="absolute inset-0 overflow-hidden">
          {/*
            La capa A queda visible de forma estática si el navegador no
            anima (prefers-reduced-motion): nunca debe depender del
            keyframe para tener alguna opacidad.
          */}
          <Image
            src="/gallery/brochas-flatlay.jpg"
            alt=""
            fill
            priority
            className="scale-105 object-cover opacity-100 motion-safe:animate-kenburns motion-safe:opacity-0"
            sizes="100vw"
          />
          <Image
            src="/gallery/brochas-glam.jpg"
            alt=""
            fill
            className="scale-105 object-cover opacity-0 motion-safe:animate-kenburns motion-safe:[animation-delay:-9s]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-noir/78" />
        </div>
        <div className="absolute left-1/2 top-[-16rem] h-[30rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(217,165,116,0.34),transparent_66%)] blur-2xl" />
        <div className="absolute -left-32 top-16 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(232,169,184,0.22),transparent_70%)] blur-3xl" />
        <div className="absolute -right-28 bottom-0 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(192,133,82,0.26),transparent_70%)] blur-3xl" />
        <div className="absolute left-1/2 top-0 h-[28rem] w-[46rem] -translate-x-1/2 bg-[conic-gradient(from_202deg_at_50%_-12%,transparent_0deg,rgba(249,226,220,0.11)_18deg,transparent_40deg)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_28%,rgba(8,6,5,0.72)_100%)]" />
        {SPARKLES.map((sparkle) => (
          <span
            key={`${sparkle.left}-${sparkle.top}`}
            className="absolute rounded-full bg-rose-gold-light motion-safe:animate-twinkle"
            style={{
              left: sparkle.left,
              top: sparkle.top,
              width: sparkle.size,
              height: sparkle.size,
              animationDelay: sparkle.delay,
            }}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-cream" />
      </div>

      <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-rose-gold-light sm:text-[11px]">
              <Sparkles size={14} aria-hidden="true" />
              Lo nuevo de la tienda
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-cream sm:text-4xl lg:text-5xl">
              <span className="font-script text-3xl font-normal text-rose-gold-light sm:text-5xl lg:text-6xl">
                Vitrina
              </span>{" "}
              de belleza en movimiento
            </h2>
            <p className="mt-2.5 max-w-md font-body text-sm text-blush/80">
              Maquillaje, pestañas y brochas profesionales, girando en vitrina.
            </p>
          </div>

          <Link
            href="/tienda"
            className="shrink-0 self-start rounded-full bg-blush px-5 py-2.5 text-[13px] font-medium text-noir transition-colors hover:bg-cream sm:px-6 sm:py-3 sm:text-sm"
          >
            Explorar la tienda
          </Link>
        </div>
      </Reveal>

      <Reveal className="mt-6 sm:mt-9" delay={0.12} y={34}>
        <VitrineMarquee items={cards} />
      </Reveal>
    </section>
  );
}
