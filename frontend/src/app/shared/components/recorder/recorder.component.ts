import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecordingService } from '../../services/recording.service';

@Component({
  selector: 'app-recorder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.scss']
})
export class RecorderComponent implements OnDestroy {
  @Input() recordingKey = '';
  @Input() isDisabled = false;
  @Input() shouldRecord = true;
  
  @Output() recordingEnded = new EventEmitter<string>();
  @Output() recordingStarted = new EventEmitter<void>();
  @Output() keystroke = new EventEmitter<{timestamp: number, keyCode: number}>();

  isStarted = false;
  isEnded = false;
  elapsedTime = 0;
  private startTime: number = 0;
  private timerInterval?: number;

  constructor(private recordingService: RecordingService) {}

  onStart() {
    this.isStarted = true;
    this.startTime = performance.now();
    this.recordingStarted.emit();
    
    if (this.shouldRecord) {
      this.recordingService.startRecording(this.recordingKey);
    }
    
    this.timerInterval = window.setInterval(() => {
      this.elapsedTime = Math.floor(performance.now() - this.startTime);
    }, 10);
  }

  onEnd() {
    const endTime = Math.floor(performance.now() - this.startTime);
    
    if (this.shouldRecord) {
      this.recordingService.endRecording(this.recordingKey, endTime);
      this.recordingEnded.emit(this.recordingService.getRecording(this.recordingKey) || '');
    } else {
      this.recordingEnded.emit('');
    }
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.isEnded = true;
  }

  onKeystroke(event: KeyboardEvent) {
    if (!this.isStarted || this.isEnded) return;

    const timestamp = Math.floor(performance.now() - this.startTime);
    let keyCode: number;

    if (event.key.length === 1) {
      keyCode = event.key.charCodeAt(0);
    } else {
      switch(event.code) {
        case 'Enter': keyCode = 13; break;
        case 'Backspace': keyCode = 8; break;
        case 'ArrowLeft': keyCode = 0x1B5B44; break;
        case 'ArrowUp': keyCode = 0x1B5B41; break;
        case 'ArrowRight': keyCode = 0x1B5B43; break;
        case 'ArrowDown': keyCode = 0x1B5B42; break;
        default: return;
      }
    }

    if (this.shouldRecord) {
      this.recordingService.appendKeystroke(this.recordingKey, timestamp, keyCode);
    }
    
    this.keystroke.emit({ timestamp, keyCode });
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
    if (!this.isEnded) {
      this.onEnd();
    }
  }
} 