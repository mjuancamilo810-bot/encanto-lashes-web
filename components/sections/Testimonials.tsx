import { getAllTestimonials } from "@/lib/products";
import { StarRating } from "@/components/ui/StarRating";
import { FloatingPhoto } from "@/components/ui/FloatingPhoto";
import { GALLERY } from "@/lib/gallery";

export function Testimonials() {
  const testimonials = getAllTestimonials();

  // Sin testimonios reales no se muestra nada: inventar reseñas con
  // nombre y ciudad sería publicidad engañosa.
  if (testimonials.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      <FloatingPhoto
        src={GALLERY.brushesFlatlay}
        objectPosition="20% 35%"
        rotate={5}
        className="-left-12 top-16 h-28 w-24 sm:-left-8 sm:h-40 sm:w-32 lg:left-2 lg:h-52 lg:w-40 xl:left-8"
      />
      <FloatingPhoto
        src={GALLERY.lashes}
        objectPosition="50% 55%"
        rotate={-4}
        delay="1.1s"
        className="-right-12 bottom-12 h-28 w-24 sm:-right-8 sm:h-40 sm:w-32 lg:right-2 lg:h-52 lg:w-40 xl:right-8"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold text-noir sm:text-4xl">
            Lo que dicen de nosotras
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.id} className="flex flex-col rounded-2xl bg-blush-light/50 p-6 ring-1 ring-blush">
              <StarRating rating={t.rating} />
              <p className="mt-3 flex-1 text-sm text-noir/85">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-noir">{t.name}</p>
                  <p className="text-xs text-noir/60">{t.city}</p>
                </div>
                <span className="rounded-full bg-blush-light px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-noir ring-1 ring-rose-gold/30">
                  {t.type === "lashista" ? "Lashista" : "Clienta"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
