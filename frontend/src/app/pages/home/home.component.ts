import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BroadcastActionCardComponent } from './components/broadcast-action-card/broadcast-action-card.component';
import { JoinActionCardComponent } from './components/join-action-card/join-action-card.component';
import { RecordActionCardComponent } from './components/record-action-card/record-action-card.component';
import { ReplayActionCardComponent } from './components/replay-action-card/replay-action-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BroadcastActionCardComponent, JoinActionCardComponent, RecordActionCardComponent, ReplayActionCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private router: Router) {}

  onBroadcastConfigSubmit(event: any) {
    // ... existing code ...
  }

  onFileSelected(event: Event) {
    // Handle file selection
  }

  navigateToRecord() {
    this.router.navigate(['/record']);
  }
}


