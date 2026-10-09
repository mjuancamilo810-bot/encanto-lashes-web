"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimationFrame, useInView, useMotionValue, wrap } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, MoveHorizontal } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatCOP } from "@/lib/utils";

export interface VitrineCard {
  slug: string;
  name: string;
  brand: string;
  price: number;
  categoryLabel: string;
  badge: string | null;
  /** Foto real del producto — misma fuente que el resto de la tienda. */
  art: string;
}

/** Velocidad del desplazamiento automático, en px/s. */
const AUTO_SPEED = 38;
/** Constante de amortiguación de la inercia, en 1/s. */
const DECAY = 3.1;
/** Tope de velocidad de un flick, en px/s. */
const MAX_FLICK = 2800;
/** Distancia en px a partir de la cual un gesto se considera arrastre y no clic. */
const DRAG_THRESHOLD = 10;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface VitrineMarqueeProps {
  items: VitrineCard[];
}

export function VitrineMarquee({ items }: VitrineMarqueeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackCopyRef = useRef<HTMLUListElement>(null);

  const x = useMotionValue(0);
  /** Ancho de una copia completa de la lista: el periodo del bucle infinito. */
  const periodRef = useRef(0);
  /** Velocidad extra (px/s) aportada por el arrastre o los botones. */
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const pausedRef = useRef(false);
  const pointerRef = useRef({ x: 0, t: 0, moved: 0 });

  const reducedMotion = useReducedMotion();
  const inView = useInView(viewportRef, { amount: 0.1 });

  const measure = useCallback(() => {
    const list = trackCopyRef.current;
    if (!list) return;
    periodRef.current = list.offsetWidth;
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const list = trackCopyRef.current;
    if (!viewport || !list) return;
    // El propio observer emite una primera medición al observar.
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [measure]);

  /** Escribe la posición aplicando el bucle: el track nunca se "acaba". */
  const applyX = useCallback(
    (value: number) => {
      const period = periodRef.current;
      x.set(period > 0 ? wrap(-period, 0, value) : value);
    },
    [x]
  );

  useAnimationFrame((_, delta) => {
    if (draggingRef.current) return;
    const boost = velocityRef.current;
    const idle = reducedMotion || pausedRef.current || !inView;
    if (idle && boost === 0) return;

    const dt = Math.min(delta, 60) / 1000;
    applyX(x.get() + (idle ? 0 : -AUTO_SPEED) * dt + boost * dt);

    if (boost !== 0) {
      const next = boost * Math.exp(-DECAY * dt);
      velocityRef.current = Math.abs(next) < 6 ? 0 : next;
    }
  });

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    draggingRef.current = true;
    velocityRef.current = 0;
    pointerRef.current = { x: event.clientX, t: event.timeStamp, moved: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const previous = pointerRef.current;
    const dx = event.clientX - previous.x;
    const dt = Math.max(event.timeStamp - previous.t, 1);
    velocityRef.current = clamp((dx / dt) * 1000, -MAX_FLICK, MAX_FLICK);
    pointerRef.current = {
      x: event.clientX,
      t: event.timeStamp,
      moved: previous.moved + Math.abs(dx),
    };
    applyX(x.get() + dx);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    // Sin inercia si el usuario pidió reducir movimiento.
    if (reducedMotion || event.type === "pointercancel") velocityRef.current = 0;
  };

  // Un arrastre no debe navegar al soltar sobre una tarjeta.
  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (pointerRef.current.moved > DRAG_THRESHOLD) {
      event.preventDefault();
      event.stopPropagation();
      pointerRef.current = { ...pointerRef.current, moved: 0 };
    }
  };

  // El auto-scroll se detiene mientras el cursor está encima.
  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    pausedRef.current = true;
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    pausedRef.current = false;
  };

  /** dir = -1 avanza (contenido hacia la izquierda), dir = 1 retrocede. */
  const nudge = useCallback(
    (dir: number) => {
      const card = trackCopyRef.current?.firstElementChild;
      const step = card instanceof HTMLElement ? card.offsetWidth : 280;
      if (reducedMotion) {
        applyX(x.get() + dir * step);
        return;
      }
      velocityRef.current = dir * step * DECAY;
    },
    [applyX, reducedMotion, x]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nudge(-1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      nudge(1);
    }
  };

  // Al tabular, la tarjeta enfocada se trae al área visible (el track se mueve
  // por transform, así que el scroll nativo del navegador no serviría).
  // Se calcula sobre el offset de layout: corregir con la posición en pantalla
  // daría un desplazamiento de un periodo exacto, que el bucle anula.
  const handleFocusCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    pausedRef.current = true;
    const viewport = viewportRef.current;
    const list = trackCopyRef.current;
    const period = periodRef.current;
    const card = event.target instanceof Element ? event.target.closest("li") : null;
    if (!viewport || !list || !card || period <= 0) return;

    viewport.scrollLeft = 0;
    const offset = card.offsetLeft - list.offsetLeft;
    const width = viewport.clientWidth;
    const cardWidth = card.offsetWidth;
    const pad = 24;

    const current = x.get() + offset;
    if (current >= pad && current + cardWidth <= width - pad) return;

    // x nunca puede ser positivo: el track debe seguir cubriendo el viewport.
    const centered = Math.max(pad, (width - cardWidth) / 2);
    const target = clamp(centered - offset, -period, 0);
    velocityRef.current = 0;
    x.set(target);
  };

  return (
    <div className="relative">
      <div className="mx-auto mb-4 flex max-w-7xl items-center justify-between gap-4 px-4 sm:mb-5 sm:px-6">
        <p className="flex items-center gap-2 text-xs font-medium text-blush/75">
          <MoveHorizontal size={15} className="text-rose-gold-light" aria-hidden="true" />
          Arrastra o usa las flechas
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="Ver productos anteriores"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-gold/50 text-blush transition-colors hover:border-rose-gold hover:bg-rose-gold/15"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label="Ver más productos"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-gold/50 text-blush transition-colors hover:border-rose-gold hover:bg-rose-gold/15"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Vitrina de productos destacados"
        className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={() => {
          pausedRef.current = false;
        }}
        onClickCapture={handleClickCapture}
        onKeyDown={handleKeyDown}
        onScroll={(event) => {
          event.currentTarget.scrollLeft = 0;
        }}
      >
        <motion.div
          style={{ x }}
          className="flex w-max cursor-grab touch-pan-y select-none active:cursor-grabbing"
        >
          <ul ref={trackCopyRef} className="flex">
            {items.map((item, index) => (
              <VitrineItem key={item.slug} item={item} index={index} priority={index < 3} />
            ))}
          </ul>
          {/* Copia visual para el bucle: fuera del árbol de accesibilidad. */}
          <ul className="flex" aria-hidden="true" inert>
            {items.map((item, index) => (
              <VitrineItem
                key={`${item.slug}-copia`}
                item={item}
                index={index}
                priority={index < 3}
              />
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

interface VitrineItemProps {
  item: VitrineCard;
  index: number;
  priority: boolean;
}

function VitrineItem({ item, index, priority }: VitrineItemProps) {
  return (
    <li data-index={index} className="w-52 shrink-0 pr-4 sm:w-64 sm:pr-5 lg:w-72">
      <Link
        href={`/producto/${item.slug}`}
        draggable={false}
        className="group/card relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-noir/70 bg-gradient-to-b from-white/14 via-white/5 to-transparent p-1.5 ring-1 ring-white/15 transition duration-500 hover:-translate-y-2 hover:shadow-glow-rose hover:ring-rose-gold/60"
      >
        <div className="relative aspect-4/5 overflow-hidden rounded-[1.4rem] bg-blush-light">
          {/* Color de espera mientras carga la foto real. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#FDF4EF_0%,#F5D8D0_40%,#E8B8AC_72%,#CE8E7C_100%)]"
          />
          <Image
            src={item.art}
            alt={item.name}
            fill
            priority={priority}
            draggable={false}
            sizes="(max-width: 640px) 55vw, 300px"
            className="object-cover transition-transform duration-700 group-hover/card:scale-108"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-noir/45 to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-y-10 -left-1/2 w-1/3 -rotate-12 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/card:left-[110%] group-hover/card:opacity-100"
          />
          <span className="absolute left-3 top-3 z-10 rounded-full bg-noir/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blush">
            {item.categoryLabel}
          </span>
          {item.badge && (
            <span className="absolute bottom-3 left-3 z-10 rounded-full bg-rose-gold px-2.5 py-1 text-[10px] font-semibold tracking-wide text-noir">
              {item.badge}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-3 pb-3 pt-3.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-blush/70">
            {item.brand}
          </p>
          <p className="mt-1.5 line-clamp-2 font-display text-[0.95rem] leading-snug text-cream">
            {item.name}
          </p>
          <div className="mt-auto flex items-center justify-between pt-3">
            <span className="font-display text-base font-semibold text-rose-gold-light">
              {formatCOP(item.price)}
            </span>
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blush text-noir transition-transform duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5"
            >
              <ArrowUpRight size={15} />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
