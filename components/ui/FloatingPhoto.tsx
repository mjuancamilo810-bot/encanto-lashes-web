import Image from "next/image";
import { cn } from "@/lib/utils";

interface FloatingPhotoProps {
  src: string;
  /** Posición y tamaño: lo decide cada sección (incluye visibilidad por breakpoint). */
  className?: string;
  /** Recorte: permite que una misma foto se lea distinta en secciones distintas. */
  objectPosition?: string;
  /** Desfase de la flotación, para que varias no suban y bajen sincronizadas. */
  delay?: string;
  /** Inclinación sutil, en grados. */
  rotate?: number;
  /** Aro claro sobre fondo oscuro, o aro rosado sobre fondo claro. */
  tone?: "light" | "dark";
}

/**
 * Foto decorativa que flota junto al contenido. Es puramente ambiental:
 * queda fuera del árbol de accesibilidad y nunca intercepta clics, así que
 * puede posicionarse encima de cualquier sección sin romper su interacción.
 */
export function FloatingPhoto({
  src,
  className,
  objectPosition = "center",
  delay = "0s",
  rotate = 0,
  tone = "light",
}: FloatingPhotoProps) {
  return (
    // La rotación va en el contenedor y la flotación en el hijo: el keyframe
    // anima `transform`, así que si compartieran elemento la animación
    // sobrescribiría la inclinación.
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute select-none opacity-80", className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-[2rem] shadow-glow-rose ring-1 motion-safe:animate-float",
          tone === "dark" ? "ring-blush/25" : "ring-rose-gold/25"
        )}
        style={{ animationDelay: delay }}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 1024px) 40vw, 320px"
          className="object-cover"
          style={{ objectPosition }}
        />
        {/* Velo de marca para que la foto no compita con el texto de la sección. */}
        <span
          className={cn(
            "absolute inset-0",
            tone === "dark"
              ? "bg-gradient-to-t from-noir/70 via-noir/20 to-transparent"
              : "bg-gradient-to-t from-cream/55 via-transparent to-transparent"
          )}
        />
      </div>
    </div>
  );
}
