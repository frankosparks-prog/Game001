'use client';

import React, { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../state/useGameStore';
import { soundManager } from '../audio/soundManager';

interface TeargasCloudData {
  id: string;
  position: [number, number, number];
  radius: number;
}

/**
 * Volumetric Smoke Particle Cloud for a Teargas Canister
 */
function SmokePuff({ position, radius }: { position: [number, number, number]; radius: number }) {
  const particlesRef = useRef<THREE.Points>(null);

  // Generate particle positions within the cloud volume
  const { positions } = useMemo(() => {
    const count = 50;
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = Math.pow(Math.random(), 0.5) * radius;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.random() * 2.8 + 0.2;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    return { positions: pos };
  }, [radius]);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const t = state.clock.getElapsedTime();
    particlesRef.current.rotation.y = t * 0.12;
  });

  return (
    <group position={position}>
      {/* Metallic Teargas canister shell on the ground */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.35, 12]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Billowing Volumetric Smoke Spheres */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[radius * 0.75, 16, 16]} />
        <meshStandardMaterial
          color="#cbd5e1"
          transparent
          opacity={0.38}
          roughness={1}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.6, 1.8, 0.4]}>
        <sphereGeometry args={[radius * 0.6, 14, 14]} />
        <meshStandardMaterial
          color="#e2e8f0"
          transparent
          opacity={0.28}
          roughness={1}
          depthWrite={false}
        />
      </mesh>

      {/* Swirling Smoke Micro-Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={50}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#e2e8f0" size={0.3} transparent opacity={0.35} depthWrite={false} />
      </points>
    </group>
  );
}

/**
 * Animated Flying Teargas Canister Projectile
 * Flies in an arc from the police phalanx line into the crowd, landing with a thump.
 */
function FlyingCanister({
  startPos,
  targetPos,
  cycleDuration = 6.0,
  timeOffset = 0,
}: {
  startPos: [number, number, number];
  targetPos: [number, number, number];
  cycleDuration?: number;
  timeOffset?: number;
}) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = (state.clock.getElapsedTime() + timeOffset) % cycleDuration;
    const flightTime = 1.8; // Takes 1.8s to land

    if (t < flightTime) {
      const progress = t / flightTime;
      const x = startPos[0] + (targetPos[0] - startPos[0]) * progress;
      const z = startPos[2] + (targetPos[2] - startPos[2]) * progress;
      // Parabolic arc
      const y = startPos[1] + (targetPos[1] - startPos[1]) * progress + Math.sin(progress * Math.PI) * 6.5;

      meshRef.current.position.set(x, y, z);
      meshRef.current.rotation.x += 0.25;
      meshRef.current.rotation.z += 0.15;
      meshRef.current.visible = true;
    } else {
      // Landed on ground
      meshRef.current.position.set(targetPos[0], targetPos[1] + 0.1, targetPos[2]);
      meshRef.current.visible = true;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.32, 10]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Red canister band */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.06, 10]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

/**
 * TeargasSystem
 * Coordinates active teargas hazards in Nairobi CBD, ballistic launches from police lines, and player exposure.
 */
export function TeargasSystem() {
  const { position: playerPos, takeTeargasDamage } = useGameStore();

  // Active teargas smoke canisters in CBD hot spots
  const canisters: TeargasCloudData[] = useMemo(
    () => [
      { id: 'tg_parliament_gate', position: [0, 0, -14], radius: 7.0 },
      { id: 'tg_left_roadblock', position: [-8, 0, -7], radius: 6.0 },
      { id: 'tg_right_roadblock', position: [9, 0, -5], radius: 5.5 },
      { id: 'tg_intersection', position: [-3, 0, 5], radius: 6.5 },
    ],
    []
  );

  // Proximity damage checking loop
  useFrame((_, delta) => {
    let insideSmoke = false;

    canisters.forEach((canister) => {
      const dx = playerPos[0] - canister.position[0];
      const dz = playerPos[2] - canister.position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < canister.radius) {
        insideSmoke = true;
        // Exposure builds up faster the closer player is to center
        const exposureRate = (1 - dist / canister.radius) * 16 * delta;
        takeTeargasDamage(exposureRate);
      }
    });

    if (insideSmoke && Math.random() < 0.007) {
      soundManager.playTeargasLaunch();
    }
  });

  return (
    <group>
      {/* Billowing Smoke Puffs */}
      {canisters.map((c) => (
        <SmokePuff key={c.id} position={c.position} radius={c.radius} />
      ))}

      {/* Ballistic Teargas Canisters launched from Police Line (-22) into Street */}
      <FlyingCanister
        startPos={[4, 1.8, -22]}
        targetPos={[-3, 0, 5]}
        cycleDuration={7}
        timeOffset={0}
      />
      <FlyingCanister
        startPos={[-5, 1.8, -22]}
        targetPos={[-8, 0, -7]}
        cycleDuration={8}
        timeOffset={3}
      />
      <FlyingCanister
        startPos={[0, 1.8, -22]}
        targetPos={[0, 0, -14]}
        cycleDuration={6.5}
        timeOffset={1.5}
      />
    </group>
  );
}
