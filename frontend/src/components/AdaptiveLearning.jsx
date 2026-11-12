import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Award,
  Lightbulb,
  FileText,
  Loader2,
  Sliders,
  Send,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { tts } from '../services/tts';

export default function AdaptiveLearning({ preferences, setActiveTab }) {
  // Topic input & configuration
  const [topicName, setTopicName] = useState('Science - Renewable Energy');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [ageGroup, setAgeGroup] = useState(preferences?.age_group || 'college');

  // Materials & simplification
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [customText, setCustomText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simplifiedData, setSimplifiedData] = useState(null);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [recommendations, setRecommendations] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    if (preferences?.age_group) {
      setAgeGroup(preferences.age_group);
    }
  }, [preferences?.age_group]);

  const loadMaterials = async () => {
    try {
      const data = await api.getLearningMaterials();
      if (Array.isArray(data) && data.length > 0) {
        setMaterials(data);
        handleSelectMaterial(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectMaterial = async (mat) => {
    setSelectedMaterial(mat);
    setTopicName(mat.title);
    setQuizQuestions([]);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setRecommendations(null);

    if (mat.simplified_text) {
      setSimplifiedData({
        overview: mat.simplified_text,
        takeaways: mat.key_takeaways || [],
        analogy: "Think of this topic like nature's building blocks working seamlessly in balance.",
        dyslexia_summary: "Short points. Clear facts. Easy to remember."
      });
    } else {
      simplifyContent(mat.original_text);
    }
  };

  const simplifyContent = async (text) => {
    setIsProcessing(true);
    try {
      const res = await api.simplifyContent(text, ageGroup, preferences?.preferred_language || 'en');
      if (res.success && res.simplified) {
        setSimplifiedData(res.simplified);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Custom Quiz on ANY Topic
  const handleGenerateCustomQuiz = async (e) => {
    if (e) e.preventDefault();
    if (!topicName.trim()) return;

    setIsProcessing(true);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setRecommendations(null);

    try {
      const res = await api.generateQuiz(
        topicName.trim(),
        difficulty,
        numQuestions,
        ageGroup
      );

      if (res.success && res.questions) {
        setQuizQuestions(res.questions);
        setQuizId(res.quiz_id);
        tts.speak(`Generated ${res.questions.length} ${difficulty} questions for ${topicName}. Good luck!`, preferences?.preferred_language);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectAnswer = (qIdx, optIdx) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = async () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);
    setIsProcessing(true);

    try {
      const resp = await api.submitQuiz({
        quiz_id: quizId || 1,
        subject: topicName,
        difficulty: difficulty,
        score: score,
        total: quizQuestions.length,
        user_answers: selectedAnswers
      });

      if (resp.success && resp.recommendations) {
        setRecommendations(resp.recommendations);
        tts.speak(
          `Quiz submitted! Your score is ${score} out of ${quizQuestions.length}. ${resp.recommendations.encouragement}`,
          preferences?.preferred_language
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryQuiz = () => {
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setRecommendations(null);
    tts.speak("Retrying quiz. Select your answers once more.", preferences?.preferred_language);
  };

  const readSimplifiedAloud = () => {
    if (!simplifiedData) return;
    const textToSpeak = `${simplifiedData.overview}. Key Takeaways: ${simplifiedData.takeaways.join('. ')}. Analogy: ${simplifiedData.analogy}`;
    tts.speak(textToSpeak, preferences?.preferred_language, () => setIsSpeaking(true), () => setIsSpeaking(false));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Adaptive EdTech Engine</span>
            <span>•</span>
            <span>Gemini AI Quizzes</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Adaptive Learning & Dynamic AI Quizzing
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter ANY subject or topic, choose difficulty (Easy, Medium, Hard), and Gemini generates interactive quizzes with automatic evaluation and permanent SQLite progress tracking.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('analytics')}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition self-start sm:self-auto"
        >
          <Award className="w-4 h-4" />
          <span>View Subject Analytics</span>
        </button>
      </div>

      {/* Dynamic Quiz Generator Configuration Form */}
      <form onSubmit={handleGenerateCustomQuiz} className="bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Generate Quiz for ANY Subject or Topic
            </h2>
          </div>
          <span className="text-xs text-indigo-600 font-semibold">Gemini 2.5 Flash + SQLite</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Topic Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Subject or Topic Name:
            </label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g. Physics, World History, Python, Biology"
              required
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Difficulty Level */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Difficulty Level:
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold cursor-pointer"
            >
              <option value="Easy">🟢 Easy (Fundamentals)</option>
              <option value="Medium">🟡 Medium (Intermediate)</option>
              <option value="Hard">🔴 Hard (Advanced Rigor)</option>
            </select>
          </div>

          {/* Number of Questions */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Number of Questions:
            </label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold cursor-pointer"
            >
              <option value="3">3 Questions (Quick Sprint)</option>
              <option value="5">5 Questions (Standard Test)</option>
              <option value="8">8 Questions (Comprehensive)</option>
              <option value="10">10 Questions (Mastery Exam)</option>
            </select>
          </div>

          {/* Learner Age Profile */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Learner Profile:
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold cursor-pointer"
            >
              <option value="children">Children (5–12)</option>
              <option value="teenagers">Teenagers (13–17)</option>
              <option value="college">College Students (18–25)</option>
              <option value="adults">Adults (26–64)</option>
              <option value="seniors">Seniors (65+)</option>
            </select>
          </div>

        </div>

        <button
          type="submit"
          disabled={isProcessing || !topicName.trim()}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Adaptive Quiz with Gemini AI...</span>
            </>
          ) : (
            <>
              <GraduationCap className="w-4 h-4" />
              <span>Generate Custom Quiz Now</span>
            </>
          )}
        </button>
      </form>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Seed Topics & Study Content */}
        <div className="space-y-4">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Curated Study Lessons</span>
            </h3>

            <div className="space-y-2">
              {materials.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMaterial(m)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                    selectedMaterial?.id === m.id
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 font-bold text-indigo-950 dark:text-indigo-200 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-[10px] uppercase">
                      {m.category}
                    </span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      {m.difficulty}
                    </span>
                  </div>
                  <div className="font-bold text-sm mt-1">{m.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Concept Simplifier View */}
          {simplifiedData && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-indigo-600">
                  Concept Simplifier
                </span>
                <button
                  onClick={readSimplifiedAloud}
                  className="text-xs text-indigo-600 hover:underline flex items-center space-x-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Read Aloud</span>
                </button>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {simplifiedData.overview}
              </p>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-[11px] text-amber-900 dark:text-amber-200">
                <strong>Analogy:</strong> {simplifiedData.analogy}
              </div>
            </div>
          )}

        </div>

        {/* Right 2 Columns: Interactive Quiz Component */}
        <div className="lg:col-span-2 space-y-6">
          
          {quizQuestions.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    <span>{topicName} Quiz</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Difficulty: <span className="font-bold text-indigo-600">{difficulty}</span> • {quizQuestions.length} Questions • Adapted for {ageGroup}
                  </p>
                </div>

                <div className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full">
                  {Object.keys(selectedAnswers).length} of {quizQuestions.length} Answered
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {quizQuestions.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-start space-x-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <span className="leading-snug">{q.question}</span>
                    </h4>

                    {/* 4 Multiple-Choice Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[qIdx] === optIdx;
                        const isCorrect = q.correctIndex === optIdx;
                        let optionStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 text-slate-800 dark:text-slate-200';

                        if (quizSubmitted) {
                          if (isCorrect) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200 font-bold';
                          }
                        } else if (isSelected) {
                          optionStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectAnswer(qIdx, optIdx)}
                            disabled={quizSubmitted}
                            className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${optionStyle}`}
                          >
                            <span className="leading-relaxed">{opt}</span>
                            {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-1 flex-shrink-0" />}
                            {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600 ml-1 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanations after submission */}
                    {quizSubmitted && q.explanation && (
                      <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit or Score Summary */}
              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition"
                >
                  Submit Answers & Save Results in SQLite
                </button>
              ) : (
                <div className="p-6 bg-gradient-to-tr from-indigo-50 via-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 border-2 border-indigo-200 dark:border-indigo-900 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Quiz Completed & Stored in SQLite
                      </span>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                        Score: {quizScore} / {quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                      </h4>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-indigo-600 text-white rounded-full">
                      Level: {recommendations?.performance_level || 'Evaluated'}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    "{recommendations?.encouragement}"
                  </p>

                  {recommendations?.suggested_actions && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        Recommended Next Steps:
                      </span>
                      {recommendations.suggested_actions.map((act, i) => (
                        <div key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 flex flex-wrap gap-3">
                    <button
                      onClick={handleRetryQuiz}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry This Quiz</span>
                    </button>
                    <button
                      onClick={() => handleGenerateCustomQuiz()}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs rounded-xl flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate New Questions</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
                    >
                      <span>View Academic Analytics</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 mx-auto flex items-center justify-center">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                Ready to Test Your Knowledge?
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Enter any subject above and press "Generate Custom Quiz Now". Questions will appear here with 4 options and automatic scoring.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
