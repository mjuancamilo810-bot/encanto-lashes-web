"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, ShoppingBag, X } from "lucide-react";
import { Logo } from "./Logo";
import { categories } from "@/lib/categories";
import { useCartStore, cartCount } from "@/lib/cart";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const PRIMARY_LINKS = [
  { label: "Pestañas y cejas", href: "/tienda?categoria=pestanas-cejas" },
  { label: "Maquillaje", href: "/tienda?categoria=maquillaje" },
  { label: "Skincare", href: "/tienda?categoria=skincare" },
  { label: "Cabello", href: "/tienda?categoria=cabello" },
];

const MORE_LINKS = [
  ...categories
    .filter((c) => !["pestanas-cejas", "maquillaje", "skincare", "cabello"].includes(c.slug))
    .map((c) => ({ label: c.shortName, href: `/tienda?categoria=${c.slug}` })),
  { label: "Kits y sets de regalo", href: "/tienda?tag=kit" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const lines = useCartStore((s) => s.lines);
  const openCart = useCartStore((s) => s.open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 transition-all",
        scrolled ? "bg-cream/80 shadow-sm backdrop-blur-md" : "bg-cream"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo variant="compact" className="w-32 shrink-0 sm:w-40" />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Categorías principales">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-noir/85 hover:text-noir"
            >
              {link.label}
            </Link>
          ))}

          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              className="flex items-center gap-1 text-sm font-medium text-noir/85 hover:text-noir"
            >
              Más <ChevronDown size={15} className={cn("transition-transform", moreOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 top-full mt-2 grid w-56 -translate-x-1/2 grid-cols-1 gap-1 rounded-2xl bg-white p-3 shadow-glow-rose ring-1 ring-blush"
                >
                  {MORE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm text-noir hover:bg-blush-light"
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/para-lashistas" className="text-sm font-medium text-noir/85 hover:text-noir">
            Para Lashistas
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full p-2 text-noir hover:bg-blush-light focus-visible:outline-rose-gold"
            aria-label="Abrir carrito"
          >
            <ShoppingBag size={20} />
            {cartCount(lines) > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-noir text-[10px] font-semibold text-blush">
                {cartCount(lines)}
              </span>
            )}
          </button>

          <a
            href={whatsappLink("Hola, quiero reservar mi cita en Encanto Lashes")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-noir px-4 py-2 text-sm font-medium text-blush hover:bg-noir/85 sm:inline-block"
          >
            Reserva tu cita
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-full p-2 text-noir hover:bg-blush-light lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-cream lg:hidden"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <Logo variant="compact" className="w-32" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 text-noir hover:bg-blush-light"
                aria-label="Cerrar menú"
              >
                <X size={22} />
              </button>
            </div>
            <motion.nav
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="flex flex-col gap-1 px-6 py-4"
            >
              {[...PRIMARY_LINKS, ...MORE_LINKS, { label: "Para Lashistas", href: "/para-lashistas" }].map(
                (link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="border-b border-blush py-3 text-base font-medium text-noir"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <a
                href={whatsappLink("Hola, quiero reservar mi cita en Encanto Lashes")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 rounded-full bg-noir px-5 py-3 text-center text-sm font-medium text-blush"
              >
                Reserva tu cita
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
