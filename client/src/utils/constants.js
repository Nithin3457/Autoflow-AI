export const CATEGORIES = {
  IT_SUPPORT: {
    label: 'IT Support',
    color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
    dot: 'bg-cyan-400',
    iconName: 'Laptop'
  },
  MAINTENANCE: {
    label: 'Maintenance',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
    iconName: 'Wrench'
  },
  PROCUREMENT: {
    label: 'Procurement',
    color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-400',
    iconName: 'ShoppingBag'
  },
  HR_LEAVE: {
    label: 'HR & Leave',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
    iconName: 'Calendar'
  },
  DOCUMENT_APPROVAL: {
    label: 'Document Approval',
    color: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-400',
    iconName: 'FileCheck'
  }
};

export const PRIORITIES = {
  LOW: {
    label: 'Low',
    badge: 'bg-slate-800 text-slate-300 border-slate-700'
  },
  MEDIUM: {
    label: 'Medium',
    badge: 'bg-blue-900/40 text-blue-300 border-blue-700/50'
  },
  HIGH: {
    label: 'High',
    badge: 'bg-amber-900/40 text-amber-300 border-amber-700/50'
  },
  CRITICAL: {
    label: 'Critical',
    badge: 'bg-rose-900/50 text-rose-300 border-rose-600/60 animate-pulse'
  }
};

export const RISK_LEVELS = {
  LOW: {
    label: 'Low Risk',
    badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
  },
  MEDIUM: {
    label: 'Medium Risk',
    badge: 'bg-amber-950/60 text-amber-400 border-amber-800/40'
  },
  HIGH: {
    label: 'High Risk',
    badge: 'bg-rose-950/60 text-rose-400 border-rose-800/40'
  }
};

export const ROLES = {
  EMPLOYEE: { label: 'Employee', badge: 'bg-slate-700/60 text-slate-200' },
  TECHNICIAN: { label: 'Technician', badge: 'bg-cyan-900/60 text-cyan-200' },
  MANAGER: { label: 'Manager', badge: 'bg-indigo-900/60 text-indigo-200' },
  ADMIN: { label: 'Admin', badge: 'bg-purple-900/60 text-purple-200' }
};
