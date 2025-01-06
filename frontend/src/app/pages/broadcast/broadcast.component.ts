import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BroadcastService, ConnectionStatus } from '../../shared/services/broadcast.service';
import { RecorderComponent } from '../../shared/components/recorder/recorder.component';
import { ReplayViewerComponent } from '../../shared/components/replay-viewer/replay-viewer.component';
import { Subscription } from 'rxjs';
import { LiveChatComponent } from '../../shared/components/live-chat/live-chat.component';

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RecorderComponent, 
    ReplayViewerComponent,
    LiveChatComponent
  ],
  templateUrl: './broadcast.component.html',
  styleUrls: ['../../shared/styles/layout/_container.scss', './broadcast.component.scss']
})
export class BroadcastComponent implements OnInit, OnDestroy {
  title = 'Broadcast Message';
  broadcastKey = '';
  isConnected = false;
  isBroadcastStarted = false;
  isBroadcastEnded = false;
  isRecordingEnabled = true;
  error: string | null = null;
  private connectionSubscription?: Subscription;

  constructor(
    private broadcastService: BroadcastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.broadcastKey = params['url'];
      if (!this.broadcastKey) {
        this.router.navigate(['/']);
        return;
      }

      this.connectionSubscription = this.broadcastService.getConnectionStatus().subscribe({
        next: (status: ConnectionStatus) => {
          if (status.connected) {
            this.isConnected = true;
            this.error = null;
          } else if (status.error) {
            this.isConnected = false;
            this.error = status.error;
            if (status.error === 'Broadcast ended by creator') {
              this.isBroadcastEnded = true;
            }
          }
        }
      });
    });
  }

  startBroadcast() {
    this.isBroadcastStarted = true;
    this.broadcastService.startBroadcasting(this.broadcastKey);
  }

  onKeystroke(event: {timestamp: number, keyCode: number}) {
    if (!this.isConnected || !this.isBroadcastStarted || this.isBroadcastEnded) return;
    this.broadcastService.broadcastKeystroke(this.broadcastKey, event);
  }

  onRecordingEnded() {
    this.isBroadcastEnded = true;
    this.broadcastService.endBroadcast(this.broadcastKey);
  }

  downloadRecording() {
    if (!this.isRecordingEnabled) return;
    
    const blob = new Blob([localStorage.getItem('recording_' + this.broadcastKey) || ''], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.broadcastKey}.miab`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  getBroadcastStatus(): string {
    if (this.error) return this.error;
    if (!this.isConnected) return 'Connecting...';
    if (this.isBroadcastEnded) return 'Broadcast ended';
    if (!this.isBroadcastStarted) return 'Ready to broadcast';
    return `Broadcasting to: miab.local/watch/${this.broadcastKey}`;
  }

  ngOnDestroy() {
    this.connectionSubscription?.unsubscribe();
    if (!this.isBroadcastEnded) {
      this.broadcastService.endBroadcast(this.broadcastKey);
    }
  }
} 