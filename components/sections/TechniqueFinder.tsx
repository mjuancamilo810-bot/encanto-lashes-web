import { techniques } from "@/lib/categories";
import { TechniqueCard } from "@/components/ui/TechniqueCard";
import { FloatingPhoto } from "@/components/ui/FloatingPhoto";
import { GALLERY } from "@/lib/gallery";

export function TechniqueFinder() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      <FloatingPhoto
        src={GALLERY.lashes}
        objectPosition="35% 50%"
        rotate={4}
        className="-left-14 bottom-20 h-32 w-28 sm:-left-8 sm:h-44 sm:w-36 lg:left-3 lg:h-56 lg:w-44 xl:left-8"
      />
      <FloatingPhoto
        src={GALLERY.lashes}
        objectPosition="75% 40%"
        rotate={-5}
        delay="1.8s"
        className="-right-14 top-20 h-32 w-28 sm:-right-8 sm:h-44 sm:w-36 lg:right-3 lg:h-56 lg:w-44 xl:right-8"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold text-noir sm:text-4xl">
            Encuentra tu técnica
          </h2>
          <p className="mt-3 text-sm text-mauve">
            Cada mirada es distinta. Elige el efecto que va contigo.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {techniques.map((technique) => (
            <TechniqueCard key={technique.slug} technique={technique} />
          ))}
        </div>
      </div>
    </section>
  );
}
