"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { X } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatCOP } from "@/lib/utils";
import { useCartStore } from "@/lib/cart";
import { StarRating } from "./StarRating";

interface QuickViewModalProps {
  product: Product;
  trigger: React.ReactNode;
}

export function QuickViewModal({ product, trigger }: QuickViewModalProps) {
  const [variantSku, setVariantSku] = useState(product.variants[0]?.sku ?? "");
  const addLine = useCartStore((s) => s.addLine);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-noir/50" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-cream p-6 shadow-xl outline-none"
          aria-describedby={undefined}
        >
          <Dialog.Close
            className="absolute right-4 top-4 rounded-full p-1.5 text-noir hover:bg-blush focus-visible:outline-rose-gold"
            aria-label="Cerrar vista rápida"
          >
            <X size={20} />
          </Dialog.Close>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-blush-light">
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="400px" />
            </div>
            <div className="flex flex-col">
              <Dialog.Title className="font-display text-xl font-semibold text-noir">
                {product.name}
              </Dialog.Title>
              <p className="text-xs uppercase tracking-wide text-mauve">{product.brand}</p>
              <StarRating rating={product.rating} reviewCount={product.reviewCount} className="mt-2" />
              <p className="mt-3 text-sm text-noir/80">{product.shortDescription}</p>

              {product.variants.length > 1 && (
                <select
                  value={variantSku}
                  onChange={(e) => setVariantSku(e.target.value)}
                  aria-label={`Variante de ${product.name}`}
                  className="mt-4 rounded-lg border border-blush bg-white px-3 py-2 text-sm text-noir"
                >
                  {product.variants.map((v) => (
                    <option key={v.sku} value={v.sku}>
                      {v.name}
                    </option>
                  ))}
                </select>
              )}

              <p className="mt-4 font-display text-2xl font-semibold text-noir">
                {formatCOP(product.price)}
              </p>

              <button
                type="button"
                onClick={() => addLine(product, variantSku)}
                className="mt-4 rounded-full bg-noir px-5 py-3 text-sm font-medium text-blush hover:bg-noir/85"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
