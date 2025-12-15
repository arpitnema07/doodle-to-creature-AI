export interface DrawPoint {
  x: number;
  y: number;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
}

export enum BrushColor {
  BLACK = '#1e293b', // slate-800
  RED = '#ef4444',   // red-500
  BLUE = '#3b82f6',  // blue-500
  GREEN = '#10b981', // green-500
}