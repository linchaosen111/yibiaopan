export type GamePhase = 'settings' | 'calibration' | 'playing' | 'result';

export type Direction = '前' | '后' | '左' | '右' | '上' | '下';

export interface GameSettings {
  durationPerTask: number;
  totalTasks: number;
}

export interface OrientationData {
  alpha: number; // Z-axis rotation (compass) [0, 360]
  beta: number;  // X-axis rotation (front/back tilt) [-180, 180]
  gamma: number; // Y-axis rotation (left/right tilt) [-90, 90]
}

// iOS specific interface extension for permission request
export interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export interface GameResult {
  correct: number;
  total: number;
  history: {
    direction: Direction;
    success: boolean;
  }[];
}
