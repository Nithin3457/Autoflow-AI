import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  icon: Icon,
  accentColor = 'indigo'
}) {
  const accentStyles = {
    indigo: 'from-indigo-500/20 to-purple-500/5 text-indigo-400 border-indigo-500/30',
    rose: 'from-rose-500/20 to-red-500/5 text-rose-400 border-rose-500/30',
    amber: 'from-amber-500/20 to-orange-500/5 text-amber-400 border-amber-500/30',
    emerald: 'from-emerald-500/20 to-teal-500/5 text-emerald-400 border-emerald-500/30',
    cyan: 'from-cyan-500/20 to-blue-500/5 text-cyan-400 border-cyan-500/30',
  }[accentColor] || 'from-indigo-500/20 to-purple-500/5 text-indigo-400 border-indigo-500/30';

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${accentStyles} blur-2xl opacity-40 group-hover:opacity-80 transition-opacity`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner group-hover:scale-110 transition-transform ${accentStyles.split(' ').slice(2, 3).join(' ')}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs relative z-10 border-t border-slate-800/80 pt-3">
        {subtitle && (
          <span className="text-slate-400 truncate max-w-[180px]">
            {subtitle}
          </span>
        )}

        {trend !== undefined && (
          <span className={`inline-flex items-center gap-1 font-semibold ${
            trendType === 'positive' ? 'text-emerald-400' :
            trendType === 'negative' ? 'text-rose-400' :
            'text-slate-400'
          }`}>
            {trendType === 'positive' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trendType === 'negative' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trendType === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
