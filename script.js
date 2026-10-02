/* ============================================
   SURPRISE GIFT — JavaScript Logic
   All audio is synthesized via Web Audio API
   (no external audio files needed!)
   ============================================ */

// ==========================================
// Audio Synthesizer — tạo âm thanh bằng code
// ==========================================
const AudioSynth = {
  context: null,
  masterGain: null,
  isUnlocked: false,

  init() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.masterGain.gain.value = 1.0;
  },

  async unlock() {
    if (!this.context) this.init();
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    // Play a silent buffer to fully unlock on iOS
    const buffer = this.context.createBuffer(1, 1, 22050);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.start(0);
    this.isUnlocked = true;
  },

  // --- Cute Music: Simple happy melody ---
  playCuteMusic() {
    if (!this.context) return null;
    const ctx = this.context;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(this.masterGain);
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.25, now + 1);

    // Melody notes (C major happy tune)
    const melody = [
      523.25, 587.33, 659.25, 698.46, 783.99, 698.46, 659.25, 587.33,
      523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 587.33,
      659.25, 698.46, 783.99, 880.00, 783.99, 698.46, 659.25, 587.33,
      523.25, 587.33, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25
    ];

    const noteDuration = 0.35;
    const sources = [];

    // Main melody
    melody.forEach((freq, i) => {
      const time = now + i * noteDuration;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;
      noteGain.gain.setValueAtTime(0, time);
      noteGain.gain.linearRampToValueAtTime(0.15, time + 0.05);
      noteGain.gain.linearRampToValueAtTime(0.1, time + noteDuration * 0.6);
      noteGain.gain.linearRampToValueAtTime(0, time + noteDuration * 0.95);

      osc.connect(noteGain);
      noteGain.connect(gain);
      osc.start(time);
      osc.stop(time + noteDuration);
      sources.push(osc);
    });

    // Harmony — soft chords
    const chords = [
      [261.63, 329.63, 392.00],
      [293.66, 369.99, 440.00],
      [329.63, 415.30, 523.25],
      [261.63, 329.63, 392.00],
    ];

    chords.forEach((chord, i) => {
      const time = now + i * noteDuration * 8;
      chord.forEach(freq => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(0.06, time + 0.3);
        noteGain.gain.linearRampToValueAtTime(0.04, time + noteDuration * 7);
        noteGain.gain.linearRampToValueAtTime(0, time + noteDuration * 8);
        osc.connect(noteGain);
        noteGain.connect(gain);
        osc.start(time);
        osc.stop(time + noteDuration * 8);
        sources.push(osc);
      });
    });

    // Sparkle SFX (high pitched random notes)
    for (let i = 0; i < 20; i++) {
      const time = now + Math.random() * melody.length * noteDuration;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 2000 + Math.random() * 3000;
      noteGain.gain.setValueAtTime(0, time);
      noteGain.gain.linearRampToValueAtTime(0.02, time + 0.02);
      noteGain.gain.linearRampToValueAtTime(0, time + 0.15);
      osc.connect(noteGain);
      noteGain.connect(gain);
      osc.start(time);
      osc.stop(time + 0.15);
      sources.push(osc);
    }

    return { gain, sources, duration: melody.length * noteDuration };
  },

  // --- Tick Sound: Clock-like ticking ---
  playTick(loop = true) {
    if (!this.context) return null;
    const ctx = this.context;
    const gain = ctx.createGain();
    gain.connect(this.masterGain);
    gain.gain.value = 0.15;

    const sources = [];
    let stopped = false;
    const totalTicks = loop ? 30 : 1;

    for (let i = 0; i < totalTicks; i++) {
      const time = ctx.currentTime + i * 0.8;
      // Tick
      const osc = ctx.createOscillator();
      const tickGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 800;
      tickGain.gain.setValueAtTime(0, time);
      tickGain.gain.linearRampToValueAtTime(0.3, time + 0.005);
      tickGain.gain.linearRampToValueAtTime(0, time + 0.08);
      osc.connect(tickGain);
      tickGain.connect(gain);
      osc.start(time);
      osc.stop(time + 0.1);
      sources.push(osc);

      // Tock (lower)
      const osc2 = ctx.createOscillator();
      const tockGain = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = 600;
      tockGain.gain.setValueAtTime(0, time + 0.4);
      tockGain.gain.linearRampToValueAtTime(0.2, time + 0.405);
      tockGain.gain.linearRampToValueAtTime(0, time + 0.48);
      osc2.connect(tockGain);
      tockGain.connect(gain);
      osc2.start(time + 0.4);
      osc2.stop(time + 0.5);
      sources.push(osc2);
    }

    return {
      gain,
      sources,
      stop() {
        if (stopped) return;
        stopped = true;
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        sources.forEach(s => { try { s.stop(); } catch (e) {} });
      }
    };
  },

  // --- SCREAM: Terrifying noise burst ---
  playScream() {
    if (!this.context) return null;
    const ctx = this.context;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(this.masterGain);
    gain.gain.value = 1.0;

    const sources = [];

    // White noise burst
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.7;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.linearRampToValueAtTime(0.1, now + 2);
    noiseGain.gain.linearRampToValueAtTime(0, now + 3);
    // Bandpass filter for more "scream-like" quality
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 3000;
    noiseFilter.Q.value = 0.5;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gain);
    noise.start(now);
    noise.stop(now + 3);
    sources.push(noise);

    // High-pitched shriek oscillators
    const shriekFreqs = [1200, 1800, 2400, 3200, 4000];
    shriekFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.5, now + 0.3);
      osc.frequency.linearRampToValueAtTime(freq * 0.8, now + 1.5);
      oscGain.gain.setValueAtTime(0.12 - idx * 0.015, now);
      oscGain.gain.linearRampToValueAtTime(0.06, now + 1);
      oscGain.gain.linearRampToValueAtTime(0, now + 2.5);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(now);
      osc.stop(now + 3);
      sources.push(osc);
    });

    // Sub bass rumble
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sine';
    bass.frequency.value = 40;
    bassGain.gain.setValueAtTime(0.5, now);
    bassGain.gain.linearRampToValueAtTime(0.2, now + 2);
    bassGain.gain.linearRampToValueAtTime(0, now + 3);
    bass.connect(bassGain);
    bassGain.connect(gain);
    bass.start(now);
    bass.stop(now + 3);
    sources.push(bass);

    // Distortion for extra harshness
    const distortion = ctx.createWaveShaper();
    const distCurve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      distCurve[i] = (Math.PI + 50) * x / (Math.PI + 50 * Math.abs(x));
    }
    distortion.curve = distCurve;

    return {
      gain,
      sources,
      stop() {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        setTimeout(() => {
          sources.forEach(s => { try { s.stop(); } catch (e) {} });
        }, 300);
      }
    };
  },

  // --- Celebration music ---
  playCelebration() {
    if (!this.context) return null;
    const ctx = this.context;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(this.masterGain);
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.2, now + 0.5);

    const sources = [];

    // Happy ascending melody
    const notes = [
      523.25, 587.33, 659.25, 783.99,
      880.00, 783.99, 880.00, 1046.50,
      880.00, 783.99, 659.25, 783.99,
      523.25, 659.25, 783.99, 1046.50
    ];

    const noteDuration = 0.3;

    notes.forEach((freq, i) => {
      const time = now + i * noteDuration;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      noteGain.gain.setValueAtTime(0, time);
      noteGain.gain.linearRampToValueAtTime(0.12, time + 0.05);
      noteGain.gain.linearRampToValueAtTime(0, time + noteDuration * 0.9);
      osc.connect(noteGain);
      noteGain.connect(gain);
      osc.start(time);
      osc.stop(time + noteDuration);
      sources.push(osc);
    });

    // Triumphant chords
    const chords = [
      [261.63, 329.63, 392.00, 523.25],
      [349.23, 440.00, 523.25, 659.25],
    ];

    chords.forEach((chord, i) => {
      const time = now + i * noteDuration * 8;
      chord.forEach(freq => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(0.05, time + 0.2);
        noteGain.gain.linearRampToValueAtTime(0, time + noteDuration * 8);
        osc.connect(noteGain);
        noteGain.connect(gain);
        osc.start(time);
        osc.stop(time + noteDuration * 8);
        sources.push(osc);
      });
    });

    return { gain, sources };
  },

  // Stop all audio
  stopAll() {
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.1);
      setTimeout(() => {
        this.masterGain.gain.value = 1.0;
      }, 200);
    }
  }
};


