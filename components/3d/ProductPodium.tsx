"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { ProductBottle } from "./ProductBottle";
import { GoldParticles } from "./GoldParticles";
import { ProductPodiumFallback } from "./ProductPodiumFallback";
import { Scene3DErrorBoundary } from "./Scene3DErrorBoundary";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

function subscribeResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getIsNarrowViewport() {
  return window.innerWidth < 640;
}

function getServerIsNarrowViewport() {
  return false;
}

/**
 * Hero "producto sobre nube": el mismo lenguaje visual de fotografía de
 * lujo en perfumería/cosmética (Rare Beauty, Charlotte Tilbury), pero
 * construido 100% con Three.js — no es una foto de stock.
 */
export function ProductPodium() {
  const { canRender3D } = useDeviceCapability();
  const isNarrow = useSyncExternalStore(
    subscribeResize,
    getIsNarrowViewport,
    getServerIsNarrowViewport
  );
  const particleCount = isNarrow ? 40 : 100;
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const progress = Math.min(1, Math.max(0, window.scrollY / 500));
        setScrollProgress(progress);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!canRender3D) {
    return <ProductPodiumFallback />;
  }

  return (
    <div className="relative mx-auto h-[420px] w-full max-w-md sm:h-[520px]">
      {/* Nube / podio en CSS puro, debajo del canvas — capas densas para el efecto "algodón" */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream/70 blur-3xl" />
        <div className="absolute bottom-16 left-1/2 h-44 w-80 -translate-x-1/2 rounded-full bg-blush-light/80 blur-3xl" />
        <div className="absolute bottom-6 left-1/4 h-28 w-44 -translate-x-1/2 rounded-full bg-blush/70 blur-2xl motion-safe:animate-float" />
        <div
          className="absolute bottom-10 right-1/4 h-24 w-40 translate-x-1/2 rounded-full bg-pink/40 blur-2xl motion-safe:animate-float"
          style={{ animationDelay: "1.2s" }}
        />
        <div
          className="absolute bottom-4 left-2/3 h-20 w-32 -translate-x-1/2 rounded-full bg-cream/90 blur-2xl motion-safe:animate-float"
          style={{ animationDelay: "0.6s" }}
        />
        <div className="absolute bottom-8 left-1/2 h-8 w-56 -translate-x-1/2 rounded-full bg-gradient-to-b from-blush to-cream opacity-80 shadow-glow-rose" />
      </div>

      <Scene3DErrorBoundary fallback={<ProductPodiumFallback />}>
        <Canvas
          camera={{ position: [0, 0.2, 3.4], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 1.5]}
          className="relative z-10"
        >
          <ambientLight intensity={0.45} color="#fbf3f0" />
          <pointLight position={[2, 2.5, 2]} intensity={1.4} color="#d9a574" />
          <pointLight position={[-2, -1, 1]} intensity={0.35} color="#e8a9b8" />
          <pointLight position={[0, 0.4, 2.6]} intensity={0.5} color="#fbf3f0" />

          <ProductBottle scale={1 - scrollProgress * 0.4} />
          <GoldParticles count={particleCount} dispersion={scrollProgress} />
        </Canvas>
      </Scene3DErrorBoundary>
    </div>
  );
}
