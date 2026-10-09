import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos por WhatsApp o visítanos en Medellín, Antioquia.",
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold text-noir sm:text-5xl">Hablemos</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-mauve">
          Resolvemos tus dudas sobre productos, técnicas o pedidos al por mayor.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <ContactForm />

        <div className="overflow-hidden rounded-3xl ring-1 ring-blush">
          <iframe
            title="Mapa — Encanto Lashes en Medellín"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-75.6247%2C6.2244%2C-75.5647%2C6.2644&layer=mapnik"
            className="h-72 w-full border-0 sm:h-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
