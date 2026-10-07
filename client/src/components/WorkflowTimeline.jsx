import React from 'react';
import SLAIndicator from './SLAIndicator';
import { CheckCircle2, Clock, PlayCircle, AlertCircle, User, Shield, ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function WorkflowTimeline({ tasks = [], onUpdateStatus, canManage = true }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm glass-panel rounded-2xl">
        No workflow tasks generated yet.
      </div>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => a.step_order - b.step_order);

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500/50 before:to-slate-800">
      {sortedTasks.map((task, index) => {
        const isCompleted = task.status === 'COMPLETED';
        const isInProgress = task.status === 'IN_PROGRESS';
        const isPending = task.status === 'PENDING';
        const isEscalated = task.status === 'ESCALATED';

        return (
          <div key={task.id} className="relative group">
            {/* Stepper Circle */}
            <div
              className={`absolute -left-6 top-1.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4 ring-[#090D16] ${
                isCompleted
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : isInProgress
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 animate-pulse'
                  : isEscalated
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : isInProgress ? (
                <span>{task.step_order}</span>
              ) : (
                <span>{task.step_order}</span>
              )}
            </div>

            {/* Task Card */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isInProgress
                  ? 'bg-gradient-to-r from-indigo-950/40 to-slate-900/80 border-indigo-500/40 shadow-xl shadow-indigo-950/20'
                  : isCompleted
                  ? 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/30'
                  : 'bg-slate-900/30 border-slate-800/50 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold tracking-wide uppercase text-indigo-400">
                      Step {task.step_order}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {task.title}
                    </h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : isInProgress
                          ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60'
                          : isEscalated
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-end gap-2 flex-shrink-0">
                  <SLAIndicator
                    deadline={task.sla_deadline}
                    status={task.status}
                    completedAt={task.completed_at}
                  />

                  {canManage && onUpdateStatus && isInProgress && (
                    <button
                      onClick={() => onUpdateStatus(task.id, 'COMPLETED')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-900/40 transition-all flex items-center gap-1 group/btn"
                    >
                      <span>Complete Step</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  )}

                  {canManage && onUpdateStatus && isPending && (
                    <button
                      onClick={() => onUpdateStatus(task.id, 'IN_PROGRESS')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-all"
                    >
                      Start Early
                    </button>
                  )}
                </div>
              </div>

              {/* Assignment & Timestamps */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Shield className="w-3 h-3 text-indigo-400" />
                    <span className="font-medium text-slate-200">{task.assigned_role}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{task.assigned_department}</span>
                  </span>

                  {task.assigned_user && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <User className="w-3 h-3 text-slate-500" />
                      {task.assigned_user.full_name}
                    </span>
                  )}
                </div>

                <div>
                  {isCompleted && task.completed_at ? (
                    <span className="text-emerald-400 font-medium">
                      Completed {formatDate(task.completed_at)}
                    </span>
                  ) : (
                    <span>Due by {formatDate(task.sla_deadline)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
