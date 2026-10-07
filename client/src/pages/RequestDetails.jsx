import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/CategoryBadge';
import WorkflowTimeline from '../components/WorkflowTimeline';
import SLAIndicator from '../components/SLAIndicator';
import { PRIORITIES, RISK_LEVELS } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import {
  ArrowLeft,
  Sparkles,
  Layers,
  Clock,
  Shield,
  FileCode,
  CheckCircle2,
  AlertCircle,
  History,
  User,
  RefreshCw,
  Share2
} from 'lucide-react';

export default function RequestDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/requests/${id}`, {
        headers: {
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        }
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to fetch request details');
      }
      const data = await res.json();
      setRequest(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id, currentUser]);

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to update task');
      }

      fetchRequestDetails();
    } catch (err) {
      alert(`Error updating task: ${err.message}`);
    }
  };

  if (loading && !request) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <span>Analyzing Workflow Execution Pipeline...</span>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Request Inaccessible</h3>
        <p className="text-xs text-slate-400">{error || 'Request could not be loaded.'}</p>
        <Link
          to="/requests"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests</span>
        </Link>
      </div>
    );
  }

  const priorityInfo = PRIORITIES[request.priority] || PRIORITIES.MEDIUM;
  const riskInfo = RISK_LEVELS[request.risk_level] || RISK_LEVELS.LOW;
  const entities = request.extracted_entities || {};

  // Check if there is an active bottleneck
  const activeTask = request.tasks?.find(t => t.status === 'IN_PROGRESS');

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/requests"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Requests</span>
        </Link>

        <button
          onClick={fetchRequestDetails}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
          title="Refresh workflow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh Pipeline</span>
        </button>
      </div>

      {/* Main Request Header Panel */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={request.category} />
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${priorityInfo.badge}`}>
                {request.priority} Priority
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${riskInfo.badge}`}>
                {riskInfo.label}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ID: {request.id.slice(0, 8)}
              </span>
            </div>

            <div className="pt-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Original Unstructured Prompt
              </span>
              <p className="text-base sm:text-lg font-medium text-white leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                "{request.raw_text}"
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-end gap-2 flex-shrink-0">
            <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg ${
              request.status === 'RESOLVED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                : 'bg-indigo-950 text-indigo-300 border border-indigo-600 animate-pulse'
            }`}>
              {request.status.replace('_', ' ')}
            </span>
            <span className="text-[11px] text-slate-500">
              Submitted {formatDate(request.created_at)}
            </span>
          </div>
        </div>

        {/* AI Extracted Entities Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Extracted Semantic Entities</span>
            </div>
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 font-mono transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{showRawJson ? 'Hide JSON' : 'Inspect JSON'}</span>
            </button>
          </div>

          {showRawJson ? (
            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto shadow-inner">
              {JSON.stringify(entities, null, 2)}
            </pre>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.keys(entities).length === 0 ? (
                <div className="text-xs text-slate-500 italic col-span-full">
                  No explicit metadata entities extracted.
                </div>
              ) : (
                Object.entries(entities).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-sm"
                  >
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 block truncate" title={String(value)}>
                      {String(value)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Current Bottleneck Callout */}
        {activeTask && request.status !== 'RESOLVED' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/40 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Current Bottleneck / Active Stage
              </span>
              <p className="text-xs sm:text-sm font-semibold text-white">
                Step {activeTask.step_order}: {activeTask.title} ({activeTask.assigned_department})
              </p>
            </div>
            <SLAIndicator
              deadline={activeTask.sla_deadline}
              status={activeTask.status}
              completedAt={activeTask.completed_at}
            />
          </div>
        )}
      </div>

      {/* Workflow Task Execution Timeline */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Autonomous Workflow Task Pipeline</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sequential dependency chain generated by AutoFlow AI
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 font-mono">
            {request.tasks?.filter(t => t.status === 'COMPLETED').length || 0} / {request.tasks?.length || 0} Finished
          </span>
        </div>

        <WorkflowTimeline
          tasks={request.tasks}
          onUpdateStatus={handleUpdateTaskStatus}
          canManage={currentUser.role !== 'EMPLOYEE' || request.requester_id === currentUser.id}
        />
      </div>

      {/* Activity Logs & Audit Trail */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Audit Trail & Orchestration History
          </h3>
        </div>

        <div className="divide-y divide-slate-800/80">
          {request.workflow_logs && request.workflow_logs.length > 0 ? (
            request.workflow_logs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-200 leading-relaxed font-medium">
                    {log.action}
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {log.actor ? `${log.actor.full_name} (${log.actor.role})` : 'AutoFlow AI System'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 flex-shrink-0 font-mono">
                  {formatDate(log.created_at)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              No audit logs recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
