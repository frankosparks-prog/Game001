'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

/**
 * Animated High-Pressure Water Cannon Stream
 * Creates an animated parabolic arc of water droplets shooting from the turret to the street.
 */
function WaterJetStream({ origin, target }: { origin: [number, number, number]; target: [number, number, number] }) {
  const pointsRef = useRef<THREE.Points>(null);
  const splashRef = useRef<THREE.Mesh>(null);

  // Pre-calculate trajectory offsets for 60 particles
  const particleCount = 70;
  const { positions, randomOffsets } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const rand = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      rand[i * 3] = (Math.random() - 0.5) * 0.4;
      rand[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      rand[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    return { positions: pos, randomOffsets: rand };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < particleCount; i++) {
      // Progress along arc (0 to 1) with loop
      const progress = ((t * 2.5 + i / particleCount) % 1);
      
      // Parabolic ballistic trajectory
      const curX = origin[0] + (target[0] - origin[0]) * progress + randomOffsets[i * 3] * progress;
      const curZ = origin[2] + (target[2] - origin[2]) * progress + randomOffsets[i * 3 + 2] * progress;
      // Arc height formula
      const arcHeight = Math.sin(progress * Math.PI) * 4.0;
      const curY = origin[1] + (target[1] - origin[1]) * progress + arcHeight + randomOffsets[i * 3 + 1] * progress;

      posAttr.setXYZ(i, curX, curY, curZ);
    }
    posAttr.needsUpdate = true;

    // Splash ripple on ground
    if (splashRef.current) {
      splashRef.current.scale.setScalar(1 + Math.sin(t * 12) * 0.3);
    }
  });

  return (
    <group>
      {/* High velocity water droplets */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#38bdf8"
          size={0.22}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </points>

      {/* Ground Water Splash Ring at target impact point */}
      <mesh ref={splashRef} position={[target[0], 0.05, target[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 1.8, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Animated Anti-Riot Water Cannon Truck
 */
export function WaterCannonPatrol({ position = [0, 0, -29] }: { position?: [number, number, number] }) {
  const turretRef = useRef<THREE.Group>(null);
  const redLightRef = useRef<THREE.PointLight>(null);
  const blueLightRef = useRef<THREE.PointLight>(null);

  // Dynamic target position where water jet is aimed
  const [jetTarget, setJetTarget] = React.useState<[number, number, number]>([0, 0, -16]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Turret smoothly sweeps back and forth across Parliament Road
    const sweepAngle = Math.sin(t * 0.8) * 0.55;
    if (turretRef.current) {
      turretRef.current.rotation.y = sweepAngle;
    }

    // Target sweep position
    const targetX = Math.sin(t * 0.8) * 9.0;
    setJetTarget([targetX, 0, -16]);

    // Flashing emergency strobe lights
    const flash = Math.sin(t * 18) > 0;
    if (redLightRef.current) redLightRef.current.intensity = flash ? 3.5 : 0.2;
    if (blueLightRef.current) blueLightRef.current.intensity = !flash ? 3.5 : 0.2;
  });

  return (
    <group position={position}>
      {/* Heavy Rapier Physics Body for Truck */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1.5, 1.8, 3.8]} position={[0, 1.8, 0]} />

        {/* Heavy Armored Dark Blue Chassis */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.0, 2.6, 7.6]} />
          <meshStandardMaterial color="#0f2b5c" roughness={0.5} metalness={0.4} />
        </mesh>

        {/* Cab Roof Wire Mesh / Protective Cage */}
        <mesh position={[0, 3.2, 1.2]} castShadow>
          <boxGeometry args={[2.8, 0.4, 2.2]} />
          <meshStandardMaterial color="#1e293b" wireframe />
        </mesh>

        {/* Heavy Steel Bull Bar on front bumper */}
        <mesh position={[0, 1.0, 3.9]} castShadow>
          <boxGeometry args={[3.2, 0.9, 0.3]} />
          <meshStandardMaterial color="#09090b" metalness={0.8} />
        </mesh>

        {/* Red & Blue Emergency Strobe Bar */}
        <group position={[0, 3.45, 1.0]}>
          <pointLight ref={redLightRef} position={[-0.8, 0.2, 0]} color="#ef4444" distance={15} />
          <pointLight ref={blueLightRef} position={[0.8, 0.2, 0]} color="#3b82f6" distance={15} />
        </group>

        {/* 6 Heavy Armored Wheels */}
        {[-1.55, 1.55].map((x, xi) =>
          [-2.4, 0, 2.4].map((z, zi) => (
            <mesh key={`${xi}-${zi}`} position={[x, 0.65, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.65, 0.65, 0.45, 16]} />
              <meshStandardMaterial color="#09090b" roughness={0.9} />
            </mesh>
          ))
        )}
      </RigidBody>

      {/* Articulated Roof Water Cannon Turret */}
      <group ref={turretRef} position={[0, 3.3, 1.4]}>
        {/* Turret Base Mount */}
        <mesh castShadow>
          <cylinderGeometry args={[0.45, 0.55, 0.6, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Dual High Pressure Barrels */}
        <mesh position={[0.15, 0.25, 0.9]} rotation={[Math.PI / 2 + 0.22, 0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 1.8, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        <mesh position={[-0.15, 0.25, 0.9]} rotation={[Math.PI / 2 + 0.22, 0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 1.8, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
      </group>

      {/* Active High Pressure Water Stream blasting onto street */}
      <WaterJetStream
        origin={[position[0], position[1] + 3.6, position[2] + 2.2]}
        target={jetTarget}
      />
    </group>
  );
}
