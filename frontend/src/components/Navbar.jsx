import React from 'react';
import { 
  Eye, 
  Ear, 
  MessageSquare, 
  Accessibility, 
  BookOpen, 
  Globe, 
  Sun, 
  Moon, 
  Type, 
  HelpCircle,
  Users
} from 'lucide-react';
import { tts } from '../services/tts';

const MODES = [
  { id: 'general', label: 'General Hub', icon: Globe },
  { id: 'blind', label: 'Blind Mode', icon: Eye },
  { id: 'deaf', label: 'Deaf Mode', icon: Ear },
  { id: 'nonverbal', label: 'Non-Speaking (AAC)', icon: MessageSquare },
  { id: 'motor', label: 'Motor Mode', icon: Accessibility },
  { id: 'dyslexia', label: 'Dyslexia Mode', icon: BookOpen }
];

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' }
];

const AGE_GROUPS = [
  { id: 'children', label: 'Children (5–12)' },
  { id: 'teenagers', label: 'Teenagers (13–17)' },
  { id: 'college', label: 'College (18–25)' },
  { id: 'adults', label: 'Adults (26–64)' },
  { id: 'seniors', label: 'Seniors (65+)' }
];

export default function Navbar({ 
  currentMode, 
  setMode, 
  preferences, 
  updatePreference, 
  onOpenHelp 
}) {
  const handleModeChange = (newMode) => {
    setMode(newMode);
    const modeObj = MODES.find(m => m.id === newMode);
    tts.speak(`${modeObj ? modeObj.label : newMode} activated.`, preferences.preferred_language);
  };

  const handleLanguageChange = (langCode) => {
    updatePreference('preferred_language', langCode);
    tts.setLanguage(langCode);
    const langObj = LANGUAGES.find(l => l.code === langCode);
    const greeting = langCode === 'hi' 
      ? 'हिन्दी भाषा सक्रिय की गई है।' 
      : (langCode === 'kn' ? 'ಕನ್ನಡ ಭಾಷೆಯನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ.' : 'English language selected.');
    tts.speak(greeting, langCode);
  };

  const handleAgeChange = (age) => {
    updatePreference('age_group', age);
    const ageObj = AGE_GROUPS.find(a => a.id === age);
    tts.speak(`Learner profile set to ${ageObj?.label}. Explanations will adapt accordingly.`, preferences.preferred_language);
  };

  const toggleHighContrast = () => {
    const nextVal = !preferences.high_contrast;
    updatePreference('high_contrast', nextVal);
    tts.speak(nextVal ? "High contrast enabled" : "Standard contrast enabled", preferences.preferred_language);
  };

  const toggleLargeFont = () => {
    const nextVal = !preferences.large_font;
    updatePreference('large_font', nextVal);
    tts.speak(nextVal ? "Large font mode enabled" : "Standard font size enabled", preferences.preferred_language);
  };

  const toggleDyslexiaFont = () => {
    const nextStyle = preferences.font_style === 'dyslexic' ? 'inter' : 'dyslexic';
    updatePreference('font_style', nextStyle);
    tts.speak(nextStyle === 'dyslexic' ? "Dyslexia friendly font enabled" : "Standard font enabled", preferences.preferred_language);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Accessibility className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  UNIACCESS AI
                </span>
                <span className="hidden lg:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Multilingual ISL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                One Platform. Every Ability. Equal Opportunity.
              </p>
            </div>
          </div>

          {/* Center / Right Controls */}
          <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap justify-end">
            
            {/* Multilingual Selector */}
            <div className="relative">
              <label htmlFor="lang-select" className="sr-only">Select Language</label>
              <select
                id="lang-select"
                value={preferences.preferred_language || 'en'}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-indigo-50 dark:bg-slate-800 text-indigo-900 dark:text-indigo-200 font-bold text-xs py-2 px-2.5 rounded-lg border border-indigo-200 dark:border-slate-700 hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm transition"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    🌐 {lang.native} ({lang.label})
                  </option>
                ))}
              </select>
            </div>

            {/* Age Group Selector */}
            <div className="relative hidden sm:block">
              <label htmlFor="age-select" className="sr-only">Select Age Group</label>
              <select
                id="age-select"
                value={preferences.age_group || 'college'}
                onChange={(e) => handleAgeChange(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-xs py-2 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm transition"
              >
                {AGE_GROUPS.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    🎓 {ag.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Accessibility Mode Switcher */}
            <div className="relative">
              <label htmlFor="mode-select" className="sr-only">Select Accessibility Mode</label>
              <select
                id="mode-select"
                value={currentMode}
                onChange={(e) => handleModeChange(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs py-2 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-indigo-500 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm transition"
              >
                {MODES.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Accessibility Toggles */}
            <div className="flex items-center space-x-1 pl-1 border-l border-slate-200 dark:border-slate-700">
              
              {/* High Contrast */}
              <button
                onClick={toggleHighContrast}
                title="Toggle High Contrast"
                aria-label="Toggle High Contrast"
                className={`p-2 rounded-lg text-xs font-semibold transition ${
                  preferences.high_contrast
                    ? 'bg-yellow-400 text-black ring-2 ring-yellow-500'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                {preferences.high_contrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Large Font */}
              <button
                onClick={toggleLargeFont}
                title="Toggle Large Font Size"
                aria-label="Toggle Large Font Size"
                className={`p-2 rounded-lg text-xs font-semibold transition ${
                  preferences.large_font
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                <span className="font-bold text-xs">A+</span>
              </button>

              {/* Dyslexia Font */}
              <button
                onClick={toggleDyslexiaFont}
                title="Toggle Dyslexia-Friendly Font"
                aria-label="Toggle Dyslexia-Friendly Font"
                className={`p-2 rounded-lg text-xs font-semibold transition ${
                  preferences.font_style === 'dyslexic'
                    ? 'bg-amber-500 text-white shadow'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                <Type className="w-4 h-4" />
              </button>

              {/* Help & Feedback Button (Replaced Emergency) */}
              <button
                onClick={onOpenHelp}
                className="ml-1 flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-2 rounded-lg shadow-sm transition active:scale-95"
                title="Help, Guides & Feedback"
                aria-label="Help and Feedback"
              >
                <HelpCircle className="w-4 h-4 text-white" />
                <span className="hidden md:inline">Help & Feedback</span>
              </button>

            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
