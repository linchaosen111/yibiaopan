import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameSettings, OrientationData, Direction, GameResult } from '../types';
import { getAngleDifference } from '../utils/math';
import { playSound, speakText } from '../utils/sound';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, LocateFixed } from 'lucide-react';

interface Props {
  settings: GameSettings;
  baseOrientation: OrientationData;
  onFinish: (result: GameResult) => void;
}

const TOLERANCE = 40; // Degrees
const DIRECTIONS: Direction[] = ['前', '后', '左', '右', '上', '下'];

const GameScreen: React.FC<Props> = ({ settings, baseOrientation, onFinish }) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [targetDirection, setTargetDirection] = useState<Direction | null>(null);
  const [timeLeft, setTimeLeft] = useState(settings.durationPerTask);
  const [isProcessing, setIsProcessing] = useState(false); // Between rounds
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [history, setHistory] = useState<{ direction: Direction; success: boolean }[]>([]);
  
  // Refs for loop
  const currentOrientationRef = useRef<OrientationData>(baseOrientation);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const mountedRef = useRef(true);

  // Update orientation ref without re-render
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha === null || event.beta === null) return;
      currentOrientationRef.current = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma || 0
      };
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Check if orientation matches target
  const checkOrientation = useCallback((target: Direction): boolean => {
    const current = currentOrientationRef.current;
    const base = baseOrientation;

    let alphaDiff = getAngleDifference(base.alpha, current.alpha);
    let betaDiff = current.beta - base.beta; 
    
    const isAlphaAligned = Math.abs(alphaDiff) < TOLERANCE;
    const isBetaAligned = Math.abs(betaDiff) < TOLERANCE;

    switch (target) {
      case '前':
        return isAlphaAligned && isBetaAligned;
      case '后':
        return Math.abs(Math.abs(alphaDiff) - 180) < TOLERANCE;
      case '左':
        // Accept both left turns (positive diff) and right turns logic if inverted, 
        // but standard is Left turn increases alpha usually. 
        // Let's broaden the range slightly for user experience.
        return alphaDiff > (90 - TOLERANCE) && alphaDiff < (90 + TOLERANCE);
      case '右':
        return alphaDiff < (-90 + TOLERANCE) && alphaDiff > (-90 - TOLERANCE);
      case '上':
        return betaDiff > 30;
      case '下':
        return betaDiff < -30;
      default:
        return false;
    }
  }, [baseOrientation]);

  const handleRoundEnd = (success: boolean) => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (success) {
      playSound('success');
      setFeedback('correct');
    } else {
      playSound('failure');
      setFeedback('wrong');
    }

    const newHistory = [...history, { direction: targetDirection!, success }];
    setHistory(newHistory);

    setTimeout(() => {
      if (!mountedRef.current) return;
      
      if (currentTaskIndex + 1 >= settings.totalTasks) {
        onFinish({
          correct: newHistory.filter(h => h.success).length,
          total: settings.totalTasks,
          history: newHistory
        });
      } else {
        setCurrentTaskIndex(prev => prev + 1);
        startNewRound();
      }
    }, 1000);
  };

  const startNewRound = () => {
    setFeedback('none');
    setIsProcessing(false);
    
    let nextDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    
    setTargetDirection(nextDir);
    setTimeLeft(settings.durationPerTask);
    
    // Voice command - Add "向" (Towards) to make speech clearer/longer
    speakText(`向${nextDir}`);
    
    startTimeRef.current = Date.now();
  };

  // Initial Start
  useEffect(() => {
    playSound('start');
    const t = setTimeout(() => startNewRound(), 500);
    return () => clearTimeout(t);
  }, []);

  // Game Loop
  useEffect(() => {
    const loop = () => {
      if (!isProcessing && targetDirection) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const remaining = Math.max(0, settings.durationPerTask - elapsed);
        setTimeLeft(remaining);

        if (checkOrientation(targetDirection)) {
          handleRoundEnd(true);
          return;
        }

        if (remaining <= 0) {
          handleRoundEnd(false);
          return;
        }
      }
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [targetDirection, isProcessing, settings.durationPerTask, checkOrientation]);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const getIcon = (dir: Direction | null) => {
    switch (dir) {
      case '上': return <ArrowUp size={80} />;
      case '下': return <ArrowDown size={80} />;
      case '左': return <ArrowLeft size={80} />;
      case '右': return <ArrowRight size={80} />;
      case '前': return <LocateFixed size={80} />;
      case '后': return <RotateCw size={80} />;
      default: return <LocateFixed size={80} className="opacity-0"/>;
    }
  };

  let bgClass = "bg-slate-900";
  if (feedback === 'correct') bgClass = "bg-green-600";
  if (feedback === 'wrong') bgClass = "bg-red-600";

  return (
    <div className={`flex flex-col items-center justify-between h-full p-6 transition-colors duration-300 ${bgClass}`}>
      <div className="w-full flex justify-between items-center text-slate-300 font-mono text-sm">
        <div>进度: {currentTaskIndex + 1}/{settings.totalTasks}</div>
        <div>得分: {history.filter(h => h.success).length}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className={`transform transition-all duration-300 ${isProcessing ? 'scale-90 opacity-50' : 'scale-110'}`}>
          <div className="bg-white/10 p-12 rounded-full backdrop-blur-md shadow-2xl border border-white/20">
            {getIcon(targetDirection)}
          </div>
        </div>

        <h2 className="text-6xl font-black text-white tracking-widest drop-shadow-lg">
          {targetDirection}
        </h2>
        
        <div className="h-8 text-2xl font-bold">
          {feedback === 'correct' && <span className="text-white animate-bounce">正确!</span>}
          {feedback === 'wrong' && <span className="text-white animate-shake">超时!</span>}
        </div>
      </div>

      <div className="w-full space-y-2 mb-8">
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>剩余时间</span>
          <span>{timeLeft.toFixed(1)}s</span>
        </div>
        <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div 
            className={`h-full transition-all duration-100 ease-linear ${timeLeft < 1 ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${(timeLeft / settings.durationPerTask) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
