export interface BroadcastResponse {
  success: boolean;
  message?: string;
}

export interface KeystrokeData {
  keyCode: number;
  timestamp: number;
}

export interface BroadcastData {
  url: string;
  data: KeystrokeData;
} 