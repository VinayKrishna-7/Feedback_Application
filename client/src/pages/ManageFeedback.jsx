import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDashboard, deleteFeedback, updateFormTitle, getErrorMessage } from '../services/api';
import FeedbackCard from '../components/FeedbackCard';
import CopyButton from '../components/CopyButton';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function ManageFeedback() {
  const { adminToken } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);
  const [titleError, setTitleError] = useState('');

  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const loadDashboard = useCallback(
    async (showFullLoading = true) => {
      try {
        if (showFullLoading) setLoading(true);
        else setIsRefreshing(true);
        setError(null);

        const res = await getDashboard(adminToken);
        setData(res);
        setLastRefreshed(new Date());
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Management page not found. Check that you are using the correct private link.');
        } else {
          setError(getErrorMessage(err));
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [adminToken]
  );

  // Initial load
  useEffect(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  // Auto-refresh interval (every 5 seconds when autoRefresh is active)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadDashboard(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadDashboard]);

  async function handleSaveTitle(e) {
    e.preventDefault();
    const trimmed = editedTitle.trim();
    if (!trimmed) {
      setTitleError('Title cannot be empty');
      return;
    }
    if (trimmed.length > 200) {
      setTitleError('Title cannot exceed 200 characters');
      return;
    }

    try {
      setSavingTitle(true);
      setTitleError('');
      await updateFormTitle(adminToken, trimmed);
      setData((prev) => (prev ? { ...prev, form: { ...prev.form, title: trimmed } } : prev));
      setIsEditingTitle(false);
    } catch (err) {
      setTitleError(getErrorMessage(err));
    } finally {
      setSavingTitle(false);
    }
  }

  async function handleDeleteFeedback(feedbackId) {
    try {
      setDeletingId(feedbackId);
      await deleteFeedback(adminToken, feedbackId);

      // Optimistically update state
      setData((prev) => {
        if (!prev) return prev;
        const target = prev.feedback.find((f) => f.id === feedbackId);
        const newFeedback = prev.feedback.filter((f) => f.id !== feedbackId);

        const newStats = {
          total: Math.max(0, prev.stats.total - 1),
          positive:
            target?.category === 'positive'
              ? Math.max(0, prev.stats.positive - 1)
              : prev.stats.positive,
          improvement:
            target?.category === 'improvement'
              ? Math.max(0, prev.stats.improvement - 1)
              : prev.stats.improvement,
          general:
            target?.category === 'general'
              ? Math.max(0, prev.stats.general - 1)
              : prev.stats.general,
          uncategorized:
            !target?.category
              ? Math.max(0, (prev.stats.uncategorized || 0) - 1)
              : prev.stats.uncategorized || 0,
        };

        return {
          ...prev,
          stats: newStats,
          feedback: newFeedback,
        };
      });
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  function handleExportCSV() {
    if (!data || !data.feedback.length) return;
    const headers = ['ID', 'Category', 'Date', 'Message'];
    const rows = data.feedback.map((f) => [
      f.id,
      f.category || 'uncategorized',
      new Date(f.createdAt).toISOString(),
      `"${f.message.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const safeTitle = (data.form.title || 'feedback').toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.setAttribute('download', `${safeTitle}_feedback.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <ErrorMessage
          title="Management page not found"
          message={error}
          actionText="Try Again"
          onAction={() => loadDashboard(true)}
          homeLink={true}
        />
      </div>
    );
  }

  if (!data) return null;

  const { form, stats, feedback } = data;
  const publicUrl = `${window.location.origin}/f/${form.publicToken}`;

  // Filter feedback by category and search query
  const filteredFeedback = feedback.filter((item) => {
    const matchesCategory =
      activeCategoryFilter === 'all'
        ? true
        : activeCategoryFilter === 'uncategorized'
        ? !item.category
        : item.category === activeCategoryFilter;

    const matchesSearch = searchQuery.trim()
      ? item.message.toLowerCase().includes(searchQuery.trim().toLowerCase())
      : true;

    return matchesCategory && matchesSearch;
  });

  const totalResponses = stats.total || 0;
  const posPct = totalResponses > 0 ? Math.round((stats.positive / totalResponses) * 100) : 0;
  const impPct = totalResponses > 0 ? Math.round((stats.improvement / totalResponses) * 100) : 0;
  const genPct = totalResponses > 0 ? Math.round((stats.general / totalResponses) * 100) : 0;
  const uncatPct =
    totalResponses > 0 && stats.uncategorized
      ? Math.round((stats.uncategorized / totalResponses) * 100)
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8 relative overflow-hidden transition-all duration-200">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Secret Management URL
              </span>
              {isRefreshing && (
                <span className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full font-medium">
                  <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Syncing...
                </span>
              )}
            </div>

            {isEditingTitle ? (
              <form onSubmit={handleSaveTitle} className="mt-2 space-y-2 max-w-lg">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  maxLength={200}
                  className="w-full px-3 py-2 border border-sky-400 dark:border-sky-600 rounded-xl text-lg font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  autoFocus
                />
                {titleError && <p className="text-xs text-rose-600 dark:text-rose-400">{titleError}</p>}
                <div className="flex items-center gap-2">
                  <Button type="submit" size="sm" loading={savingTitle} className="font-semibold">
                    Save Title
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setIsEditingTitle(false);
                      setTitleError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-baseline gap-2.5 group flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {form.title}
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setEditedTitle(form.title);
                    setIsEditingTitle(true);
                  }}
                  className="text-xs text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 font-semibold inline-flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Rename feedback page"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Rename
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              <span>
                {totalResponses} {totalResponses === 1 ? 'response' : 'responses'} received
              </span>
              <span>&bull;</span>
              <span>Last checked {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all flex items-center gap-1.5 shadow-sm ${
                  autoRefresh
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
                title="Toggle real-time auto updates"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                Live Sync: {autoRefresh ? 'ON' : 'OFF'}
              </button>

              <button
                type="button"
                onClick={() => loadDashboard(false)}
                disabled={isRefreshing}
                className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition-all inline-flex items-center gap-1.5 active:scale-95"
                title="Refresh responses now"
              >
                <svg className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>

              {feedback.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition-all inline-flex items-center gap-1.5 active:scale-95"
                  title="Export responses as CSV"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
              )}
            </div>

            {/* Public Link Share Pill */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate max-w-xs px-2 select-all hidden sm:inline">
                {publicUrl}
              </span>
              <CopyButton
                textToCopy={publicUrl}
                label="Copy Link"
                copiedLabel="✓ Copied"
                size="sm"
                variant="primary"
              />
              <a
                href={`/f/${form.publicToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-semibold px-2 py-1 text-center hover:underline"
              >
                Open Form &nearr;
              </a>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Response Overview
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 transition-all hover:border-slate-300 dark:hover:border-slate-600">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Total Submissions</span>
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.total}</span>
            </div>

            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 transition-all hover:border-emerald-300">
              <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 block mb-1">👍 Positive</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{stats.positive}</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">({posPct}%)</span>
              </div>
            </div>

            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 rounded-2xl p-4 transition-all hover:border-amber-300">
              <span className="text-xs font-medium text-amber-800 dark:text-amber-300 block mb-1">💡 Improvement</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-700 dark:text-amber-400">{stats.improvement}</span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">({impPct}%)</span>
              </div>
            </div>

            <div className="bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/80 rounded-2xl p-4 transition-all hover:border-sky-300">
              <span className="text-xs font-medium text-sky-800 dark:text-sky-300 block mb-1">💬 General</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-sky-700 dark:text-sky-400">{stats.general}</span>
                <span className="text-xs text-sky-600 dark:text-sky-400 font-bold">({genPct}%)</span>
              </div>
            </div>
          </div>

          {/* Distribution Bars */}
          {totalResponses > 0 && (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Category Distribution
              </span>

              {/* Positive Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Positive
                  </span>
                  <span>{stats.positive} ({posPct}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${posPct}%` }}
                  />
                </div>
              </div>

              {/* Improvement Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Improvement
                  </span>
                  <span>{stats.improvement} ({impPct}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${impPct}%` }}
                  />
                </div>
              </div>

              {/* General Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    General
                  </span>
                  <span>{stats.general} ({genPct}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${genPct}%` }}
                  />
                </div>
              </div>

              {/* Uncategorized Bar */}
              {stats.uncategorized > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      Uncategorized
                    </span>
                    <span>{stats.uncategorized} ({uncatPct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-slate-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${uncatPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feedback List Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Responses
            </h2>
            <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2.5 py-0.5 rounded-full">
              {filteredFeedback.length}
            </span>
          </div>

          {/* Search + Filter Controls */}
          {feedback.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in feedback..."
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Pills */}
              <div className="inline-flex flex-wrap rounded-xl bg-slate-200/80 dark:bg-slate-800 p-1 text-xs font-semibold">
                {[
                  { id: 'all', label: `All (${feedback.length})` },
                  { id: 'positive', label: `Positive (${stats.positive})` },
                  { id: 'improvement', label: `Improve (${stats.improvement})` },
                  { id: 'general', label: `General (${stats.general})` },
                  ...(stats.uncategorized > 0
                    ? [{ id: 'uncategorized', label: `Other (${stats.uncategorized})` }]
                    : []),
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setActiveCategoryFilter(pill.id)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeCategoryFilter === pill.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {feedback.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-4 border border-sky-100 dark:border-sky-800 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No responses yet</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Share your public feedback link with anyone to start collecting honest responses.
            </p>
            <div className="flex justify-center">
              <CopyButton
                textToCopy={publicUrl}
                label="Copy Feedback Link"
                copiedLabel="✓ Feedback Link Copied"
                size="md"
                variant="primary"
              />
            </div>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No responses match your search or filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedback.map((item) => (
              <FeedbackCard
                key={item.id}
                feedback={item}
                onDelete={handleDeleteFeedback}
                isDeleting={deletingId === item.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
