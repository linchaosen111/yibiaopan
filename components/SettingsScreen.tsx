import React from 'react';
import { GameSettings } from '../types';
import { Settings, Timer, Hash } from 'lucide-react';

interface Props {
  settings: GameSettings;
  onUpdateSettings: (s: GameSettings) => void;
  onStart: () => void;
}

const SettingsScreen: React.FC<Props> = ({ settings, onUpdateSettings, onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="bg-blue-600 p-4 rounded-full inline-block mb-4 shadow-lg shadow-blue-500/30">
          <Settings size={48} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">陀螺仪方向挑战</h1>
        <p className="text-slate-400">听指令，转动手机，挑战反应速度！</p>
      </div>

      <div className="w-full space-y-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
        
        {/* Duration Setting */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-blue-400">
              <Timer size={20} />
              <span className="font-semibold">单个任务时间</span>
            </div>
            <span className="text-white font-mono bg-slate-700 px-3 py-1 rounded-lg">{settings.durationPerTask} 秒</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={settings.durationPerTask}
            onChange={(e) => onUpdateSettings({ ...settings, durationPerTask: Number(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-500 font-mono">
            <span>1s</span>
            <span>5s</span>
          </div>
        </div>

        {/* Count Setting */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-purple-400">
              <Hash size={20} />
              <span className="font-semibold">任务总数</span>
            </div>
            <span className="text-white font-mono bg-slate-700 px-3 py-1 rounded-lg">{settings.totalTasks} 个</span>
          </div>
          <input
            type="range"
            min="5"
            max="20"
            step="1"
            value={settings.totalTasks}
            onChange={(e) => onUpdateSettings({ ...settings, totalTasks: Number(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-slate-500 font-mono">
            <span>5</span>
            <span>20</span>
          </div>
        </div>

      </div>

      <button
        onClick={onStart}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all active:scale-95 text-lg"
      >
        进入准备
      </button>
    </div>
  );
};

export default SettingsScreen;
