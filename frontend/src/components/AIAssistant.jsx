import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  User, 
  RotateCcw,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { tts } from '../services/tts';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I am your UniAccess AI Learning Assistant. Whether you need a concept broken down into simple analogies, want homework simplified, or need assistance navigating accessibility features, I'm here for you. How can I help today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const resp = await api.chatAssistant(userText);
      const replyText = resp.reply || "I am glad to help! Let me know if you would like me to explain this in further detail.";
      setMessages(prev => [...prev, { role: 'assistant', text: replyText }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "I am having trouble reaching the network right now, but you can always explore our offline simplified lessons and AAC board!" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text, idx) => {
    if (speakingIdx === idx) {
      tts.stop();
      setSpeakingIdx(null);
    } else {
      setSpeakingIdx(idx);
      tts.speak(text, () => setSpeakingIdx(idx), () => setSpeakingIdx(null));
    }
  };

  const samplePrompts = [
    "Explain photosynthesis in one simple sentence.",
    "How does a blind person navigate using UniAccess OCR?",
    "Give me 3 memory tricks for learning math formulas.",
    "What are the 10 verified sign language gestures supported?"
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Powered by Google Gemini</span>
            <span>•</span>
            <span>Assistive Tutor</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            AI Adaptive Learning Assistant
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ask any question, request simpler explanations, or hear responses read aloud.
          </p>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-[560px]">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                  isUser ? 'bg-indigo-600' : 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  
                  {!isUser && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                      <button
                        onClick={() => handleSpeak(m.text, idx)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center space-x-1 font-semibold"
                      >
                        {speakingIdx === idx ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{speakingIdx === idx ? 'Stop Voice' : 'Read Aloud'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-2 text-indigo-600 text-xs font-semibold py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gemini is generating simplified explanation...</span>
            </div>
          )}
        </div>

        {/* Suggestion Prompts */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-700 flex overflow-x-auto gap-2 scrollbar-none">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setInputMessage(p)}
              className="text-[11px] whitespace-nowrap bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-medium"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your question or concept to explain..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 transition"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>

      </div>
    </div>
  );
}
