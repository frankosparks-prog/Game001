"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const worldSimulation_1 = require("./game/worldSimulation");
const protestSocket_1 = require("./sockets/protestSocket");
const api_1 = require("./routes/api");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN || process.env.CLIENT_URL || '*';
// Middleware
app.use((0, cors_1.default)({ origin: CORS_ORIGIN }));
app.use(express_1.default.json());
// Initialize World Simulation Engine
const simulation = new worldSimulation_1.WorldSimulation();
// Register REST APIs
app.use('/api', (0, api_1.createApiRouter)(simulation));
// Create HTTP and WebSocket Server
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ['GET', 'POST'],
    },
});
// Attach Socket.IO game loop
(0, protestSocket_1.setupProtestSockets)(io, simulation);
// Optional MongoDB Connection (Persists accounts & saved placards)
if (MONGODB_URI) {
    mongoose_1.default
        .connect(MONGODB_URI)
        .then(() => console.log('🍃 Connected to MongoDB.'))
        .catch((err) => console.warn('⚠️ MongoDB connection failed, continuing with in-memory persistence:', err.message));
}
else {
    console.log('ℹ️ Running with fast in-memory protest state (Set MONGODB_URI to enable persistent accounts).');
}
server.listen(PORT, () => {
    console.log(`🇰🇪 Nairobi Pulse Multiplayer Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
});
