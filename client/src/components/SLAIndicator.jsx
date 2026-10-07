import React from 'react';
import { calculateSLA } from '../utils/formatters';
import { Clock, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SLAIndicator({ deadline, status, completedAt, showIcon = true, size = 'sm' }) {
  const sla = calculateSLA(deadline, status, completedAt);

  const getIcon = () => {
    switch (sla.status) {
      case 'MET':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'BREACHED':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const sizeClasses = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border shadow-sm transition-all ${sla.badgeClass} ${sizeClasses}`}
      title={`SLA Status: ${sla.status} (Target: ${new Date(deadline).toLocaleString()})`}
    >
      {showIcon && getIcon()}
      <span className="whitespace-nowrap">{sla.label}</span>
    </span>
  );
}
