'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createTextTexture } from '../utils/canvasTexture';

interface HumanProtesterMeshProps {
  animation: string;
  isChanting: boolean;
  isStreaming: boolean;
  placardText: string;
  outfitColor: string;
  hasFlag?: boolean;
  isRemote?: boolean;
  skinTone?: string;
  pantsColor?: string;
}

/**
 * Anatomically proportioned 3D Human Protester
 * Features:
 * - Human proportions (1.78m height, realistic shoulder-to-hip ratio)
 * - Articulated humanoid hierarchy (Head, Neck, Torso, Shoulders, Biceps, Forearms, Hands, Hips, Thighs, Knees, Calves, Sneakers)
 * - Streetwear clothing: Detailed oversized hoodie with drawstrings, cargo joggers with pocket flaps, chunky high-top sneakers
 * - Authentic Kenyan accessories: Headband with Kenyan flag tricolor, anti-teargas mask, miniature flag waving
 * - Human gait locomotion with knee flexion, hip sway, and arm counter-swing
 */
export function HumanProtesterMesh({
  animation,
  isChanting,
  isStreaming,
  placardText,
  outfitColor = '#10b981',
  hasFlag = true,
  skinTone = '#5c3a21',
  pantsColor = '#1e2430',
}: HumanProtesterMeshProps) {
  // Skeletal Group Refs
  const rootGroupRef = useRef<THREE.Group>(null);
  const pelvisRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftUpperArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightUpperArmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const leftThighRef = useRef<THREE.Group>(null);
  const leftShinRef = useRef<THREE.Group>(null);
  const rightThighRef = useRef<THREE.Group>(null);
  const rightShinRef = useRef<THREE.Group>(null);

  // Placard Canvas Texture
  const placardTexture = useMemo(
    () =>
      createTextTexture(placardText, {
        bgColor: '#e2ca9c',
        textColor: '#0a0a0a',
        fontSize: 34,
        borderColor: '#8d5b2d',
      }),
    [placardText]
  );

  // Natural Human Locomotion Animation Loop
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const isRunning = animation === 'run';
    const isWalking = animation === 'walk' || isRunning;

    if (isWalking) {
      const speedMult = isRunning ? 13 : 7.5;
      const cycle = t * speedMult;
      const legAmplitude = isRunning ? 0.75 : 0.45;
      const armAmplitude = isRunning ? 0.8 : 0.45;

      // Pelvis natural vertical bounce and subtle yaw sway
      if (pelvisRef.current) {
        pelvisRef.current.position.y = Math.abs(Math.sin(cycle * 2)) * 0.05;
        pelvisRef.current.rotation.y = Math.sin(cycle) * 0.08;
      }

      // Torso counter-twist
      if (spineRef.current) {
        spineRef.current.rotation.y = -Math.sin(cycle) * 0.07;
      }

      // Left Leg Gait (Thigh + Knee flexion)
      if (leftThighRef.current) {
        const thighAngle = Math.sin(cycle) * legAmplitude;
        leftThighRef.current.rotation.x = thighAngle;
        if (leftShinRef.current) {
          // Knee flexes when swinging forward
          leftShinRef.current.rotation.x = thighAngle > 0 ? thighAngle * 0.9 : 0.08;
        }
      }

      // Right Leg Gait (Opposite phase)
      if (rightThighRef.current) {
        const thighAngle = Math.sin(cycle + Math.PI) * legAmplitude;
        rightThighRef.current.rotation.x = thighAngle;
        if (rightShinRef.current) {
          rightShinRef.current.rotation.x = thighAngle > 0 ? thighAngle * 0.9 : 0.08;
        }
      }

      // Left Arm Counter-Swing (unless streaming)
      if (!isStreaming && leftUpperArmRef.current) {
        leftUpperArmRef.current.rotation.x = -Math.sin(cycle) * armAmplitude;
        leftUpperArmRef.current.rotation.z = 0.1;
      }

      // Right Arm Counter-Swing (unless chanting)
      if (!isChanting && rightUpperArmRef.current) {
        rightUpperArmRef.current.rotation.x = Math.sin(cycle) * (armAmplitude * 0.6);
      }
    } else {
      // Idle state: Subtle organic breathing and posture
      if (pelvisRef.current) {
        pelvisRef.current.position.y = 0;
        pelvisRef.current.rotation.y = 0;
      }
      if (leftThighRef.current) {
        leftThighRef.current.rotation.x = 0;
        if (leftShinRef.current) leftShinRef.current.rotation.x = 0.05;
      }
      if (rightThighRef.current) {
        rightThighRef.current.rotation.x = 0;
        if (rightShinRef.current) rightShinRef.current.rotation.x = 0.05;
      }
      if (spineRef.current) {
        // Inhale/exhale chest expansion
        spineRef.current.rotation.x = Math.sin(t * 1.8) * 0.02;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 1.2) * 0.06;
      }
      if (!isStreaming && leftUpperArmRef.current) {
        leftUpperArmRef.current.rotation.x = 0.05;
        leftUpperArmRef.current.rotation.z = 0.12;
      }
      if (!isChanting && rightUpperArmRef.current) {
        rightUpperArmRef.current.rotation.x = -0.3; // Holding placard comfortably
      }
    }

    // Smartphone Live-Streaming Pose (Left Arm raised high)
    if (isStreaming && leftUpperArmRef.current && leftForearmRef.current) {
      leftUpperArmRef.current.rotation.x = -1.45;
      leftUpperArmRef.current.rotation.y = 0.35;
      leftUpperArmRef.current.rotation.z = -0.2;
      leftForearmRef.current.rotation.x = -0.4;
    }

    // Vuvuzela / Megaphone Chanting Pose (Right Arm raised to lips)
    if (isChanting && rightUpperArmRef.current && rightForearmRef.current) {
      rightUpperArmRef.current.rotation.x = -1.55;
      rightUpperArmRef.current.rotation.y = -0.3;
      rightUpperArmRef.current.rotation.z = 0.15;
      rightForearmRef.current.rotation.x = -0.5;
    }
  });

  return (
    <group ref={rootGroupRef} position={[0, -0.9, 0]}>
      {/* PELVIS / HIPS ANCHOR */}
      <group ref={pelvisRef} position={[0, 0.88, 0]}>
        
        {/* Pelvis structure */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.16, 0.18, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.8} />
        </mesh>

        {/* ================= UPPER BODY / SPINE ================= */}
        <group ref={spineRef} position={[0, 0.1, 0]}>
          
          {/* Waist & Lower Torso */}
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.18, 0.22, 12]} />
            <meshStandardMaterial color={outfitColor} roughness={0.65} />
          </mesh>

          {/* Chest & Hoodie Upper Torso (Broadened shoulders) */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.2, 0.26, 12]} />
            <meshStandardMaterial color={outfitColor} roughness={0.65} />
          </mesh>

          {/* Kangaroo Pocket Pouch on front of hoodie */}
          <mesh position={[0, 0.15, 0.18]} rotation={[0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.24, 0.14, 0.05]} />
            <meshStandardMaterial color={outfitColor} roughness={0.7} />
          </mesh>

          {/* Folded Hoodie Hood behind neck */}
          <mesh position={[0, 0.44, -0.12]} rotation={[-0.3, 0, 0]}>
            <sphereGeometry args={[0.14, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshStandardMaterial color={outfitColor} roughness={0.75} />
          </mesh>

          {/* Protester Urban Tactical Backpack */}
          <group position={[0, 0.26, -0.22]} rotation={[0.05, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.3, 0.38, 0.16]} />
              <meshStandardMaterial color="#111827" roughness={0.85} />
            </mesh>
            {/* Backpack zippered front pouch */}
            <mesh position={[0, -0.05, -0.09]} castShadow>
              <boxGeometry args={[0.24, 0.2, 0.06]} />
              <meshStandardMaterial color="#1f2937" roughness={0.9} />
            </mesh>
            {/* Miniature Kenyan Flag protruding from backpack */}
            {hasFlag && (
              <group position={[0.1, 0.26, -0.02]} rotation={[0.2, 0, 0.25]}>
                <mesh>
                  <cylinderGeometry args={[0.008, 0.008, 0.55, 6]} />
                  <meshStandardMaterial color="#475569" metalness={0.6} />
                </mesh>
                {/* Flowing tricolor flag plane */}
                <mesh position={[0.14, 0.16, 0]}>
                  <planeGeometry args={[0.28, 0.18]} />
                  <meshStandardMaterial color="#bb0000" side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0.14, 0.22, 0.001]}>
                  <planeGeometry args={[0.28, 0.06]} />
                  <meshStandardMaterial color="#000000" side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0.14, 0.1, 0.001]}>
                  <planeGeometry args={[0.28, 0.06]} />
                  <meshStandardMaterial color="#00853f" side={THREE.DoubleSide} />
                </mesh>
              </group>
            )}
          </group>

          {/* Neck */}
          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.09, 0.12, 10]} />
            <meshStandardMaterial color={skinTone} roughness={0.8} />
          </mesh>

          {/* ================= HEAD & FACE ================= */}
          <group ref={headRef} position={[0, 0.62, 0]}>
            {/* Cranium / Head (Sculpted oval) */}
            <mesh castShadow>
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshStandardMaterial color={skinTone} roughness={0.8} />
            </mesh>
            {/* Jawline & Chin */}
            <mesh position={[0, -0.05, 0.04]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.12, 0.1, 0.12]} />
              <meshStandardMaterial color={skinTone} roughness={0.8} />
            </mesh>

            {/* Gen Z Stylish Fade / Afro Hair */}
            <mesh position={[0, 0.08, -0.02]}>
              <sphereGeometry args={[0.145, 14, 14]} />
              <meshStandardMaterial color="#18181b" roughness={0.95} />
            </mesh>

            {/* Kenyan Flag Bandana around forehead */}
            <group position={[0, 0.03, 0]}>
              <mesh>
                <cylinderGeometry args={[0.146, 0.146, 0.05, 16]} />
                <meshStandardMaterial color="#00853f" />
              </mesh>
              <mesh position={[0, 0, 0.148]}>
                <planeGeometry args={[0.18, 0.02]} />
                <meshBasicMaterial color="#bb0000" />
              </mesh>
            </group>

            {/* Anti-Teargas Face Mask covering nose & mouth */}
            <mesh position={[0, -0.04, 0.1]}>
              <boxGeometry args={[0.14, 0.09, 0.1]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>

            {/* Streetwear Sunglasses / Shades */}
            <group position={[0, 0.03, 0.12]}>
              <mesh>
                <boxGeometry args={[0.18, 0.04, 0.03]} />
                <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.8} />
              </mesh>
              {/* Reflective Dark Lens */}
              <mesh position={[0, 0, 0.016]}>
                <planeGeometry args={[0.16, 0.035]} />
                <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.9} />
              </mesh>
            </group>
          </group>

          {/* ================= LEFT ARM ================= */}
          <group ref={leftUpperArmRef} position={[-0.26, 0.42, 0]}>
            {/* Shoulder Deltoid */}
            <mesh castShadow>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshStandardMaterial color={outfitColor} roughness={0.7} />
            </mesh>
            {/* Upper Arm / Bicep */}
            <mesh position={[-0.02, -0.15, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.055, 0.24, 10]} />
              <meshStandardMaterial color={outfitColor} roughness={0.7} />
            </mesh>

            {/* Elbow & Forearm */}
            <group ref={leftForearmRef} position={[-0.02, -0.28, 0]}>
              <mesh position={[0, -0.14, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.045, 0.24, 10]} />
                <meshStandardMaterial color={skinTone} roughness={0.8} />
              </mesh>
              {/* Hand */}
              <group position={[0, -0.28, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.06, 0.08, 0.04]} />
                  <meshStandardMaterial color={skinTone} roughness={0.8} />
                </mesh>

                {/* Smartphone held in left hand */}
                <group position={[0, 0, 0.06]} rotation={[0.2, 0, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[0.085, 0.16, 0.015]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.15} />
                  </mesh>
                  {/* Glowing Screen */}
                  <mesh position={[0, 0, 0.009]}>
                    <planeGeometry args={[0.076, 0.145]} />
                    <meshBasicMaterial color={isStreaming ? '#ef4444' : '#38bdf8'} />
                  </mesh>
                  {/* Streaming Light */}
                  {isStreaming && (
                    <pointLight position={[0, 0, 0.15]} color="#38bdf8" intensity={1.2} distance={2.5} />
                  )}
                </group>
              </group>
            </group>
          </group>

          {/* ================= RIGHT ARM ================= */}
          <group ref={rightUpperArmRef} position={[0.26, 0.42, 0]}>
            {/* Shoulder Deltoid */}
            <mesh castShadow>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshStandardMaterial color={outfitColor} roughness={0.7} />
            </mesh>
            {/* Upper Arm / Bicep */}
            <mesh position={[0.02, -0.15, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.055, 0.24, 10]} />
              <meshStandardMaterial color={outfitColor} roughness={0.7} />
            </mesh>

            {/* Elbow & Forearm */}
            <group ref={rightForearmRef} position={[0.02, -0.28, 0]}>
              <mesh position={[0, -0.14, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.045, 0.24, 10]} />
                <meshStandardMaterial color={skinTone} roughness={0.8} />
              </mesh>
              {/* Hand */}
              <group position={[0, -0.28, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.06, 0.08, 0.04]} />
                  <meshStandardMaterial color={skinTone} roughness={0.8} />
                </mesh>

                {/* Handheld Item: Vuvuzela or Cardboard Placard */}
                {isChanting ? (
                  /* Vuvuzela Horn */
                  <group position={[0, 0.1, 0.2]} rotation={[1.2, 0, 0]}>
                    <mesh castShadow>
                      <coneGeometry args={[0.1, 0.55, 14]} />
                      <meshStandardMaterial color="#00853f" roughness={0.4} />
                    </mesh>
                    <mesh position={[0, -0.28, 0]}>
                      <cylinderGeometry args={[0.025, 0.025, 0.25, 10]} />
                      <meshStandardMaterial color="#eab308" />
                    </mesh>
                  </group>
                ) : (
                  /* Cardboard Protest Placard with realistic wooden pole */
                  <group position={[0, 0.3, 0.1]} rotation={[0.15, -0.2, 0]}>
                    {/* Wooden Pole */}
                    <mesh position={[0, -0.4, 0]} castShadow>
                      <cylinderGeometry args={[0.018, 0.018, 1.3, 8]} />
                      <meshStandardMaterial color="#78451f" roughness={0.9} />
                    </mesh>
                    {/* Cardboard Sign */}
                    <mesh position={[0, 0.35, 0]} castShadow>
                      <boxGeometry args={[1.05, 0.7, 0.02]} />
                      <meshStandardMaterial
                        map={placardTexture || undefined}
                        color="#ffffff"
                        roughness={0.85}
                      />
                    </mesh>
                  </group>
                )}
              </group>
            </group>
          </group>

        </group> {/* End Spine */}

      </group> {/* End Pelvis */}

      {/* ================= LOWER BODY / LEGS ================= */}
      {/* LEFT LEG */}
      <group ref={leftThighRef} position={[-0.12, 0.84, 0]}>
        {/* Hip Joint & Thigh (Cargo Pants) */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.07, 0.42, 10]} />
          <meshStandardMaterial color={pantsColor} roughness={0.85} />
        </mesh>
        {/* Cargo Side Pocket Flap */}
        <mesh position={[-0.08, -0.18, 0]} castShadow>
          <boxGeometry args={[0.03, 0.12, 0.1]} />
          <meshStandardMaterial color={pantsColor} roughness={0.9} />
        </mesh>

        {/* Knee Joint & Shin / Calf */}
        <group ref={leftShinRef} position={[0, -0.42, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.068, 0.055, 0.38, 10]} />
            <meshStandardMaterial color={pantsColor} roughness={0.85} />
          </mesh>

          {/* Chunky High-Top Streetwear Sneaker */}
          <group position={[0, -0.4, 0.06]}>
            {/* Sole (Thick white rubber) */}
            <mesh position={[0, -0.04, 0]} castShadow>
              <boxGeometry args={[0.12, 0.06, 0.28]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} />
            </mesh>
            {/* Sneaker Upper Body */}
            <mesh position={[0, 0.03, -0.02]} castShadow>
              <boxGeometry args={[0.11, 0.1, 0.24]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </mesh>
            {/* Toe Cap */}
            <mesh position={[0, 0, 0.08]} castShadow>
              <boxGeometry args={[0.11, 0.06, 0.08]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.5} />
            </mesh>
          </group>
        </group>
      </group>

      {/* RIGHT LEG */}
      <group ref={rightThighRef} position={[0.12, 0.84, 0]}>
        {/* Hip Joint & Thigh (Cargo Pants) */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.07, 0.42, 10]} />
          <meshStandardMaterial color={pantsColor} roughness={0.85} />
        </mesh>
        {/* Cargo Side Pocket Flap */}
        <mesh position={[0.08, -0.18, 0]} castShadow>
          <boxGeometry args={[0.03, 0.12, 0.1]} />
          <meshStandardMaterial color={pantsColor} roughness={0.9} />
        </mesh>

        {/* Knee Joint & Shin / Calf */}
        <group ref={rightShinRef} position={[0, -0.42, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.068, 0.055, 0.38, 10]} />
            <meshStandardMaterial color={pantsColor} roughness={0.85} />
          </mesh>

          {/* Chunky High-Top Streetwear Sneaker */}
          <group position={[0, -0.4, 0.06]}>
            {/* Sole (Thick white rubber) */}
            <mesh position={[0, -0.04, 0]} castShadow>
              <boxGeometry args={[0.12, 0.06, 0.28]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} />
            </mesh>
            {/* Sneaker Upper Body */}
            <mesh position={[0, 0.03, -0.02]} castShadow>
              <boxGeometry args={[0.11, 0.1, 0.24]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </mesh>
            {/* Toe Cap */}
            <mesh position={[0, 0, 0.08]} castShadow>
              <boxGeometry args={[0.11, 0.06, 0.08]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.5} />
            </mesh>
          </group>
        </group>
      </group>

    </group>
  );
}
