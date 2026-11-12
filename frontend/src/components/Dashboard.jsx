import React from 'react';
import { 
  Eye, 
  Ear, 
  MessageSquare, 
  Accessibility, 
  BookOpen, 
  Sliders, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  Users, 
  BarChart3, 
  HelpCircle 
} from 'lucide-react';
import { tts } from '../services/tts';

export default function Dashboard({ 
  currentMode, 
  setMode, 
  preferences, 
  updatePreference, 
  setActiveTab 
}) {
  const modes = [
    {
      id: 'blind',
      title: 'Blind & Low-Vision',
      description: 'AI scene description, OCR document scanning, screen reader speech & voice guide.',
      icon: Eye,
      accent: 'from-blue-600 to-cyan-600',
      actionTab: 'blind',
      actionLabel: 'Launch Vision OCR'
    },
    {
      id: 'deaf',
      title: 'Deaf & Hard-of-Hearing',
      description: 'Multilingual speech captions (EN/HI/KN), MediaPipe ISL sign tracking & sign library.',
      icon: Ear,
      accent: 'from-teal-600 to-emerald-600',
      actionTab: 'deaf',
      actionLabel: 'Launch Captions & Signs'
    },
    {
      id: 'nonverbal',
      title: 'Non-Speaking (AAC)',
      description: 'Multilingual picture communication board (EN/HI/KN), instant voice synthesizer & sentence strip.',
      icon: MessageSquare,
      accent: 'from-purple-600 to-indigo-600',
      actionTab: 'aac',
      actionLabel: 'Launch AAC Board'
    },
    {
      id: 'dyslexia',
      title: 'Dyslexia & Learning',
      description: 'Dyslexia-friendly fonts, AI concept simplifier, visual analogies & audio narration.',
      icon: BookOpen,
      accent: 'from-amber-600 to-orange-600',
      actionTab: 'learning',
      actionLabel: 'Launch Adaptive Study'
    },
    {
      id: 'motor',
      title: 'Motor Accessibility',
      description: 'Large clickable targets, high-contrast keyboard focus rings & scan mode.',
      icon: Accessibility,
      accent: 'from-rose-600 to-pink-600',
      actionTab: 'aac',
      actionLabel: 'Explore Large Controls'
    }
  ];

  const ageGroups = [
    { id: 'children', label: 'Children (5–12)', desc: 'Playful analogies, joyful vocabulary, large visual cards' },
    { id: 'teenagers', label: 'Teenagers (13–17)', desc: 'Relatable examples, dynamic quizzes, interactive tests' },
    { id: 'college', label: 'College Students (18–25)', desc: 'In-depth conceptual rigor, academic challenges, full analytics' },
    { id: 'adults', label: 'Adults (26–64)', desc: 'Comprehensive study, real-world case studies, flexible pacing' },
    { id: 'seniors', label: 'Seniors (65+)', desc: 'High-legibility typography, calm pacing, step-by-step clarity' }
  ];

  const languages = [
    { code: 'en', name: 'English', native: 'English', desc: 'Universal English voice & captions' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', desc: 'हिन्दी भाषण, उपशीर्षक और एएसी कार्ड' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', desc: 'ಕನ್ನಡ ಧ್ವನಿ, ಶೀರ್ಷಿಕೆಗಳು ಮತ್ತು ಎಎಸಿ ಕಾರ್ಡ್‌ಗಳು' }
  ];

  const handleTestSpeech = () => {
    tts.setRate(preferences.speech_rate || 1.0);
    const lang = preferences.preferred_language || 'en';
    const msg = lang === 'hi' 
      ? 'UniAccess AI में आपका स्वागत है। एक मंच, हर क्षमता, समान अवसर।'
      : (lang === 'kn' ? 'UniAccess AI ಗೆ ಸುಸ್ವಾಗತ. ಒಂದು ವೇದಿಕೆ, ಪ್ರತಿಯೊಂದು ಸಾಮರ್ಥ್ಯ, ಸಮಾನ ಅವಕಾಶ.' : 'Welcome to UniAccess AI. One Platform. Every Ability. Equal Opportunity.');
    tts.speak(msg, lang);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>All Abilities & All Age Groups</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            One Platform. Every Ability. Equal Opportunity.
          </h1>
          <p className="mt-3 text-base sm:text-lg text-indigo-100 leading-relaxed">
            UniAccess AI unites computer vision, speech synthesis, multilingual real-time captions (English, Hindi, Kannada), 
            and adaptive AI learning for children, teenagers, college students, adults, and seniors.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('learning')}
              className="bg-white text-indigo-900 font-bold px-5 py-2.5 rounded-xl shadow hover:bg-indigo-50 transition flex items-center space-x-2"
            >
              <span>Explore Adaptive Quizzes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="bg-indigo-600/50 hover:bg-indigo-600 border border-white/30 text-white font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Academic Analytics</span>
            </button>
            <button
              onClick={handleTestSpeech}
              className="bg-purple-600/50 hover:bg-purple-600 border border-white/30 text-white font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Multilingual Voice</span>
            </button>
          </div>
        </div>
        
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-40 -top-12 w-48 h-48 rounded-full bg-purple-500/20 blur-xl pointer-events-none" />
      </div>

      {/* Multilingual & Age Group Setup Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Language Selection Card */}
        <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Multilingual Audio & Captions Language
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Select your preferred language. Speech recognition, voice synthesis, captions, and AAC cards will automatically adapt.
          </p>
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {languages.map((l) => {
              const isSelected = (preferences.preferred_language || 'en') === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => {
                    updatePreference('preferred_language', l.code);
                    tts.setLanguage(l.code);
                    tts.speak(`Selected ${l.name}`, l.code);
                  }}
                  className={`p-3 rounded-xl border text-center transition ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-base font-extrabold">{l.native}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{l.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Age Group Onboarding Card */}
        <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Learner Age Group Profile
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Adjusts explanation vocabulary, font pacing, and quiz difficulty without limiting accessibility options.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {ageGroups.map((ag) => {
              const isSelected = (preferences.age_group || 'college') === ag.id;
              return (
                <button
                  key={ag.id}
                  onClick={() => {
                    updatePreference('age_group', ag.id);
                    tts.speak(`Profile set to ${ag.label}`, preferences.preferred_language);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{ag.label}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{ag.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Tailored Accessibility Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Mode Customizer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>Accessibility Mode Profiles</span>
            </h2>
            <span className="text-xs text-slate-500">Select any profile to activate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modes.map((m) => {
              const Icon = m.icon;
              const isSelected = currentMode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setMode(m.id);
                    tts.speak(`${m.title} profile selected.`, preferences.preferred_language);
                  }}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-3 right-3 flex items-center text-xs font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Active
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${m.accent} flex items-center justify-center text-white mb-3 shadow`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {m.description}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMode(m.id);
                      setActiveTab(m.actionTab);
                    }}
                    className="mt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <span>{m.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Fine Tuning Preferences */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 dark:text-white">
              Fine-Tune Preferences (Persistent)
            </h3>
          </div>

          {/* Speech Rate Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-700 dark:text-slate-300">Speech Rate (TTS)</span>
              <span className="text-indigo-600">{preferences.speech_rate || 1.0}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={preferences.speech_rate || 1.0}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updatePreference('speech_rate', val);
                tts.setRate(val);
              }}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Fast)</span>
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">High Contrast</p>
              <p className="text-xs text-slate-500">Maximum visibility contrast theme</p>
            </div>
            <input
              type="checkbox"
              checked={!!preferences.high_contrast}
              onChange={(e) => updatePreference('high_contrast', e.target.checked)}
              className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Large Font */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Large Fonts</p>
              <p className="text-xs text-slate-500">Increases text scaling by 120%</p>
            </div>
            <input
              type="checkbox"
              checked={!!preferences.large_font}
              onChange={(e) => updatePreference('large_font', e.target.checked)}
              className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Dyslexia Friendly Mode */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Dyslexia Font Mode</p>
              <p className="text-xs text-slate-500">Weighted characters & wider kerning</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.font_style === 'dyslexic'}
              onChange={(e) => updatePreference('font_style', e.target.checked ? 'dyslexic' : 'inter')}
              className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Keyboard Shortcuts & Focus Rings */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Motor Focus Rings</p>
              <p className="text-xs text-slate-500">Visible outline for keyboard navigation</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.keyboard_shortcuts_enabled !== false}
              onChange={(e) => updatePreference('keyboard_shortcuts_enabled', e.target.checked)}
              className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleTestSpeech}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition"
            >
              <Volume2 className="w-4 h-4 text-indigo-600" />
              <span>Auditory Voice Test</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
