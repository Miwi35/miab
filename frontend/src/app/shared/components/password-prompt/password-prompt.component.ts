import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-prompt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-prompt.component.html',
  styleUrls: ['./password-prompt.component.scss']
})
export class PasswordPromptComponent {
  @Output() passwordSubmit = new EventEmitter<string>();
  password = '';

  onSubmit() {
    this.passwordSubmit.emit(this.password);
    this.password = '';
  }
} 