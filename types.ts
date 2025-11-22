export interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
}

export interface GameState {
  players: Player[];
  gameName: string;
  history: Player[][]; // Stack of player states
}

export interface RuleResponse {
  answer: string;
  source?: string;
}

export enum AppView {
  SETUP = 'SETUP',
  GAME = 'GAME',
}
