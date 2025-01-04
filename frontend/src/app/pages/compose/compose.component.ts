import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BroadcastService, ConnectionStatus } from '../../shared/services/broadcast.service';
import { RecordingService } from '../../shared/services/recording.service';
import { ReplayViewerComponent } from '../../shared/components/replay-viewer/replay-viewer.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-compose',
  standalone: true,
  imports: [CommonModule, ReplayViewerComponent],
  templateUrl: './compose.component.html',
  styleUrls: ['../../shared/styles/container.scss', './compose.component.scss']
})
export class ComposeComponent implements OnInit, OnDestroy {
  title = 'Broadcast';
  broadcastKey = '';
  isConnected = false;
  error?: string;
  isBroadcastEnded = false;
  isBroadcastStarted = false;
  private startTime: number = 0;
  private connectionSubscription?: Subscription;
  elapsedTime: number = 0;
  private timerInterval?: number;

  constructor(
    private broadcastService: BroadcastService,
    private recordingService: RecordingService,
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
            this.error = undefined;
          } else if (status.error) {
            this.isConnected = false;
            this.error = status.error;
            if (status.error === 'Broadcast ended by creator') {
              this.isBroadcastEnded = true;
              if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = undefined;
              }
            }
          }
        }
      });
    });
  }

  startBroadcast() {
    this.isBroadcastStarted = true;
    this.startTime = performance.now();
    this.recordingService.startRecording(this.broadcastKey);
    this.broadcastService.startBroadcasting(this.broadcastKey);
    
    // Start timer
    this.timerInterval = window.setInterval(() => {
      this.elapsedTime = Math.floor(performance.now() - this.startTime);
    }, 10);
  }

  getBroadcastStatus(): string {
    if (this.error) return this.error;
    if (!this.isConnected) return 'Connecting...';
    if (this.isBroadcastEnded) return 'Broadcast ended';
    if (!this.isBroadcastStarted) return 'Ready to broadcast';
    return `Broadcasting to: miab.local/${this.broadcastKey}`;
  }

  onKeystroke(event: KeyboardEvent) {
    if (!this.isConnected || !this.isBroadcastStarted || this.isBroadcastEnded) return;

    const timestamp = Math.floor(performance.now() - this.startTime);
    let keyCode: number;

    if (event.key.length === 1) {
      // Regular character keys - use charCode
      keyCode = event.key.charCodeAt(0);
    } else {
      // Special keys - use special codes
      switch(event.code) {
        case 'Enter':
          keyCode = 13;
          break;
        case 'Backspace':
          keyCode = 8;
          break;
        case 'ArrowLeft':
          keyCode = 0x1B5B44;  // Special code for left arrow
          break;
        case 'ArrowUp':
          keyCode = 0x1B5B41;  // Special code for up arrow
          break;
        case 'ArrowRight':
          keyCode = 0x1B5B43;  // Special code for right arrow
          break;
        case 'ArrowDown':
          keyCode = 0x1B5B42;  // Special code for down arrow
          break;
        default:
          return; // Ignore other special keys
      }
    }

    this.recordingService.appendKeystroke(this.broadcastKey, timestamp, keyCode);
    this.broadcastService.broadcastKeystroke(this.broadcastKey, { keyCode, timestamp });
  }

  endBroadcast() {
    if (this.broadcastKey) {
      const endTime = Math.floor(performance.now() - this.startTime);
      this.recordingService.endRecording(this.broadcastKey, endTime);
      
      // Clear timer
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      
      this.isBroadcastEnded = true;
      this.broadcastService.endBroadcast(this.broadcastKey);
    }
  }

  formatTime(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.connectionSubscription?.unsubscribe();
    if (!this.isBroadcastEnded) {
      this.endBroadcast();
    }
  }

  get recording(): string {
    return this.recordingService.getRecording(this.broadcastKey) || '';
  }

  downloadRecording() {
    const blob = new Blob([this.recording], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.broadcastKey}.miab`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
} 