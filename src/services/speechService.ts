/**
 * Speech Service - Handles Speech Synthesis (Screen Reader Narration)
 * and Speech Recognition (Voice Commands Navigation).
 */

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

type CommandCallback = (command: string, rawTranscript: string) => void;

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private onCommandCallback: CommandCallback | null = null;
  private onListeningStateChange: ((listening: boolean) => void) | null = null;
  private onTranscriptPreview: ((text: string) => void) | null = null;
  private speechRate: number = 1.0;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  public setSpeechRate(rate: number) {
    this.speechRate = Math.max(0.7, Math.min(1.8, rate));
  }

  /**
   * Reads text aloud using Web SpeechSynthesis
   */
  public speak(text: string, onEnd?: () => void, priority = true) {
    if (!this.synth) return;
    if (priority) {
      this.synth.cancel(); // cancel previous narration
    }

    const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = this.speechRate;
    utterance.pitch = 1.0;
    
    // Pick natural English voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    return !!this.synth && this.synth.speaking;
  }

  /**
   * Initializes Web Speech Recognition for voice navigation
   */
  public startListening(
    onCommand: CommandCallback,
    onStateChange?: (listening: boolean) => void,
    onTranscript?: (text: string) => void
  ): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('SpeechRecognition API not supported on this browser.');
      return false;
    }

    this.onCommandCallback = onCommand;
    this.onListeningStateChange = onStateChange || null;
    this.onTranscriptPreview = onTranscript || null;

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onListeningStateChange) this.onListeningStateChange(true);
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (this.onTranscriptPreview) {
          this.onTranscriptPreview(interimTranscript || finalTranscript);
        }

        if (finalTranscript) {
          this.processCommand(finalTranscript.trim().toLowerCase());
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.stopListening();
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // Restart if meant to be listening continuously
          try {
            this.recognition.start();
          } catch {
            this.isListening = false;
            if (this.onListeningStateChange) this.onListeningStateChange(false);
          }
        } else {
          if (this.onListeningStateChange) this.onListeningStateChange(false);
        }
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      this.isListening = false;
      if (this.onListeningStateChange) this.onListeningStateChange(false);
      return false;
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
    if (this.onListeningStateChange) {
      this.onListeningStateChange(false);
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  private processCommand(raw: string) {
    if (!this.onCommandCallback) return;

    let matched = 'UNKNOWN';
    if (raw.startsWith('search ') || raw.startsWith('find ') || raw.startsWith('filter by ')) {
      matched = 'SEARCH_QUERY';
    } else if (raw.includes('dating request') || raw.includes('date request') || raw.includes('dates') || raw.includes('date night') || raw.includes('my dates')) {
      matched = 'NAV_REQUESTS';
    } else if (raw.includes('propose date') || raw.includes('ask on date') || raw.includes('invite on date') || raw.includes('new date')) {
      matched = 'PROPOSE_DATE';
    } else if (raw.includes('accept date') || raw.includes('confirm date')) {
      matched = 'ACCEPT_DATE';
    } else if (raw.includes('recall interest') || raw.includes('undo interest') || raw.includes('cancel interest') || raw.includes('remove interest') || raw.includes('unsend interest')) {
      matched = 'RECALL_INTEREST';
    } else if (raw.includes('express interest') || raw.includes('interested') || raw.includes('send interest')) {
      matched = 'EXPRESS_INTEREST';
    } else if (raw.includes('super like') || raw.includes('super') || raw.includes('star')) {
      matched = 'SUPER_LIKE';
    } else if (raw.includes('like') || raw.includes('love') || raw.includes('right') || raw.includes('yes') || raw.includes('match')) {
      matched = 'LIKE';
    } else if (raw.includes('pass') || raw.includes('next') || raw.includes('left') || raw.includes('no') || raw.includes('skip')) {
      matched = 'PASS';
    } else if (raw.includes('read') || raw.includes('tell me') || raw.includes('bio') || raw.includes('details') || raw.includes('about')) {
      matched = 'READ_PROFILE';
    } else if (raw.includes('stop') || raw.includes('quiet') || raw.includes('silence') || raw.includes('shut up')) {
      matched = 'STOP_SPEAKING';
    } else if (raw.includes('video') || raw.includes('watch') || raw.includes('play video')) {
      matched = 'VIDEO_BIO';
    } else if (raw.includes('filter') || raw.includes('search') || raw.includes('preferences')) {
      matched = 'OPEN_FILTERS';
    } else if (raw.includes('message') || raw.includes('chat') || raw.includes('inbox')) {
      matched = 'NAV_MESSAGES';
    } else if (raw.includes('discover') || raw.includes('card') || raw.includes('home') || raw.includes('swipe')) {
      matched = 'NAV_DISCOVERY';
    } else if (raw.includes('status') || raw.includes('story') || raw.includes('feed') || raw.includes('update')) {
      matched = 'NAV_STATUS';
    } else if (raw.includes('profile') || raw.includes('my profile') || raw.includes('account')) {
      matched = 'NAV_PROFILE';
    } else if (raw.includes('contrast') || raw.includes('high contrast') || raw.includes('theme') || raw.includes('dark mode')) {
      matched = 'TOGGLE_CONTRAST';
    } else if (raw.includes('lock') || raw.includes('secure') || raw.includes('privacy')) {
      matched = 'LOCK_APP';
    } else if (raw.includes('help') || raw.includes('command') || raw.includes('cheat sheet')) {
      matched = 'HELP';
    }

    this.onCommandCallback(matched, raw);
  }
}

export const speechService = new SpeechService();
