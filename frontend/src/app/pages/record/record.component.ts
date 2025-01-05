import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReplayViewerComponent } from '../../shared/components/replay-viewer/replay-viewer.component';
import { RecorderComponent } from '../../shared/components/recorder/recorder.component';

@Component({
  selector: 'app-record',
  standalone: true,
  imports: [CommonModule, ReplayViewerComponent, RecorderComponent],
  templateUrl: './record.component.html',
  styleUrls: ['../../shared/styles/layout/_container.scss', './record.component.scss']
})
export class RecordComponent {
  title = 'Record Message';
  recordingTitle = '';
  isRecordingEnded = false;
  recordingData = '';

  onTitleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const sanitizedValue = input.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    this.recordingTitle = sanitizedValue;
    if (input.value !== sanitizedValue) {
      input.value = sanitizedValue;
    }
  }

  isTitleValid(): boolean {
    return this.recordingTitle.length >= 3 && /^[a-z0-9-]+$/.test(this.recordingTitle);
  }

  onRecordingEnded(recordingData: string) {
    this.recordingData = recordingData;
    this.isRecordingEnded = true;
  }

  downloadRecording() {
    const blob = new Blob([this.recordingData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.recordingTitle}.miab`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
} 