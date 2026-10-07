import React, { useState } from 'react';
import SLAIndicator from './SLAIndicator';
import CategoryBadge from './CategoryBadge';
import { PRIORITIES } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import { CheckCircle2, PlayCircle, Clock, LayoutGrid, List, Filter, ExternalLink, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TaskBoard({ tasks = [], onUpdateStatus, loading = false }) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterDepartment !== 'ALL' && task.assigned_department !== filterDepartment) return false;
    if (filterPriority !== 'ALL' && task.request?.priority !== filterPriority) return false;
    return true;
  });

  const departments = ['ALL', ...new Set(tasks.map(t => t.assigned_department).filter(Boolean))];
  const priorities = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const columns = [
    { key: 'PENDING', label: 'Pending', count: filteredTasks.filter(t => t.status === 'PENDING').length, color: 'text-slate-400 border-slate-700' },
    { key: 'IN_PROGRESS', label: 'In Progress', count: filteredTasks.filter(t => t.status === 'IN_PROGRESS').length, color: 'text-indigo-400 border-indigo-700/60' },
    { key: 'COMPLETED', label: 'Completed', count: filteredTasks.filter(t => t.status === 'COMPLETED').length, color: 'text-emerald-400 border-emerald-700/60' }
  ];

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:border-indigo-500 focus:outline-none"
          >
            {departments.map(d => (
              <option key={d} value={d}>
                Dept: {d}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:border-indigo-500 focus:outline-none"
          >
            {priorities.map(p => (
              <option key={p} value={p}>
                Priority: {p}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'kanban'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-2">
          <Clock className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <h3 className="text-base font-semibold text-slate-200">No Tasks Match Selected Criteria</h3>
          <p className="text-xs text-slate-500">
            Check back later or adjust the department/priority filters above.
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.key);

            return (
              <div key={col.key} className="flex flex-col space-y-3">
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">
                      {col.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                      {col.count}
                    </span>
                  </div>
                </div>

                {/* Column Cards Container */}
                <div className="space-y-3.5 min-h-[400px] p-2 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 text-xs">
                      No {col.label.toLowerCase()} tasks
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdateStatus={onUpdateStatus}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="glass-panel rounded-2xl divide-y divide-slate-800 overflow-hidden">
          {filteredTasks.map(task => (
            <TaskListItem
              key={task.id}
              task={task}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onUpdateStatus }) {
  const priorityInfo = PRIORITIES[task.request?.priority] || PRIORITIES.MEDIUM;

  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-4 space-y-3 border border-slate-700/60 shadow-md relative group">
      {/* Top badges */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {task.request?.category && (
          <CategoryBadge category={task.request.category} size="sm" />
        )}
        <SLAIndicator
          deadline={task.sla_deadline}
          status={task.status}
          completedAt={task.completed_at}
          size="xs"
        />
      </div>

      {/* Title & Request Context */}
      <div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-400 uppercase tracking-wider mb-1">
          <span>Step {task.step_order}</span>
          <span>•</span>
          <span className="text-slate-400">{task.assigned_department}</span>
        </div>
        <h4 className="text-sm font-semibold text-white leading-snug">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Requester snippet */}
      {task.request && (
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/70 text-[11px] text-slate-400">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-slate-500 font-medium">Original Request:</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${priorityInfo.badge}`}>
              {task.request.priority}
            </span>
          </div>
          <p className="line-clamp-1 italic text-slate-300">
            "{task.request.raw_text}"
          </p>
        </div>
      )}

      {/* Actions and Footer */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
        <Link
          to={`/requests/${task.request_id}`}
          className="text-[11px] text-slate-400 hover:text-indigo-400 font-medium flex items-center gap-1"
        >
          <span>Details</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        {task.status === 'PENDING' && (
          <button
            onClick={() => onUpdateStatus(task.id, 'IN_PROGRESS')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
          >
            <PlayCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Start</span>
          </button>
        )}

        {task.status === 'IN_PROGRESS' && (
          <button
            onClick={() => onUpdateStatus(task.id, 'COMPLETED')}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-950/50 transition-colors flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Complete</span>
          </button>
        )}

        {task.status === 'COMPLETED' && (
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Resolved</span>
          </span>
        )}
      </div>
    </div>
  );
}

function TaskListItem({ task, onUpdateStatus }) {
  const priorityInfo = PRIORITIES[task.request?.priority] || PRIORITIES.MEDIUM;

  return (
    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {task.request?.category && (
            <CategoryBadge category={task.request.category} size="sm" />
          )}
          <span className="text-xs font-mono text-indigo-400">
            Step {task.step_order}
          </span>
          <span className="text-xs text-slate-400">
            {task.assigned_department} ({task.assigned_role})
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityInfo.badge}`}>
            {task.request?.priority || 'MEDIUM'}
          </span>
        </div>

        <h4 className="text-sm font-semibold text-white">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-slate-400">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <SLAIndicator
          deadline={task.sla_deadline}
          status={task.status}
          completedAt={task.completed_at}
        />

        {task.status === 'PENDING' && (
          <button
            onClick={() => onUpdateStatus(task.id, 'IN_PROGRESS')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            Start
          </button>
        )}

        {task.status === 'IN_PROGRESS' && (
          <button
            onClick={() => onUpdateStatus(task.id, 'COMPLETED')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Complete Task</span>
          </button>
        )}

        <Link
          to={`/requests/${task.request_id}`}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="View Request Details"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
