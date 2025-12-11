import React, { useState } from 'react';
import { GamePhase, GameSettings, OrientationData, GameResult } from './types';
import SettingsScreen from './components/SettingsScreen';
import CalibrationScreen from './components/CalibrationScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>('settings');
  const [settings, setSettings] = useState<GameSettings>({
    durationPerTask: 3,
    totalTasks: 10
  });
  const [baseOrientation, setBaseOrientation] = useState<OrientationData>({ alpha: 0, beta: 0, gamma: 0 });
  const [result, setResult] = useState<GameResult | null>(null);

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-900 text-white overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black -z-10"></div>
      
      {phase === 'settings' && (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={setSettings}
          onStart={() => setPhase('calibration')}
        />
      )}

      {phase === 'calibration' && (
        <CalibrationScreen
          onCalibrate={(data) => {
            setBaseOrientation(data);
            setPhase('playing');
          }}
        />
      )}

      {phase === 'playing' && (
        <GameScreen
          settings={settings}
          baseOrientation={baseOrientation}
          onFinish={(res) => {
            setResult(res);
            setPhase('result');
          }}
        />
      )}

      {phase === 'result' && result && (
        <ResultScreen
          result={result}
          onRestart={() => setPhase('settings')}
        />
      )}
    </div>
  );
};

export default App;
