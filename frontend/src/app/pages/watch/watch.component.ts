import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BroadcastService, KeystrokeData, ConnectionStatus } from '../../shared/services/broadcast.service';
import { CryptoService } from '../../shared/services/crypto.service';
import { PasswordPromptComponent } from '../../shared/components/password-prompt/password-prompt.component';

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
  cursorPosition = 0;
  isConnected = false;
  error?: string;
  showPasswordPrompt = false;
  statusText = 'Connecting...';
  private keystrokesSubscription?: Subscription;
  private connectionSubscription?: Subscription;

  constructor(
    private broadcastService: BroadcastService,
    private route: ActivatedRoute,
    private router: Router,
    private cryptoService: CryptoService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.broadcastKey = params['url'];
      if (!this.broadcastKey) {
        this.router.navigate(['/']);
        return;
      }
      this.joinBroadcast();
    });

    // Subscribe to connection status updates
    this.connectionSubscription = this.broadcastService.getConnectionStatus().subscribe({
      next: (status: ConnectionStatus) => {
        if (status.connected) {
          this.isConnected = true;
          this.error = undefined;
          this.showPasswordPrompt = false;
          this.currentContent = '';
          this.cursorPosition = 0;
          this.statusText = status.broadcastStarted 
            ? `Connected to: miab.local/${this.broadcastKey}`
            : 'Waiting for the broadcast to start...';
        } else {
          this.isConnected = false;
          if (status.error === 'Password required') {
            this.error = status.error;
            this.showPasswordPrompt = true;
            this.statusText = 'Password required';
          } else if (status.error === 'Invalid password') {
            this.error = status.error;
            this.statusText = 'Invalid password';
            setTimeout(() => this.showPasswordPrompt = true, 100);
          } else {
            this.error = status.error;
            this.statusText = status.error || 'Connecting...';
          }
        }
      }
    });

    // Subscribe to keystrokes
    this.keystrokesSubscription = this.broadcastService.getKeystrokes().subscribe({
      next: (keystroke: KeystrokeData | null) => {
        console.log('Keystroke received in component:', keystroke); // Debug log
        if (keystroke) {
          this.handleKeystroke(keystroke);
        }
      }
    });
  }

  onPasswordSubmit(password: string) {
    this.showPasswordPrompt = false;
    const hashedPassword = this.cryptoService.hashPassword(password);
    this.joinBroadcast(hashedPassword);
  }

  private joinBroadcast(password?: string) {
    this.broadcastService.joinBroadcast(this.broadcastKey, password);
  }

  ngOnDestroy() {
    this.keystrokesSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
    this.broadcastService.leaveBroadcast();
  }

  leaveBroadcast() {
    this.keystrokesSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
    this.broadcastService.leaveBroadcast();
    this.router.navigate(['/']);
  }

  private handleKeystroke(keystroke: KeystrokeData) {
    console.log('Processing keystroke:', keystroke); // Debug log
    const keyCode = keystroke.keyCode;
    
    // Check for special arrow key codes
    if (keyCode === 0x1B5B44) { // Left Arrow
      this.cursorPosition = Math.max(0, this.cursorPosition - 1);
    } else if (keyCode === 0x1B5B43) { // Right Arrow
      this.cursorPosition = Math.min(this.currentContent.length, this.cursorPosition + 1);
    } else if (keyCode === 0x1B5B41 || keyCode === 0x1B5B42) { // Up or Down Arrow
      const lines = this.currentContent.split('\n');
      let currentLine = 0;
      let pos = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (pos + lines[i].length >= this.cursorPosition) {
          currentLine = i;
          break;
        }
        pos += lines[i].length + 1;
      }
      
      if (keyCode === 0x1B5B41) { // Up Arrow
        if (currentLine > 0) {
          const targetPos = pos - lines[currentLine - 1].length - 1;
          this.cursorPosition = Math.max(0, targetPos);
        }
      } else { // Down Arrow
        if (currentLine < lines.length - 1) {
          const targetPos = pos + lines[currentLine].length + 1;
          this.cursorPosition = Math.min(this.currentContent.length, targetPos);
        }
      }
    } else if (keyCode === 8) { // Backspace
      this.currentContent = 
        this.currentContent.slice(0, this.cursorPosition - 1) + 
        this.currentContent.slice(this.cursorPosition);
      this.cursorPosition = Math.max(0, this.cursorPosition - 1);
    } else if (keyCode === 13) { // Enter
      this.currentContent = 
        this.currentContent.slice(0, this.cursorPosition) + 
        '\n' + 
        this.currentContent.slice(this.cursorPosition);
      this.cursorPosition++;
    } else {
      // Regular character
      this.currentContent = 
        this.currentContent.slice(0, this.cursorPosition) + 
        String.fromCharCode(keyCode) + 
        this.currentContent.slice(this.cursorPosition);
      this.cursorPosition++;
    }
  }
} 