// ==========================================
// Particle System
// ==========================================
const Particles = {
  spawn(container, type, count = 20) {
    const el = document.getElementById(container);
    if (!el) return;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');

      switch (type) {
        case 'confetti':
          particle.classList.add('particle-confetti');
          particle.style.left = Math.random() * 100 + '%';
          particle.style.top = '-20px';
          particle.style.backgroundColor = this.randomColor();
          particle.style.animationDuration = (2 + Math.random() * 3) + 's';
          particle.style.animationDelay = Math.random() * 2 + 's';
          particle.style.width = (6 + Math.random() * 8) + 'px';
          particle.style.height = (6 + Math.random() * 8) + 'px';
          break;

        case 'hearts':
          particle.classList.add('particle-heart');
          particle.textContent = ['❤️', '💕', '💖', '💗', '💝', '🩷'][Math.floor(Math.random() * 6)];
          particle.style.left = (30 + Math.random() * 40) + '%';
          particle.style.bottom = '30%';
          particle.style.setProperty('--drift', (Math.random() * 100 - 50) + 'px');
          particle.style.animationDelay = Math.random() * 3 + 's';
          particle.style.fontSize = (16 + Math.random() * 16) + 'px';
          break;

        case 'sparkles':
          particle.classList.add('particle-sparkle');
          particle.style.left = Math.random() * 100 + '%';
          particle.style.top = Math.random() * 100 + '%';
          particle.style.animationDelay = Math.random() * 3 + 's';
          particle.style.animationDuration = (1 + Math.random() * 2) + 's';
          break;

        case 'celebration':
          particle.classList.add('particle-star');
          particle.textContent = ['🎉', '🎊', '⭐', '✨', '🌟', '🥳'][Math.floor(Math.random() * 6)];
          particle.style.left = Math.random() * 100 + '%';
          particle.style.top = '-30px';
          particle.style.animationDuration = (2 + Math.random() * 4) + 's';
          particle.style.animationDelay = Math.random() * 3 + 's';
          particle.style.fontSize = (14 + Math.random() * 20) + 'px';
          break;
      }

      el.appendChild(particle);

      // Auto cleanup
      particle.addEventListener('animationend', () => particle.remove());
      // Fallback cleanup
      setTimeout(() => { if (particle.parentNode) particle.remove(); }, 8000);
    }
  },

  randomColor() {
    const colors = ['#FF69B4', '#FFD700', '#FF6B6B', '#7C4DFF', '#00BCD4', '#FF9800', '#E91E63', '#4CAF50'];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Continuous spawning
  startLoop(container, type, count, interval) {
    this.spawn(container, type, count);
    const id = setInterval(() => this.spawn(container, type, count), interval);
    return id;
  }
};


