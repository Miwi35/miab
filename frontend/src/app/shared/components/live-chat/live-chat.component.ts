import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiveChatService, ChatMessage } from '../../services/live-chat.service';
import { Subscription } from 'rxjs';

interface EnrichedChatMessage extends ChatMessage {
  username: string;
  color: string;
}

@Component({
  selector: 'app-live-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live-chat.component.html',
  styleUrls: ['./live-chat.component.scss']
})
export class LiveChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() roomId: string = '';
  @Input() isBroadcaster: boolean = false;
  
  messages: EnrichedChatMessage[] = [];
  newMessage: string = '';
  participantCount: number = 1;
  
  private messagesSubscription?: Subscription;
  private participantsSubscription?: Subscription;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(private chatService: LiveChatService) {}

  ngOnInit() {
    this.chatService.joinRoom(this.roomId, this.isBroadcaster);
    
    this.messagesSubscription = this.chatService.getMessages()
      .subscribe(messages => this.messages = messages);
      
    this.participantsSubscription = this.chatService.getParticipantCount()
      .subscribe(count => this.participantCount = count);
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    this.chatService.sendMessage(this.roomId, this.newMessage);
    this.newMessage = '';
  }

  ngOnDestroy() {
    this.messagesSubscription?.unsubscribe();
    this.participantsSubscription?.unsubscribe();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch(err) { }
  }
} 