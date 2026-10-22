'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { NairobiCBDWorld } from './Landmarks';
import { GenZPlayer } from '../characters/GenZPlayer';
import { RemoteProtester } from '../characters/RemoteProtester';
import { TeargasSystem } from '../hazards/TeargasSystem';
import { VehicleMesh } from '../vehicles/VehicleMesh';
import { PoliceSquad } from '../police/PoliceSquad';
import { WaterCannonPatrol } from '../police/WaterCannonPatrol';
import { ActiveVehicleSimulation } from '../vehicles/ActiveVehicleSimulation';
import { useGameStore } from '../state/useGameStore';

/**
 * Primary 3D Scene for Nairobi Pulse
 * Encapsulates the Three.js Canvas, Rapier physics simulation, lighting, and audio triggers.
 */
export function NairobiCBDScene() {
  const { remotePlayers, vehicles } = useGameStore();

  return (
    <div className="w-full h-full absolute inset-0 bg-[#07090e]">
      <Canvas
        shadows
        camera={{ position: [0, 5, 22], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Sky Background Color */}
        <color attach="background" args={['#1e293b']} />

        {/* Dynamic African Dusk / Golden Hour Sky */}
        <Sky
          distance={450000}
          sunPosition={[100, 35, -80]}
          inclination={0.5}
          azimuth={0.25}
          turbidity={6}
          rayleigh={2.0}
        />
        <Stars radius={150} depth={50} count={2500} factor={4} saturation={0} fade speed={1} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={1.1} color="#ffffff" />
        <hemisphereLight args={['#fed7aa', '#334155', 0.9]} />
        <directionalLight
          position={[60, 90, 40]}
          intensity={2.4}
          color="#fff1e6"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={250}
          shadow-camera-left={-80}
          shadow-camera-right={80}
          shadow-camera-top={80}
          shadow-camera-bottom={-80}
        />

        {/* Atmospheric Teargas Haze */}
        <fog attach="fog" args={['#1e293b', 50, 320]} />

        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            {/* Nairobi CBD Landmarks, Roads, and Skyscrapers */}
            <NairobiCBDWorld />

            {/* Anti-Riot Police Squad in Phalanx Formation */}
            <PoliceSquad />

            {/* Dynamic Water Cannon Patrol Truck with Active Water Stream */}
            <WaterCannonPatrol />

            {/* Dynamic Moving Vehicles (Matatus & Politician VIP Convoy) */}
            <ActiveVehicleSimulation />

            {/* Local Player Character */}
            <GenZPlayer />

            {/* Remote Multiplayer Protesters */}
            {Object.values(remotePlayers).map((player) => (
              <RemoteProtester key={player.id} player={player} />
            ))}

            {/* Synced Vehicles */}
            {vehicles.map((v) => (
              <VehicleMesh key={v.id} vehicle={v} />
            ))}

            {/* Dynamic Teargas Canisters & Smoke Clouds */}
            <TeargasSystem />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
