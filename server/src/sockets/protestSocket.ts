import { Server, Socket } from 'socket.io';
import { WorldSimulation } from '../game/worldSimulation';
import type { 
  JoinProtestPayload, 
  PlayerState, 
  ChatMessage, 
  ServerWorldUpdatePayload 
} from '@nairobi-pulse/shared';

export function setupProtestSockets(io: Server, simulation: WorldSimulation) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Protester connected: ${socket.id}`);

    // Player joins the protest with their username & placard
    socket.on('protest:join', (payload: JoinProtestPayload) => {
      // Send immediate welcome packet with player's authoritative server ID
      socket.emit('protest:welcome', { yourId: socket.id });

      const initialPlayer: PlayerState = {
        id: socket.id,
        username: payload.username || 'GenZ_' + socket.id.substring(0, 4),
        position: [
          (Math.random() - 0.5) * 8,
          1.2,
          12 + Math.random() * 4
        ],
        rotation: [0, 0, 0],
        animation: 'idle',
        placardText: payload.placardText || 'REJECT FINANCE BILL',
        isChanting: false,
        isStreaming: false,
        hype: 40,
        teargasExposure: 0,
        outfitColor: payload.outfitColor || '#10b981',
        hasFlag: true,
      };

      simulation.addPlayer(initialPlayer);
      console.log(`[Protest] ${initialPlayer.username} joined the march.`);

      // Broadcast welcome shout
      io.emit('chat:broadcast', {
        id: 'msg_join_' + Date.now(),
        senderId: 'system',
        senderName: 'CBD Coordinator',
        text: `🇰🇪 ${initialPlayer.username} just joined the protest carrying: "${initialPlayer.placardText}"`,
        timestamp: Date.now(),
        isChant: true,
      } as ChatMessage);
    });

    // Player sends transform and animation update (20Hz)
    socket.on('player:update', (delta: Partial<PlayerState>) => {
      simulation.updatePlayer(socket.id, delta);
    });

    // Player sends a chat or crowd shout
    socket.on('chat:send', (msg: ChatMessage) => {
      io.emit('chat:broadcast', msg);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`[Socket] Protester disconnected: ${socket.id}`);
      simulation.removePlayer(socket.id);
    });
  });

  // Global Server Game Tick (Default 20Hz = 50ms)
  const tickHz = Number(process.env.SIMULATION_TICK_HZ) || 20;
  const tickIntervalMs = Math.round(1000 / tickHz);
  const dt = 1 / tickHz;

  setInterval(() => {
    simulation.tick(dt);

    const updatePayload: ServerWorldUpdatePayload = {
      serverTime: Date.now(),
      players: simulation.getPlayers(),
      tension: simulation.getTension(),
      events: simulation.getEvents(),
      vehicles: simulation.getVehicles(),
    };

    io.emit('world:update', updatePayload);
  }, tickIntervalMs);
}
