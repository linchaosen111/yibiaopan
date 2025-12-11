import React from 'react';
import { GameResult } from '../types';
import { Trophy, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  result: GameResult;
  onRestart: () => void;
}

const ResultScreen: React.FC<Props> = ({ result, onRestart }) => {
  const percentage = Math.round((result.correct / result.total) * 100);
  
  let comment = "继续加油！";
  if (percentage >= 100) comment = "完美！神之方向感！";
  else if (percentage >= 80) comment = "太棒了！反应敏捷！";
  else if (percentage >= 60) comment = "表现不错！";

  return (
    <div className="flex flex-col items-center h-full p-6 animate-fade-in overflow-y-auto">
      <div className="mt-8 mb-6 bg-yellow-500/20 p-6 rounded-full">
        <Trophy size={64} className="text-yellow-400" />
      </div>

      <h2 className="text-3xl font-bold text-white mb-2">挑战完成</h2>
      <p className="text-xl text-blue-400 font-mono mb-4">{result.correct} / {result.total}</p>
      
      <div className="text-center mb-8">
        <div className="text-6xl font-black text-white mb-2">{percentage}%</div>
        <p className="text-slate-400">{comment}</p>
      </div>

      <div className="w-full max-w-sm bg-slate-800/50 rounded-xl overflow-hidden mb-8 border border-slate-700">
        <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 font-bold text-slate-300">
          详细记录
        </div>
        <div className="max-h-48 overflow-y-auto">
          {result.history.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 last:border-0">
              <span className="text-slate-400 font-mono text-sm">#{idx + 1}</span>
              <span className="font-bold text-lg">{item.direction}</span>
              {item.success ? (
                <CheckCircle2 className="text-green-500" size={20} />
              ) : (
                <XCircle className="text-red-500" size={20} />
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onRestart}
        className="w-full max-w-sm bg-white text-slate-900 hover:bg-slate-200 font-bold py-4 px-8 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-colors mb-4"
      >
        <RefreshCcw size={20} />
        <span>再次挑战</span>
      </button>
    </div>
  );
};

export default ResultScreen;
