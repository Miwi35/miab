import { Injectable } from '@angular/core';
import { sha256 } from 'js-sha256';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  hashPassword(password: string): string {
    return sha256(password);
  }
} 