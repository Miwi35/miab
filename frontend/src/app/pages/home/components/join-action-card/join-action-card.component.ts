import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-action-card',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './join-action-card.component.html',
  styleUrls: ['./join-action-card.component.scss']
})
export class JoinActionCardComponent {
  urlPath = '';
  isUrlValid = false;

  constructor(private router: Router) {}

  onUrlPathChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.urlPath = input.value.replace(/[^a-zA-Z0-9-]/g, '');
    this.validateUrl();
  }

  validateUrl() {
    this.isUrlValid = this.urlPath.length >= 3 && /^[a-zA-Z0-9-]+$/.test(this.urlPath);
  }

  onSubmit() {
    if (!this.urlPath) return;
    this.router.navigate(['/watch', this.urlPath]);
  }
} 