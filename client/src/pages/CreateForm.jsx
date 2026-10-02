import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createForm, getErrorMessage } from '../services/api';
import Button from '../components/Button';
import CopyButton from '../components/CopyButton';

export default function CreateForm() {
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdData, setCreatedData] = useState(null);

  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      setTitle(topicParam);
    }
  }, [searchParams]);

  const quickSuggestions = [
    'My Presentation Feedback',
    'UI/UX Design Critique',
    'Code & Architecture Review',
    'Team Retrospective',
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Please provide a title for what you want feedback about.');
      return;
    }

    if (trimmedTitle.length > 200) {
      setError('Title cannot exceed 200 characters.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await createForm(trimmedTitle);
      setCreatedData(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // After form is created successfully
  if (createdData) {
    const origin = window.location.origin;
    const publicUrl = `${origin}/f/${createdData.publicToken}`;
    const manageUrl = `${origin}/manage/${createdData.adminToken}`;

    return (
      <div className="max-w-xl mx-auto px-4 py-8 md:py-14">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-200/60 dark:shadow-none relative overflow-hidden transition-colors">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20 shadow-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
              Your feedback page is ready!
            </h1>
            <div className="inline-block max-w-full px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
              "{createdData.title}"
            </div>
          </div>

          <div className="space-y-5">
            {/* Public Link Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/25 border border-sky-200/70 dark:border-sky-900/40 transition-colors">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-300">
                    Public Feedback Link
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/60 px-2.5 py-0.5 rounded-md">
                  Share with anyone
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-950 p-2 pl-3 rounded-xl border border-sky-200/80 dark:border-sky-900/60 shadow-sm mb-3">
                <svg className="w-4 h-4 text-sky-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="w-full text-xs font-mono bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none select-all truncate"
                  aria-label="Public Feedback Link"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <CopyButton
                  textToCopy={publicUrl}
                  label="Copy Public Link"
                  copiedLabel="Link Copied"
                  size="sm"
                  variant="primary"
                />
                <a
                  href={`/f/${createdData.publicToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-semibold inline-flex items-center gap-1.5 hover:underline py-1"
                >
                  <span>Open in new tab</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Private Management Link Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-900/40 transition-colors">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    Private Management Link
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-md">
                  Secret URL
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-950 p-2 pl-3 rounded-xl border border-amber-200/80 dark:border-amber-900/60 shadow-sm mb-3">
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <input
                  type="text"
                  readOnly
                  value={manageUrl}
                  className="w-full text-xs font-mono bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none select-all truncate"
                  aria-label="Private Management Link"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <CopyButton
                  textToCopy={manageUrl}
                  label="Copy Secret Link"
                  copiedLabel="Secret Copied"
                  size="sm"
                  variant="secondary"
                />
                <Link
                  to={`/manage/${createdData.adminToken}`}
                  className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-semibold inline-flex items-center gap-1.5 hover:underline py-1"
                >
                  <span>Dashboard</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Important Notice Callout */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 border border-amber-500/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Save your secret link now
                </p>
                <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                  Bookmark or copy the management URL. Since this app collects zero personal data and has no passwords, this secret URL is the only key to view responses.
                </p>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setCreatedData(null);
                  setTitle('');
                }}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-semibold transition-colors flex items-center gap-1.5 py-2 px-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create another topic</span>
              </button>

              <Link to={`/manage/${createdData.adminToken}`}>
                <Button size="md" className="font-semibold shadow-md shadow-sky-600/20 inline-flex items-center gap-2">
                  <span>Open Dashboard</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create form view
  return (
    <div className="max-w-lg mx-auto px-4 py-12 md:py-20">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
          Create your feedback page
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          Set up a private space to collect candid feedback without creating an account.
        </p>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="form-title" className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                What would you like feedback about? <span className="text-rose-500">*</span>
              </label>
              <span className={`text-xs ${title.length > 200 ? 'text-rose-600 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                {title.length}/200
              </span>
            </div>

            <input
              id="form-title"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. My presentation, Project design proposal, Team retrospective"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all shadow-sm"
              autoFocus
            />

            {/* Quick suggestion chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {quickSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setTitle(sug);
                    if (error) setError('');
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={loading || !title.trim()}
            size="lg"
            className="w-full font-bold shadow-md shadow-sky-600/20"
          >
            Create Feedback Page &rarr;
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 gap-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Instantly ready with both public and secret management links.</span>
        </div>
      </div>
    </div>
  );
}
