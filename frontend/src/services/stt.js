// Multilingual Speech-to-Text Live Captioning Service
// Supports English (en-IN), Hindi (hi-IN), and Kannada (kn-IN)

class MultilingualSTTService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.currentLanguage = 'en';
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.isSupported = false;

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-IN';
        this.isSupported = true;

        this.recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (this.onResultCallback) {
            this.onResultCallback({
              final: finalTranscript,
              interim: interimTranscript,
              full: finalTranscript || interimTranscript
            });
          }
        };

        this.recognition.onerror = (event) => {
          console.warn('STT Notification:', event.error);
          if (this.onErrorCallback) {
            this.onErrorCallback(event.error);
          }
        };

        this.recognition.onend = () => {
          if (this.isListening) {
            try {
              this.recognition.start();
            } catch (e) {
              this.isListening = false;
            }
          }
        };
      }
    }
  }

  setLanguage(langCode) {
    this.currentLanguage = langCode;
    let bcpTag = 'en-IN';
    if (langCode === 'hi') bcpTag = 'hi-IN';
    else if (langCode === 'kn') bcpTag = 'kn-IN';

    if (this.recognition) {
      this.recognition.lang = bcpTag;
      if (this.isListening) {
        // Restart with new language on the fly
        try {
          this.recognition.stop();
          this.recognition.start();
        } catch (e) {}
      }
    }
  }

  start(lang = 'en', onResult, onError) {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.setLanguage(lang);

    if (!this.recognition) {
      if (onError) onError('Browser speech recognition not available. You can use standard microphone captions or test mode.');
      return false;
    }

    try {
      this.isListening = true;
      this.recognition.start();
      return true;
    } catch (e) {
      console.warn('Recognition start notice:', e);
      return false;
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }
}

export const stt = new MultilingualSTTService();
