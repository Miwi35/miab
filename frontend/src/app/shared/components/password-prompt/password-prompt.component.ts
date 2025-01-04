import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-prompt',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="password-prompt-overlay">
      <div class="password-prompt-modal">
        <h2>Protected Broadcast</h2>
        <p>This broadcast requires a password to view.</p>
        
        <div class="password-input">
          <input 
            type="password" 
            [(ngModel)]="password"
            placeholder="Enter password"
            (keyup.enter)="onSubmit()"
          >
        </div>

        <p class="error" *ngIf="error">
          {{ error }}
        </p>

        <div class="actions">
          <button class="secondary-btn" (click)="onCancel()">Cancel</button>
          <button 
            class="primary-btn" 
            [disabled]="!password"
            (click)="onSubmit()"
          >
            Join Broadcast
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .password-prompt-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .password-prompt-modal {
      background: #1e1e2e;
      padding: 2rem;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      color: #e4e4e7;
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

      h2 {
        margin: 0 0 0.5rem;
        background: linear-gradient(135deg, #e4e4e7, #a1a1aa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      p {
        margin: 0 0 1.5rem;
        color: #a1a1aa;

        &.error {
          color: #ef4444;
          margin-bottom: 1rem;
        }
      }
    }

    .password-input {
      margin-bottom: 1rem;

      input {
        width: 100%;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        padding: 0.75rem;
        border-radius: 8px;
        color: #e4e4e7;
        font-size: 1rem;
        font-family: 'Inter', sans-serif;

        &::placeholder {
          color: #71717a;
        }

        &:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5);
        }
      }
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;

      button {
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .primary-btn {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        border: none;

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        &:active:not(:disabled) {
          transform: translateY(0);
        }
      }

      .secondary-btn {
        background: transparent;
        color: #e4e4e7;
        border: 1px solid rgba(255, 255, 255, 0.1);

        &:hover {
          background: rgba(255, 255, 255, 0.05);
        }
      }
    }
  `]
})
export class PasswordPromptComponent {
  @Output() passwordSubmitted = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  password = '';
  error = '';

  onSubmit() {
    if (this.password) {
      this.passwordSubmitted.emit(this.password);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  setError(message: string) {
    this.error = message;
  }
} 