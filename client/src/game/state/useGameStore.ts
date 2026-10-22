import { create } from 'zustand';
import type { 
  PlayerState, 
  WorldTensionState, 
  ProtestEvent, 
  ChatMessage, 
  VehicleState,
  Vector3Tuple 
} from '@nairobi-pulse/shared';

/**
 * Camera View Modes available to the player:
 * - 'third_person': Classic over-the-shoulder orbit camera
 * - 'stream_pov': Smartphone selfie/front camera with social live-stream UI
 * - 'tactical_drone': Elevated panoramic view of the Nairobi CBD crowd
 */
export type CameraMode = 'third_person' | 'stream_pov' | 'tactical_drone';

export interface GameState {
  // Local Player Properties
  localPlayerId: string;
  username: string;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  animation: PlayerState['animation'];
  placardText: string;
  isChanting: boolean;
  isStreaming: boolean;
  hype: number;
  stamina: number;
  teargasExposure: number;
  milkBottles: number;
  outfitColor: string;
  hasFlag: boolean;
  streamViewers: number;
  isConnected: boolean;

  // Camera & Perspective
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;

  // Remote Multiplayer Peers
  remotePlayers: Record<string, PlayerState>;

  // Global World & Tension State
  tension: WorldTensionState;
  events: ProtestEvent[];
  vehicles: VehicleState[];
  chatMessages: ChatMessage[];

  // UI State
  isPlacardEditorOpen: boolean;
  isChatOpen: boolean;
  isMuted: boolean;
  isLiveModalOpen: boolean;

  // Action Handlers
  setLocalPlayerId: (id: string) => void;
  setUsername: (name: string) => void;
  setPlacardText: (text: string) => void;
  setOutfitColor: (color: string) => void;
  updateLocalTransform: (position: Vector3Tuple, rotation: Vector3Tuple, animation: PlayerState['animation']) => void;
  setChanting: (chanting: boolean) => void;
  toggleStream: () => void;
  useMilkBottle: () => void;
  pickupMilkBottle: () => void;
  takeTeargasDamage: (delta: number) => void;
  recoverStamina: (amount: number) => void;
  consumeStamina: (amount: number) => boolean;
  addChatMessage: (msg: ChatMessage) => void;
  setPlacardEditorOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  toggleMute: () => void;
  
  // Network Synchronization
  syncRemotePlayers: (players: Record<string, PlayerState>) => void;
  syncWorldUpdate: (tension: WorldTensionState, events: ProtestEvent[], vehicles: VehicleState[]) => void;
  setConnectionStatus: (connected: boolean) => void;
}

/**
 * Global Zustand Store for Nairobi Pulse: Gen Z Uprising
 * Manages both local simulation loops and multiplayer socket updates.
 */
