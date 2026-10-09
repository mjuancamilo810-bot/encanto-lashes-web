import Link from "next/link";
import { Logo } from "./Logo";
import { categories, techniques } from "@/lib/categories";

const GLOSSARY = [
  ...techniques.map((t) => t.name),
  "Nagaraku",
  "Sky Glue",
  "Stacy Lash",
  "BrowXenna",
  ...categories.map((c) => c.shortName),
  "Kits mayoristas",
];

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 2h-3v13.2a2.8 2.8 0 1 1-2-2.68V9.4a5.8 5.8 0 1 0 5 5.75V8.9a7.4 7.4 0 0 0 4.5 1.53v-3a4.4 4.4 0 0 1-4.5-4.43z" />
    </svg>
  );
}

const NAV_COLUMN = [
  { label: "Tienda", href: "/tienda" },
  { label: "Para Lashistas", href: "/para-lashistas" },
  { label: "Contacto", href: "/contacto" },
  { label: "Carrito", href: "/carrito" },
];

export function Footer() {
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "@encantolashes";
  const tiktok = process.env.NEXT_PUBLIC_TIKTOK_HANDLE ?? "@encantolashes";

  return (
    <footer className="bg-noir text-blush">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap gap-x-2 gap-y-1 border-b border-blush/15 pb-6 text-xs text-blush/70">
          {GLOSSARY.map((term, i) => (
            <span key={term}>
              {term}
              {i < GLOSSARY.length - 1 && <span className="mx-2 text-blush/30">·</span>}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-3">
          <div>
            <Logo variant="light" className="w-36" />
            <p className="mt-4 max-w-xs text-sm text-blush/70">
              Pestañas · Maquillaje · Accesorios. Tienda de belleza y estudio de
              extensiones de pestañas en Medellín, con envíos a toda Colombia.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href={`https://instagram.com/${instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Encanto Lashes"
                className="rounded-full bg-blush/10 p-2 hover:bg-blush/20"
              >
                <InstagramIcon />
              </a>
              <a
                href={`https://tiktok.com/${tiktok.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok de Encanto Lashes"
                className="rounded-full bg-blush/10 p-2 hover:bg-blush/20"
              >
                <TikTokIcon />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-blush/90">
              Navegación
            </h3>
            <ul className="mt-3 space-y-2">
              {NAV_COLUMN.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-blush/70 hover:text-blush">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-blush/90">
              Contacto
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-blush/70">
              <li>Medellín, Antioquia, Colombia</li>
              <li>Envíos a todo el país</li>
              <li>
                <Link href="/contacto" className="hover:text-blush">
                  Escríbenos por WhatsApp
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="border-t border-blush/15 py-4 text-center text-xs text-blush/50">
          © {new Date().getFullYear()} Encanto Lashes. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
