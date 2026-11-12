import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UniversalAAC from './components/UniversalAAC';
import BlindAccessibility from './components/BlindAccessibility';
import DeafAccessibility from './components/DeafAccessibility';
import AdaptiveLearning from './components/AdaptiveLearning';
import AIAssistant from './components/AIAssistant';
import AcademicPerformanceAnalytics from './components/AcademicPerformanceAnalytics';
import HelpFeedback from './components/HelpFeedback';
import { api } from './services/api';
import { tts } from './services/tts';

export default function App() {
  const [currentMode, setMode] = useState('general');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [preferences, setPreferences] = useState({
    primary_mode: 'general',
    age_group: 'college',
    preferred_language: 'en',
    high_contrast: false,
    large_font: false,
    font_style: 'inter',
    speech_rate: 1.0,
    speech_pitch: 1.0,
    keyboard_shortcuts_enabled: true
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await api.getPreferences();
      if (data) {
        setPreferences(data);
        if (data.primary_mode) {
          setMode(data.primary_mode);
        }
        if (data.speech_rate) {
          tts.setRate(data.speech_rate);
        }
        if (data.preferred_language) {
          tts.setLanguage(data.preferred_language);
        }
      }
    } catch (err) {
      console.warn('Backend not yet reachable on startup, using local defaults.');
    }
  };

  const updatePreference = async (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    try {
      await api.savePreferences(updated);
    } catch (err) {
      console.warn('Failed saving preferences to SQLite:', err);
    }
  };

  const handleSetMode = (mode) => {
    setMode(mode);
    updatePreference('primary_mode', mode);

    if (mode === 'blind') {
      updatePreference('large_font', true);
      setActiveTab('blind');
    } else if (mode === 'deaf') {
      setActiveTab('deaf');
    } else if (mode === 'nonverbal') {
      setActiveTab('aac');
    } else if (mode === 'dyslexia') {
      updatePreference('font_style', 'dyslexic');
      setActiveTab('learning');
    } else if (mode === 'motor') {
      updatePreference('large_font', true);
      updatePreference('keyboard_shortcuts_enabled', true);
      setActiveTab('aac');
    }
  };

  const rootClasses = [
    preferences.high_contrast ? 'high-contrast dark' : '',
    preferences.large_font ? 'large-font' : '',
    preferences.font_style === 'dyslexic' ? 'dyslexia-font' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${rootClasses}`}>
      
      {/* Hidden ARIA Live Announcer for Screen Readers */}
      <div 
        id="a11y-live-announcer" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      />

      {/* Top Navigation Bar */}
      <Navbar
        currentMode={currentMode}
        setMode={handleSetMode}
        preferences={preferences}
        updatePreference={updatePreference}
        onOpenHelp={() => setActiveTab('feedback')}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Left Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            tts.announce(`Switched to ${tab} tab`);
          }} 
        />

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              currentMode={currentMode}
              setMode={handleSetMode}
              preferences={preferences}
              updatePreference={updatePreference}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'aac' && (
            <UniversalAAC preferences={preferences} />
          )}

          {activeTab === 'blind' && (
            <BlindAccessibility preferences={preferences} />
          )}

          {activeTab === 'deaf' && (
            <DeafAccessibility preferences={preferences} />
          )}

          {activeTab === 'learning' && (
            <AdaptiveLearning preferences={preferences} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'analytics' && (
            <AcademicPerformanceAnalytics setActiveTab={setActiveTab} />
          )}

          {activeTab === 'assistant' && (
            <AIAssistant />
          )}

          {activeTab === 'feedback' && (
            <HelpFeedback preferences={preferences} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>UNIACCESS AI</strong> — One Platform. Every Ability. Equal Opportunity.
          </span>
          <span className="text-[11px] text-slate-400">
            Powered by Google Gemini 2.5 Flash, MediaPipe & OpenCV. English • हिन्दी • ಕನ್ನಡ.
          </span>
        </div>
      </footer>

    </div>
  );
}
