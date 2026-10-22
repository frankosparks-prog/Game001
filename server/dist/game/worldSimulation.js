"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldSimulation = void 0;
/**
 * WorldSimulation
 * Manages the live state of the Nairobi CBD protest server:
 * - Active player registries
 * - NPC protesters to maintain crowd density
 * - Dynamic political tension dynamics
 * - Vehicle convoy waypoints
 */
class WorldSimulation {
    players = new Map();
    tension = {
        publicSolidarity: 70,
        policeAlertLevel: 40,
        politicalPanic: 50,
        activeProtesters: 1,
        trendingHashtag: '#OccupyParliament',
    };
    events = [];
    vehicles = [
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
    ];
    constructor() {
        this.initNPCProtesters();
    }
    /**
     * Initializes atmospheric NPC Gen Z protesters to ensure the CBD feels vibrant
     * even when a single player connects.
     */
    initNPCProtesters() {
        const npcPresets = [
            { name: 'GenZ_Wangari', slogan: 'TREES OVER CORRUPTION', color: '#10b981', pos: [-3, 0.9, 12] },
            { name: 'Nairobi_Techie', slogan: 'CODE & PROTEST', color: '#38bdf8', pos: [4, 0.9, 14] },
            { name: 'Gikomba_Trader', slogan: 'LOWER OUR TAXES NOW', color: '#f59e0b', pos: [-2, 0.9, 8] },
            { name: 'Campus_Comrade', slogan: 'TUMECHOKA KUDANGANYWA', color: '#ef4444', pos: [2, 0.9, 10] },
            { name: 'Boda_Rider', slogan: 'FUEL PRICES MUST FALL', color: '#a855f7', pos: [-6, 0.9, 16] },
        ];
        npcPresets.forEach((npc, index) => {
            this.players.set(`npc_${index}`, {
                id: `npc_${index}`,
                username: npc.name,
                position: [npc.pos[0], npc.pos[1], npc.pos[2]],
                rotation: [0, 0, 0],
                animation: 'idle',
                placardText: npc.slogan,
                isChanting: index % 2 === 0,
                isStreaming: index === 0,
                hype: 80,
                teargasExposure: 0,
                outfitColor: npc.color,
                hasFlag: true,
            });
        });
    }
    addPlayer(player) {
        this.players.set(player.id, player);
        this.updateTension();
    }
    updatePlayer(id, delta) {
        const existing = this.players.get(id);
        if (existing) {
            this.players.set(id, { ...existing, ...delta });
        }
    }
    removePlayer(id) {
        this.players.delete(id);
        this.updateTension();
    }
    getPlayers() {
        const obj = {};
        this.players.forEach((val, key) => {
            obj[key] = val;
        });
        return obj;
    }
    getTension() {
        return this.tension;
    }
    getEvents() {
        return this.events;
    }
    getVehicles() {
        return this.vehicles;
    }
    /**
     * Evaluates crowd size and active chanting to adjust political panic and solidarity.
     */
    updateTension() {
        const count = this.players.size;
        let chantingCount = 0;
        this.players.forEach((p) => {
            if (p.isChanting)
                chantingCount++;
        });
        this.tension.activeProtesters = count;
        this.tension.publicSolidarity = Math.min(100, 50 + count * 5 + chantingCount * 8);
        this.tension.politicalPanic = Math.min(100, 30 + chantingCount * 12);
        this.tension.policeAlertLevel = Math.min(100, 20 + count * 6);
    }
    /**
     * Simulation Tick (Called at 20Hz).
     * Animates vehicles and subtle NPC shifts.
     */
    tick(delta) {
        // Subtle NPC sway
        const time = Date.now() / 1000;
        this.players.forEach((p) => {
            if (p.id.startsWith('npc_')) {
                // Toggle chanting periodically
                if (Math.random() < 0.005) {
                    p.isChanting = !p.isChanting;
                }
            }
        });
    }
}
exports.WorldSimulation = WorldSimulation;
