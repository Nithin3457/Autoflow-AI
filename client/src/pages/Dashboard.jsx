import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import CategoryBadge from '../components/CategoryBadge';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  IT_SUPPORT: '#06b6d4',
  MAINTENANCE: '#f59e0b',
  PROCUREMENT: '#a855f7',
  HR_LEAVE: '#10b981',
  DOCUMENT_APPROVAL: '#f43f5e'
};

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics', {
        headers: {
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        }
      });
      if (!res.ok) throw new Error('Failed to load analytics');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [currentUser]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <span>Loading Analytics Dashboard...</span>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalRequests: 0,
    inProgressRequests: 0,
    resolvedRequests: 0,
    slaBreachedCount: 0,
    slaWarningCount: 0,
    slaSafeCount: 0,
    slaComplianceRate: 100
  };

  const workloadData = data?.workloadByDepartment || [];
  const categoryData = (data?.requestsByCategory || []).map(item => ({
    name: item.category.replace('_', ' '),
    rawCategory: item.category,
    value: item.count
  })).filter(i => i.value > 0);

  const avgTimeData = data?.avgCompletionTimeByDepartment || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Hero */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-700/80 shadow-2xl">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            Live SLA & Bottleneck Telemetry
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Autonomous Organizational Flow
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            AI-driven request routing, SLA deadline tracking, and bottleneck resolution across IT, Maintenance, Procurement, and HR.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={fetchAnalytics}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh analytics data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/requests/new"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <span>Submit Request</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={summary.totalRequests}
          subtitle={`${summary.inProgressRequests} Active In-Flight`}
          icon={FileText}
          accentColor="indigo"
          trend="+18% vs last week"
          trendType="positive"
        />

        <StatCard
          title="SLA Compliance"
          value={`${summary.slaComplianceRate}%`}
          subtitle="Target threshold: >85%"
          icon={CheckCircle2}
          accentColor={summary.slaComplianceRate >= 85 ? 'emerald' : 'amber'}
          trend={summary.slaComplianceRate >= 85 ? 'Healthy SLA' : 'Needs Attention'}
          trendType={summary.slaComplianceRate >= 85 ? 'positive' : 'negative'}
        />

        <StatCard
          title="SLA Breaches"
          value={summary.slaBreachedCount}
          subtitle={`${summary.slaWarningCount} tasks in warning (<2h)`}
          icon={AlertTriangle}
          accentColor={summary.slaBreachedCount > 0 ? 'rose' : 'emerald'}
          trend={summary.slaBreachedCount > 0 ? `${summary.slaBreachedCount} Violations` : 'Zero Breaches'}
          trendType={summary.slaBreachedCount > 0 ? 'negative' : 'positive'}
        />

        <StatCard
          title="Resolved Workflows"
          value={summary.resolvedRequests}
          subtitle="End-to-end task completion"
          icon={Layers}
          accentColor="cyan"
          trend="Automated sign-off"
          trendType="positive"
        />
      </div>

      {/* SLA Alert Feed (If any breaches exist) */}
      {data?.criticalBreaches && data.criticalBreaches.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 border border-rose-900/60 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
            Active SLA Violations Requiring Immediate Action
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.criticalBreaches.map(breach => (
              <div
                key={breach.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-rose-800/40 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 truncate pr-2">
                  <div className="font-semibold text-rose-300 truncate">
                    {breach.title}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Dept: {breach.department} • <span className="italic">{breach.requestTitle}</span>
                  </div>
                </div>
                <Link
                  to="/tasks"
                  className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[11px] font-semibold border border-rose-700/60 flex-shrink-0"
                >
                  Resolve
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recharts Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Workload by Department */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Workload Volume by Department
              </h3>
              <p className="text-xs text-slate-400">
                Active tasks distributed across functional teams
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="department" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="in_progress" name="In Progress" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Requests by Category Distribution */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-400" />
                Requests by Workflow Category
              </h3>
              <p className="text-xs text-slate-400">
                AI classification distribution across operational domains
              </p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-slate-500 text-xs">No categorical data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.rawCategory] || '#818cf8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#374151',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Average Resolution Time */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Average Processing Duration (Hours) by Department
              </h3>
              <p className="text-xs text-slate-400">
                Mean time from task activation to verified completion
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={avgTimeData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={11} unit="h" />
                <YAxis dataKey="department" type="category" stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} hours`, 'Avg Resolution Time']}
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="avgHours" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
