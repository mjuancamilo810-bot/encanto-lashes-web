import type { Metadata } from "next";
import { B2BSection } from "@/components/sections/B2BSection";

export const metadata: Metadata = {
  title: "Para Lashistas",
  description:
    "Compra al por mayor insumos de pestañas y cejas: Nagaraku, Sky Glue, Stacy Lash y más, con precios especiales para lashistas.",
};

export default function ParaLashistasPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
        <h1 className="font-display text-4xl font-semibold text-noir sm:text-5xl">
          Insumos profesionales, precios de mayorista
        </h1>
        <p className="mt-4 text-base text-noir/75">
          Regístrate como lashista y desbloquea precios especiales en toda la línea
          de pestañas, cejas y kits — sin mínimos de compra imposibles.
        </p>
      </div>
      <B2BSection />
    </div>
  );
}
