/**
 * Nairobi Pulse: Gen Z Uprising 3D Game
 * Shared Data Contracts & Types
 * 
 * This module defines the common data interfaces shared between the Next.js client
 * and the Node.js/Socket.IO multiplayer game server.
 */

/**
 * 3D Vector represented as [X, Y, Z] coordinate tuple.
 * X: Left/Right (East/West in Nairobi CBD)
 * Y: Elevation (Up/Down)
 * Z: Forward/Backward (North/South along Parliament / Harambee Avenues)
 */
export type Vector3Tuple = [number, number, number];

/**
 * Represents the current action/animation state of a Gen Z protester.
 */
export type PlayerAnimation = 
  | 'idle' 
  | 'walk' 
  | 'run' 
  | 'jump' 
  | 'chant' 
  | 'stream' 
  | 'cough'; // Triggered when exposed to teargas smoke

/**
 * Complete synchronized state for a player in the 3D world.
 */
export interface PlayerState {
  /** Unique socket or session identifier */
  id: string;
  /** Display nickname of the Gen Z protester */
  username: string;
  /** Position in 3D world space */
  position: Vector3Tuple;
  /** Euler rotation in radians [X, Y, Z] (Y is yaw/facing direction) */
  rotation: Vector3Tuple;
  /** Current animation state */
  animation: PlayerAnimation;
  /** Custom slogan written on the player's cardboard placard */
  placardText: string;
  /** Whether player is actively blowing a vuvuzela or chanting through megaphone */
  isChanting: boolean;
  /** Whether player is in live-stream mode holding up their smartphone */
  isStreaming: boolean;
  /** Public hype meter (0 - 100), fueled by live streaming & active chanting */
  hype: number;
  /** Teargas exposure level (0 - 100). Higher levels impair vision/movement */
  teargasExposure: number;
  /** Visual customization: Hoodie/bandana color hex or identifier */
  outfitColor: string;
  /** Kenyan flag equipped (true = waving mini-flag) */
  hasFlag: boolean;
  /** Network ping / latency in milliseconds */
  ping?: number;
}

/**
 * Real-time protest chat and megaphone broadcast message.
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  /** If true, renders as a prominent crowd shout / megaphone chant in the 3D HUD */
  isChant?: boolean;
}

/**
 * Types of dynamic political and police events that occur in Nairobi CBD.
 */
export type ProtestEventType = 
  | 'teargas_launched'     // Police teargas canister launched at coordinate
  | 'water_cannon_spray'   // Police anti-riot truck spraying colored water
  | 'politician_speech'    // Politician addressing from screen/podium
  | 'convoy_movement'      // Armored SUV convoy passing through CBD
  | 'crowd_surge'          // Gen Z crowd solidarity peak dispersing police barriers
  | 'anthem_chant';        // Crowd singing national anthem together

/**
 * Dynamic event payload broadcasted by the server to all connected clients.
 */
export interface ProtestEvent {
  id: string;
  type: ProtestEventType;
  /** Coordinate where the event originates */
  location: Vector3Tuple;
  /** Magnitude/radius of effect */
  intensity: number;
  /** Human-readable event description displayed on player notification feed */
  description: string;
  /** Unix epoch timestamp */
  timestamp: number;
}

/**
 * Global political climate and protest tension metrics across Nairobi CBD.
 */
export interface WorldTensionState {
  /** 0 - 100: Collective energy of the Gen Z protesters */
  publicSolidarity: number;
  /** 0 - 100: Anti-riot police readiness and aggression */
  policeAlertLevel: number;
  /** 0 - 100: Panic level of politicians in Parliament / State offices */
  politicalPanic: number;
  /** Number of active protesters currently online */
  activeProtesters: number;
  /** Current global trending hashtag */
  trendingHashtag: string;
}

/**
 * Synchronized state for urban vehicles (Matatus, Politician Prado SUVs, Police Trucks).
 */
export interface VehicleState {
  id: string;
  type: 'matatu' | 'politician_suv' | 'police_truck';
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  speed: number;
  sirenActive: boolean;
  customGraffiti?: string; // Slogans on Matatus
}

/**
 * Initial handshake payload sent from client to server when joining a protest room.
 */
export interface JoinProtestPayload {
  username: string;
  placardText: string;
  outfitColor: string;
}

/**
 * Server-to-Client delta packet emitted on each game tick (20-30Hz).
 */
export interface ServerWorldUpdatePayload {
  serverTime: number;
  players: Record<string, PlayerState>;
  tension: WorldTensionState;
  events: ProtestEvent[];
  vehicles: VehicleState[];
}
