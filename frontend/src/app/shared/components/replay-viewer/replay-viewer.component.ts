import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface KeystrokeEvent {
  timestamp: number;
  keyCode: number;
}

@Component({
  selector: 'app-replay-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './replay-viewer.component.html',
  styleUrls: ['./replay-viewer.component.scss']
})
export class ReplayViewerComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() recordingData: string = '';
  @ViewChild('progressBar') progressBar!: ElementRef;

  replayContent = '';
  isPlaying = false;
  replayProgress = 0;
  currentTime = 0;
  totalTime = 0;
  private replayStartTime = 0;
  private animationFrame?: number;
  private replayTimeouts: number[] = [];
  private keystrokeEvents: KeystrokeEvent[] = [];
  private isScrubbing = false;

  ngOnInit() {
    this.parseRecording();
  }

  private parseRecording() {
    if (!this.recordingData) return;
    
    const events = this.recordingData.split('|');
    let currentIndex = 0;
    
    // Skip 'start' event
    if (events[0] === 'start') {
      currentIndex = 1;
    }

    // Parse all events except the last one (which should be 'end')
    while (currentIndex < events.length - 1) {
      const [timestamp, keyCode] = events[currentIndex].split(':');
      this.keystrokeEvents.push({
        timestamp: parseInt(timestamp),
        keyCode: parseInt(keyCode)
      });
      currentIndex++;
    }

    // Get total time from the end event
    const lastEvent = events[events.length - 1];
    if (lastEvent.endsWith('end')) {
      const [timestamp] = lastEvent.split(':');
      this.totalTime = parseInt(timestamp);
    }
  }

  toggleReplay() {
    if (this.isPlaying) {
      this.pauseReplay();
    } else {
      this.startReplay();
    }
  }

  private startReplay() {
    this.isPlaying = true;
    this.replayStartTime = performance.now() - this.currentTime;
    this.replayContent = '';
    
    // Start animation frame loop
    this.animate();
  }

  private pauseReplay() {
    this.isPlaying = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private animate() {
    const currentTime = performance.now() - this.replayStartTime;
    this.currentTime = Math.min(currentTime, this.totalTime);
    this.replayProgress = (this.currentTime / this.totalTime) * 100;

    // Process all keystrokes up to current time
    this.processKeystrokesUpToTime(this.currentTime);

    if (this.currentTime < this.totalTime && this.isPlaying) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
    } else {
      this.isPlaying = false;
    }
  }

  private processKeystrokesUpToTime(currentTime: number) {
    while (
      this.keystrokeEvents.length > 0 && 
      this.keystrokeEvents[0].timestamp <= currentTime
    ) {
      const event = this.keystrokeEvents.shift()!;
      this.processKeystroke(event.keyCode);
    }
  }

  private processKeystroke(keyCode: number) {
    if (keyCode === 8) { // Backspace
      this.replayContent = this.replayContent.slice(0, -1);
    } else if (keyCode === 13) { // Enter
      this.replayContent += '\n';
    } else {
      // Convert ASCII code back to character
      this.replayContent += String.fromCharCode(keyCode);
    }
  }

  startScrubbing(event: MouseEvent) {
    this.isScrubbing = true;
    this.pauseReplay();
    this.scrub(event);
  }

  scrub(event: MouseEvent) {
    if (!this.isScrubbing) return;
    
    const rect = this.progressBar.nativeElement.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width;
    const newTime = this.totalTime * Math.max(0, Math.min(1, position));
    
    // Reset replay state
    this.currentTime = newTime;
    this.replayProgress = (newTime / this.totalTime) * 100;
    this.replayContent = '';
    
    // Rebuild keystroke events array
    this.parseRecording();
    // Process keystrokes up to new time
    this.processKeystrokesUpToTime(newTime);
  }

  stopScrubbing() {
    this.isScrubbing = false;
  }

  formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
} 