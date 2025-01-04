import { Server, Socket } from 'socket.io';
import { BroadcastSession, KeystrokeData, BroadcastData } from '../types/index';

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
          connectedClients: new Set([socket.id]),
          isStarted: false
        };

        this.broadcasts.set(url, session);
        socket.join(url);
        socket.emit('broadcast:created');
      });

      socket.on('broadcast:start', ({ url }: { url: string }) => {
        const session = this.broadcasts.get(url);
        if (session?.creatorId === socket.id) {
          session.isStarted = true;
          io.to(url).emit('broadcast:started');
        }
      });

      socket.on('broadcast:end', ({ url }: { url: string }) => {
        const session = this.broadcasts.get(url);
        if (session?.creatorId === socket.id) {
          io.to(url).emit('broadcast:ended');
          this.broadcasts.delete(url);
        }
      });

      socket.on('watcher:join', ({ url, hashedPassword }: Pick<BroadcastSession, 'url' | 'hashedPassword'>) => {
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
        socket.emit('watcher:joined');
        
        if (session.isStarted) {
          socket.emit('broadcast:started');
        }
      });

      socket.on('broadcast:keystroke', ({ url, keystroke }: { url: string, keystroke: { keyCode: number, timestamp: number } }) => {
        console.log('Received keystroke:', { url, keystroke }); // Debug log
        const session = this.broadcasts.get(url);
        if (session?.connectedClients.has(socket.id)) {
          console.log('Broadcasting keystroke to room:', url); // Debug log
          socket.to(url).emit('broadcast:keystroke', keystroke);
        } else {
          console.log('Session not found or client not in session:', { 
            sessionExists: !!session, 
            clientInSession: session?.connectedClients.has(socket.id) 
          });
        }
      });

      socket.on('disconnect', () => {
        for (const [url, session] of this.broadcasts.entries()) {
          if (session.connectedClients.has(socket.id)) {
            session.connectedClients.delete(socket.id);
            
            // If creator disconnects, end the broadcast
            if (session.creatorId === socket.id) {
              io.to(url).emit('broadcast:ended');
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