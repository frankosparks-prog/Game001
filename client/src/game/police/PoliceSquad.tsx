'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

/**
 * 3D Anti-Riot Police Officer Mesh
 * Armed with tactical riot helmet, protective visor, polycarbonate riot shield, and baton.
 */
function RiotPoliceOfficer({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const shieldRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!shieldRef.current) return;
    const t = state.clock.getElapsedTime();
    // Subtle rhythmic shield bracing
    shieldRef.current.position.z = Math.sin(t * 2 + position[0]) * 0.02;
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Heavy Boots */}
      <mesh position={[-0.14, 0.1, 0]} castShadow>
        <boxGeometry args={[0.14, 0.2, 0.26]} />
        <meshStandardMaterial color="#09090b" roughness={0.9} />
      </mesh>
      <mesh position={[0.14, 0.1, 0]} castShadow>
        <boxGeometry args={[0.14, 0.2, 0.26]} />
        <meshStandardMaterial color="#09090b" roughness={0.9} />
      </mesh>

      {/* Navy Blue Tactical Pants with Knee Pads */}
      <mesh position={[-0.14, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.065, 0.55, 10]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[0.14, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.065, 0.55, 10]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      {/* Black Knee Protective Pads */}
      <mesh position={[-0.14, 0.42, 0.07]}>
        <boxGeometry args={[0.1, 0.12, 0.04]} />
        <meshStandardMaterial color="#09090b" roughness={0.5} />
      </mesh>
      <mesh position={[0.14, 0.42, 0.07]}>
        <boxGeometry args={[0.1, 0.12, 0.04]} />
        <meshStandardMaterial color="#09090b" roughness={0.5} />
      </mesh>

      {/* Torso & Tactical Bulletproof Riot Vest */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.48, 0.6, 0.28]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
      {/* "POLICE" reflective white stencil on chest */}
      <mesh position={[0, 1.15, 0.15]}>
        <planeGeometry args={[0.26, 0.08]} />
        <meshBasicMaterial color="#e2e8f0" />
      </mesh>

      {/* Police Head & Riot Helmet */}
      <group position={[0, 1.48, 0]}>
        {/* Head */}
        <mesh castShadow>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#452718" roughness={0.8} />
        </mesh>
        {/* Glossy Black Riot Helmet */}
        <mesh position={[0, 0.04, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
          <meshStandardMaterial color="#09090b" roughness={0.2} metalness={0.4} />
        </mesh>
        {/* Transparent Polycarbonate Helmet Visor */}
        <mesh position={[0, -0.02, 0.1]} rotation={[0.1, 0, 0]}>
          <planeGeometry args={[0.24, 0.14]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transparent
            opacity={0.45}
            roughness={0.1}
            transmission={0.8}
            thickness={0.02}
          />
        </mesh>
      </group>

      {/* Left Arm Holding Transparent Riot Shield */}
      <group ref={shieldRef} position={[-0.15, 0.95, 0.32]}>
        {/* Clear Polycarbonate Anti-Riot Shield */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.65, 1.3, 0.02]} />
          <meshPhysicalMaterial
            color="#94a3b8"
            transparent
            opacity={0.65}
            roughness={0.15}
            transmission={0.7}
            thickness={0.03}
          />
        </mesh>
        {/* Heavy Shield Metal Trim */}
        <mesh position={[0, 0, 0.015]}>
          <boxGeometry args={[0.67, 0.04, 0.02]} />
          <meshStandardMaterial color="#09090b" metalness={0.7} />
        </mesh>
        {/* Police Shield Insignia Stencil */}
        <mesh position={[0, 0.25, 0.015]}>
          <planeGeometry args={[0.3, 0.12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Right Arm Holding Tactical Baton */}
      <group position={[0.3, 0.9, 0]} rotation={[0.4, 0, -0.2]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.045, 0.4, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Baton */}
        <mesh position={[0, -0.4, 0.1]} rotation={[0.6, 0, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.65, 8]} />
          <meshStandardMaterial color="#09090b" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * PoliceSquad Formation
 * Creates a coordinated anti-riot blockade across Parliament Road with real Rapier physics collision.
 */
export function PoliceSquad() {
  // Police line positions blocking Parliament Road at Z = -22
  const officerPositions: [number, number, number][] = [
    [-9, 0, -22],
    [-7.5, 0, -22],
    [-6, 0, -22],
    [-4.5, 0, -22],
    [-3, 0, -22],
    [-1.5, 0, -22],
    [0, 0, -22],
    [1.5, 0, -22],
    [3, 0, -22],
    [4.5, 0, -22],
    [6, 0, -22],
    [7.5, 0, -22],
    [9, 0, -22],
  ];

  return (
    <group>
      {/* Physical Choke Point Barrier Collider */}
      <RigidBody type="fixed" colliders={false} position={[0, 0, -22]}>
        <CuboidCollider args={[10.5, 1.8, 0.6]} position={[0, 1.0, 0]} />
      </RigidBody>

      {/* 13 Riot Police Officers in Phalanx Formation */}
      {officerPositions.map((pos, idx) => (
        <RiotPoliceOfficer key={idx} position={pos} rotation={[0, 0, 0]} />
      ))}
    </group>
  );
}
