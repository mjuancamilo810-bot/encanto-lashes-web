/** Fallback CSS puro: mismo mood (nube + brillo dorado) sin WebGL. Usado si Three.js falla o el dispositivo es de gama baja. */
export function ProductPodiumFallback() {
  return (
    <div
      className="relative mx-auto flex h-[420px] w-full max-w-md items-center justify-center sm:h-[520px]"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream/70 blur-3xl" />
      <div className="absolute bottom-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-blush-light/80 blur-3xl" />
      <div className="absolute bottom-10 left-1/3 h-24 w-40 -translate-x-1/2 rounded-full bg-blush/70 blur-2xl motion-safe:animate-float" />
      <div
        className="absolute bottom-12 right-1/4 h-20 w-36 translate-x-1/2 rounded-full bg-pink/40 blur-2xl motion-safe:animate-float"
        style={{ animationDelay: "1.2s" }}
      />

      <div className="absolute bottom-10 left-1/2 h-8 w-56 -translate-x-1/2 rounded-full bg-gradient-to-b from-blush to-cream opacity-80 shadow-glow-rose" />

      <div className="relative z-10 flex flex-col items-center motion-safe:animate-float">
        <div className="h-8 w-20 rounded-t-lg bg-noir/90" />
        <div className="h-40 w-28 rounded-2xl bg-gradient-to-b from-rose-gold-light to-rose-gold shadow-glow-rose" />
      </div>

      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-rose-gold-light motion-safe:animate-twinkle"
          style={{
            top: `${15 + i * 12}%`,
            left: `${20 + ((i * 37) % 60)}%`,
            animationDelay: `${i * 0.35}s`,
          }}
        />
      ))}
    </div>
  );
}
