import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Send, 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Bug, 
  Lightbulb, 
  Heart,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { tts } from '../services/tts';

export default function HelpFeedback({ preferences }) {
  // Feedback form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Feature Suggestion');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  // Accordion state
  const [openFaq, setOpenFaq] = useState(null);
  const [openGuide, setOpenGuide] = useState(null);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const res = await api.getFeedbacks();
      if (res.success && Array.isArray(res.feedbacks)) {
        setFeedbacks(res.feedbacks);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const resp = await api.submitFeedback({
        name: name.trim() || 'Anonymous User',
        category,
        rating,
        message: message.trim()
      });

      if (resp.success) {
        setSubmissionSuccess(true);
        setMessage('');
        setName('');
        setRating(5);
        loadFeedbacks();
        tts.speak("Thank you! Your feedback has been recorded permanently in our SQLite database.", preferences?.preferred_language);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "How does the Multilingual Audio feature work?",
      a: "You can switch between English, Hindi (हिन्दी), and Kannada (ಕನ್ನಡ) using the language dropdown in the top bar. The platform dynamically activates speech synthesis voices and speech-to-text recognition configured for that language."
    },
    {
      q: "Which hand signs are recognized by the computer vision detector?",
      a: "Our MediaPipe HandLandmarker tracks 21 3D landmarks and recognizes 10 verified gestures: Namaste / Greetings, Thank You, Yes (Thumbs Up), No (Thumbs Down), Water (W-sign), Good / Super (OK circle), Eat / Food, Help (Closed fist), Peace / Victory (V-sign), and Stop (Open flat palm)."
    },
    {
      q: "Can I generate a quiz on any subject?",
      a: "Yes! In the Adaptive Learning section, enter any subject name (e.g. Physics, Indian History, Machine Learning, Chemistry), pick your difficulty (Easy, Medium, Hard), and select your desired question count. Gemini AI will generate 4-option multiple-choice questions with instant scoring."
    },
    {
      q: "Is my progress and profile saved permanently?",
      a: "Yes. All user preferences, age group settings, quiz attempts, recognized signs, and submitted feedback are stored permanently in a local SQLite database (uniaccess.db). Data is retained across refreshes and restarts."
    },
    {
      q: "How do I activate high contrast or dyslexia-friendly fonts?",
      a: "Use the quick toggles in the top navigation bar. Click the Sun/Moon icon for High Contrast (WCAG AAA dark/yellow) and the 'A' icon to switch to the OpenDyslexic weighted font."
    }
  ];

  const howToGuides = [
    {
      title: "How to use Blind Mode & OCR Document Extractor",
      steps: [
        "Navigate to 'Blind OCR & Vision' from the sidebar.",
        "Click 'Upload Document Image' or open the webcam scanner to capture printed text (books, medicine labels, signs).",
        "The optical character recognition engine will extract all readable text.",
        "Click 'Read Aloud' to hear the extracted text spoken at your chosen speed."
      ]
    },
    {
      title: "How to use Deaf Captions & Indian Sign Recognition",
      steps: [
        "Navigate to 'Deaf Captions & ISL' from the sidebar.",
        "Click 'Start Captions' to see spoken audio transcribed as live subtitles in English, Hindi, or Kannada.",
        "Click 'Start Camera' to enable MediaPipe hand landmark tracking.",
        "Form any of the 10 verified signs in front of the lens. The recognized text will stream into the transcript.",
        "Click 'Clear / Reset' to reset the transcript at any time."
      ]
    },
    {
      title: "How to use the Picture-based AAC Communication Board",
      steps: [
        "Navigate to 'Universal AAC Board' from the sidebar.",
        "Select your preferred language (English, Hindi, or Kannada).",
        "Tap picture cards across categories (Essentials, Feelings, Classroom, Greetings) to assemble a sentence in the sentence builder.",
        "Press 'Speak Sentence' to vocalize the full phrase with natural voice synthesis."
      ]
    },
    {
      title: "How to track Subject-wise Marks in Academic Analytics",
      steps: [
        "Take quizzes in different subjects under 'Adaptive Learning'.",
        "Navigate to 'Academic Analytics' in the sidebar.",
        "Inspect the comparative bar chart to view scores across subjects, identify weak topics, and follow personalized revision recommendations."
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Community Support & Guides</span>
            <span>•</span>
            <span>Help & Feedback</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Help Center, How-To Guides & User Feedback
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse accessibility guides, explore FAQs, report issues, and submit suggestions. All submissions are stored permanently in SQLite.
          </p>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: FAQs & How-To Guides */}
        <div className="space-y-6">
          
          {/* How-To Guides Accordion */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Step-by-Step How-To Guides</span>
            </h2>

            <div className="space-y-2.5">
              {howToGuides.map((guide, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenGuide(openGuide === idx ? null : idx)}
                    className="w-full text-left p-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition"
                  >
                    <span>{guide.title}</span>
                    {openGuide === idx ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openGuide === idx && (
                    <div className="p-4 bg-white dark:bg-slate-900 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                        {guide.steps.map((st, sIdx) => (
                          <li key={sIdx}>{st}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Frequently Asked Questions Accordion */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <span>Frequently Asked Questions (FAQ)</span>
            </h2>

            <div className="space-y-2.5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Feedback & Problem Submission Form */}
        <div className="space-y-6">
          
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  Submit Feedback & Report Issues
                </h2>
              </div>
              <span className="text-[10px] text-slate-400">Stores to SQLite</span>
            </div>

            {submissionSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Thank you! Your feedback has been submitted and stored permanently in the database.</span>
              </div>
            )}

            {/* Name Input (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Your Name (Optional):
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Sharma or leave blank for Anonymous"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Feedback Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold cursor-pointer"
              >
                <option value="Feature Suggestion">💡 Feature Suggestion</option>
                <option value="Bug Report">🐛 Report a Technical Problem</option>
                <option value="Accessibility Improvement">♿ Accessibility Improvement</option>
                <option value="Curriculum Request">📚 Subject or Quiz Request</option>
                <option value="Appreciation">❤️ General Appreciation</option>
              </select>
            </div>

            {/* Interactive 5-Star Rating */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Rate the Application (1–5 Stars):
              </label>
              <div className="flex items-center space-x-1 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-500 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Detailed Message or Report: <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your suggestion, the bug encountered, or your experience with UniAccess AI..."
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Database...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </form>

          {/* Recently Submitted Feedback History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Community Feedback Records (SQLite)</span>
            </h3>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {feedbacks.length > 0 ? (
                feedbacks.map((fb) => (
                  <div key={fb.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{fb.name}</span>
                      <span className="text-[10px] text-amber-500 font-bold">
                        {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                      </span>
                    </div>
                    <span className="inline-block text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {fb.category}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                      "{fb.message}"
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No feedback entries yet. Be the first to share your thoughts!</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
