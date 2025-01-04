import { Server, Socket } from 'socket.io';
import { BroadcastSession, KeystrokeData, BroadcastData } from '../types';

export class BroadcastManager {
  private broadcasts: Map<string, BroadcastSession>;

  constructor(io: Server) {
    this.broadcasts = new Map();

    io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      socket.on('broadcast:create', ({ url, hashedPassword }: Pick<BroadcastSession, 'url' | 'hashedPassword'>) => {
        if (this.broadcasts.has(url)) {
          socket.emit('broadcast:error', 'URL already in use');
          return;
        }

        const session: BroadcastSession = {
          url,
          hashedPassword,
          creatorId: socket.id,
          connectedClients: new Set([socket.id])
        };

        this.broadcasts.set(url, session);
        socket.join(url);
        socket.emit('broadcast:connected');
      });

      socket.on('broadcast:join', ({ url, hashedPassword }: Pick<BroadcastSession, 'url' | 'hashedPassword'>) => {
        const session = this.broadcasts.get(url);

        if (!session) {
          socket.emit('broadcast:error', 'Broadcast not found');
          return;
        }

        if (session.hashedPassword) {
          if (!hashedPassword) {
            socket.emit('broadcast:error', 'Password required');
            return;
          }

          if (hashedPassword !== session.hashedPassword) {
            socket.emit('broadcast:error', 'Invalid password');
            return;
          }
        }

        session.connectedClients.add(socket.id);
        socket.join(url);
        socket.emit('broadcast:connected');
      });

      socket.on('broadcast:keystroke', (data: { url: string; keystroke: KeystrokeData }) => {
        const session = this.broadcasts.get(data.url);
        if (session?.connectedClients.has(socket.id)) {
          socket.to(data.url).emit('broadcast:keystroke', data.keystroke);
        }
      });

      socket.on('disconnect', () => {
        for (const [url, session] of this.broadcasts.entries()) {
          if (session.connectedClients.has(socket.id)) {
            session.connectedClients.delete(socket.id);
            
            // If creator disconnects, end the broadcast
            if (session.creatorId === socket.id) {
              socket.to(url).emit('broadcast:error', 'Broadcast ended');
              this.broadcasts.delete(url);
            }
            // If no clients left, clean up
            else if (session.connectedClients.size === 0) {
              this.broadcasts.delete(url);
            }
          }
        }
      });
    });
  }
} 