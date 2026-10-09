"use client";

import { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function makeCircleTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function makeStarTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;
  const cy = size / 2;
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 4;
  const outerR = size / 2;
  const innerR = size / 6;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / spikes) * i;
    ctx.lineTo(r * Math.sin(angle), -r * Math.cos(angle));
  }
  ctx.closePath();
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, outerR);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0.1)");
  ctx.fillStyle = gradient;
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

interface GoldParticlesProps {
  count: number;
  spread?: number;
  dispersion: number;
}

const STAR_COUNT = 7;

export function GoldParticles({ count, spread = 2.6, dispersion }: GoldParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const starsRef = useRef<THREE.Points>(null);

  const circleTexture = useMemo(() => makeCircleTexture(), []);
  const starTexture = useMemo(() => makeStarTexture(), []);

  // Callback refs: se ejecutan al montar/actualizar el nodo (fase de commit,
  // no de render), así que generar posiciones con Math.random() aquí no
  // viola las reglas de pureza de render ni de inmutabilidad de hooks.
  const setPointsGeometry = useCallback(
    (geometry: THREE.BufferGeometry | null) => {
      if (!geometry) return;
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        arr[i * 3] = (Math.random() - 0.5) * spread;
        arr[i * 3 + 1] = (Math.random() - 0.5) * spread * 1.3;
        arr[i * 3 + 2] = (Math.random() - 0.5) * spread;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    },
    [count, spread]
  );

  const setStarsGeometry = useCallback(
    (geometry: THREE.BufferGeometry | null) => {
      if (!geometry) return;
      const arr = new Float32Array(STAR_COUNT * 3);
      for (let i = 0; i < STAR_COUNT; i++) {
        arr[i * 3] = (Math.random() - 0.5) * spread * 1.1;
        arr[i * 3 + 1] = (Math.random() - 0.5) * spread * 1.1;
        arr[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.6;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    },
    [spread]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.04;
      pointsRef.current.scale.setScalar(1 + dispersion * 0.8);
    }
    if (starsRef.current) {
      starsRef.current.rotation.y = -t * 0.06;
      starsRef.current.scale.setScalar(1 + dispersion);
      const material = starsRef.current.material as THREE.PointsMaterial;
      material.opacity = 0.85 * (1 - dispersion * 0.6) + 0.15;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry ref={setPointsGeometry} />
        <pointsMaterial
          size={0.05}
          map={circleTexture}
          transparent
          opacity={0.9}
          color="#d9a574"
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <points ref={starsRef}>
        <bufferGeometry ref={setStarsGeometry} />
        <pointsMaterial
          size={0.16}
          map={starTexture}
          transparent
          opacity={0.85}
          color="#d9a574"
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
