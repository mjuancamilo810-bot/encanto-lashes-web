import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "default" | "compact" | "light" | "dark";
  className?: string;
}

/**
 * Único punto de referencia al archivo de logo. Cuando la dueña tenga el
 * archivo real, basta reemplazar los SVG en /public — no hay que tocar
 * ningún otro componente. Ver README, sección "Reemplazar el logo".
 *
 * Variantes: "default" es el badge completo a color (vertical, fiel a la
 * composición del logo real — para contextos con espacio, ej. redes
 * sociales). "compact" es el mismo lockup a color pero horizontal, para
 * la navbar. "light"/"dark" son versiones de una sola línea para fondos
 * oscuros/claros con poco espacio (footer).
 */
const SRC = {
  default: "/logo.svg",
  compact: "/logo-compact.svg",
  light: "/logo-light.svg",
  dark: "/logo-dark.svg",
};

const DIMENSIONS = {
  default: { width: 87, height: 100 },
  compact: { width: 165, height: 50 },
  light: { width: 150, height: 56 },
  dark: { width: 150, height: 56 },
};

export function Logo({ variant = "default", className }: LogoProps) {
  // El badge vertical ("default") se dimensiona por alto; los lockups
  // horizontales (compact/light/dark) se dimensionan por ancho.
  const sizeClassName = variant === "default" ? "h-full w-auto" : "w-full h-auto";
  return (
    <Link href="/" className={className} aria-label="Encanto Lashes, ir al inicio">
      <Image
        src={SRC[variant]}
        alt="Encanto Lashes"
        width={DIMENSIONS[variant].width}
        height={DIMENSIONS[variant].height}
        priority
        className={sizeClassName}
      />
    </Link>
  );
}
