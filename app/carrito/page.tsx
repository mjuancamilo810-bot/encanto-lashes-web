"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, cartTotal } from "@/lib/cart";
import { formatCOP } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

export default function CarritoPage() {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);

  const total = cartTotal(lines);

  const orderMessage =
    `Hola, quiero confirmar mi pedido en Encanto Lashes:\n` +
    lines.map((l) => `• ${l.name} (${l.variantName}) x${l.quantity} — ${formatCOP(l.price * l.quantity)}`).join("\n") +
    `\n\nTotal: ${formatCOP(total)}`;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold text-noir">
          Tu carrito está esperando a que lo llenes de brillo
        </h1>
        <Link
          href="/tienda"
          className="mt-6 inline-block rounded-full bg-noir px-6 py-3 text-sm font-medium text-blush hover:bg-noir/85"
        >
          Ver la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-noir">Tu carrito</h1>

      <ul className="mt-8 divide-y divide-blush">
        {lines.map((line) => (
          <li key={line.variantSku} className="flex gap-4 py-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-blush-light">
              <Image src={line.image} alt={line.name} fill className="object-cover" sizes="96px" />
            </div>
            <div className="flex flex-1 flex-col">
              <p className="text-xs uppercase tracking-wide text-mauve">{line.brand}</p>
              <p className="font-medium text-noir">{line.name}</p>
              <p className="text-sm text-mauve">{line.variantName}</p>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-3 rounded-full bg-blush-light px-3 py-1.5">
                  <button
                    type="button"
                    aria-label="Disminuir cantidad"
                    onClick={() => setQuantity(line.variantSku, line.quantity - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center text-sm">{line.quantity}</span>
                  <button
                    type="button"
                    aria-label="Aumentar cantidad"
                    onClick={() => setQuantity(line.variantSku, line.quantity + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="font-semibold text-noir">{formatCOP(line.price * line.quantity)}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label={`Quitar ${line.name}`}
              onClick={() => removeLine(line.variantSku)}
              className="self-start text-mauve hover:text-noir"
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl bg-blush-light/60 p-6">
        <div className="flex items-center justify-between font-display text-xl font-semibold text-noir">
          <span>Total</span>
          <span>{formatCOP(total)}</span>
        </div>
        <p className="mt-2 text-xs text-mauve">
          Pago contraentrega en Medellín y área metropolitana, o pasarela digital
          (Wompi / MercadoPago) próximamente vía Shopify.
        </p>
        <a
          href={whatsappLink(orderMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block rounded-full bg-noir px-6 py-3.5 text-center text-sm font-medium text-blush hover:bg-noir/85"
        >
          Finalizar pedido por WhatsApp
        </a>
      </div>
    </div>
  );
}
