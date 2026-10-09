"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
  imageBefore: string;
  imageAfter: string;
  labelBefore?: string;
  labelAfter?: string;
  caption?: string;
  className?: string;
}

/**
 * Comparador de arrastre antes/después. Sin dependencias 3D a propósito:
 * es el componente que más impacta en conversión y debe cargar instantáneo.
 */
export function BeforeAfterSlider({
  imageBefore,
  imageAfter,
  labelBefore = "ANTES",
  labelAfter = "DESPUÉS",
  caption,
  className,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, ratio)));
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: PointerEvent) => {
      updateFromClientX(e.clientX);
    };
    const handleUp = () => setDragging(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging, updateFromClientX]);

  // Pequeña sugerencia de arrastre al montar: mueve el handle y regresa.
  useEffect(() => {
    if (hasInteracted) return;
    const timer = setTimeout(() => {
      setPosition(38);
      setTimeout(() => setPosition(50), 550);
    }, 700);
    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setHasInteracted(true);
      setPosition((p) => Math.max(0, p - 5));
    } else if (e.key === "ArrowRight") {
      setHasInteracted(true);
      setPosition((p) => Math.min(100, p + 5));
    }
  };

  return (
    <div className={cn("select-none", className)}>
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label={`Comparación ${labelBefore.toLowerCase()} y ${labelAfter.toLowerCase()}. Usa las flechas izquierda y derecha para mover el corte.`}
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => {
          setDragging(true);
          setHasInteracted(true);
          updateFromClientX(e.clientX);
        }}
        className="relative aspect-[4/5] w-full touch-none overflow-hidden rounded-3xl shadow-glow-rose outline-none sm:aspect-[4/3]"
      >
        <div className="absolute inset-0">
          <Image
            src={imageAfter}
            alt={`Resultado ${labelAfter.toLowerCase()}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <span className="absolute right-4 top-4 rounded-full bg-noir/80 px-3 py-1 text-xs font-medium tracking-wide text-blush">
            {labelAfter}
          </span>
        </div>

        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={imageBefore}
            alt={`Resultado ${labelBefore.toLowerCase()}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-xs font-medium tracking-wide text-noir">
            {labelBefore}
          </span>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-cream"
          style={{ left: `${position}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream shadow-lg ring-2 ring-rose-gold/60">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-rose-gold"
            >
              <path d="M8 6L2 12L8 18" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 6L22 12L16 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      {caption && (
        <p className="mt-3 text-center font-body text-sm text-mauve">{caption}</p>
      )}
    </div>
  );
}
