import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

export default function Home() {
  const navigate = useNavigate();
  const [activePreviewTab, setActivePreviewTab] = useState('submission');

  const popularTopics = [
    { label: '🎤 Presentation Feedback', query: 'My Presentation Feedback' },
    { label: '🎨 Design Critique', query: 'UI/UX Design Critique' },
    { label: '💻 Code & Architecture', query: 'Code & Architecture Review' },
    { label: '👥 Team Retrospective', query: 'Sprint & Team Retrospective' },
    { label: '🎓 Class & Workshop', query: 'Workshop & Class Feedback' },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-400/10 via-sky-400/5 to-transparent dark:from-sky-500/15 dark:via-sky-500/5 dark:to-transparent pointer-events-none blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50/90 dark:bg-sky-950/70 border border-sky-200/80 dark:border-sky-800/80 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span>100% Anonymous &bull; No Passwords &bull; Dual-Token URLs</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-slate-50 tracking-tight mb-6 leading-[1.1]">
            Honest feedback.{' '}
            <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-500 dark:from-sky-400 dark:via-indigo-300 dark:to-sky-300 bg-clip-text text-transparent">
              Zero accounts.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto font-normal">
            Create an anonymous feedback topic in seconds. Share the public link with anyone, and manage responses securely through your private secret URL.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <Link to="/create" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto font-semibold px-8 py-3.5 text-base shadow-lg shadow-sky-600/25 hover:shadow-sky-600/35 transition-all">
                Create Feedback Page &rarr;
              </Button>
            </Link>
          </div>

          {/* Quick Starter Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mr-1">
              Popular topics:
            </span>
            {popularTopics.map((topic) => (
              <button
                key={topic.label}
                type="button"
                onClick={() => navigate(`/create?topic=${encodeURIComponent(topic.query)}`)}
                className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Interactive Product Preview Card */}
        <div className="max-w-3xl mx-auto mb-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block"></span>
              </div>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 ml-2 hidden sm:inline">
                openfeedback.app
              </span>
            </div>

            {/* Preview switcher tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setActivePreviewTab('submission')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activePreviewTab === 'submission'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Public Page View
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('dashboard')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activePreviewTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Creator Dashboard
              </button>
            </div>
          </div>

          {activePreviewTab === 'submission' ? (
            <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-950/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Feedback for</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Q3 Product Strategy Presentation</h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200/80 dark:border-emerald-800">
                  🔒 Anonymous
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 mb-3">
                "The roadmap breakdown was crystal clear! I would recommend spending slightly more time on competitive benchmarks next time."
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                    ✓ Positive
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Improvement
                  </span>
                </div>
                <span className="text-sky-600 dark:text-sky-400 font-semibold">1-Click Submission &rarr;</span>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-950/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Private Dashboard</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">24 Responses Received</h3>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Auto-Update ON
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/80 dark:border-emerald-800/80">
                  <span className="block text-emerald-800 dark:text-emerald-300 font-medium">Positive</span>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">16 (67%)</span>
                </div>
                <div className="bg-amber-50/80 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/80 dark:border-amber-800/80">
                  <span className="block text-amber-800 dark:text-amber-300 font-medium">Improvement</span>
                  <span className="text-base font-bold text-amber-700 dark:text-amber-300">6 (25%)</span>
                </div>
                <div className="bg-sky-50/80 dark:bg-sky-950/40 p-2 rounded-lg border border-sky-200/80 dark:border-sky-800/80">
                  <span className="block text-sky-800 dark:text-sky-300 font-medium">General</span>
                  <span className="text-base font-bold text-sky-700 dark:text-sky-300">2 (8%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden flex">
                <div className="bg-emerald-500 h-2" style={{ width: '67%' }}></div>
                <div className="bg-amber-500 h-2" style={{ width: '25%' }}></div>
                <div className="bg-sky-500 h-2" style={{ width: '8%' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* 3-Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              1
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Create Topic</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Name your topic in 1-click. No passwords, no phone numbers, and no signup friction.
            </p>
          </div>

          <div className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              2
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Share Public Link</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Distribute your public URL with coworkers, students, or audiences to collect raw, honest responses.
            </p>
          </div>

          <div className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              3
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Manage Privately</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Use your high-entropy secret link to view submissions, analyze categories, and delete entries.
            </p>
          </div>
        </div>

        {/* Privacy & Guarantees Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-100 via-sky-50/50 to-slate-100 dark:from-slate-900/90 dark:via-slate-800/80 dark:to-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-3xl mx-auto text-center shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 uppercase tracking-wide">
            Our Architecture Guarantees
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto mb-6">
            We never store IP addresses, track cookies, or collect names. Feedback submissions are completely untraceable to any personal identity.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
              No Signups
            </div>
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
              No Cookies
            </div>
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
              256-bit Security
            </div>
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
              Instant Deletion
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
