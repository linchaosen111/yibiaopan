import React, { useState, useEffect } from 'react';
import { DeviceOrientationEventiOS, OrientationData } from '../types';
import { Compass, Smartphone, RefreshCw } from 'lucide-react';
import { initAudio } from '../utils/sound';

interface Props {
  onCalibrate: (baseOrientation: OrientationData) => void;
}

const CalibrationScreen: React.FC<Props> = ({ onCalibrate }) => {
  const [currentOrientation, setCurrentOrientation] = useState<OrientationData | null>(null);
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    // Some devices fire events with null values initially
    if (event.alpha === null || event.beta === null || event.gamma === null) return;
    
    setCurrentOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma
    });
  };

  const requestAccess = async () => {
    try {
      if (typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission!();
        if (permission === 'granted') {
          setHasPermission(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setError('需要陀螺仪权限才能进行游戏');
        }
      } else {
        // Non-iOS or older devices
        setHasPermission(true);
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } catch (e) {
      console.error(e);
      // Fallback for non-iOS devices that might throw error on requestPermission access
      setHasPermission(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const handleSetFront = () => {
    if (currentOrientation) {
      // Warm up audio/speech engines on user gesture
      initAudio();
      onCalibrate(currentOrientation);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-6 space-y-8 animate-fade-in text-center">
      <div className="bg-emerald-600/20 p-6 rounded-full inline-block animate-pulse">
        <Compass size={64} className="text-emerald-400" />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">校准方向</h2>
        <p className="text-slate-300">
          请手持手机，<strong className="text-emerald-400">屏幕朝向自己</strong>，并将手机指向正前方。
        </p>
      </div>

      {!hasPermission ? (
        <button
          onClick={requestAccess}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors flex items-center space-x-2 mx-auto"
        >
          <Smartphone size={20} />
          <span>授予传感器权限</span>
        </button>
      ) : (
        <div className="w-full space-y-6">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
             <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-400 mb-2">
               <div>ALPHA (Z)</div>
               <div>BETA (X)</div>
               <div>GAMMA (Y)</div>
             </div>
             <div className="grid grid-cols-3 gap-2 font-mono font-bold text-white">
               <div>{currentOrientation?.alpha.toFixed(0) || '--'}°</div>
               <div>{currentOrientation?.beta.toFixed(0) || '--'}°</div>
               <div>{currentOrientation?.gamma.toFixed(0) || '--'}°</div>
             </div>
          </div>

          <button
            onClick={handleSetFront}
            disabled={!currentOrientation}
            className={`w-full py-4 px-8 rounded-xl font-bold text-lg shadow-lg transform transition-all 
              ${currentOrientation 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
          >
            设定正前方 & 开始
          </button>
          
          <div className="text-xs text-slate-500 flex items-center justify-center space-x-1">
             <RefreshCw size={12} />
             <span>保持手机竖直握持效果最佳</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default CalibrationScreen;
