"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Retardo en segundos, para escalonar varios bloques. */
  delay?: number;
  /** Desplazamiento vertical inicial en px. */
  y?: number;
}

/**
 * Entrada suave al hacer scroll (whileInView, una sola vez).
 * Si el usuario pidió reducir movimiento, renderiza el contenido tal cual.
 */
export function Reveal({ children, className, delay = 0, y = 26 }: RevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
