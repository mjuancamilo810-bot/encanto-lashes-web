"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatCOP, cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart";
import { useIsLashista } from "@/hooks/useIsLashista";
import { StarRating } from "./StarRating";

interface ProductCardProps {
  product: Product;
}

const BADGE_STYLES: Record<string, string> = {
  "MÁS VENDIDO": "bg-noir text-blush",
  PREMIUM: "bg-rose-gold text-noir",
  NUEVO: "bg-noir text-blush",
  KIT: "bg-rose-gold text-noir",
};

export function ProductCard({ product }: ProductCardProps) {
  const [variantSku, setVariantSku] = useState(product.variants[0]?.sku ?? "");
  const addLine = useCartStore((s) => s.addLine);
  const { isLashista } = useIsLashista();

  const displayPrice =
    isLashista && product.priceWholesale ? product.priceWholesale : product.price;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white/60 shadow-sm ring-1 ring-blush transition-shadow hover:shadow-glow-rose">
      <Link
        href={`/producto/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-blush-light"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {product.badges.map((badge) => (
            <span
              key={badge}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                BADGE_STYLES[badge] ?? "bg-noir text-blush"
              )}
            >
              {badge}
            </span>
          ))}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-mauve">{product.brand}</p>
        <Link href={`/producto/${product.slug}`} className="font-body text-sm font-medium text-noir hover:underline">
          {product.name}
        </Link>

        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        {product.variants.length > 1 && (
          <select
            value={variantSku}
            onChange={(e) => setVariantSku(e.target.value)}
            aria-label={`Variante de ${product.name}`}
            className="mt-1 rounded-lg border border-blush bg-white px-2 py-1.5 text-xs text-noir focus-visible:outline-rose-gold"
          >
            {product.variants.map((v) => (
              <option key={v.sku} value={v.sku}>
                {v.name}
              </option>
            ))}
          </select>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <p className="font-display text-base font-semibold text-noir">
              {formatCOP(displayPrice)}
            </p>
            {isLashista && product.priceWholesale && (
              <p className="text-xs text-mauve line-through">{formatCOP(product.price)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => addLine(product, variantSku)}
            className="rounded-full bg-noir px-3 py-2 text-xs font-medium text-blush transition-colors hover:bg-noir/85 focus-visible:outline-rose-gold"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
