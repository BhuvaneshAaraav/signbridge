// Universal Multilingual Text-to-Speech Engine
// Supports English, Hindi (हिन्दी), and Kannada (ಕನ್ನಡ)

class MultilingualTTSService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isSpeaking = false;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.currentLanguage = 'en';

    if (this.synth) {
      this._loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this._loadVoices();
      }
    }
  }

  _loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  setPitch(pitch) {
    this.pitch = Math.max(0.5, Math.min(2.0, pitch));
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
  }

  getBestVoiceForLanguage(langCode) {
    if (!this.voices || this.voices.length === 0) {
      this._loadVoices();
    }

    const code = (langCode || this.currentLanguage || 'en').toLowerCase();

    // 1. Hindi Voice matching
    if (code.startsWith('hi')) {
      const hiVoice = this.voices.find(v => 
        v.lang.toLowerCase().includes('hi') || 
        v.name.toLowerCase().includes('hindi') || 
        v.name.toLowerCase().includes('हिन्दी') ||
        v.name.toLowerCase().includes('hemant') ||
        v.name.toLowerCase().includes('kalpana')
      );
      if (hiVoice) return hiVoice;
    }

    // 2. Kannada Voice matching
    if (code.startsWith('kn')) {
      const knVoice = this.voices.find(v => 
        v.lang.toLowerCase().includes('kn') || 
        v.name.toLowerCase().includes('kannada') ||
        v.name.toLowerCase().includes('ಕನ್ನಡ') ||
        v.name.toLowerCase().includes('sapna')
      );
      if (knVoice) return knVoice;
    }

    // 3. Indian English / Natural Voice matching
    const inVoice = this.voices.find(v => 
      v.lang.toLowerCase().includes('en-in') || 
      v.name.toLowerCase().includes('india') ||
      v.name.toLowerCase().includes('neerja') ||
      v.name.toLowerCase().includes('prabhat')
    );
    if (inVoice && (code.startsWith('hi') || code.startsWith('kn'))) {
      return inVoice; // Best phoneme renderer for Indic text when pure language voice is not pre-installed
    }

    // Default English Voice
    return this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
  }

  speak(text, lang = null, onStart = null, onEnd = null) {
    if (!this.synth || !text) return;

    // Stop currently running voice synthesis before new utterance
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = lang || this.currentLanguage || 'en';

    // Map internal code to standard BCP-47 tag
    let bcpTag = 'en-US';
    if (targetLang === 'hi') bcpTag = 'hi-IN';
    else if (targetLang === 'kn') bcpTag = 'kn-IN';
    else bcpTag = 'en-IN';

    utterance.lang = bcpTag;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    const matchedVoice = this.getBestVoiceForLanguage(targetLang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('TTS Playback notice:', e);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  announce(message) {
    const liveRegion = document.getElementById('a11y-live-announcer');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }
}

export const tts = new MultilingualTTSService();
