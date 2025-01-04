import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  private readonly RECORDING_PREFIX = 'recording_';

  startRecording(broadcastKey: string): void {
    const recording = 'start|';
    localStorage.setItem(this.RECORDING_PREFIX + broadcastKey, recording);
  }

  appendKeystroke(broadcastKey: string, timestamp: number, keyCode: number): void {
    const recording = this.getRecording(broadcastKey);
    if (!recording) return;

    const updatedRecording = recording + `${timestamp}:${keyCode}|`;
    localStorage.setItem(this.RECORDING_PREFIX + broadcastKey, updatedRecording);
  }

  endRecording(broadcastKey: string, endTime: number): void {
    const recording = this.getRecording(broadcastKey);
    if (!recording) return;

    const finalRecording = recording + `${endTime}:end`;
    localStorage.setItem(this.RECORDING_PREFIX + broadcastKey, finalRecording);
  }

  getRecording(broadcastKey: string): string | null {
    return localStorage.getItem(this.RECORDING_PREFIX + broadcastKey);
  }
} 