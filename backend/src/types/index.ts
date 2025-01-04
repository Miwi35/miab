export interface BroadcastSession {
  url: string;
  hashedPassword?: string;
  creatorId: string;
  connectedClients: Set<string>;
  isStarted: boolean;
}

export interface KeystrokeData {
  keyCode: number;
  timestamp: number;
}

export interface BroadcastData {
  url: string;
  keystroke: KeystrokeData;
} 