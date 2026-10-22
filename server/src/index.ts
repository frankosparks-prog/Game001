import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { WorldSimulation } from './game/worldSimulation';
import { setupProtestSockets } from './sockets/protestSocket';
import { createApiRouter } from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN || process.env.CLIENT_URL || '*';

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Initialize World Simulation Engine
const simulation = new WorldSimulation();

// Register REST APIs
app.use('/api', createApiRouter(simulation));

// Create HTTP and WebSocket Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Attach Socket.IO game loop
setupProtestSockets(io, simulation);

// Optional MongoDB Connection (Persists accounts & saved placards)
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('🍃 Connected to MongoDB.'))
    .catch((err) => console.warn('⚠️ MongoDB connection failed, continuing with in-memory persistence:', err.message));
} else {
  console.log('ℹ️ Running with fast in-memory protest state (Set MONGODB_URI to enable persistent accounts).');
}

server.listen(PORT, () => {
  console.log(`🇰🇪 Nairobi Pulse Multiplayer Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
});
