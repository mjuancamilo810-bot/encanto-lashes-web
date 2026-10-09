import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./types";

export interface CartLine {
  productSlug: string;
  variantSku: string;
  name: string;
  brand: string;
  variantName: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  isLashista: boolean;
  open: () => void;
  close: () => void;
  addLine: (product: Product, variantSku: string, quantity?: number) => void;
  removeLine: (variantSku: string) => void;
  setQuantity: (variantSku: string, quantity: number) => void;
  setLashista: (value: boolean) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      isLashista: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addLine: (product, variantSku, quantity = 1) => {
        const variant = product.variants.find((v) => v.sku === variantSku);
        if (!variant) return;
        const existing = get().lines.find((l) => l.variantSku === variantSku);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.variantSku === variantSku
                ? { ...l, quantity: l.quantity + quantity }
                : l
            ),
          });
          return;
        }
        set({
          lines: [
            ...get().lines,
            {
              productSlug: product.slug,
              variantSku,
              name: product.name,
              brand: product.brand,
              variantName: variant.name,
              price:
                get().isLashista && product.priceWholesale
                  ? product.priceWholesale
                  : product.price,
              image: product.images[0],
              quantity,
            },
          ],
          isOpen: true,
        });
      },
      removeLine: (variantSku) =>
        set({ lines: get().lines.filter((l) => l.variantSku !== variantSku) }),
      setQuantity: (variantSku, quantity) => {
        if (quantity <= 0) {
          get().removeLine(variantSku);
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.variantSku === variantSku ? { ...l, quantity } : l
          ),
        });
      },
      setLashista: (value) => set({ isLashista: value }),
      clear: () => set({ lines: [] }),
    }),
    { name: "encanto-lashes-cart" }
  )
);

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
