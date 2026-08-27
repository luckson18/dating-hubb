/**
 * Audio Synthesizer and Haptic Feedback Engine
 * Provides multi-sensory feedback for accessible tactile and auditory navigation.
 */

class AudioHapticsEngine {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private hapticEnabled: boolean = true;

  constructor() {
    // Lazy initialized on first user gesture
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setPreferences(sound: boolean, haptic: boolean) {
    this.soundEnabled = sound;
    this.hapticEnabled = haptic;
  }

  /**
   * Triggers device vibration if supported & enabled
   */
  public vibrate(pattern: number | number[]) {
    if (!this.hapticEnabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore fallback
      }
    }
  }

  /**
   * Plays a synthesized frequency tone
   */
  private playTone(freq: number, type: OscillatorType, duration: number, gainValue = 0.1, ramp = true) {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, ctx.currentTime);
      if (ramp) {
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted
    }
  }

  // --- Multi-sensory tactile cues ---

  public triggerNavigationClick() {
    this.vibrate(10);
    this.playTone(480, 'sine', 0.05, 0.04);
  }

  public triggerSwipeLeft() {
    this.vibrate([20, 20]);
    this.playTone(320, 'triangle', 0.12, 0.05);
  }

  public triggerSwipeRight() {
    this.vibrate([25, 15, 35]);
    this.playTone(640, 'sine', 0.14, 0.07);
    setTimeout(() => this.playTone(880, 'sine', 0.18, 0.08), 80);
  }

  public triggerLike() {
    this.vibrate([25, 15, 35]);
    this.playTone(640, 'sine', 0.14, 0.07);
    setTimeout(() => this.playTone(880, 'sine', 0.18, 0.08), 80);
  }

  public triggerSuperLike() {
    this.vibrate([40, 20, 40, 20, 80]);
    this.playTone(523.25, 'sine', 0.1, 0.08); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.08), 90); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.15, 0.09), 180); // G5
    setTimeout(() => this.playTone(1046.50, 'sine', 0.25, 0.1), 270); // C6
  }

  public triggerMatchCelebration() {
    this.vibrate([80, 40, 80, 40, 160]);
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.2, 0.08), i * 80);
    });
  }

  public triggerVoiceCommandAcknowledge() {
    this.vibrate([15, 10, 15]);
    this.playTone(800, 'sine', 0.08, 0.06);
    setTimeout(() => this.playTone(1200, 'sine', 0.1, 0.06), 60);
  }

  public triggerVoiceCommandError() {
    this.vibrate([60, 40, 60]);
    this.playTone(280, 'sawtooth', 0.15, 0.05);
    setTimeout(() => this.playTone(220, 'sawtooth', 0.2, 0.05), 100);
  }

  public triggerBiometricSuccess() {
    this.vibrate([30, 20, 45]);
    this.playTone(600, 'sine', 0.08, 0.05);
    setTimeout(() => this.playTone(900, 'sine', 0.12, 0.07), 80);
  }

  public triggerBiometricLocked() {
    this.vibrate([70, 30, 70]);
    this.playTone(300, 'triangle', 0.15, 0.06);
  }

  public triggerMessageSent() {
    this.vibrate(20);
    this.playTone(720, 'sine', 0.08, 0.06);
    setTimeout(() => this.playTone(960, 'sine', 0.1, 0.06), 50);
  }

  public triggerInterestSent() {
    this.vibrate([25, 20, 45]);
    this.playTone(587.33, 'sine', 0.1, 0.08);
    setTimeout(() => this.playTone(880, 'sine', 0.16, 0.09), 75);
    setTimeout(() => this.playTone(1174.66, 'sine', 0.22, 0.09), 150);
  }

  public triggerRecallInterest() {
    this.vibrate([30, 20, 30]);
    this.playTone(660, 'sine', 0.09, 0.07);
    setTimeout(() => this.playTone(440, 'sine', 0.14, 0.07), 70);
  }

  public triggerMatchSuccess() {
    this.triggerMatchCelebration();
  }

  public triggerSuccessCheck() {
    this.vibrate(15);
    this.playTone(600, 'sine', 0.08, 0.05);
    setTimeout(() => this.playTone(900, 'sine', 0.12, 0.07), 80);
  }

  public triggerSuccessChime() {
    this.triggerSuccessCheck();
  }

  public triggerErrorShake() {
    this.triggerVoiceCommandError();
  }

  public triggerSafetyAlert() {
    this.vibrate([100, 50, 100, 50, 200]);
    this.playTone(880, 'sawtooth', 0.15, 0.08);
    setTimeout(() => this.playTone(587.33, 'sawtooth', 0.2, 0.08), 120);
    setTimeout(() => this.playTone(880, 'sawtooth', 0.25, 0.09), 260);
  }

  public triggerSafetyCheckSuccess() {
    this.vibrate([30, 20, 50]);
    this.playTone(523.25, 'sine', 0.1, 0.06); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.06), 70); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.16, 0.07), 140); // G5
    setTimeout(() => this.playTone(1046.50, 'sine', 0.25, 0.08), 210); // C6
  }

  public triggerTap() {
    this.triggerNavigationClick();
  }

  public triggerMatch() {
    this.triggerMatchCelebration();
  }

  public triggerPass() {
    this.triggerSwipeLeft();
  }

  public triggerModalOpen() {
    this.vibrate(12);
    this.playTone(520, 'sine', 0.06, 0.04);
  }

  public triggerSaveDraft() {
    this.triggerSuccessCheck();
  }
}

export const audioHaptics = new AudioHapticsEngine();
