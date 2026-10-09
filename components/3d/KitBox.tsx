"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Group } from "three";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

interface KitBoxSceneProps {
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

function KitBoxScene({ triggerRef }: KitBoxSceneProps) {
  const lidRef = useRef<Group>(null);

  useEffect(() => {
    if (!lidRef.current || !triggerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.to(lidRef.current!.rotation, {
        x: -1.85,
        ease: "none",
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top 75%",
          end: "top 25%",
          scrub: 0.6,
        },
      });
    });

    return () => ctx.revert();
  }, [triggerRef]);

  return (
    <>
      <ambientLight intensity={0.5} color="#fbf3f0" />
      <pointLight position={[2, 3, 2]} intensity={1} color="#d9a574" />
      <pointLight position={[-2, -1, 2]} intensity={0.35} color="#e8a9b8" />

      <group position={[0, -0.3, 0]}>
        {/* Base de la caja */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[1.4, 0.7, 1]} />
          <meshPhysicalMaterial color="#1a1613" roughness={0.35} metalness={0.15} clearcoat={0.6} />
        </mesh>

        {/* Contenido miniatura, revelado al abrir la tapa */}
        <mesh position={[-0.35, 0.28, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
          <meshPhysicalMaterial color="#e8a9b8" roughness={0.2} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0.24, 0.1]}>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshPhysicalMaterial color="#d9a574" roughness={0.15} metalness={0.2} clearcoat={1} />
        </mesh>
        <mesh position={[0.35, 0.26, -0.05]}>
          <boxGeometry args={[0.22, 0.32, 0.12]} />
          <meshPhysicalMaterial color="#c08552" roughness={0.2} clearcoat={1} />
        </mesh>

        {/* Tapa, pivota desde el borde trasero */}
        <group ref={lidRef} position={[0, 0.2, -0.5]}>
          <mesh position={[0, 0, 0.5]}>
            <boxGeometry args={[1.42, 0.12, 1.02]} />
            <meshPhysicalMaterial color="#c08552" roughness={0.2} metalness={0.1} clearcoat={1} clearcoatRoughness={0.1} />
          </mesh>
        </group>
      </group>
    </>
  );
}

/** Acento 3D secundario: caja que se abre al hacer scroll, revela contenido miniatura. */
export function KitBox() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { canRender3D } = useDeviceCapability();

  if (!canRender3D) {
    return (
      <div
        ref={wrapperRef}
        className="mx-auto h-64 w-full max-w-sm rounded-3xl bg-gradient-to-b from-rose-gold/30 to-noir/60 shadow-glow-rose"
        aria-hidden="true"
      />
    );
  }

  return (
    <div ref={wrapperRef} className="mx-auto h-64 w-full max-w-sm sm:h-80">
      <Canvas camera={{ position: [1.6, 1.4, 2.4], fov: 42 }} dpr={[1, 1.5]}>
        <KitBoxScene triggerRef={wrapperRef} />
      </Canvas>
    </div>
  );
}
