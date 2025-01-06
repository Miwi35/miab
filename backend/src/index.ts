import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from './server';

const app = express();
const httpServer = createServer(app);

// Update CORS configuration
app.use(cors({
  origin: "http://miab.local",
  credentials: true
}));
app.use(express.json());

// Initialize server with socket.io managers
const server = new Server(httpServer, {
  cors: {
    origin: "http://miab.local",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 