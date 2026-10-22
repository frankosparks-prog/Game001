import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../state/useGameStore';
import type { 
  ServerWorldUpdatePayload, 
  ChatMessage, 
  PlayerState,
  JoinProtestPayload 
} from '@nairobi-pulse/shared';

class NetworkManager {
  private socket: Socket | null = null;
  private updateInterval: any = null;
  private isConnected: boolean = false;

  /**
   * Initializes real-time Socket.IO connection to the multiplayer game server.
   */
  public connect(
    serverUrl: string = process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_SERVER_URL ||
      'http://localhost:3001'
  ) {
    if (this.socket) return;

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 5000,
    });

    const store = useGameStore.getState();

    this.socket.on('connect', () => {
      console.log('🇰🇪 Connected to Nairobi Pulse Multiplayer Server:', this.socket?.id);
      this.isConnected = true;
      if (this.socket?.id) {
        useGameStore.getState().setLocalPlayerId(this.socket.id);
      }
      useGameStore.getState().setConnectionStatus(true);

      // Send initial handshake
      const joinPayload: JoinProtestPayload = {
        username: store.username,
        placardText: store.placardText,
        outfitColor: store.outfitColor,
      };
      this.socket?.emit('protest:join', joinPayload);

      // Start tick sender (20Hz)
      this.startHeartbeat();
    });

    this.socket.on('protest:welcome', (data: { yourId: string }) => {
      if (data?.yourId) {
        useGameStore.getState().setLocalPlayerId(data.yourId);
      }
    });

    this.socket.on('disconnect', () => {
      console.warn('⚠️ Disconnected from multiplayer server. Running local simulation.');
      this.isConnected = false;
      useGameStore.getState().setConnectionStatus(false);
      this.stopHeartbeat();
    });

    this.socket.on('connect_error', () => {
      // Server not reachable (offline dev mode), game will continue seamlessly locally
      useGameStore.getState().setConnectionStatus(false);
    });

    // Server-to-Client delta update
    this.socket.on('world:update', (data: ServerWorldUpdatePayload) => {
      useGameStore.getState().syncRemotePlayers(data.players);
      useGameStore.getState().syncWorldUpdate(data.tension, data.events, data.vehicles);
    });

    // Chat / Megaphone message received
    this.socket.on('chat:broadcast', (msg: ChatMessage) => {
      useGameStore.getState().addChatMessage(msg);
    });
  }

  /**
   * Emits player transform and protest status to the server at 20Hz.
   */
  private startHeartbeat() {
    this.stopHeartbeat();
    this.updateInterval = setInterval(() => {
      if (!this.socket || !this.isConnected) return;

      const state = useGameStore.getState();
      const payload: Partial<PlayerState> = {
        position: state.position,
        rotation: state.rotation,
        animation: state.animation,
        placardText: state.placardText,
        isChanting: state.isChanting,
        isStreaming: state.isStreaming,
        hype: state.hype,
        teargasExposure: state.teargasExposure,
        outfitColor: state.outfitColor,
        hasFlag: state.hasFlag,
      };

      this.socket.emit('player:update', payload);
    }, 50); // 20 updates per second
  }

  private stopHeartbeat() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Broadcast a crowd chant or chat message to all connected peers.
   */
  public sendChatMessage(text: string, isChant: boolean = false) {
    if (!this.socket || !this.isConnected) return;
    const { username } = useGameStore.getState();

    const msg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      senderId: this.socket.id || 'anonymous',
      senderName: username,
      text,
      timestamp: Date.now(),
      isChant,
    };

    this.socket.emit('chat:send', msg);
  }

  public disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const networkManager = new NetworkManager();
