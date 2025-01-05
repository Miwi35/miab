import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BroadcastService, BroadcastSession } from '../../../../shared/services/broadcast.service';
import { CryptoService } from '../../../../shared/services/crypto.service';

@Component({
  selector: 'app-broadcast-action-card',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './broadcast-action-card.component.html',
  styleUrls: ['./broadcast-action-card.component.scss']
})
export class BroadcastActionCardComponent implements OnInit {
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

  ngOnInit() {
    this.validateConfig();
  }

  onTitleChange(event: any) {
    this.urlPath = event.target.value.replace(/[^a-zA-Z0-9-]/g, '');
    this.validateConfig();
  }

  validateConfig() {
    const isUrlValid = this.urlPath.length >= 3 && /^[a-zA-Z0-9-]+$/.test(this.urlPath);
    const isPasswordValid = !this.usePassword || (this.usePassword && this.password.length >= 6);
    this.isConfigValid = isUrlValid && isPasswordValid;
  }

  async onConfirm(event: Event) {
    event.preventDefault();
    if (!this.isConfigValid) return;

    const config: BroadcastSession = {
      url: this.urlPath
    };

    if (this.usePassword && this.password) {
      config.hashedPassword = this.cryptoService.hashPassword(this.password);
    }

    try {
      await this.broadcastService.createBroadcast(config);
      this.configSubmitted.emit(config);
      this.router.navigate(['/broadcast', this.urlPath]);
    } catch (error) {
      console.error('Failed to create broadcast:', error);
    }
  }
} 