'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, RapierRigidBody } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import { useGameStore } from '../state/useGameStore';
import { soundManager } from '../audio/soundManager';
import { createTextTexture } from '../utils/canvasTexture';

/**
 * Procedural Placard Sign with In-Memory Canvas Texture
 */
function PlacardSign({ text }: { text: string }) {
  const placardTexture = useMemo(
    () =>
      createTextTexture(text, {
        bgColor: '#d4b483',
        textColor: '#0a0a0a',
        fontSize: 34,
      }),
    [text]
  );

  return (
    <group position={[0.4, 0.4, 0.5]} rotation={[0.2, -0.2, 0.1]}>
      {/* Wooden handle / stick */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.2, 8]} />
        <meshStandardMaterial color="#854d0e" roughness={0.9} />
      </mesh>

      {/* Cardboard Placard board */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.0, 0.65, 0.02]} />
        <meshStandardMaterial
          map={placardTexture || undefined}
          color="#ffffff"
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}

import { HumanProtesterMesh } from './HumanProtesterMesh';

/**
 * Gen Z Player Controller Component
 * Handles WASD movement, Rapier physics, camera attachment, and action hotkeys.
 */
export function GenZPlayer() {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const { camera } = useThree();

  const {
    username,
    placardText,
    outfitColor,
    hasFlag,
    isChanting,
    isStreaming,
    cameraMode,
    consumeStamina,
    recoverStamina,
    setChanting,
    toggleStream,
    useMilkBottle,
    setPlacardEditorOpen,
    updateLocalTransform,
  } = useGameStore();

  // Keyboard input state
  const keys = useRef<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    sprint: boolean;
    jump: boolean;
  }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
  });

  const [currentAnim, setCurrentAnim] = useState<string>('idle');

  // Register Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in an input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = true;
          break;
        case 'Space':
          keys.current.jump = true;
          break;
        case 'KeyC':
          // Chant / Vuvuzela action
          soundManager.playVuvuzela(1.5);
          setChanting(true);
          break;
        case 'KeyF':
          // Toggle phone streaming
          toggleStream();
          break;
        case 'KeyM':
          // Drink milk antidote
          soundManager.playDrinkMilk();
          useMilkBottle();
          break;
        case 'KeyP':
          // Open placard editor
          setPlacardEditorOpen(true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = false;
          break;
        case 'Space':
          keys.current.jump = false;
          break;
        case 'KeyC':
          setChanting(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setChanting, toggleStream, useMilkBottle, setPlacardEditorOpen]);

  // Main Physics and Movement Loop (60 FPS)
  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return;

    const body = rigidBodyRef.current;
    const pos = body.translation();
    const vel = body.linvel();

    // Movement calculation
    const moveX = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
    const moveZ = (keys.current.backward ? 1 : 0) - (keys.current.forward ? 1 : 0);
    const isMoving = moveX !== 0 || moveZ !== 0;

    let speed = 5.0; // Base walk speed
    let anim = 'idle';

    if (isMoving) {
      if (keys.current.sprint && consumeStamina(0.3)) {
        speed = 9.5; // Sprint speed
        anim = 'run';
      } else {
        recoverStamina(0.15);
        anim = 'walk';
      }
    } else {
      recoverStamina(0.25);
    }

    if (isChanting) anim = 'chant';
    if (isStreaming) anim = 'stream';

    // Normalize diagonal movement vector
    const moveDir = new THREE.Vector3(moveX, 0, moveZ).normalize();
    const targetVelX = moveDir.x * speed;
    const targetVelZ = moveDir.z * speed;

    // Fall-through-ground safety clamp
    let currentY = pos.y;
    let velY = vel.y;
    if (pos.y < 0.9) {
      body.setTranslation({ x: pos.x, y: 1.15, z: pos.z }, true);
      body.setLinvel({ x: targetVelX, y: 0, z: targetVelZ }, true);
      velY = 0;
      currentY = 1.15;
    } else {
      // Apply linear velocity while preserving gravity / Y velocity
      body.setLinvel({ x: targetVelX, y: vel.y, z: targetVelZ }, true);
    }

    // Jump impulse if on ground
    if (keys.current.jump && (Math.abs(vel.y) < 0.1 || pos.y <= 1.2)) {
      body.applyImpulse({ x: 0, y: 6.0, z: 0 }, true);
      anim = 'jump';
    }

    // Rotate character towards movement direction
    if (isMoving) {
      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetRotation);
      body.setRotation(quat, true);
    }

    // Stabilized camera follow mechanics
    const camFollowY = Math.max(2.4, currentY + 2.8);
    if (cameraMode === 'third_person') {
      const targetCamPos = new THREE.Vector3(pos.x, camFollowY, pos.z + 5.5);
      camera.position.lerp(targetCamPos, 0.12);
      camera.lookAt(pos.x, currentY + 1.2, pos.z);
    } else if (cameraMode === 'stream_pov') {
      // Selfie / Live-Stream Phone POV
      const targetCamPos = new THREE.Vector3(pos.x, currentY + 1.4, pos.z - 1.2);
      camera.position.lerp(targetCamPos, 0.15);
      camera.lookAt(pos.x, currentY + 1.3, pos.z + 10);
    } else if (cameraMode === 'tactical_drone') {
      // Elevated drone perspective of CBD
      const targetCamPos = new THREE.Vector3(pos.x, currentY + 18, pos.z + 16);
      camera.position.lerp(targetCamPos, 0.08);
      camera.lookAt(pos.x, currentY, pos.z);
    }

    setCurrentAnim(anim);

    // Synchronize to Zustand store
    updateLocalTransform(
      [pos.x, pos.y, pos.z],
      [0, body.rotation().y, 0],
      anim as any
    );
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      position={[0, 1.2, 15]}
      enabledRotations={[false, false, false]} // Prevent character from tipping over
      friction={0.2}
      restitution={0}
      mass={70}
    >
      <CapsuleCollider args={[0.5, 0.35]} position={[0, 0, 0]} />

      {/* Username & Status badge floating above player head */}
      <Html center position={[0, 1.35, 0]} distanceFactor={15}>
        <div className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-sky-400/40 text-[11px] font-bold text-sky-300 whitespace-nowrap shadow-lg flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{username}</span>
        </div>
      </Html>

      {/* Anatomical Human Protester 3D Mesh */}
      <HumanProtesterMesh
        animation={currentAnim}
        isChanting={isChanting}
        isStreaming={isStreaming}
        placardText={placardText}
        outfitColor={outfitColor}
        hasFlag={hasFlag}
      />
    </RigidBody>
  );
}
