import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Trash2, 
  Play, 
  MessageSquare,
  Globe,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { tts } from '../services/tts';

export default function UniversalAAC({ preferences }) {
  const [categories, setCategories] = useState([]);
  const [quickPhrases, setQuickPhrases] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('essentials');
  const [sentenceStrip, setSentenceStrip] = useState([]);
  const [customText, setCustomText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLang, setCurrentLang] = useState(preferences?.preferred_language || 'en');

  useEffect(() => {
    if (preferences?.preferred_language) {
      setCurrentLang(preferences.preferred_language);
    }
  }, [preferences?.preferred_language]);

  useEffect(() => {
    loadAACData();
  }, [currentLang]);

  const loadAACData = async () => {
    try {
      const data = await api.getAACData(currentLang);
      if (data && data.categories) {
        setCategories(data.categories);
        setQuickPhrases(data.quick_phrases || {});
      }
    } catch (err) {
      console.error('Error fetching AAC data:', err);
    }
  };

  const getLabel = (item) => {
    if (!item || !item.label) return '';
    if (typeof item.label === 'string') return item.label;
    return item.label[currentLang] || item.label.en || '';
  };

  const getSpeech = (item) => {
    if (!item) return '';
    if (item.speech) {
      if (typeof item.speech === 'string') return item.speech;
      return item.speech[currentLang] || item.speech.en || '';
    }
    return getLabel(item);
  };

  const handleCardClick = (item) => {
    setSentenceStrip(prev => [...prev, item]);
    const phrase = getSpeech(item);
    speakText(phrase);
  };

  const speakText = (text) => {
    if (!text) return;
    setIsSpeaking(true);
    tts.speak(text, currentLang, () => setIsSpeaking(true), () => setIsSpeaking(false));
  };

  const speakSentenceStrip = () => {
    if (sentenceStrip.length === 0) return;
    const fullSentence = sentenceStrip.map(item => getSpeech(item)).join(' ');
    speakText(fullSentence);
  };

  const clearSentenceStrip = () => {
    setSentenceStrip([]);
    tts.stop();
    setIsSpeaking(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customText.trim()) {
      speakText(customText.trim());
      setCustomText('');
    }
  };

  const currentCategoryData = categories.find(c => c.id === selectedCategory) || categories[0];
  const activePhrases = quickPhrases[currentLang] || quickPhrases.en || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Multilingual AAC Board</span>
            <span>•</span>
            <span>English • हिन्दी • ಕನ್ನಡ</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Universal Picture Communication Board
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tap picture cards or type custom phrases — UniAccess AI speaks immediately in your selected language with natural voice synthesis.
          </p>
        </div>

        {/* Language Quick Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          {['en', 'hi', 'kn'].map((code) => (
            <button
              key={code}
              onClick={() => {
                setCurrentLang(code);
                tts.setLanguage(code);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentLang === code
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {code === 'en' ? 'English' : (code === 'hi' ? 'हिन्दी' : 'ಕನ್ನಡ')}
            </button>
          ))}
        </div>
      </div>

      {/* Sentence Strip (Sentence Builder) */}
      <div className="bg-white dark:bg-slate-900 border-2 border-purple-300 dark:border-purple-900 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
            Active Sentence Builder ({currentLang.toUpperCase()})
          </span>
          <div className="flex space-x-2">
            <button
              onClick={clearSentenceStrip}
              disabled={sentenceStrip.length === 0}
              className="text-xs text-slate-500 hover:text-red-600 disabled:opacity-40 flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
            <button
              onClick={speakSentenceStrip}
              disabled={sentenceStrip.length === 0}
              className="text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold flex items-center space-x-1.5 px-4 py-1.5 rounded-lg shadow-sm transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Speak Sentence</span>
            </button>
          </div>
        </div>

        {/* Sentence Cards Strip */}
        <div className="min-h-20 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-wrap items-center gap-2">
          {sentenceStrip.length === 0 ? (
            <span className="text-xs text-slate-400 italic">
              Tap any picture card below to assemble and hear your message...
            </span>
          ) : (
            sentenceStrip.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-xl shadow-sm text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{getLabel(item)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Custom Typed Speech Input */}
      <form onSubmit={handleCustomSubmit} className="flex gap-2">
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder={currentLang === 'hi' ? 'या यहाँ कोई भी संदेश लिखें और बुलवाएं...' : (currentLang === 'kn' ? 'ಅಥವಾ ಮಾತನಾಡಲು ಯಾವುದೇ ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...' : 'Or type any message here to speak...')}
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-400 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm shadow-sm"
        />
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl flex items-center space-x-2 shadow transition active:scale-95"
        >
          <Volume2 className="w-5 h-5" />
          <span>Speak</span>
        </button>
      </form>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-none">
        {categories.map((cat) => {
          const catName = typeof cat.name === 'string' ? cat.name : (cat.name[currentLang] || cat.name.en);
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{catName}</span>
            </button>
          );
        })}
      </div>

      {/* Picture Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {currentCategoryData && currentCategoryData.items.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            className="group flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 active:scale-95 text-center min-h-[130px]"
          >
            <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform">
              {card.icon}
            </span>
            <span className="mt-3 font-bold text-xs sm:text-sm text-slate-800 dark:text-white group-hover:text-purple-600 line-clamp-2">
              {getLabel(card)}
            </span>
          </button>
        ))}
      </div>

      {/* Frequently Used Quick Phrases */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-purple-600" />
          <span>Frequently Used Everyday Phrases ({currentLang.toUpperCase()})</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activePhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => speakText(phrase)}
              className="text-left p-3.5 bg-slate-50 hover:bg-purple-50 dark:bg-slate-800/60 dark:hover:bg-purple-950/30 border border-slate-200 dark:border-slate-700 hover:border-purple-400 rounded-xl transition flex items-center justify-between group"
            >
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                "{phrase}"
              </span>
              <Volume2 className="w-4 h-4 text-slate-400 group-hover:text-purple-600 flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
