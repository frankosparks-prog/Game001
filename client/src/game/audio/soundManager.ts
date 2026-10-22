/**
 * Nairobi Pulse: Web Audio Sound Engine
 * 
 * Synthesizes dynamic, authentic protest sounds using the native Web Audio API:
 * - Vuvuzela Horns (harmonic saw-tooth blast)
 * - Anti-Riot Teargas Canister Thump & Hiss
 * - Police Siren Wail
 * - Megaphone Chants & Whistles
 * - Water Cannon Spray
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenInterval: any = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.sirenGain) {
      this.sirenGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  /**
   * Plays a loud, buzzy Vuvuzela blast.
   * Uses three detuned sawtooth oscillators to create the signature brass drone.
   */
  public playVuvuzela(duration = 1.2) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const baseFreq = 233.08; // Bb3 (standard stadium vuvuzela pitch)

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.35, now + 0.1);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    masterGain.connect(this.ctx.destination);

    // Filter to give that horn resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq * 2, now);
    filter.Q.setValueAtTime(4.0, now);
    filter.connect(masterGain);

    // 3 detuned oscillators for full brass chorus
    const detunes = [-12, 0, 14];
    detunes.forEach((detune) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.detune.setValueAtTime(detune, now);
      osc.connect(filter);
      osc.start(now);
      osc.stop(now + duration);
    });
  }

  /**
   * Simulates a Teargas Canister launching and detonating:
   * 1. Low frequency "THUMP"
   * 2. Prolonged white noise "HISSSSS" as teargas disperses
   */
  public playTeargasLaunch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Thump Oscillator
    const thump = this.ctx.createOscillator();
    const thumpGain = this.ctx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(150, now);
    thump.frequency.exponentialRampToValueAtTime(30, now + 0.35);

    thumpGain.gain.setValueAtTime(0.5, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    thump.connect(thumpGain);
    thumpGain.connect(this.ctx.destination);
    thump.start(now);
    thump.stop(now + 0.35);

    // 2. White noise hiss
    const bufferSize = this.ctx.sampleRate * 2.5; // 2.5s hiss
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const hissFilter = this.ctx.createBiquadFilter();
    hissFilter.type = 'highpass';
    hissFilter.frequency.setValueAtTime(1200, now);

    const hissGain = this.ctx.createGain();
    hissGain.gain.setValueAtTime(0.01, now + 0.1);
    hissGain.gain.linearRampToValueAtTime(0.2, now + 0.4);
    hissGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    whiteNoise.connect(hissFilter);
    hissFilter.connect(hissGain);
    hissGain.connect(this.ctx.destination);

    whiteNoise.start(now + 0.1);
    whiteNoise.stop(now + 2.5);
  }

  /**
   * High-pitch referee/protest whistle blast.
   */
  public playWhistle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2600, now);
    // Vibrato effect
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(25, now);
    lfoGain.gain.setValueAtTime(200, now);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.6);
    osc.stop(now + 0.6);
  }

  /**
   * Toggles realistic police / VIP convoy siren loop.
   */
  public startSiren(active: boolean) {
    if (this.isMuted || !active) {
      if (this.sirenOsc) {
        try {
          this.sirenOsc.stop();
          this.sirenOsc.disconnect();
        } catch (e) {}
        this.sirenOsc = null;
      }
      if (this.sirenInterval) {
        clearInterval(this.sirenInterval);
        this.sirenInterval = null;
      }
      return;
    }

    this.initContext();
    if (!this.ctx || this.sirenOsc) return;

    const now = this.ctx.currentTime;
    this.sirenOsc = this.ctx.createOscillator();
    this.sirenGain = this.ctx.createGain();
    this.sirenGain.gain.setValueAtTime(0.08, now);

    this.sirenOsc.type = 'sine';
    this.sirenOsc.connect(this.sirenGain);
    this.sirenGain.connect(this.ctx.destination);
    this.sirenOsc.start();

    let toggle = false;
    this.sirenInterval = setInterval(() => {
      if (!this.ctx || !this.sirenOsc) return;
      const t = this.ctx.currentTime;
      this.sirenOsc.frequency.cancelScheduledValues(t);
      this.sirenOsc.frequency.linearRampToValueAtTime(toggle ? 650 : 950, t + 0.4);
      toggle = !toggle;
    }, 450);
  }

  /**
   * Sound effect when drinking milk bottle (antidote).
   */
  public playDrinkMilk() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

export const soundManager = new SoundManager();