// ==========================================
// Screen Manager
// ==========================================
function switchScreen(fromId, toId, mode = 'fade') {
  const from = document.getElementById(fromId);
  const to = document.getElementById(toId);
  if (!from || !to) return;

  if (mode === 'instant') {
    to.classList.add('instant');
    from.classList.remove('active');
    to.classList.add('active');
    // Remove instant class after a frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        to.classList.remove('instant');
      });
    });
  } else if (mode === 'flash') {
    // Flash white → black → show
    const flash = document.getElementById('flash-overlay');
    if (flash) {
      flash.classList.add('flash-white');
      setTimeout(() => {
        from.classList.remove('active');
        to.classList.add('active');
      }, 130);
      setTimeout(() => {
        flash.classList.remove('flash-white');
      }, 500);
    }
  } else {
    // Normal fade
    from.classList.remove('active');
    to.classList.add('active');
  }
}


// ==========================================
// Fullscreen helpers
// ==========================================
async function requestFullscreen() {
  try {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      await el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      await el.msRequestFullscreen();
    }
  } catch (e) {
    // Fallback: do nothing, still works without fullscreen
  }
}

function exitFullscreen() {
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  } catch (e) {}
}


// ==========================================
// Back button trap
// ==========================================
let isTrapped = false;

function enableBackTrap() {
  isTrapped = true;
  // Push multiple fake states
  for (let i = 0; i < 5; i++) {
    history.pushState({ trap: true }, '', '');
  }
}

