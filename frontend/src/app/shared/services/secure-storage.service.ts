import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async storeSecureItem(key: string, value: string): Promise<void> {
    const hashedKey = await this.hashString(key);
    localStorage.setItem(hashedKey, value);
  }

  async getSecureItem(key: string): Promise<string | null> {
    const hashedKey = await this.hashString(key);
    return localStorage.getItem(hashedKey);
  }

  async removeSecureItem(key: string): Promise<void> {
    const hashedKey = await this.hashString(key);
    localStorage.removeItem(hashedKey);
  }
} 