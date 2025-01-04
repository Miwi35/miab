import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReplayViewerComponent } from '../../shared/components/replay-viewer/replay-viewer.component';

interface Recording {
  timestamp: number;
  duration: number;
  recording: string;
}

@Component({
  selector: 'app-replay',
  standalone: true,
  imports: [CommonModule, RouterLink, ReplayViewerComponent],
  templateUrl: './replay.component.html',
  styleUrls: ['./replay.component.scss']
})
export class ReplayComponent implements OnInit {
  title = '';
  recordingData = '';
  private recording: Recording | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const path = this.route.snapshot.params['path'];
    const recordingData = localStorage.getItem(`replay_${path}`);
    
    if (!recordingData) {
      this.router.navigate(['/']);
      return;
    }

    try {
      this.recording = JSON.parse(recordingData);
      if (this.recording) {
        this.title = `Replay: ${path}`;
        this.recordingData = this.recording.recording;
      }
    } catch (error) {
      console.error('Error parsing recording:', error);
      this.router.navigate(['/']);
    }
  }

  getFormattedDate(): string {
    if (!this.recording) return '';
    return new Date(this.recording.timestamp).toLocaleString();
  }
} 