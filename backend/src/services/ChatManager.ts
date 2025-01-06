import { Server, Socket, Namespace } from 'socket.io';
import { NameGenerator } from './NameGenerator';

interface User {
  username: string;
  color: string;
  isBroadcaster?: boolean;
}

export class ChatManager {
  private rooms: Map<string, Map<string, User>> = new Map(); // roomId -> Map<socketId, User>
  private nameGenerator: NameGenerator;
  private broadcasters: Map<string, string> = new Map(); // roomId -> socketId

  constructor(io: Server) {
    this.nameGenerator = new NameGenerator();
    const chatNamespace = io.of('/chat');

    chatNamespace.on('connection', (socket: Socket) => {
      console.log('Chat client connected:', socket.id);

      socket.on('chat:join', ({ roomId, isBroadcaster }: { roomId: string, isBroadcaster?: boolean }) => {
        console.log('User joining room:', { roomId, socketId: socket.id, isBroadcaster });
        
        let username: string;
        if (isBroadcaster) {
          username = 'OP';
        } else {
          const roomUsers = Array.from(this.rooms.get(roomId)?.values() || []);
          do {
            username = this.nameGenerator.generateName();
          } while (roomUsers.some(user => user.username === username));
        }

        const color = isBroadcaster ? '#FFD700' : this.generateVibrantColor();
        
        if (isBroadcaster) {
          this.broadcasters.set(roomId, socket.id);
        }

        if (!this.rooms.has(roomId)) {
          this.rooms.set(roomId, new Map());
        }

        const room = this.rooms.get(roomId)!;
        room.set(socket.id, { username, color, isBroadcaster });
        
        socket.join(roomId);
        
        console.log('Room state after join:', {
          roomId,
          participants: room.size,
          users: Array.from(room.entries())
        });

        chatNamespace.to(roomId).emit('chat:participants', room.size);
      });

      socket.on('chat:message', ({ roomId, message }: { roomId: string, message: any }) => {
        const room = this.rooms.get(roomId);
        const user = room?.get(socket.id);
        if (user) {
          const enrichedMessage = {
            content: message.content,
            timestamp: message.timestamp,
            username: user.username,
            color: user.color
          };
          socket.to(roomId).emit('chat:message', enrichedMessage);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        this.rooms.forEach((room, roomId) => {
          if (room.has(socket.id)) {
            this.handleLeaveRoom(socket, chatNamespace, roomId);
          }
        });
      });
    });
  }

  private handleLeaveRoom(socket: Socket, namespace: Namespace, roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    console.log('User leaving room:', { roomId, socketId: socket.id });
    
    socket.leave(roomId);
    room.delete(socket.id);

    if (this.broadcasters.get(roomId) === socket.id) {
      this.broadcasters.delete(roomId);
    }

    if (room.size === 0) {
      this.rooms.delete(roomId);
    } else {
      namespace.to(roomId).emit('chat:participants', room.size);
    }

    console.log('Room state after leave:', {
      roomId,
      participants: room.size,
      users: Array.from(room.entries())
    });
  }

  private generateVibrantColor(): string {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 50%)`;
  }
} 