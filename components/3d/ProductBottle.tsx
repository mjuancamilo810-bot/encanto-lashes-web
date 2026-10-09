"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";

interface ProductBottleProps {
  scale: number;
}

/**
 * Geometría original de un frasco de pegamento — no es una reproducción
 * de foto/render de terceros, sino primitivas de Three.js compuestas.
 */
export function ProductBottle({ scale }: ProductBottleProps) {
  const groupRef = useRef<Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.25;

    const maxTilt = (8 * Math.PI) / 180;
    const targetX = -pointer.y * maxTilt;
    const targetZ = pointer.x * maxTilt;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.06;
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.06;

    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      {/* Cuerpo del frasco */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.5, 1.1, 32]} />
        <meshPhysicalMaterial
          color="#d9a574"
          roughness={0.08}
          metalness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
      {/* Base con tono más profundo, simula el gradiente rose-gold -> rose-gold-light */}
      <mesh position={[0, -0.62, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.48, 0.2, 32]} />
        <meshPhysicalMaterial
          color="#c08552"
          roughness={0.12}
          metalness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>
      {/* Cuello */}
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.2, 32]} />
        <meshPhysicalMaterial
          color="#d9a574"
          roughness={0.08}
          metalness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
      {/* Tapa, tono más oscuro para contraste */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.32, 32]} />
        <meshPhysicalMaterial
          color="#1a1613"
          roughness={0.18}
          metalness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </mesh>
    </group>
  );
}
