"use client";

import { useCartStore } from "@/lib/cart";

/** Expone el modo mayorista (precios de lashista) desbloqueado vía /para-lashistas. */
export function useIsLashista() {
  const isLashista = useCartStore((s) => s.isLashista);
  const setLashista = useCartStore((s) => s.setLashista);
  return { isLashista, setLashista };
}
