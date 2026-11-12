import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquareHeart, 
  Eye, 
  Ear, 
  GraduationCap, 
  Bot, 
  BarChart3, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Accessibility Hub', icon: LayoutDashboard, badge: null },
  { id: 'aac', label: 'Universal AAC Board', icon: MessageSquareHeart, badge: 'Multilingual' },
  { id: 'blind', label: 'Blind OCR & Vision', icon: Eye, badge: 'Vision' },
  { id: 'deaf', label: 'Deaf Captions & ISL', icon: Ear, badge: '10 Signs' },
  { id: 'learning', label: 'Adaptive Learning', icon: GraduationCap, badge: 'Adaptive' },
  { id: 'analytics', label: 'Academic Analytics', icon: BarChart3, badge: 'Chart.js' },
  { id: 'assistant', label: 'AI Learning Tutor', icon: Bot, badge: 'Gemini' },
  { id: 'feedback', label: 'Help & Feedback', icon: HelpCircle, badge: 'Support' },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shadow-sm">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Platform Modules
        </div>

        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-indigo-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 rounded-xl border border-indigo-100/60 dark:border-slate-700">
          <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-300 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Inclusive Learning Standard</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Equipped with English, Hindi, and Kannada multilingual audio and verified ISL gestures.
          </p>
        </div>
      </div>
    </aside>
  );
}
