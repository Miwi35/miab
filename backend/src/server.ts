import { Server as HttpServer } from 'http';
import { Server as SocketServer, ServerOptions } from 'socket.io';
import { BroadcastManager } from './services/BroadcastManager';
import { ChatManager } from './services/ChatManager';

export class Server {
  private io: SocketServer;
  private broadcastManager: BroadcastManager;
  private chatManager: ChatManager;

  constructor(httpServer: HttpServer, options?: Partial<ServerOptions>) {
    this.io = new SocketServer(httpServer, {
      ...options,
      transports: ['websocket', 'polling']
    });

    this.broadcastManager = new BroadcastManager(this.io);
    this.chatManager = new ChatManager(this.io);
  }
} 