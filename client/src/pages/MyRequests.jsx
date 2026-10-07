import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/CategoryBadge';
import { PRIORITIES, RISK_LEVELS } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import { FileText, PlusCircle, Search, Filter, ExternalLink, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyRequests() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/requests', {
        headers: {
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        }
      });
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (search.trim() && !r.raw_text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Requests & Workflow Submissions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {currentUser.role === 'EMPLOYEE'
              ? 'Tracking requests submitted by your account (Scoped to your ID).'
              : `Viewing organizational requests accessible to ${currentUser.role} role.`}
          </p>
        </div>

        <Link
          to="/requests/new"
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search request description..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <button
            onClick={fetchRequests}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-colors"
            title="Refresh requests"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="glass-panel rounded-3xl p-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
          <span>Loading request portfolio...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <div>
            <h3 className="text-base font-semibold text-white">No Requests Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {currentUser.role === 'EMPLOYEE'
                ? 'You have not submitted any unstructured requests yet.'
                : 'No requests matched your current filter criteria.'}
            </p>
          </div>
          <Link
            to="/requests/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Your First Request</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(req => {
            const priorityInfo = PRIORITIES[req.priority] || PRIORITIES.MEDIUM;
            const riskInfo = RISK_LEVELS[req.risk_level] || RISK_LEVELS.LOW;
            const progress = req.taskStats?.progressPercentage || 0;
            const completedCount = req.taskStats?.completed || 0;
            const totalCount = req.taskStats?.total || 0;

            return (
              <div
                key={req.id}
                className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-700/70 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CategoryBadge category={req.category} size="sm" />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityInfo.badge}`}>
                        {req.priority}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${riskInfo.badge}`}>
                        {riskInfo.label}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Submitted {formatDate(req.created_at)}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                      "{req.raw_text}"
                    </h3>
                  </div>

                  <div className="flex sm:flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      req.status === 'RESOLVED'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                        : 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>

                    <Link
                      to={`/requests/${req.id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <span>View Pipeline</span>
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                    </Link>
                  </div>
                </div>

                {/* Task Progression Bar */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Task Execution Pipeline</span>
                    <span className="font-semibold text-slate-200">
                      {completedCount} of {totalCount} tasks completed ({progress}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        req.status === 'RESOLVED'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
