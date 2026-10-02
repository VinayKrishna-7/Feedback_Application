import React from 'react';

export default function Loading({ message = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center" role="status" aria-live="polite">
      <div className="relative w-12 h-12 mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-800 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-sky-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
