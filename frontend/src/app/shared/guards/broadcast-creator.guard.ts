import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { BroadcastService } from '../services/broadcast.service';

@Injectable({
  providedIn: 'root'
})
export class BroadcastCreatorGuard implements CanActivate {
  constructor(
    private broadcastService: BroadcastService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.broadcastService.isConnected()) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
} 