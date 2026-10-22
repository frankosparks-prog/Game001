import { Router } from 'express';
import { WorldSimulation } from '../game/worldSimulation';

export function createApiRouter(simulation: WorldSimulation): Router {
  const router = Router();

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Nairobi Pulse 3D Multiplayer Engine',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Current Nairobi CBD Protest statistics
  router.get('/protest/stats', (req, res) => {
    const tension = simulation.getTension();
    const players = simulation.getPlayers();
    res.json({
      tension,
      activeProtesters: Object.keys(players).length,
      sampleProtesters: Object.values(players).map((p) => ({
        username: p.username,
        placard: p.placardText,
        isChanting: p.isChanting,
        isStreaming: p.isStreaming,
      })),
    });
  });

  // Popular Placard Slogans
  router.get('/placards/trending', (req, res) => {
    res.json({
      trending: [
        'REJECT FINANCE BILL 2024!',
        'TUMECHOKA!',
        'WHERE IS THE HEALTHCARE BUDGET?',
        'TRIBELESS & PARTYLESS',
        'PEACEFUL BUT UNBOWED',
        'ACCCOUNTABILITY NOW!',
      ],
    });
  });

  return router;
}
