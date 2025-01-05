import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecordingService } from '../../../../shared/services/recording.service';

@Component({
  selector: 'app-replay-action-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './replay-action-card.component.html',
  styleUrls: ['./replay-action-card.component.scss']
})

export class ReplayActionCardComponent {
  constructor(
    private router: Router,
    private recordingService: RecordingService
  ) {}

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    
    // Check if it's a .miab file
    if (!file.name.endsWith('.miab')) {
      console.error('Invalid file type. Please select a .miab file');
      return;
    }

    try {
      const content = await file.text();
      const path = file.name.slice(0, -5);
      
      this.recordingService.saveRecording(path, content);

      // Navigate to /replay/<path>
      this.router.navigate(['/replay', path]);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  }
} 