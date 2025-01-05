import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReplayViewerComponent } from '../../shared/components/replay-viewer/replay-viewer.component';
import { RecordingService } from '../../shared/services/recording.service';

@Component({
  selector: 'app-replay',
  standalone: true,
  imports: [CommonModule, RouterLink, ReplayViewerComponent],
  templateUrl: './replay.component.html',
  styleUrls: ['../../shared/styles/layout/_container.scss', './replay.component.scss']
})
export class ReplayComponent implements OnInit {
  title = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private recordingService: RecordingService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const path = params['url'];
      if (!path) {
        this.router.navigate(['/']);
        return;
      }

      if (!this.recordingService.getRecording(path)) {
        console.error('Recording not found');
        this.router.navigate(['/']);
        return;
      }

      this.title = path;
    });
  }
} 