const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
let audioCtx: AudioContext | null = null;

// Keep references to active utterances to prevent garbage collection (Chrome/Safari bug)
const activeUtterances = new Set<SpeechSynthesisUtterance>();

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
};

// Call this on a user interaction (click) to unlock audio/speech on mobile
export const initAudio = () => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // Play a silent buffer to physically unlock the audio hardware on iOS
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    // Initialize speech engine with an empty utterance
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  } catch (e) {
    console.warn("Audio init failed", e);
  }
};

export const playSound = (type: 'success' | 'failure' | 'tick' | 'start') => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'success') {
      // Coin Sound: Crisp high pitch jump
      // B5 (987Hz) -> E6 (1318Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987, now); 
      osc.frequency.linearRampToValueAtTime(1318, now + 0.08); 
      
      gainNode.gain.setValueAtTime(0.2, now); // Louder
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'failure') {
      // Warning Sound: Negative buzz
      osc.type = 'sawtooth'; // Sawtooth cuts through better than square sometimes
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'tick') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'start') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.4);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export const speakText = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  
  // Important: Cancel to clear any stuck queue from previous attempts
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 1.0; 
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Prevent Garbage Collection bug
  activeUtterances.add(utterance);
  
  utterance.onend = () => {
    activeUtterances.delete(utterance);
  };
  utterance.onerror = (e) => {
    console.error("Speech synthesis error", e);
    activeUtterances.delete(utterance);
  };

  window.speechSynthesis.speak(utterance);
};
