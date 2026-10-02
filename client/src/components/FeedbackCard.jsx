import React, { useState } from 'react';

function formatRelativeTime(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 30) return `${diffInDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'recently';
  }
}

export default function FeedbackCard({ feedback, onDelete, isDeleting = false }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const categoryConfig = {
    positive: {
      label: 'Positive',
      icon: '👍',
      badgeClass:
        'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    improvement: {
      label: 'Improvement',
      icon: '💡',
      badgeClass:
        'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    general: {
      label: 'General',
      icon: '💬',
      badgeClass:
        'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    },
  };

  const categoryMeta = feedback.category ? categoryConfig[feedback.category] : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {categoryMeta ? (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryMeta.badgeClass}`}
            >
              <span className="text-[11px]">{categoryMeta.icon}</span>
              {categoryMeta.label}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
              Uncategorized
            </span>
          )}

          <time
            dateTime={feedback.createdAt}
            className="text-xs text-slate-400 dark:text-slate-500 font-medium"
            title={new Date(feedback.createdAt).toLocaleString()}
          >
            {formatRelativeTime(feedback.createdAt)}
          </time>
        </div>

        <p className="text-slate-800 dark:text-slate-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
          "{feedback.message}"
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
        {confirmDelete ? (
          <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl p-2 text-xs">
            <span className="text-rose-700 dark:text-rose-300 font-semibold mr-1">Delete feedback?</span>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(feedback.id)}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete this feedback"
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium inline-flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
