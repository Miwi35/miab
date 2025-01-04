import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BroadcastService, BroadcastSession } from '../../services/broadcast.service';
import { CryptoService } from '../../services/crypto.service';

@Component({
  selector: 'app-broadcast-config',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './broadcast-config.component.html',
  styleUrls: ['./broadcast-config.component.scss']
})
export class BroadcastConfigComponent {
  @Output() configSubmitted = new EventEmitter<BroadcastSession>();

  urlPath = '';
  usePassword = false;
  password = '';
  isConfigValid = false;

  constructor(
    private cryptoService: CryptoService,
    private broadcastService: BroadcastService,
    private router: Router
  ) {}

  validateUrl() {
    this.isConfigValid = this.urlPath.length >= 3 && /^[a-zA-Z0-9-]+$/.test(this.urlPath);
  }

  async onConfirm() {
    if (!this.isConfigValid) return;

    const config: BroadcastSession = {
      url: this.urlPath
    };

    if (this.usePassword && this.password) {
      const hashedPassword = this.cryptoService.hashPassword(this.password);
      config.hashedPassword = hashedPassword;
    }

    try {
      // Create broadcast first
      await this.broadcastService.createBroadcast(config);
      
      // Emit config for parent components
      this.configSubmitted.emit(config);
      
      // Navigate to compose page
      this.router.navigate(['/compose', this.urlPath]);
    } catch (error) {
      console.error('Failed to create broadcast:', error);
      // TODO: Show error to user
    }
  }
} 