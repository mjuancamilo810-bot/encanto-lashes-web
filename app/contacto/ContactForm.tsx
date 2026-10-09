"use client";

import { useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola, soy ${form.name}. ${form.message}`;
    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-blush">
      <div>
        <label htmlFor="contact-name" className="text-xs uppercase tracking-wide text-mauve">
          Nombre
        </label>
        <input
          id="contact-name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 w-full rounded-lg border border-blush px-3 py-2.5 text-sm text-noir focus-visible:outline-rose-gold"
          placeholder="Tu nombre"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="text-xs uppercase tracking-wide text-mauve">
          Mensaje
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="mt-1 w-full rounded-lg border border-blush px-3 py-2.5 text-sm text-noir focus-visible:outline-rose-gold"
          placeholder="Cuéntanos qué necesitas..."
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-noir px-5 py-3 text-sm font-medium text-blush hover:bg-noir/85"
      >
        Enviar por WhatsApp
      </button>
    </form>
  );
}
