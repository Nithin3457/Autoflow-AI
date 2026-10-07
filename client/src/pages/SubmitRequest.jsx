import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RequestForm from '../components/RequestForm';
import { CheckCircle2, Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';

export default function SubmitRequest() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const handleFormSubmit = async ({ rawText, attachmentUrl }) => {
    setIsSubmitting(true);
    setSubmissionSuccess(null);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          rawText,
          requesterId: currentUser.id
        })
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to submit request to AI Orchestrator');
      }

      const createdRequest = await response.json();
      setSubmissionSuccess(createdRequest);

      // Short delay for visual polish then navigate to detailed workflow view
      setTimeout(() => {
        navigate(`/requests/${createdRequest.id}`);
      }, 1200);
    } catch (err) {
      alert(`Error submitting request: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Success Banner */}
      {submissionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 flex items-center justify-between shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                Autonomous Workflow Successfully Generated!
              </p>
              <p className="text-xs text-emerald-300">
                Categorized as <span className="font-bold">{submissionSuccess.category}</span> with {submissionSuccess.tasks?.length || 0} sequential tasks. Redirecting to timeline...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main AI Input Form */}
      <RequestForm
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* How It Works Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            1. Intent & Entity Extraction
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Gemini 2.5 Flash analyzes unstructured prose, identifies broken hardware, requested software, dates, and locations.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            2. Multi-Step DAG Task Graph
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generates strict sequential steps, assigning approvals to managers and implementation to specialized technicians.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            3. Dynamic SLA & Auto-Resolve
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            SLA deadlines calculated per step. Completing the final milestone automatically resolves the request.
          </p>
        </div>
      </div>
    </div>
  );
}
