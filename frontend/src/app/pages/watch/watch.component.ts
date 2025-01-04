import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PasswordPromptComponent } from '../../shared/components/password-prompt/password-prompt.component';
import { BroadcastService, ConnectionStatus, KeystrokeData } from '../../shared/services/broadcast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [CommonModule, PasswordPromptComponent],
  templateUrl: './watch.component.html',
  styleUrls: ['../../shared/styles/container.scss', './watch.component.scss']
})
export class WatchComponent implements OnInit, OnDestroy {
  title = 'Live Broadcast';
  broadcastKey = '';
  currentContent = '';
  isConnected = false;
  error?: string;
  showPasswordPrompt = false;
  private keystrokesSubscription?: Subscription;
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
      this.connectToBroadcast();
    });

    // Subscribe to connection status updates
    this.connectionSubscription = this.broadcastService.getConnectionStatus().subscribe({
      next: (status: ConnectionStatus) => {
        if (status.connected) {
          this.isConnected = true;
          this.error = undefined;
        } else if (status.error) {
          this.error = status.error;
          if (status.error === 'Password required') {
            this.showPasswordPrompt = true;
          }
        }
      }
    });

    // Subscribe to keystrokes and update content
    this.keystrokesSubscription = this.broadcastService.getKeystrokes().subscribe(
      (keystroke: KeystrokeData | null) => {
        if (keystroke) {
          if (keystroke.keyCode === 8) { // Backspace
            this.currentContent = this.currentContent.slice(0, -1);
          } else if (keystroke.keyCode === 13) { // Enter
            this.currentContent += '\n';
          } else {
            this.currentContent += String.fromCharCode(keystroke.keyCode);
          }
        }
      }
    );
  }

  private connectToBroadcast() {
    if (this.broadcastKey) {
      this.title = `Live Broadcast: ${this.broadcastKey}`;
      this.broadcastService.joinBroadcast(this.broadcastKey);
    }
  }

  onPasswordSubmit(password: string) {
    this.showPasswordPrompt = false;
    this.broadcastService.joinBroadcast(this.broadcastKey, password);
  }

  ngOnDestroy() {
    this.connectionSubscription?.unsubscribe();
    this.keystrokesSubscription?.unsubscribe();
    this.broadcastService.disconnect();
  }

  getBroadcastStatus(): string {
    if (this.error) return this.error;
    if (!this.isConnected) return 'Connecting...';
    return `Connected to: miab.local/${this.broadcastKey}`;
  }

  leaveBroadcast() {
    this.broadcastService.disconnect();
    this.router.navigate(['/']);
  }
} 