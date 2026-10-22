'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { createTextTexture } from '../utils/canvasTexture';

/**
 * Nairobi Acacia Tree
 */
function AcaciaTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.38, 5, 8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      <mesh position={[0.7, 4.2, 0.4]} rotation={[0.4, 0.3, 0.5]}>
        <cylinderGeometry args={[0.12, 0.18, 2.6, 6]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      <mesh position={[-0.7, 4.4, -0.3]} rotation={[-0.3, -0.4, -0.6]}>
        <cylinderGeometry args={[0.12, 0.18, 2.6, 6]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      {/* Flat-topped umbrella foliage canopy */}
      <mesh position={[0, 5.6, 0]} castShadow>
        <cylinderGeometry args={[3.2, 1.4, 0.7, 12]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.8} />
      </mesh>
      <mesh position={[0.9, 6.0, 0.5]} castShadow>
        <cylinderGeometry args={[2.0, 0.9, 0.5, 10]} />
        <meshStandardMaterial color="#386b32" roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * Tropical Palm Tree (Common along Uhuru Highway & Central Park)
 */
function PalmTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Curved slender trunk */}
      <mesh position={[0.2, 3.5, 0]} rotation={[0, 0, -0.08]} castShadow>
        <cylinderGeometry args={[0.16, 0.28, 7, 8]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      {/* Palm Fronds radiating outward */}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        return (
          <group key={i} position={[0.2, 7.0, 0]} rotation={[0.4, angle, 0.4]}>
            <mesh position={[0, 0, 1.8]} rotation={[-0.3, 0, 0]}>
              <boxGeometry args={[0.4, 0.05, 3.2]} />
              <meshStandardMaterial color="#1e5c22" roughness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Burning Tire Protest Barricade with Flickering Fire Light
 */
function BurningBarricade({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.getElapsedTime();
    // Flame flicker
    lightRef.current.intensity = 2.5 + Math.sin(t * 15) * 0.8 + Math.cos(t * 23) * 0.5;
  });

  return (
    <group position={position}>
      {/* Concrete Barrier Base */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1.6, 0.7, 0.4]} position={[0, 0.7, 0]} />
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 1.2, 0.6]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Stack of Rubber Tires */}
      <mesh position={[-0.8, 0.4, 0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.38, 0.16, 8, 16]} />
        <meshStandardMaterial color="#18181b" roughness={0.9} />
      </mesh>
      <mesh position={[-0.8, 0.8, 0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.38, 0.16, 8, 16]} />
        <meshStandardMaterial color="#18181b" roughness={0.9} />
      </mesh>

      {/* Fire Glow Flame Mesh */}
      <mesh position={[-0.8, 1.2, 0.4]}>
        <coneGeometry args={[0.35, 0.8, 8]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>
      <mesh position={[-0.8, 1.1, 0.4]}>
        <coneGeometry args={[0.22, 0.6, 8]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>

      {/* Rising Smoke Column */}
      <mesh position={[-0.8, 2.6, 0.4]}>
        <cylinderGeometry args={[0.5, 0.25, 2.2, 8]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.5} roughness={1} />
      </mesh>

      {/* Dynamic Orange Flame Light */}
      <pointLight ref={lightRef} position={[-0.8, 1.4, 0.4]} color="#f97316" distance={15} />
    </group>
  );
}

/**
 * Nairobi Street Newspaper Kiosk
 */
function NewspaperStand({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const headlineTexture = useMemo(
    () =>
      createTextTexture('DAILY NATION', {
        bgColor: '#f8fafc',
        textColor: '#dc2626',
        fontSize: 32,
        subtext: 'GEN Z MARCH TO PARLIAMENT',
        subtextColor: '#0a0a0a',
        borderColor: '#dc2626',
      }),
    []
  );

  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1.2, 1.2, 0.8]} position={[0, 1.2, 0]} />
        {/* Kiosk Wooden Stand */}
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 2.2, 1.5]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        {/* Slanted Sheet Metal Roof */}
        <mesh position={[0, 2.3, 0.1]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[2.7, 0.1, 1.8]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} />
        </mesh>
        {/* Front Newspaper Display Board */}
        <mesh position={[0, 1.2, 0.77]}>
          <planeGeometry args={[2.1, 1.0]} />
          <meshBasicMaterial map={headlineTexture || undefined} color="#ffffff" />
        </mesh>
      </RigidBody>
    </group>
  );
}

