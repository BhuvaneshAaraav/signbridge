import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertTriangle, 
  BookOpen, 
  RotateCcw, 
  CheckCircle2, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AcademicPerformanceAnalytics({ setActiveTab }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await api.getAcademicAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching academic analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e1b4b',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `Average: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`
        },
        grid: { color: 'rgba(203, 213, 225, 0.4)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e1b4b',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (value) => `${value}%` },
        grid: { color: 'rgba(203, 213, 225, 0.4)' }
      },
      x: { grid: { display: false } }
    }
  };

  const defaultBarChart = {
    labels: ['Science', 'Mathematics', 'Computer Science', 'History'],
    datasets: [{
      label: 'Average Score (%)',
      data: [80, 70, 95, 75],
      backgroundColor: 'rgba(99, 102, 241, 0.85)',
      borderRadius: 8
    }]
  };

  const defaultLineChart = {
    labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4'],
    datasets: [{
      label: 'Score (%)',
      data: [65, 80, 75, 90],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      tension: 0.35,
      fill: true,
      pointBackgroundColor: '#4f46e5',
      pointRadius: 6
    }]
  };

  const barData = analytics?.bar_chart_data || defaultBarChart;
  const lineData = analytics?.timeline_chart_data || defaultLineChart;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Section 6</span>
            <span>•</span>
            <span>Academic Performance & Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Academic Performance & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Subject-wise score comparison, highest and lowest scoring disciplines, historical progress curves, and targeted revision roadmaps.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('learning')}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Take New Subject Quiz</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Overall Average */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Overall Average</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {analytics?.overall_average || 78.5}%
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold flex items-center mt-1">
            Across {analytics?.total_attempts || 0} total attempts
          </span>
        </div>

        {/* Highest Subject */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Top Discipline</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-2 truncate">
            {analytics?.highest_subject?.name || 'Computer Science'}
          </div>
          <span className="text-[11px] text-slate-500 font-semibold flex items-center mt-1">
            Average Score: {analytics?.highest_subject?.score || 95}%
          </span>
        </div>

        {/* Lowest Subject */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Needs Revision</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-2 truncate">
            {analytics?.lowest_subject?.name || 'Mathematics'}
          </div>
          <span className="text-[11px] text-slate-500 font-semibold flex items-center mt-1">
            Average Score: {analytics?.lowest_subject?.score || 65}%
          </span>
        </div>

        {/* Weak Topics Flagged */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Weak Topics Count</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {analytics?.weak_topics?.length || 1}
          </div>
          <span className="text-[11px] text-rose-600 font-semibold flex items-center mt-1">
            Targeted for immediate review
          </span>
        </div>

      </div>

      {/* Two Comparative Charts: Bar Chart (Subjects) & Line Chart (Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subject-Wise Comparative Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Subject-Wise Marks Comparison (Bar Chart)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Score per Subject</span>
          </div>

          <div className="h-64 w-full">
            <Bar data={barData} options={barChartOptions} />
          </div>
        </div>

        {/* Progress Over Time Line Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Overall Progress Over Time (Timeline Chart)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Comprehension Curve</span>
          </div>

          <div className="h-64 w-full">
            <Line data={lineData} options={lineChartOptions} />
          </div>
        </div>

      </div>

      {/* Subject Performance Breakdown Table with Trend (Improvement/Decline) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Subject Mastery Breakdown & Trend Analysis
            </h3>
          </div>
          <span className="text-xs text-slate-400">Retrieved from SQLite</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3">Subject</th>
                <th className="p-3">Quizzes Taken</th>
                <th className="p-3">Average Score</th>
                <th className="p-3">Latest Score</th>
                <th className="p-3">Trend vs Previous</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {analytics?.subject_stats && analytics.subject_stats.length > 0 ? (
                analytics.subject_stats.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{s.subject}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{s.attempts} attempts</td>
                    <td className="p-3 font-bold text-indigo-600">{s.average}%</td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{s.latest}%</td>
                    <td className="p-3">
                      {s.trend === 'improved' && (
                        <span className="text-emerald-600 font-bold flex items-center space-x-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+{s.change}%</span>
                        </span>
                      )}
                      {s.trend === 'declined' && (
                        <span className="text-rose-600 font-bold flex items-center space-x-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>{s.change}%</span>
                        </span>
                      )}
                      {s.trend === 'steady' && (
                        <span className="text-slate-400 font-semibold">Steady</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        s.average >= 80 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                          : (s.average >= 70 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300')
                      }`}>
                        {s.average >= 80 ? 'Mastery' : (s.average >= 70 ? 'Proficient' : 'Needs Review')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    No subject records in SQLite yet. Complete quizzes to populate marks comparison!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revision Recommendations Card */}
      {analytics?.revision_recommendations && analytics.revision_recommendations.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-900 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-amber-900 dark:text-amber-200">
              Personalized Revision Recommendations
            </h3>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Based on your quiz performance history in SQLite, the following topics are flagged for targeted reinforcement:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {analytics.revision_recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-1">
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Subject: {rec.subject}</span>
                  <span className="text-[10px] text-amber-600 font-semibold">Priority</span>
                </div>
                <p className="text-xs text-slate-500">{rec.reason}</p>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1 pt-1">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{rec.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Attempts History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Permanent Quiz Attempts Log (SQLite)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3">Subject</th>
                <th className="p-3">Difficulty</th>
                <th className="p-3">Score</th>
                <th className="p-3">Percentage</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {analytics?.attempts_history && analytics.attempts_history.length > 0 ? (
                analytics.attempts_history.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{a.subject}</td>
                    <td className="p-3 font-medium text-slate-600 dark:text-slate-300">{a.difficulty}</td>
                    <td className="p-3 font-semibold text-indigo-600">{a.score} / {a.total}</td>
                    <td className="p-3 font-bold">{a.percentage}%</td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">{a.completed_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-400">
                    No attempts logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
