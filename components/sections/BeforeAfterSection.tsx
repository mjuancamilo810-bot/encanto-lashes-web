import Image from "next/image";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { FloatingPhoto } from "@/components/ui/FloatingPhoto";
import { GALLERY } from "@/lib/gallery";

const THUMBS = [
  { before: "/before-after/before-2.svg", after: "/before-after/after-2.svg", label: "Volumen ruso" },
  { before: "/before-after/before-3.svg", after: "/before-after/after-3.svg", label: "Mega volumen" },
];

export function BeforeAfterSection() {
  return (
    <section className="relative overflow-hidden bg-cream py-16 sm:py-24">
      <FloatingPhoto
        src={GALLERY.lashes}
        objectPosition="25% 45%"
        rotate={-5}
        className="-left-12 top-28 h-28 w-24 sm:-left-8 sm:h-40 sm:w-32 lg:left-2 lg:h-56 lg:w-40 xl:left-10"
      />
      <FloatingPhoto
        src={GALLERY.brushesGlam}
        objectPosition="55% 45%"
        rotate={6}
        delay="1.6s"
        className="-right-12 bottom-28 h-28 w-24 sm:-right-8 sm:h-40 sm:w-32 lg:right-2 lg:h-52 lg:w-40 xl:right-10"
      />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-noir/70">
          La prueba está en el resultado
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-noir sm:text-4xl">
          Arrastra para ver la diferencia
        </h2>
      </div>

      <div className="relative z-10 mx-auto mt-10 max-w-md px-4 sm:px-6">
        <BeforeAfterSlider
          imageBefore="/before-after/before-1.svg"
          imageAfter="/before-after/after-1.svg"
          caption="Técnica clásica — resultado a las 2 semanas."
        />
      </div>

      <div className="relative z-10 mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-4 px-4 sm:px-6">
        {THUMBS.map((thumb) => (
          <div key={thumb.label}>
            <BeforeAfterSlider
              imageBefore={thumb.before}
              imageAfter={thumb.after}
              caption={thumb.label}
              className="text-sm"
            />
          </div>
        ))}
      </div>

      {/*
        Foto de referencia, no una clienta real: se muestra fuera del
        comparador de arrastre a propósito, para no insinuar que es un
        antes/después verificado de un trabajo nuestro.
      */}
      <div className="relative z-10 mx-auto mt-10 max-w-md px-4 sm:px-6">
        <div className="relative aspect-4/5 overflow-hidden rounded-3xl shadow-glow-rose sm:aspect-4/3">
          <Image
            src="/gallery/resultado-pestanas.jpg"
            alt="Ejemplo del efecto que puede lograr una extensión de pestañas bien aplicada"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 448px"
          />
          <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-xs font-medium tracking-wide text-noir">
            Resultado de referencia
          </span>
        </div>
        <p className="mt-3 text-center font-body text-sm text-mauve">
          Así se ve el efecto — no es una clienta de Encanto Lashes, es una imagen ilustrativa.
        </p>
      </div>
    </section>
  );
}
