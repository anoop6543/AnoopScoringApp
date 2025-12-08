export interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
}

export interface GameState {
  players: Player[];
  gameName: string;
  history: Player[][];
}

export interface RuleResponse {
  answer: string;
  source?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string; // Optional for guest/offline, required for cloud
  createdAt: number;
  lastSynced?: number; // Timestamp of last successful cloud sync
}

export interface GameSession {
  id: string;
  ownerId: string; // ID of the user who owns this session
  name: string;
  date: number;
  lastUpdated: number;
  players: Player[];
  history: Player[][];
  isFinished: boolean;
}

export enum AppView {
  WELCOME = 'WELCOME',
  DASHBOARD = 'DASHBOARD',
  SETUP = 'SETUP',
  GAME = 'GAME',
}