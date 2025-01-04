export interface BroadcastSession {
  url: string;
  hashedPassword?: string;
  creatorId: string;
  connectedClients: Set<string>;
}

export interface KeystrokeData {
  keyCode: number;
  timestamp: number;
}

export interface BroadcastData {
  url: string;
  keystroke: KeystrokeData;
} 