function disableBackTrap() {
  isTrapped = false;
}

window.addEventListener('popstate', (e) => {
  if (isTrapped) {
    history.pushState({ trap: true }, '', '');
  }
});


// ==========================================
// Glitch effect
// ==========================================
function triggerGlitch() {
  const overlay = document.getElementById('glitch-overlay');
  if (!overlay) return;
  overlay.classList.add('active');
  setTimeout(() => overlay.classList.remove('active'), 200);
}


// ==========================================
// Progress bar animation
// ==========================================
function animateProgressBar(duration, onComplete) {
  const bar = document.getElementById('progress-bar');
  const text = document.getElementById('progress-text');
  if (!bar || !text) return;

  const steps = [
    { percent: 12, time: 0.08 },
    { percent: 28, time: 0.18 },
    { percent: 41, time: 0.28 },
    { percent: 55, time: 0.40 },
    { percent: 67, time: 0.52 },
    { percent: 78, time: 0.65 },
    { percent: 85, time: 0.75 },
    { percent: 91, time: 0.85 },
    { percent: 95, time: 0.92 },
    { percent: 97, time: 0.98 },
  ];

  steps.forEach(step => {
    setTimeout(() => {
      bar.style.width = step.percent + '%';
      text.textContent = step.percent + '%';
    }, step.time * duration);
  });

  if (onComplete) {
    setTimeout(onComplete, duration);
  }
}


// ==========================================
// Main App State & Flow
// ==========================================
let currentMusic = null;
let tickSound = null;
let screamSound = null;
let celebrationSound = null;
let particleLoop1 = null;
let particleLoop2 = null;


// --- SCREEN 1: Bait → Click to start ---
document.getElementById('btn-open-gift').addEventListener('click', async function () {
  this.disabled = true;
  this.style.pointerEvents = 'none';

  // Unlock audio
  await AudioSynth.unlock();

  // Start the journey
  startLullaby();
});


// --- SCREEN 2: Lullaby (8 seconds) ---
function startLullaby() {
  switchScreen('screen-bait', 'screen-lullaby', 'fade');

  // Play cute music
  currentMusic = AudioSynth.playCuteMusic();

  // Spawn particles continuously
  Particles.spawn('lullaby-particles', 'confetti', 25);
  Particles.spawn('lullaby-particles', 'hearts', 10);
  particleLoop1 = Particles.startLoop('lullaby-particles', 'hearts', 5, 1500);
  particleLoop2 = Particles.startLoop('lullaby-particles', 'confetti', 10, 2000);

  // After 8 seconds → Tension
  setTimeout(() => {
    startTension();
  }, 8000);
}


