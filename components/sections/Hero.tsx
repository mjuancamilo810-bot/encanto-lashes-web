"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { whatsappLink } from "@/lib/whatsapp";
import { ProductPodiumFallback } from "@/components/3d/ProductPodiumFallback";
import { FloatingPhoto } from "@/components/ui/FloatingPhoto";
import { GALLERY } from "@/lib/gallery";

const ProductPodium = dynamic(
  () => import("@/components/3d/ProductPodium").then((m) => m.ProductPodium),
  { ssr: false, loading: () => <ProductPodiumFallback /> }
);

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream to-blush">
      <FloatingPhoto
        src={GALLERY.brushesFlatlay}
        objectPosition="50% 40%"
        rotate={-6}
        delay="0.8s"
        className="hidden lg:block lg:-left-8 lg:bottom-12 lg:h-44 lg:w-36 xl:left-4"
      />
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-noir/70">
            Pestañas · Maquillaje · Skincare · y más
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-noir sm:text-5xl lg:text-6xl">
            La mirada que{" "}
            {/* Excepción de contraste deliberada: eco tipográfico del script
                del logo, tratado como logotype (exento por WCAG 1.4.3). La
                oración completa sigue siendo legible por el texto en --noir
                alrededor. Ver DESIGN_TOKENS.md, sección de contraste. */}
            <span className="font-script text-5xl font-normal text-rose-gold sm:text-6xl lg:text-7xl">
              enamora
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-md font-body text-base text-noir/75 lg:mx-0">
            Extensiones que duran 5 semanas, aplicadas en sesiones de 90 minutos por
            técnicas certificadas — y la tienda de belleza completa para todo lo demás.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href={whatsappLink("Hola, quiero reservar mi sesión en Encanto Lashes")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full bg-noir px-6 py-3.5 text-center text-sm font-medium text-blush hover:bg-noir/85 sm:w-auto"
            >
              Reserva tu sesión
            </a>
            <a
              href="/tienda"
              className="w-full rounded-full border border-rose-gold px-6 py-3.5 text-center text-sm font-medium text-noir hover:bg-rose-gold/10 sm:w-auto"
            >
              Ver la tienda
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <ProductPodium />
        </motion.div>
      </div>
    </section>
  );
}
