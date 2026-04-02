
class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.ctx) {
      if (muted) {
        this.ctx.suspend();
      } else {
        this.ctx.resume();
      }
    }
  }

  public resume() {
    this.init();
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended' && !this.muted) {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    this.init();
    if (!this.ctx || this.muted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playMove() {
    this.playTone(150, 'sine', 0.1, 0.1);
  }

  playInteract() {
    this.playTone(440, 'square', 0.15, 0.1);
    setTimeout(() => this.playTone(880, 'square', 0.15, 0.1), 50);
  }

  playAttack() {
    this.playTone(100, 'sawtooth', 0.25, 0.2);
    this.playTone(50, 'sawtooth', 0.25, 0.2);
  }

  playCriticalHit() {
    this.playTone(150, 'sawtooth', 0.1, 0.3);
    this.playTone(400, 'sawtooth', 0.1, 0.2);
    setTimeout(() => this.playTone(800, 'sine', 0.3, 0.1), 50);
  }

  playPoisonAttack() {
    this.playTone(100, 'sawtooth', 0.1, 0.1);
    this.playTone(200, 'sawtooth', 0.1, 0.1);
    // Sizzle effect
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playTone(1000 + Math.random() * 2000, 'sine', 0.05, 0.05), i * 30);
    }
  }

  playTideAttack() {
    // Splashy water sound using noise-like frequencies
    for (let i = 0; i < 8; i++) {
      setTimeout(() => this.playTone(200 + Math.random() * 400, 'sine', 0.1, 0.05), i * 20);
      setTimeout(() => this.playTone(800 + Math.random() * 1000, 'sine', 0.05, 0.02), i * 15);
    }
  }

  playWhoosh() {
    // Wind/whoosh sound
    for (let i = 0; i < 10; i++) {
      const freq = 800 - (i * 50);
      setTimeout(() => this.playTone(freq, 'sine', 0.1, 0.05), i * 10);
    }
  }

  playShieldBlock() {
    // Dull thud
    this.playTone(150, 'triangle', 0.1, 0.2);
    this.playTone(80, 'triangle', 0.15, 0.2);
  }

  playEnemyAttack() {
    this.playTone(80, 'sawtooth', 0.3, 0.2);
    this.playTone(40, 'sawtooth', 0.3, 0.2);
  }

  playBossAttack() {
    this.playTone(60, 'sawtooth', 0.5, 0.3);
    this.playTone(30, 'sawtooth', 0.5, 0.3);
    this.playTone(10, 'sawtooth', 0.8, 0.4);
  }

  playSpecialAbility() {
    const notes = [200, 400, 600, 800];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 'sine', 0.2, 0.1), i * 100);
    });
  }

  playHit() {
    this.playTone(60, 'triangle', 0.4, 0.3);
  }

  playEnemyHit() {
    this.playTone(120, 'triangle', 0.3, 0.2);
    this.playTone(80, 'triangle', 0.3, 0.2);
  }

  playHeal() {
    this.playTone(523.25, 'sine', 0.4, 0.2); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.4, 0.2), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.4, 0.2), 200); // G5
  }

  playPotion() {
    this.playTone(800, 'sine', 0.15, 0.1);
    this.playTone(1200, 'sine', 0.25, 0.1);
  }

  playLevelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 'square', 0.5, 0.1), i * 150);
    });
  }

  playBuy() {
    this.playTone(880, 'sine', 0.15, 0.1);
    setTimeout(() => this.playTone(1320, 'sine', 0.15, 0.1), 50);
  }

  playDeath() {
    this.playTone(200, 'sawtooth', 0.6, 0.2);
    this.playTone(150, 'sawtooth', 0.6, 0.2);
    this.playTone(100, 'sawtooth', 1.2, 0.2);
  }

  playParry() {
    // Metallic "clink" sound
    this.playTone(1200, 'square', 0.05, 0.15);
    setTimeout(() => this.playTone(1800, 'square', 0.05, 0.1), 30);
    setTimeout(() => this.playTone(2400, 'sine', 0.2, 0.05), 60);
    // Add a low-frequency thud for impact
    setTimeout(() => this.playTone(100, 'triangle', 0.1, 0.1), 10);
  }

  playHazardTrigger() {
    this.playTone(300, 'sawtooth', 0.2, 0.1);
    setTimeout(() => this.playTone(600, 'sawtooth', 0.2, 0.1), 100);
  }

  playPillarBreak() {
    this.playTone(100, 'sawtooth', 0.4, 0.2);
    this.playTone(50, 'sawtooth', 0.4, 0.2);
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playTone(200 + Math.random() * 300, 'square', 0.1, 0.05), i * 50);
    }
  }
}

export const sounds = new SoundManager();
