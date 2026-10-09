"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatCOP } from "@/lib/utils";
import { useCartStore } from "@/lib/cart";
import { useIsLashista } from "@/hooks/useIsLashista";
import { StarRating } from "@/components/ui/StarRating";

export function ProductDetailClient({ product }: { product: Product }) {
  const [variantSku, setVariantSku] = useState(product.variants[0]?.sku ?? "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const addLine = useCartStore((s) => s.addLine);
  const { isLashista } = useIsLashista();

  const displayPrice = isLashista && product.priceWholesale ? product.priceWholesale : product.price;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-blush-light">
          <Image
            src={product.images[activeImage]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-16 overflow-hidden rounded-xl ring-2 ${
                  i === activeImage ? "ring-rose-gold" : "ring-transparent"
                }`}
                aria-label={`Ver imagen ${i + 1} de ${product.name}`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-mauve">{product.brand}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-noir">{product.name}</h1>
        <div className="mt-2">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} size={16} />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-noir/80">{product.description}</p>

        <div className="mt-6 flex items-baseline gap-3">
          <p className="font-display text-3xl font-semibold text-noir">{formatCOP(displayPrice)}</p>
          {isLashista && product.priceWholesale && (
            <p className="text-base text-mauve line-through">{formatCOP(product.price)}</p>
          )}
        </div>
        {!isLashista && product.priceWholesale && (
          <p className="mt-1 text-xs text-mauve">
            ¿Eres lashista?{" "}
            <a href="/para-lashistas" className="underline decoration-rose-gold underline-offset-2">
              Desbloquea precio mayorista
            </a>
          </p>
        )}

        {product.variants.length > 1 && (
          <div className="mt-6">
            <label htmlFor="variant-select" className="text-xs font-medium uppercase tracking-wide text-mauve">
              Variante
            </label>
            <select
              id="variant-select"
              value={variantSku}
              onChange={(e) => setVariantSku(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-blush bg-white px-3 py-2.5 text-sm text-noir focus-visible:outline-rose-gold"
            >
              {product.variants.map((v) => (
                <option key={v.sku} value={v.sku}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-full bg-blush-light px-3 py-2">
            <button
              type="button"
              aria-label="Disminuir cantidad"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-noir"
            >
              −
            </button>
            <span className="w-5 text-center text-sm">{quantity}</span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              onClick={() => setQuantity((q) => q + 1)}
              className="text-noir"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => addLine(product, variantSku, quantity)}
            disabled={!product.inStock}
            className="flex-1 rounded-full bg-noir px-6 py-3 text-sm font-medium text-blush hover:bg-noir/85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {product.inStock ? "Agregar al carrito" : "Agotado"}
          </button>
        </div>

        <ul className="mt-6 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-blush-light px-3 py-1 text-xs text-noir/70">
              #{tag}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
