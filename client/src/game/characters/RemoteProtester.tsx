'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { PlayerState } from '@nairobi-pulse/shared';
import { HumanProtesterMesh } from './HumanProtesterMesh';

/**
 * RemoteProtester Component
 * Renders other multiplayer Gen Z protesters in the Nairobi 3D protest.
 * Applies interpolation (LERP) on positions and rotations for fluid 60FPS motion.
 */
export function RemoteProtester({ player }: { player: PlayerState }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(...player.position));
  const targetRot = useRef(new THREE.Euler(...player.rotation));

  // Update target when prop changes
  targetPos.current.set(...player.position);
  targetRot.current.set(...player.rotation);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Smooth position and rotation interpolation
    groupRef.current.position.lerp(targetPos.current, 0.15);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRot.current.y,
      0.15
    );
  });

  return (
    <group ref={groupRef} position={player.position}>
      {/* HTML Username Tag and Chant Bubble */}
      <Html center position={[0, 2.2, 0]} distanceFactor={16}>
        <div className="flex flex-col items-center gap-1 pointer-events-none select-none">
          {player.isChanting && (
            <div className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black tracking-wide shadow-md animate-bounce">
              📣 "TUMECHOKA!"
            </div>
          )}
          <div className="px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-bold text-sky-300 whitespace-nowrap shadow-md">
            {player.username}
          </div>
        </div>
      </Html>

      {/* Anatomical Human Protester 3D Mesh */}
      <HumanProtesterMesh
        animation={player.animation || 'idle'}
        isChanting={player.isChanting}
        isStreaming={player.isStreaming}
        placardText={player.placardText}
        outfitColor={player.outfitColor || '#ef4444'}
        hasFlag={player.hasFlag}
      />
    </group>
  );
}
