import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecordingService } from '../../services/recording.service';

@Component({
  selector: 'app-recording-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recording-loader.component.html',
  styleUrls: ['./recording-loader.component.scss']
})
export class RecordingLoaderComponent {
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