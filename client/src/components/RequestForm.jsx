import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Paperclip, Send, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const SAMPLE_PROMPTS = [
  {
    title: 'Hardware Procurement',
    text: 'I need a new Macbook Pro M3 for my design work because my old one is broken, I need it by next Tuesday',
    tag: 'PROCUREMENT'
  },
  {
    title: 'Facility Emergency',
    text: 'The primary laser printer on the 3rd floor marketing department is jammed, leaking black toner all over the floor, and showing error code E-402.',
    tag: 'MAINTENANCE'
  },
  {
    title: 'VPN Connectivity',
    text: 'Our core production VPN gateway is intermittently rejecting client certificates for the design team, preventing remote access to creative cloud storage.',
    tag: 'IT_SUPPORT'
  },
  {
    title: 'Urgent Leave',
    text: 'Need urgent 2-day medical leave approval for next Thursday and Friday due to minor surgery and recovery.',
    tag: 'HR_LEAVE'
  }
];

export default function RequestForm({ onSubmit, isSubmitting }) {
  const { currentUser } = useAuth();
  const [rawText, setRawText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [showAttachment, setShowAttachment] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState('');

  const loadingSteps = [
    'Analyzing intent & semantic entities...',
    'Generating multi-step workflow logic...',
    'Assigning role responsibilities & SLA deadlines...'
  ];

  // Animated progress step simulator during submission
  React.useEffect(() => {
    let interval;
    if (isSubmitting) {
      setCurrentStepIndex(0);
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1100);
    } else {
      setCurrentStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rawText.trim().length < 10) {
      setError('Please provide at least 10 characters describing the issue.');
      return;
    }
    setError('');
    onSubmit({
      rawText: rawText.trim(),
      attachmentUrl: attachmentUrl.trim() || undefined
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            AI-Powered Orchestrator
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Describe Your Request or Issue
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Write in plain language. AutoFlow AI parses intent, assigns specialists, and automates approvals.
          </p>
        </div>

        <div className="text-right hidden sm:block text-xs text-slate-400">
          Submitting as <span className="text-slate-200 font-semibold">{currentUser.full_name}</span> ({currentUser.department})
        </div>
      </div>

      {/* Preset Starters */}
      <div className="my-5">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Or try a sample request:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setRawText(sample.text);
                setError('');
              }}
              className="text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 transition-all text-xs group"
            >
              <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-indigo-400 mb-1">
                <span>{sample.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                  {sample.tag}
                </span>
              </div>
              <p className="text-slate-400 line-clamp-2 leading-relaxed">
                "{sample.text}"
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rawText" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Unstructured Problem / Request Description
          </label>
          <div className="relative">
            <textarea
              id="rawText"
              rows={5}
              disabled={isSubmitting}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., The printer in accounting is broken and making grinding noises. We need it fixed before tomorrow morning's audit..."
              className="w-full rounded-2xl bg-slate-900/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-100 placeholder-slate-500 p-4 text-sm resize-none transition-all shadow-inner disabled:opacity-60"
            />
            <div className="absolute right-3 bottom-3 text-[11px] text-slate-500 font-mono">
              {rawText.length} chars
            </div>
          </div>
          {error && (
            <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
        </div>

        {/* Attachment Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAttachment(!showAttachment)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 font-medium transition-colors"
          >
            <Paperclip className="w-3.5 h-3.5" />
            {showAttachment ? 'Remove attachment' : 'Attach document or screenshot URL (Optional)'}
          </button>

          {showAttachment && (
            <div className="mt-2 animate-in fade-in duration-200">
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://cloud.storage.com/receipt-or-photo.png"
                className="w-full rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-indigo-500 text-slate-100 placeholder-slate-500 px-3.5 py-2 text-xs"
              />
            </div>
          )}
        </div>

        {/* Dynamic Loading State Indicator */}
        {isSubmitting && (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 shadow-lg space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                Orchestrating Autonomous Workflow
              </span>
              <span>Step {currentStepIndex + 1} of 3</span>
            </div>

            <div className="space-y-1.5">
              {loadingSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-xs transition-colors ${
                    idx === currentStepIndex
                      ? 'text-white font-medium'
                      : idx < currentStepIndex
                      ? 'text-emerald-400'
                      : 'text-slate-600'
                  }`}
                >
                  {idx < currentStepIndex ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : idx === currentStepIndex ? (
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                  )}
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting || rawText.trim().length === 0}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Orchestrating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Submit to AI Orchestrator</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
