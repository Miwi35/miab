import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatMessage {
  content: string;
  timestamp: Date;
}

interface EnrichedChatMessage extends ChatMessage {
  username: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class LiveChatService {
  private socket: Socket;
  private messagesSubject = new BehaviorSubject<EnrichedChatMessage[]>([]);
  private participantsSubject = new BehaviorSubject<number>(1);

  constructor() {
    console.log('LiveChatService: Initializing');
    this.socket = io('http://localhost:3000/chat', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    this.setupSocketListeners();
  }

  joinRoom(roomId: string, isBroadcaster?: boolean) {
    console.log('LiveChatService: Joining room', { roomId, isBroadcaster });
    this.socket.emit('chat:join', { roomId, isBroadcaster });
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('LiveChatService: Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('LiveChatService: Socket disconnected');
    });

    this.socket.on('chat:message', (message: EnrichedChatMessage) => {
      console.log('LiveChatService: Received message', message);
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
    });

    this.socket.on('chat:participants', (count: number) => {
      console.log('LiveChatService: Participant count updated', count);
      this.participantsSubject.next(count);
    });
  }

  sendMessage(roomId: string, content: string) {
    console.log('LiveChatService: Sending message', { roomId, content });
    const message: ChatMessage = {
      content,
      timestamp: new Date()
    };
    
    const enrichedMessage: EnrichedChatMessage = {
      ...message,
      username: 'me',
      color: "#ffffff"
    };
    
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, enrichedMessage]);
    
    console.log('LiveChatService: Emitting message to server', { roomId, message });
    this.socket.emit('chat:message', { roomId, message });
  }

  getMessages(): Observable<EnrichedChatMessage[]> {
    return this.messagesSubject.asObservable();
  }

  getParticipantCount(): Observable<number> {
    return this.participantsSubject.asObservable();
  }
} 