// --- SCREEN 3: Tension (5 seconds) ---
function startTension() {
  // Stop cute music abruptly
  AudioSynth.stopAll();
  if (particleLoop1) clearInterval(particleLoop1);
  if (particleLoop2) clearInterval(particleLoop2);

  // Wait a beat of silence, then switch
  setTimeout(() => {
    switchScreen('screen-lullaby', 'screen-tension', 'fade');

    // Start tick sound after a short silence
    setTimeout(() => {
      tickSound = AudioSynth.playTick(true);
    }, 800);

    // Animate progress bar over 4 seconds
    animateProgressBar(4000);

    // Darken background gradually
    setTimeout(() => {
      document.getElementById('screen-tension').classList.add('darkening');
    }, 1500);

    // Glitch effects at random intervals
    setTimeout(() => triggerGlitch(), 1800);
    setTimeout(() => triggerGlitch(), 2800);
    setTimeout(() => triggerGlitch(), 3500);

    // After 5 seconds → JUMP SCARE!
    setTimeout(() => {
      triggerJumpScare();
    }, 4500);
  }, 500);
}


// --- SCREEN 4: JUMP SCARE (3 seconds) ---
function triggerJumpScare() {
  // Stop ALL sounds immediately
  if (tickSound) tickSound.stop();
  AudioSynth.stopAll();

  // Small delay to reset audio system
  setTimeout(() => {
    AudioSynth.masterGain.gain.value = 1.0;

    // Request fullscreen
    requestFullscreen();

    // Enable back button trap
    enableBackTrap();

    // Flash transition → Show scare screen
    switchScreen('screen-tension', 'screen-scare', 'flash');

    // Play scream after flash
    setTimeout(() => {
      screamSound = AudioSynth.playScream();
    }, 150);

    // Activate blood overlay
    setTimeout(() => {
      document.getElementById('blood-overlay').classList.add('active');
    }, 300);

    // Shake the entire page
    document.body.classList.add('shaking');

    // Vibrate phone (Android)
    if (navigator.vibrate) {
      navigator.vibrate([200, 50, 200, 50, 200, 50, 500, 100, 300, 50, 500]);
    }

    // After 3 seconds → Reveal
    setTimeout(() => {
      showReveal();
    }, 3000);
  }, 50);
}


// --- SCREEN 5: Troll Reveal ---
function showReveal() {
  // Stop everything scary
  if (screamSound) screamSound.stop();
  AudioSynth.stopAll();
  document.body.classList.remove('shaking');
  document.getElementById('blood-overlay').classList.remove('active');

  // Exit fullscreen
  exitFullscreen();

  // Disable back trap
  disableBackTrap();

  // Stop vibration
  if (navigator.vibrate) navigator.vibrate(0);

  // Small pause then reveal
  setTimeout(() => {
    AudioSynth.masterGain.gain.value = 1.0;
    switchScreen('screen-scare', 'screen-reveal', 'fade');

    // Play celebration
    celebrationSound = AudioSynth.playCelebration();

    // Spawn celebration particles
    Particles.spawn('reveal-particles', 'celebration', 30);
    Particles.startLoop('reveal-particles', 'celebration', 15, 2000);
  }, 300);
}


// --- Share / Troll Again buttons ---
document.getElementById('btn-troll-again').addEventListener('click', async () => {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    showCopiedToast();
  } catch (e) {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showCopiedToast();
  }
});

document.getElementById('btn-share').addEventListener('click', async () => {
  const shareData = {
    title: '🎁 Bạn nhận được một món quà đặc biệt!',
    text: 'Ai đó đã gửi tặng bạn một điều bất ngờ. Mở ngay nào! 💝',
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      showCopiedToast();
    }
  } catch (e) {
    // User cancelled share or error
    if (e.name !== 'AbortError') {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showCopiedToast();
      } catch (e2) {}
    }
  }
});

function showCopiedToast() {
  const toast = document.getElementById('copied-toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}


// ==========================================
// Initial particles for bait screen
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  Particles.spawn('bait-particles', 'sparkles', 15);
  Particles.startLoop('bait-particles', 'sparkles', 5, 3000);
  Particles.spawn('bait-particles', 'confetti', 10);
  Particles.startLoop('bait-particles', 'confetti', 5, 4000);

  // Preload the scary image
  const img = new Image();
  img.src = 'assets/images/scary-face.jpg';
});
