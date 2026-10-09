"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "./useReducedMotion";

// navigator.hardwareConcurrency no cambia durante la sesión: no hace falta
// suscribirse a nada, solo leerlo de forma segura para SSR.
function subscribe() {
  return () => {};
}

function getSnapshot() {
  return (navigator.hardwareConcurrency ?? 8) < 4;
}

function getServerSnapshot() {
  return false;
}

/**
 * Determina si el dispositivo puede renderizar la escena 3D completa.
 * Gama baja o prefers-reduced-motion → usar el fallback estático de
 * ProductPodium/KitBox en vez de montar el Canvas de Three.js.
 */
export function useDeviceCapability() {
  const reducedMotion = useReducedMotion();
  const lowEnd = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return { canRender3D: !reducedMotion && !lowEnd, reducedMotion, lowEnd };
}
