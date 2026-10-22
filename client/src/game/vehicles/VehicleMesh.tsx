'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import type { VehicleState } from '@nairobi-pulse/shared';
import { createTextTexture } from '../utils/canvasTexture';

/**
 * Nairobi Matatu (Vibrant Graffiti Minibus)
 */
function MatatuMesh({ graffiti = 'SUPER METRO' }: { graffiti?: string }) {
  const decalTexture = useMemo(
    () =>
      createTextTexture(graffiti, {
        bgColor: '#eab308',
        textColor: '#0a0a0a',
        fontSize: 32,
      }),
    [graffiti]
  );

  return (
    <group>
      {/* Minibus Body Shell */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 2.0, 5.8]} />
        <meshStandardMaterial color="#065f46" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Yellow Kenyan Public Transport Stripe */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[2.34, 0.35, 5.82]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>

      {/* Front Windshield */}
      <mesh position={[0, 1.6, 2.85]} rotation={[-0.2, 0, 0]}>
        <planeGeometry args={[2.0, 0.9]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Side Windows */}
      <mesh position={[1.16, 1.6, 0.3]}>
        <planeGeometry args={[0.02, 0.7]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Roof Luggage Carrier Rack */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[2.1, 0.2, 4.8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Graffiti Route / Slogan Decals */}
      <mesh position={[1.18, 1.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.2, 0.32]} />
        <meshBasicMaterial map={decalTexture || undefined} color="#ffffff" />
      </mesh>
      <mesh position={[-1.18, 1.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.2, 0.32]} />
        <meshBasicMaterial map={decalTexture || undefined} color="#ffffff" />
      </mesh>

      {/* 4 Wheels */}
      {[-1.1, 1.1].map((x, xi) =>
        [-1.8, 1.8].map((z, zi) => (
          <mesh key={`${xi}-${zi}`} position={[x, 0.45, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.3, 16]} />
            <meshStandardMaterial color="#18181b" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Headlights */}
      <mesh position={[-0.8, 0.8, 2.92]}>
        <boxGeometry args={[0.3, 0.2, 0.05]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh position={[0.8, 0.8, 2.92]}>
        <boxGeometry args={[0.3, 0.2, 0.05]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
    </group>
  );
}

/**
 * Politician Armored VIP Prado SUV
 */
function PoliticianSUVMesh({ sirenActive }: { sirenActive: boolean }) {
  const redLightRef = useRef<THREE.PointLight>(null);
  const blueLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!sirenActive) return;
    const t = state.clock.getElapsedTime();
    const flash = Math.sin(t * 16) > 0;
    if (redLightRef.current) redLightRef.current.intensity = flash ? 3 : 0.1;
    if (blueLightRef.current) blueLightRef.current.intensity = !flash ? 3 : 0.1;
  });

  return (
    <group>
      {/* Luxury Black SUV Body */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.5, 4.9]} />
        <meshStandardMaterial color="#09090b" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* Cabin & Tinted Windows */}
      <mesh position={[0, 1.7, -0.3]} castShadow>
        <boxGeometry args={[1.9, 1.0, 2.8]} />
        <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* VIP Siren Lightbar on Roof */}
      <group position={[0, 2.25, -0.3]}>
        <mesh>
          <boxGeometry args={[1.4, 0.12, 0.25]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        {/* Red Flasher */}
        <mesh position={[-0.4, 0, 0]}>
          <boxGeometry args={[0.4, 0.1, 0.22]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <pointLight ref={redLightRef} position={[-0.4, 0.2, 0]} color="#ef4444" distance={10} />
        {/* Blue Flasher */}
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.4, 0.1, 0.22]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
        <pointLight ref={blueLightRef} position={[0.4, 0.2, 0]} color="#3b82f6" distance={10} />
      </group>

      {/* Wheels */}
      {[-1.05, 1.05].map((x, xi) =>
        [-1.5, 1.5].map((z, zi) => (
          <mesh key={`${xi}-${zi}`} position={[x, 0.45, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.32, 16]} />
            <meshStandardMaterial color="#27272a" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  );
}

/**
 * Anti-Riot Police Water Cannon Truck
 */
function PoliceWaterCannonMesh({ sirenActive }: { sirenActive: boolean }) {
  return (
    <group>
      {/* Heavy Armored Chassis */}
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 2.4, 6.8]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
      </mesh>

      {/* Armored Windshield Grill */}
      <mesh position={[0, 2.0, 3.42]}>
        <planeGeometry args={[2.2, 1.0]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>

      {/* Water Turret Cannon on Top */}
      <group position={[0, 2.9, 2.0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.4, 0.6, 12]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        {/* Cannon Barrel */}
        <mesh position={[0, 0.2, 0.8]} rotation={[Math.PI / 2 + 0.2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 1.4, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
      </group>

      {/* Wheels (6-wheel heavy carrier) */}
      {[-1.25, 1.25].map((x, xi) =>
        [-2.2, 0, 2.2].map((z, zi) => (
          <mesh key={`${xi}-${zi}`} position={[x, 0.55, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.38, 16]} />
            <meshStandardMaterial color="#09090b" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
}

/**
 * Universal Vehicle Component
 */
export function VehicleMesh({ vehicle }: { vehicle: VehicleState }) {
  return (
    <RigidBody
      type="fixed"
      position={vehicle.position}
      rotation={vehicle.rotation}
      colliders={false}
    >
      <CuboidCollider args={[1.3, 1.2, 3.2]} position={[0, 1.2, 0]} />

      {vehicle.type === 'matatu' && (
        <MatatuMesh graffiti={vehicle.customGraffiti} />
      )}
      {vehicle.type === 'politician_suv' && (
        <PoliticianSUVMesh sirenActive={vehicle.sirenActive} />
      )}
      {vehicle.type === 'police_truck' && (
        <PoliceWaterCannonMesh sirenActive={vehicle.sirenActive} />
      )}
    </RigidBody>
  );
}
