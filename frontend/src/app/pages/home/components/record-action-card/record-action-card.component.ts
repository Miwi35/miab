import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-record-action-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './record-action-card.component.html',
  styleUrls: ['./record-action-card.component.scss']
})
export class RecordActionCardComponent {
  @Output() recordClicked = new EventEmitter<void>();

  onClick() {
    this.recordClicked.emit();
  }
} 