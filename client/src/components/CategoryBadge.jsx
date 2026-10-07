import React from 'react';
import { CATEGORIES } from '../utils/constants';
import { Laptop, Wrench, ShoppingBag, Calendar, FileCheck, HelpCircle } from 'lucide-react';

const ICONS = {
  Laptop,
  Wrench,
  ShoppingBag,
  Calendar,
  FileCheck
};

export default function CategoryBadge({ category, size = 'md' }) {
  const cat = CATEGORIES[category] || {
    label: category || 'General',
    color: 'from-slate-700 to-slate-800 text-slate-300 border-slate-700',
    dot: 'bg-slate-400',
    iconName: 'HelpCircle'
  };

  const Icon = ICONS[cat.iconName] || HelpCircle;

  const sizeClasses = size === 'sm'
    ? 'text-[11px] px-2 py-0.5 gap-1.5'
    : 'text-xs px-2.5 py-1 gap-2 font-medium';

  const iconSizes = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span className={`inline-flex items-center rounded-lg bg-gradient-to-r ${cat.color} border shadow-sm ${sizeClasses}`}>
      <Icon className={`${iconSizes} opacity-90`} />
      <span>{cat.label}</span>
    </span>
  );
}