/**
 * Modernist CBD Commercial Skyscraper
 */
function HighriseTower({
  position,
  width = 24,
  depth = 24,
  height = 80,
  facadeColor = '#1e293b',
  windowColor = '#38bdf8',
  roofSign,
}: {
  position: [number, number, number];
  width?: number;
  depth?: number;
  height?: number;
  facadeColor?: string;
  windowColor?: string;
  roofSign?: string;
}) {
  const roofSignTexture = useMemo(
    () =>
      roofSign
        ? createTextTexture(roofSign, {
            bgColor: '#0f172a',
            textColor: '#facc15',
            fontSize: 34,
            borderColor: '#38bdf8',
          })
        : null,
    [roofSign]
  );

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[width / 2, height / 2, depth / 2]} position={[0, height / 2, 0]} />
        {/* Main Skyscraper Tower Core */}
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={facadeColor} roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Glass Window Grid Facades (Front) */}
        <mesh position={[0, height / 2, depth / 2 + 0.1]}>
          <planeGeometry args={[width * 0.9, height * 0.88]} />
          <meshStandardMaterial color={windowColor} roughness={0.1} metalness={0.8} />
        </mesh>
        {/* Glass Window Grid Facades (Back) */}
        <mesh position={[0, height / 2, -depth / 2 - 0.1]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[width * 0.9, height * 0.88]} />
          <meshStandardMaterial color={windowColor} roughness={0.1} metalness={0.8} />
        </mesh>

        {/* Rooftop Plant / Elevator Housing */}
        <mesh position={[0, height + 3, 0]} castShadow>
          <boxGeometry args={[width * 0.5, 6, depth * 0.5]} />
          <meshStandardMaterial color="#334155" metalness={0.6} />
        </mesh>

        {/* Commercial Rooftop Signboard */}
        {roofSignTexture && (
          <mesh position={[0, height + 4, depth * 0.25 + 0.1]}>
            <planeGeometry args={[width * 0.45, 3.2]} />
            <meshBasicMaterial map={roofSignTexture} color="#ffffff" />
          </mesh>
        )}
      </RigidBody>
    </group>
  );
}

/**
 * Iconic KICC (Kenyatta International Convention Centre) Tower
 */
