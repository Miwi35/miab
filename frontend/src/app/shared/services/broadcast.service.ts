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
    this.socket = io('http://localhost:3000');
    this.setupSocketListeners();
  }

  createBroadcast(config: BroadcastSession): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('broadcast:create', config);
      
      const onConnect = () => {
        this.socket.off('broadcast:error', onError);
        resolve();
      };

      const onError = (error: string) => {
        this.socket.off('broadcast:connected', onConnect);
        reject(new Error(error));
      };

      this.socket.once('broadcast:connected', onConnect);
      this.socket.once('broadcast:error', onError);
    });
  }

  joinBroadcast(url: string, hashedPassword?: string): void {
    this.socket.emit('broadcast:join', { url, hashedPassword });
  }

  broadcastKeystroke(url: string, keystroke: KeystrokeData): void {
    this.socket.emit('broadcast:keystroke', { url, keystroke });
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      this.connectionStatusSubject.next({ connected: true });
    });

    this.socket.on('disconnect', () => {
      this.connectionStatusSubject.next({ 
        connected: false, 
        error: 'Disconnected from server' 
      });
    });

    this.socket.on('broadcast:error', (error: string) => {
      this.connectionStatusSubject.next({ 
        connected: false, 
        error 
      });
    });

    this.socket.on('broadcast:keystroke', (data: KeystrokeData) => {
      this.keystrokeSubject.next(data);
    });
  }

  getKeystrokes(): Observable<KeystrokeData | null> {
    return this.keystrokeSubject.asObservable();
  }

  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatusSubject.asObservable();
  }

  disconnect() {
    this.socket.disconnect();
  }
} 