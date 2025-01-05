import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordingService } from '../../services/recording.service';

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
  @ViewChild('progressBar') progressBar!: ElementRef;

  replayContent = '';
  isPlaying = false;
  replayProgress = 0;
  currentTime = 0;
  totalTime = 0;
  cursorPosition = 0;
  private replayStartTime = 0;
  private animationFrame?: number;
  private keystrokeEvents: KeystrokeEvent[] = [];
  private isScrubbing = false;
  private desiredColumn = 0;

  constructor(private recordingService: RecordingService) {}

  ngOnInit() {
    this.parseRecording();
  }

  private parseRecording() {
    const recordingData = this.recordingService.getRecording(this.title);
    if (!recordingData) return;
    
    const events = recordingData.split('|');
    let currentIndex = 0;
    
    if (events[0] === 'start') {
      currentIndex = 1;
    }

    while (currentIndex < events.length - 1) {
      const [timestamp, keyCode] = events[currentIndex].split(':');
      this.keystrokeEvents.push({
        timestamp: parseInt(timestamp),
        keyCode: parseInt(keyCode)
      });
      currentIndex++;
    }

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
    // Check for special arrow key codes
    if (keyCode === 0x1B5B44) { // Left Arrow
      this.cursorPosition = Math.max(0, this.cursorPosition - 1);
      this.updateDesiredColumn();
    } else if (keyCode === 0x1B5B43) { // Right Arrow
      this.cursorPosition = Math.min(this.replayContent.length, this.cursorPosition + 1);
      this.updateDesiredColumn();
    } else if (keyCode === 0x1B5B41 || keyCode === 0x1B5B42) { // Up or Down Arrow
      const lines = this.replayContent.split('\n');
      let currentLine = 0;
      let pos = 0;
      let lineStart = 0;
      
      // Find current line and position
      for (let i = 0; i < lines.length; i++) {
        if (pos + lines[i].length >= this.cursorPosition) {
          currentLine = i;
          lineStart = pos;
          break;
        }
        pos += lines[i].length + 1;
      }

      // If this is the first vertical movement, store the current column
      if (this.desiredColumn === 0) {
        this.desiredColumn = this.cursorPosition - lineStart;
      }

      // Calculate target line
      const targetLine = keyCode === 0x1B5B41 ? 
        Math.max(0, currentLine - 1) : // Up
        Math.min(lines.length - 1, currentLine + 1); // Down

      // Calculate new position
      if (targetLine !== currentLine) {
        // Move to the beginning of the target line
        pos = 0;
        for (let i = 0; i < targetLine; i++) {
          pos += lines[i].length + 1;
        }
        
        // Move to the desired column or end of line
        const targetLineLength = lines[targetLine].length;
        const targetColumn = Math.min(this.desiredColumn, targetLineLength);
        this.cursorPosition = pos + targetColumn;
      }
    } else if (keyCode === 8) { // Backspace
      this.replayContent = 
        this.replayContent.slice(0, this.cursorPosition - 1) + 
        this.replayContent.slice(this.cursorPosition);
      this.cursorPosition = Math.max(0, this.cursorPosition - 1);
      this.desiredColumn = 0;
    } else if (keyCode === 13) { // Enter
      this.replayContent = 
        this.replayContent.slice(0, this.cursorPosition) + 
        '\n' + 
        this.replayContent.slice(this.cursorPosition);
      this.cursorPosition++;
      this.desiredColumn = 0;
    } else {
      // Regular character
      this.replayContent = 
        this.replayContent.slice(0, this.cursorPosition) + 
        String.fromCharCode(keyCode) + 
        this.replayContent.slice(this.cursorPosition);
      this.cursorPosition++;
      this.desiredColumn = 0;
    }
  }

  private updateDesiredColumn() {
    this.desiredColumn = 0;
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