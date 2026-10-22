'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { createTextTexture } from '../utils/canvasTexture';

/**
 * Animated Driving Matatu (Nairobi Minibus)
 * Drives along a designated lane, loops around CBD, wheels rotate realistically.
 */
function DrivingMatatu({ initialZ, speed = 8.0, laneX = -12, routeName = 'SUPER METRO' }: { initialZ: number; speed?: number; laneX?: number; routeName?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const currentZ = useRef(initialZ);

  const matatuTexture = React.useMemo(
    () =>
      createTextTexture(routeName, {
        bgColor: '#eab308',
        textColor: '#0a0a0a',
        fontSize: 34,
        borderColor: '#065f46',
      }),
    [routeName]
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Advance position along Z axis
    currentZ.current += speed * delta;
    if (currentZ.current > 75) {
      currentZ.current = -55; // Loop back
    }
    groupRef.current.position.z = currentZ.current;

    // Rotate wheels based on distance traveled
    const wheelRotDelta = (speed * delta) / 0.45;
    wheelsRef.current.forEach((wheel) => {
      if (wheel) wheel.rotation.x += wheelRotDelta;
    });
  });

  return (
    <group ref={groupRef} position={[laneX, 0, initialZ]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1.3, 1.2, 3.2]} position={[0, 1.3, 0]} />

        {/* Minibus Chassis */}
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 2.1, 6.0]} />
          <meshStandardMaterial color="#065f46" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Yellow Route Stripe */}
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[2.44, 0.45, 6.02]} />
          <meshStandardMaterial color="#eab308" />
        </mesh>

        {/* Side Route Decal */}
        <mesh position={[1.23, 1.05, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.6, 0.4]} />
          <meshBasicMaterial map={matatuTexture || undefined} color="#ffffff" />
        </mesh>
        <mesh position={[-1.23, 1.05, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[3.6, 0.4]} />
          <meshBasicMaterial map={matatuTexture || undefined} color="#ffffff" />
        </mesh>

        {/* Front Windshield */}
        <mesh position={[0, 1.6, 2.95]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[2.1, 0.95]} />
          <meshStandardMaterial color="#09090b" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* Roof Luggage Rack */}
        <mesh position={[0, 2.55, 0]}>
          <boxGeometry args={[2.2, 0.2, 5.0]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>

        {/* Headlight Beams */}
        <pointLight position={[-0.8, 0.8, 3.2]} color="#fef08a" intensity={2} distance={20} />
        <pointLight position={[0.8, 0.8, 3.2]} color="#fef08a" intensity={2} distance={20} />
      </RigidBody>

      {/* 4 Animated Rotating Wheels */}
      {[-1.15, 1.15].map((x, xi) =>
        [-1.8, 1.8].map((z, zi) => (
          <group
            key={`${xi}-${zi}`}
            ref={(el) => {
              if (el) wheelsRef.current.push(el);
            }}
            position={[x, 0.45, z]}
          >
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.32, 16]} />
              <meshStandardMaterial color="#18181b" roughness={0.9} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

/**
 * Animated Politician VIP Prado SUV Convoy
 */
function PoliticianConvoy({ initialZ, speed = 6.0, laneX = 12 }: { initialZ: number; speed?: number; laneX?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const redLightRef = useRef<THREE.PointLight>(null);
  const blueLightRef = useRef<THREE.PointLight>(null);
  const currentZ = useRef(initialZ);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Advance backwards along road towards Parliament
    currentZ.current -= speed * delta;
    if (currentZ.current < -50) {
      currentZ.current = 65;
    }
    groupRef.current.position.z = currentZ.current;

    // Flashing VIP police strobes
    const flash = Math.sin(t * 18) > 0;
    if (redLightRef.current) redLightRef.current.intensity = flash ? 4.0 : 0.2;
    if (blueLightRef.current) blueLightRef.current.intensity = !flash ? 4.0 : 0.2;
  });

  return (
    <group ref={groupRef} position={[laneX, 0, initialZ]} rotation={[0, Math.PI, 0]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1.2, 1.1, 2.6]} position={[0, 1.1, 0]} />

        {/* Jet-Black Luxury Prado V8 Body */}
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.3, 1.5, 5.0]} />
          <meshStandardMaterial color="#09090b" roughness={0.2} metalness={0.7} />
        </mesh>

        {/* Tinted Bulletproof Cabin */}
        <mesh position={[0, 1.75, -0.3]} castShadow>
          <boxGeometry args={[2.0, 1.0, 2.9]} />
          <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* VIP Strobe Lightbar on Roof */}
        <group position={[0, 2.3, -0.2]}>
          <mesh>
            <boxGeometry args={[1.4, 0.12, 0.25]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>
          <pointLight ref={redLightRef} position={[-0.5, 0.2, 0]} color="#ef4444" distance={16} />
          <pointLight ref={blueLightRef} position={[0.5, 0.2, 0]} color="#3b82f6" distance={16} />
        </group>

        {/* Front Grille Strobe Strobes */}
        <mesh position={[-0.4, 0.8, 2.52]}>
          <boxGeometry args={[0.25, 0.1, 0.04]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0.4, 0.8, 2.52]}>
          <boxGeometry args={[0.25, 0.1, 0.04]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>

        {/* Wheels */}
        {[-1.1, 1.1].map((x, xi) =>
          [-1.6, 1.6].map((z, zi) => (
            <mesh key={`${xi}-${zi}`} position={[x, 0.45, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.34, 16]} />
              <meshStandardMaterial color="#18181b" roughness={0.9} />
            </mesh>
          ))
        )}
      </RigidBody>
    </group>
  );
}

/**
 * Universal Active Vehicle Simulation Component
 */
export function ActiveVehicleSimulation() {
  return (
    <group>
      {/* Matatu 1 (Southbound on Left Lane) */}
      <DrivingMatatu initialZ={-40} speed={9.0} laneX={-12.5} routeName="SUPER METRO 105" />

      {/* Matatu 2 (Southbound on Left Lane delayed) */}
      <DrivingMatatu initialZ={20} speed={8.0} laneX={-12.5} routeName="EMBASSAVA 33" />

      {/* Politician VIP Prado (Northbound on Right Lane with Strobes) */}
      <PoliticianConvoy initialZ={50} speed={7.0} laneX={12.5} />
    </group>
  );
}
