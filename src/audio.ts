let sharedCtx: AudioContext | null = null;

const getSharedCtx = () => {
  if (!sharedCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedCtx = new AudioContextClass();
    }
  }
  return sharedCtx;
};

export const startDrone = () => {
  const ctx = getSharedCtx();
  if (!ctx) return null;
  
  if (ctx.state === 'suspended') ctx.resume();

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 8); // Long fade in
  masterGain.connect(ctx.destination);

  // Sub Bass Sine
  const subOsc = ctx.createOscillator();
  subOsc.type = 'sine';
  subOsc.frequency.value = 32.7; // C1
  subOsc.connect(masterGain);

  // Gritty Saw
  const sawOsc = ctx.createOscillator();
  sawOsc.type = 'sawtooth';
  sawOsc.frequency.value = 32.7; // C1
  
  const lpf1 = ctx.createBiquadFilter();
  lpf1.type = 'lowpass';
  lpf1.frequency.setValueAtTime(80, ctx.currentTime);
  // Drone slowly opens up filter
  lpf1.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 20);
  lpf1.Q.value = 6;
  
  sawOsc.connect(lpf1);
  lpf1.connect(masterGain);

  // Detuned Square
  const sqOsc = ctx.createOscillator();
  sqOsc.type = 'square';
  sqOsc.frequency.value = 32.2; // Slightly detuned
  
  const lpf2 = ctx.createBiquadFilter();
  lpf2.type = 'lowpass';
  lpf2.frequency.setValueAtTime(60, ctx.currentTime);
  lpf2.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 15);
  lpf2.Q.value = 2;

  sqOsc.connect(lpf2);
  lpf2.connect(masterGain);

  subOsc.start();
  sawOsc.start();
  sqOsc.start();

  return {
      stop: () => {
          masterGain.gain.setTargetAtTime(0, ctx.currentTime, 2);
          setTimeout(() => {
              subOsc.stop();
              sawOsc.stop();
              sqOsc.stop();
          }, 5000);
      }
  };
};

export const playImpact = () => {
  const ctx = getSharedCtx();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') ctx.resume();

  // Low frequency impact
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.5);
  
  gain.gain.setValueAtTime(0.6, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.5);

  // Noise burst
  const bufferSize = ctx.sampleRate * 0.1; // 100ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 800;
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.4, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  
  noiseSource.start();
};

export const playShutter = () => {
  const ctx = getSharedCtx();
  if (!ctx) return;

  if (ctx.state === 'suspended') ctx.resume();

  const playClick = (time: number, freq: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.05);
    
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.05);
  };

  const t = ctx.currentTime;
  // Mechanical double click
  playClick(t, 1200); 
  playClick(t + 0.08, 800); 

  // Flash capacitor whine
  const whine = ctx.createOscillator();
  const whineGain = ctx.createGain();
  whine.type = 'sine';
  whine.frequency.setValueAtTime(1000, t + 0.1);
  whine.frequency.exponentialRampToValueAtTime(5000, t + 1.5);
  
  whineGain.gain.setValueAtTime(0, t);
  whineGain.gain.linearRampToValueAtTime(0.03, t + 0.1);
  whineGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

  whine.connect(whineGain);
  whineGain.connect(ctx.destination);
  whine.start(t);
  whine.stop(t + 1.5);
};

export const playMassiveImpact = () => {
  const ctx = getSharedCtx();
  if (!ctx) return;

  if (ctx.state === 'suspended') ctx.resume();

  // Low frequency drop
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 2);
  
  gain.gain.setValueAtTime(1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 2);

  // Big noise burst
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(3000, ctx.currentTime);
  noiseFilter.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 2);
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.8, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
  
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  
  noiseSource.start();
};
