import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BroadcastConfigComponent } from '../../shared/components/broadcast-config/broadcast-config.component';
import { BroadcastAccessComponent } from '../../shared/components/broadcast-access/broadcast-access.component';
import { RecordingLoaderComponent } from '../../shared/components/recording-loader/recording-loader.component';
import { BroadcastSession } from '../../shared/services/broadcast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BroadcastConfigComponent, BroadcastAccessComponent, RecordingLoaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  onBroadcastConfigSubmit(event: any) {
    // ... existing code ...
  }

  onFileSelected(event: Event) {
    // Handle file selection
  }
}


