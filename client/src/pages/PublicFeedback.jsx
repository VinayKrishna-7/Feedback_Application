import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicForm, submitFeedback, getErrorMessage } from '../services/api';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function PublicFeedback() {
  const { publicToken } = useParams();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadForm() {
      try {
        setLoading(true);
        setFetchError(null);
        const data = await getPublicForm(publicToken);
        if (isMounted) {
          setForm(data);
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(
            err.response?.status === 404
              ? 'Feedback page not found. This link may be invalid or no longer available.'
              : getErrorMessage(err)
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadForm();
    return () => {
      isMounted = false;
    };
  }, [publicToken]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setSubmitError('Please enter your feedback message.');
      return;
    }

    if (trimmedMessage.length < 3) {
      setSubmitError('Feedback message must be at least 3 characters long.');
      return;
    }

    if (trimmedMessage.length > 2000) {
      setSubmitError('Feedback message cannot exceed 2000 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');
      await submitFeedback(publicToken, {
        message: trimmedMessage,
        category: category || null
      });

      // Clear the form after submission
      setMessage('');
      setCategory('');
      setSubmitted(true);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <Loading fullScreen message="Loading feedback page..." />;
  }

  if (fetchError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <ErrorMessage
          title="Feedback page not found"
          message={fetchError}
          homeLink={true}
        />
      </div>
    );
  }

  const charPercentage = Math.min(100, Math.round((message.length / 2000) * 100));

  return (
    <div className="max-w-lg mx-auto px-4 py-10 md:py-16">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden transition-all">
        {submitted ? (
          /* Submission Success State */
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
              ✓ Feedback sent anonymously!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
              Your message was delivered directly to the creator. No sender identity was stored.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSubmitted(false)}
                className="font-semibold"
              >
                Send more feedback
              </Button>
              <Link to="/">
                <Button variant="outline" size="md" className="font-semibold">
                  Create your own page &rarr;
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Feedback Form */
          <div>
            {/* Header info */}
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Feedback for:
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1 mb-2.5">
                {form?.title}
              </h1>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-sm">
                <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Your feedback is anonymous</span>
              </div>
            </div>

            {submitError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="feedback-message"
                    className="block text-sm font-bold text-slate-800 dark:text-slate-200"
                  >
                    Your Feedback <span className="text-rose-500">*</span>
                  </label>
                  <span
                    className={`text-xs ${
                      message.length > 2000 ? 'text-rose-600 font-bold' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {message.length}/2000
                  </span>
                </div>

                <textarea
                  id="feedback-message"
                  name="message"
                  rows={5}
                  required
                  minLength={3}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (submitError) setSubmitError('');
                  }}
                  placeholder="Share what went well, what could be improved, or any candid thoughts..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm leading-relaxed transition-all resize-y min-h-[120px] shadow-sm"
                />

                {/* Progress bar gauge */}
                {message.length > 0 && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
                    <div
                      className={`h-1 transition-all ${
                        charPercentage > 90 ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${charPercentage}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Category selection */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Category <span className="text-slate-400 font-normal text-xs">(optional)</span>
                </label>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label="Feedback category selection">
                  {[
                    {
                      id: 'positive',
                      label: 'Positive',
                      icon: '👍',
                      selectedClass: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20 shadow-sm',
                      unselectedClass: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                    },
                    {
                      id: 'improvement',
                      label: 'Improvement',
                      icon: '💡',
                      selectedClass: 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold ring-2 ring-amber-500/20 shadow-sm',
                      unselectedClass: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                    },
                    {
                      id: 'general',
                      label: 'General',
                      icon: '💬',
                      selectedClass: 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-bold ring-2 ring-sky-500/20 shadow-sm',
                      unselectedClass: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                    },
                  ].map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(isSelected ? '' : cat.id)}
                        aria-pressed={isSelected}
                        className={`py-2.5 px-3 text-center rounded-xl border text-xs transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 active:scale-95 ${
                          isSelected ? cat.selectedClass : cat.unselectedClass
                        }`}
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <span>{cat.icon}</span>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                loading={submitting}
                disabled={submitting || message.trim().length < 3}
                size="lg"
                className="w-full font-bold shadow-md shadow-sky-600/20"
              >
                Send Feedback &rarr;
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                Feedback is anonymous within this application. The app does not ask for or store your identity.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
