"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, cartTotal } from "@/lib/cart";
import { formatCOP } from "@/lib/utils";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);

  const total = cartTotal(lines);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-noir/50 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-xl outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-blush px-5 py-4">
            <Dialog.Title className="font-display text-lg font-semibold text-noir">
              Tu carrito
            </Dialog.Title>
            <Dialog.Close
              className="rounded-full p-1.5 text-noir hover:bg-blush focus-visible:outline-rose-gold"
              aria-label="Cerrar carrito"
            >
              <X size={20} />
            </Dialog.Close>
          </div>

          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="font-display text-lg text-noir">
                Tu carrito está esperando a que lo llenes de brillo
              </p>
              <p className="text-sm text-mauve">Explora la tienda y encuentra tu próximo favorito.</p>
              <Link
                href="/tienda"
                onClick={close}
                className="mt-3 rounded-full bg-noir px-5 py-2.5 text-sm font-medium text-blush"
              >
                Ver la tienda
              </Link>
            </div>
          ) : (
            <>
              <ul className="flex-1 overflow-y-auto px-5 py-4">
                {lines.map((line) => (
                  <li key={line.variantSku} className="flex gap-3 border-b border-blush/60 py-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-blush-light">
                      <Image src={line.image} alt={line.name} fill className="object-cover" sizes="80px" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="text-xs uppercase tracking-wide text-mauve">{line.brand}</p>
                      <p className="text-sm font-medium text-noir">{line.name}</p>
                      <p className="text-xs text-mauve">{line.variantName}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full bg-blush-light px-2 py-1">
                          <button
                            type="button"
                            aria-label="Disminuir cantidad"
                            onClick={() => setQuantity(line.variantSku, line.quantity - 1)}
                            className="text-noir"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-4 text-center text-sm">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label="Aumentar cantidad"
                            onClick={() => setQuantity(line.variantSku, line.quantity + 1)}
                            className="text-noir"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-noir">
                          {formatCOP(line.price * line.quantity)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Quitar ${line.name} del carrito`}
                      onClick={() => removeLine(line.variantSku)}
                      className="self-start text-mauve hover:text-noir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="border-t border-blush px-5 py-4">
                <div className="mb-3 flex items-center justify-between font-display text-base font-semibold text-noir">
                  <span>Total</span>
                  <span>{formatCOP(total)}</span>
                </div>
                <Link
                  href="/carrito"
                  onClick={close}
                  className="block rounded-full bg-noir px-5 py-3 text-center text-sm font-medium text-blush hover:bg-noir/85"
                >
                  Ir a pagar
                </Link>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
