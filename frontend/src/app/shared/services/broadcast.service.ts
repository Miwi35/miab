import { Injectable } from '@angular/core';
import { Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { io } from 'socket.io-client';

export interface KeystrokeData {
  keyCode: number;
  timestamp: number;
}

export interface ConnectionStatus {
  connected: boolean;
  error?: string;
  broadcastStarted?: boolean;
}

export interface BroadcastSession {
  url: string;
  hashedPassword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {
  private socket: Socket;
  private keystrokeSubject = new BehaviorSubject<KeystrokeData | null>(null);
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>({ connected: false });

  constructor() {
    this.socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    this.setupSocketListeners();
  }

  createBroadcast(config: BroadcastSession): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('broadcast:create', config);
      
      const onCreated = () => {
        this.socket.off('broadcast:error', onError);
        this.connectionStatusSubject.next({ 
          connected: true,
          broadcastStarted: false 
        });
        resolve();
      };

      const onError = (error: string) => {
        this.socket.off('broadcast:created', onCreated);
        reject(new Error(error));
      };

      this.socket.once('broadcast:created', onCreated);
      this.socket.once('broadcast:error', onError);
    });
  }

  joinBroadcast(url: string, hashedPassword?: string): void {
    this.socket.emit('watcher:join', { url, hashedPassword });
  }

  broadcastKeystroke(url: string, keystroke: KeystrokeData): void {
    console.log('Sending keystroke:', { url, keystroke }); // Debug log
    this.socket.emit('broadcast:keystroke', { url, keystroke });
  }

  startBroadcasting(url: string): void {
    this.socket.emit('broadcast:start', { url });
  }

  endBroadcast(url: string): void {
    this.socket.emit('broadcast:end', { url });
    this.socket.disconnect();
  }

  leaveBroadcast(): void {
    this.socket.emit('watcher:leave');
    this.socket.disconnect();
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connectionStatusSubject.next({ 
        connected: false, 
        error: 'Disconnected from server' 
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.connectionStatusSubject.next({ 
        connected: false, 
        error: 'Connection failed' 
      });
    });

    this.socket.on('watcher:joined', () => {
      this.connectionStatusSubject.next({ 
        connected: true,
        broadcastStarted: false 
      });
    });

    this.socket.on('broadcast:started', () => {
      this.connectionStatusSubject.next({ 
        connected: true,
        broadcastStarted: true 
      });
    });

    this.socket.on('broadcast:ended', () => {
      this.connectionStatusSubject.next({ 
        connected: false,
        error: 'Broadcast ended by creator'
      });
    });

    this.socket.on('broadcast:error', (error: string) => {
      this.connectionStatusSubject.next({ 
        connected: false, 
        error 
      });
    });

    this.socket.on('broadcast:keystroke', (data: KeystrokeData) => {
      console.log('Received keystroke:', data); // Debug log
      this.keystrokeSubject.next(data);
    });
  }

  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatusSubject.asObservable();
  }

  getKeystrokes(): Observable<KeystrokeData | null> {
    return this.keystrokeSubject.asObservable();
  }

  isConnected(): boolean {
    return this.socket.connected && this.connectionStatusSubject.value.connected;
  }
} 