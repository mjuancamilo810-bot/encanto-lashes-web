"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useIsLashista } from "@/hooks/useIsLashista";
import { whatsappLink } from "@/lib/whatsapp";
import { FloatingPhoto } from "@/components/ui/FloatingPhoto";
import { GALLERY } from "@/lib/gallery";

const BENEFITS = [
  "Precios mayoristas en toda la línea de pestañas y cejas",
  "Acceso anticipado a nuevos lotes de Nagaraku y Sky Glue",
  "Asesoría personalizada para armar tu kit de trabajo",
  "Envíos prioritarios a todo el país",
];

export function B2BSection() {
  const { isLashista, setLashista } = useIsLashista();
  const [form, setForm] = useState({ name: "", whatsapp: "", city: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLashista(true);
    setSubmitted(true);
    const message = `Hola, soy ${form.name} de ${form.city} y quiero registrarme como lashista mayorista. Mi WhatsApp es ${form.whatsapp}.`;
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-noir to-[#2a221c] py-16 text-blush sm:py-24">
      <FloatingPhoto
        src={GALLERY.lashes}
        objectPosition="45% 50%"
        rotate={5}
        tone="dark"
        className="-left-12 bottom-20 h-28 w-24 sm:-left-8 sm:h-40 sm:w-32 lg:left-3 lg:h-52 lg:w-40 xl:left-10"
      />
      <div className="relative z-10 mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-light">
            Para Lashistas
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            Compra al por mayor, crece con nosotras
          </h2>
          <ul className="mt-6 space-y-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-blush/85">
                <Check size={16} className="mt-0.5 shrink-0 text-rose-gold-light" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-blush/5 p-6 ring-1 ring-blush/15">
          {submitted || isLashista ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
              <Check size={28} className="text-rose-gold-light" />
              <p className="font-display text-lg font-semibold">¡Precios mayoristas desbloqueados!</p>
              <p className="text-sm text-blush/70">
                Ya puedes ver tus precios de lashista en toda la tienda.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="b2b-name" className="text-xs uppercase tracking-wide text-blush/70">
                  Nombre
                </label>
                <input
                  id="b2b-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-blush/20 bg-transparent px-3 py-2.5 text-sm text-blush placeholder:text-blush/40 focus-visible:outline-rose-gold"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label htmlFor="b2b-whatsapp" className="text-xs uppercase tracking-wide text-blush/70">
                  WhatsApp
                </label>
                <input
                  id="b2b-whatsapp"
                  required
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-blush/20 bg-transparent px-3 py-2.5 text-sm text-blush placeholder:text-blush/40 focus-visible:outline-rose-gold"
                  placeholder="300 000 0000"
                />
              </div>
              <div>
                <label htmlFor="b2b-city" className="text-xs uppercase tracking-wide text-blush/70">
                  Ciudad
                </label>
                <input
                  id="b2b-city"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-blush/20 bg-transparent px-3 py-2.5 text-sm text-blush placeholder:text-blush/40 focus-visible:outline-rose-gold"
                  placeholder="Medellín"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-blush px-5 py-3 text-sm font-medium text-noir hover:bg-blush/90"
              >
                Quiero precios mayoristas
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