export function KICCTower({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Plenary / Amphitheater Podium */}
      <mesh position={[0, 6, 0]} castShadow receiveShadow>
        <boxGeometry args={[36, 12, 36]} />
        <meshStandardMaterial color="#c2b69d" roughness={0.7} />
      </mesh>

      {/* Main Terracotta Cylinder Tower (28 stories) */}
      <mesh position={[0, 42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[10, 11, 62, 32]} />
        <meshStandardMaterial color="#a35c39" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Vertical architectural terracotta ribs */}
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const x = Math.sin(angle) * 10.8;
        const z = Math.cos(angle) * 10.8;
        return (
          <mesh key={i} position={[x, 42, z]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.45, 60, 0.9]} />
            <meshStandardMaterial color="#874728" roughness={0.8} />
          </mesh>
        );
      })}

      {/* Revolving Top Restaurant Disc */}
      <mesh position={[0, 74, 0]} castShadow>
        <cylinderGeometry args={[13.5, 9, 3.5, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Rooftop Helipad */}
      <mesh position={[0, 76, 0]}>
        <cylinderGeometry args={[12, 12, 0.6, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Helipad 'H' Decal */}
      <group position={[0, 76.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[-2.2, 0, 0]}>
          <boxGeometry args={[0.9, 6.5, 0.05]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.4} />
        </mesh>
        <mesh position={[2.2, 0, 0]}>
          <boxGeometry args={[0.9, 6.5, 0.05]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.5, 0.9, 0.05]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.4} />
        </mesh>
      </group>

      {/* Telecommunications Spire */}
      <mesh position={[0, 83, 0]}>
        <cylinderGeometry args={[0.2, 0.7, 14, 8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Blinking Red Aviation Beacon Light */}
      <pointLight position={[0, 90, 0]} color="#ef4444" intensity={5} distance={100} />
    </group>
  );
}

/**
 * Parliament Complex with Neoclassical Colonnade
 */
export function ParliamentComplex({ position }: { position: [number, number, number] }) {
  const parliamentSignTexture = useMemo(
    () =>
      createTextTexture('PARLIAMENT OF KENYA • HARAMBEE AVE', {
        bgColor: '#0f172a',
        textColor: '#f8fafc',
        fontSize: 28,
        borderColor: '#e2e8f0',
      }),
    []
  );

  return (
    <group position={position}>
      {/* Perimeter Stone Wall */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[28, 2.5, 0.8]} position={[0, 2.5, 0]} />
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[56, 5, 1.4]} />
          <meshStandardMaterial color="#78716c" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Main Gate Columns */}
      {[-8, -4, 4, 8].map((x, i) => (
        <mesh key={i} position={[x, 3.5, 0.7]} castShadow>
          <cylinderGeometry args={[0.45, 0.5, 7, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
      ))}

      {/* Gate Archway */}
      <mesh position={[0, 7.2, 0.7]}>
        <boxGeometry args={[18, 1.4, 1.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} />
      </mesh>

      {/* Parliament Signboard */}
      <mesh position={[0, 7.2, 1.62]}>
        <planeGeometry args={[14, 1.0]} />
        <meshBasicMaterial map={parliamentSignTexture || undefined} color="#ffffff" />
      </mesh>

      {/* Kenyan Coat of Arms / Crest */}
      <mesh position={[0, 8.6, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.2, 16]} />
        <meshStandardMaterial color="#bb0000" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Legislative Chamber Building */}
      <mesh position={[0, 14, -30]} castShadow receiveShadow>
        <boxGeometry args={[65, 24, 35]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>

      {/* Clock Tower on Parliament */}
      <group position={[20, 28, -25]}>
        <mesh castShadow>
          <boxGeometry args={[8, 34, 8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        {/* Clock Face (Front) */}
        <mesh position={[0, 12, 4.05]}>
          <circleGeometry args={[2.2, 24]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Expanded Nairobi CBD World (300m x 300m Urban Layout)
 */
export function NairobiCBDWorld() {
  return (
    <group>
      {/* Broad Asphalt Ground with Multi-Lane Dual Carriageway */}
      <RigidBody type="fixed" friction={1.5} colliders={false}>
        <CuboidCollider args={[150, 1, 150]} position={[0, -1, 0]} />
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <boxGeometry args={[300, 1, 300]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* Central Island / Road Median with Green Grass & Palm Trees */}
      <group position={[0, 0.15, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[3, 0.3, 200]} />
          <meshStandardMaterial color="#166534" roughness={0.8} />
        </mesh>
        {/* Palms & Acacia Trees along median */}
        {[-70, -40, -10, 20, 50, 80].map((z, idx) => (
          <React.Fragment key={idx}>
            {idx % 2 === 0 ? (
              <PalmTree position={[0, 0, z]} scale={1.05} />
            ) : (
              <AcaciaTree position={[0, 0, z]} scale={0.95} />
            )}
          </React.Fragment>
        ))}
      </group>

      {/* Sidewalks with Yellow & Black Hazard Kerbs */}
      <group position={[-18, 0.15, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[14, 0.3, 240]} />
          <meshStandardMaterial color="#64748b" roughness={0.9} />
        </mesh>
        {/* Kerb Stone */}
        <mesh position={[7.2, 0.1, 0]}>
          <boxGeometry args={[0.4, 0.35, 240]} />
          <meshStandardMaterial color="#eab308" />
        </mesh>
      </group>

      <group position={[18, 0.15, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[14, 0.3, 240]} />
          <meshStandardMaterial color="#64748b" roughness={0.9} />
        </mesh>
        {/* Kerb Stone */}
        <mesh position={[-7.2, 0.1, 0]}>
          <boxGeometry args={[0.4, 0.35, 240]} />
          <meshStandardMaterial color="#eab308" />
        </mesh>
      </group>

      {/* Zebra Pedestrian Crossings */}
      {[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 6]}>
          <planeGeometry args={[1.2, 7]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}

      {/* ================= NAIROBI CBD LANDMARKS ================= */}
      {/* 1. KICC Tower on East side */}
      <KICCTower position={[-65, 0, -50]} />

      {/* 2. Parliament Complex at end of Parliament Road */}
      <ParliamentComplex position={[0, 0, -42]} />

      {/* 3. Times Tower / KRA Skyscraper (West) */}
      <HighriseTower
        position={[62, 0, -45]}
        width={26}
        depth={26}
        height={95}
        facadeColor="#0f172a"
        windowColor="#38bdf8"
        roofSign="TIMES TOWER • KRA"
      />

      {/* 4. Co-operative Bank Building (East) */}
      <HighriseTower
        position={[-60, 0, 25]}
        width={24}
        depth={24}
        height={72}
        facadeColor="#1e3a8a"
        windowColor="#60a5fa"
        roofSign="CO-OP BANK HQ"
      />

      {/* 5. Teleposta Towers (West) */}
      <HighriseTower
        position={[65, 0, 30]}
        width={22}
        depth={22}
        height={85}
        facadeColor="#1e293b"
        windowColor="#0284c7"
        roofSign="TELEPOSTA TOWERS"
      />

      {/* ================= PROTEST ACTIVISM & SCENERY ================= */}
      {/* Burning Tire Barricades on Road Intersections */}
      <BurningBarricade position={[-7, 0, 1]} />
      <BurningBarricade position={[7, 0, -3]} />

      {/* Street Newspaper Kiosks */}
      <NewspaperStand position={[-22, 0, 8]} rotation={[0, Math.PI / 2, 0]} />
      <NewspaperStand position={[22, 0, 16]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Streetlight Poles with Night/Dusk Glow */}
      {[-50, -25, 0, 25, 50, 75].map((z, idx) => (
        <React.Fragment key={idx}>
          {/* Left Pole */}
          <group position={[-16.8, 0, z]}>
            <mesh position={[0, 4.5, 0]}>
              <cylinderGeometry args={[0.15, 0.22, 9, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>
            <mesh position={[1.2, 8.8, 0]} rotation={[0, 0, -0.4]}>
              <cylinderGeometry args={[0.08, 0.08, 2.8, 6]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>
            <pointLight position={[2.0, 8.5, 0]} color="#fed7aa" intensity={2.4} distance={28} />
          </group>

          {/* Right Pole */}
          <group position={[16.8, 0, z]}>
            <mesh position={[0, 4.5, 0]}>
              <cylinderGeometry args={[0.15, 0.22, 9, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>
            <mesh position={[-1.2, 8.8, 0]} rotation={[0, 0, 0.4]}>
              <cylinderGeometry args={[0.08, 0.08, 2.8, 6]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>
            <pointLight position={[-2.0, 8.5, 0]} color="#fed7aa" intensity={2.4} distance={28} />
          </group>
        </React.Fragment>
      ))}
    </group>
  );
}