export const useGameStore = create<GameState>((set, get) => ({
  // Defaults
  localPlayerId: 'player_' + Math.random().toString(36).substring(2, 9),
  username: 'GenZ_RutoMustGo',
  position: [0, 1.2, 15], // Starting near Harambee Ave & Parliament Rd
  rotation: [0, 0, 0],
  animation: 'idle',
  placardText: 'REJECT FINANCE BILL 2024!',
  isChanting: false,
  isStreaming: false,
  hype: 25,
  stamina: 100,
  teargasExposure: 0,
  milkBottles: 2, // Starts with 2 antidotes
  outfitColor: '#10b981', // Neon green protest bandana/hoodie
  hasFlag: true,
  streamViewers: 1420,
  isConnected: false,

  cameraMode: 'third_person',
  setCameraMode: (mode) => set({ cameraMode: mode }),

  remotePlayers: {},

  tension: {
    publicSolidarity: 65,
    policeAlertLevel: 45,
    politicalPanic: 55,
    activeProtesters: 1,
    trendingHashtag: process.env.NEXT_PUBLIC_DEFAULT_PROTEST_HASHTAG || '#RejectFinanceBill2024',
  },

  events: [
    {
      id: 'evt_init',
      type: 'crowd_surge',
      location: [0, 0, 0],
      intensity: 1,
      description: 'Protesters gathering along Parliament Road & City Hall Way.',
      timestamp: Date.now(),
    }
  ],

  vehicles: [
    {
      id: 'matatu_1',
      type: 'matatu',
      position: [-14, 0, -5],
      rotation: [0, Math.PI / 2, 0],
      speed: 0,
      sirenActive: false,
      customGraffiti: 'SUPER METRO: REJECT!',
    },
    {
      id: 'prado_vip',
      type: 'politician_suv',
      position: [12, 0, -20],
      rotation: [0, -Math.PI / 2, 0],
      speed: 0,
      sirenActive: true,
    },
    {
      id: 'water_cannon_truck',
      type: 'police_truck',
      position: [0, 0, -45],
      rotation: [0, Math.PI, 0],
      speed: 0,
      sirenActive: true,
    }
  ],

  chatMessages: [
    {
      id: 'msg_welcome',
      senderId: 'system',
      senderName: 'Nairobi Pulse HQ',
      text: '🇰🇪 Karibu Nairobi CBD! Press [C] to Chant, [F] to Live-Stream, [M] for Milk bottle.',
      timestamp: Date.now(),
    }
  ],

  isPlacardEditorOpen: false,
  isChatOpen: false,
  isMuted: false,
  isLiveModalOpen: false,

  setLocalPlayerId: (id) => set({ localPlayerId: id }),
  setUsername: (name) => set({ username: name }),
  setPlacardText: (text) => set({ placardText: text.toUpperCase() }),
  setOutfitColor: (color) => set({ outfitColor: color }),

  /**
   * Called every physics render frame to keep position and rotation synced.
   */
  updateLocalTransform: (position, rotation, animation) => {
    set({ position, rotation, animation });
  },

  /**
   * Activates vuvuzela/megaphone chanting. Increases public hype and local viewer count.
   */
  setChanting: (isChanting) => {
    set((state) => {
      const bonusHype = isChanting ? Math.min(100, state.hype + 5) : state.hype;
      const viewerBoost = isChanting ? state.streamViewers + Math.floor(Math.random() * 50 + 20) : state.streamViewers;
      return { 
        isChanting, 
        hype: bonusHype,
        streamViewers: viewerBoost,
        animation: isChanting ? 'chant' : state.animation 
      };
    });
  },

  /**
   * Toggles smartphone camera live-stream mode on/off.
   */
  toggleStream: () => {
    set((state) => {
      const nextStream = !state.isStreaming;
      return {
        isStreaming: nextStream,
        cameraMode: nextStream ? 'stream_pov' : 'third_person',
        streamViewers: nextStream ? state.streamViewers + 200 : state.streamViewers,
      };
    });
  },

  /**
   * Consumes a milk bottle to flush teargas exposure and regain vision clarity.
   */
  useMilkBottle: () => {
    set((state) => {
      if (state.milkBottles <= 0) return state;
      return {
        milkBottles: state.milkBottles - 1,
        teargasExposure: Math.max(0, state.teargasExposure - 60),
        stamina: 100,
      };
    });
  },

  pickupMilkBottle: () => {
    set((state) => ({ milkBottles: state.milkBottles + 1 }));
  },

  /**
   * Accumulates teargas exposure if standing inside active smoke canisters.
   */
  takeTeargasDamage: (delta) => {
    set((state) => {
      const nextExposure = Math.min(100, state.teargasExposure + delta);
      return { 
        teargasExposure: nextExposure,
        animation: nextExposure > 70 ? 'cough' : state.animation 
      };
    });
  },

  recoverStamina: (amount) => {
    set((state) => ({ stamina: Math.min(100, state.stamina + amount) }));
  },

  consumeStamina: (amount) => {
    const { stamina } = get();
    if (stamina < amount) return false;
    set({ stamina: Math.max(0, stamina - amount) });
    return true;
  },

  addChatMessage: (msg) => {
    set((state) => ({
      chatMessages: [...state.chatMessages.slice(-40), msg], // Retain last 40 messages
    }));
  },

  setPlacardEditorOpen: (open) => set({ isPlacardEditorOpen: open }),
  setChatOpen: (open) => set({ isChatOpen: open }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  syncRemotePlayers: (players) => {
    const { localPlayerId, username } = get();
    // Filter out our own player from the remote map (by ID and username)
    const filtered: Record<string, PlayerState> = {};
    for (const [id, player] of Object.entries(players)) {
      if (id !== localPlayerId && player.username !== username) {
        filtered[id] = player;
      }
    }
    set({ remotePlayers: filtered });
  },

  syncWorldUpdate: (tension, events, vehicles) => {
    set((state) => ({
      tension,
      vehicles: vehicles.length > 0 ? vehicles : state.vehicles,
      events: [...events, ...state.events].slice(0, 20),
    }));
  },

  setConnectionStatus: (connected) => set({ isConnected: connected }),
}));
