import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  CheckSquare,
  Sparkles,
  Zap,
  ShieldCheck,
  Briefcase,
  Wrench,
  UserCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Analytics Dashboard', icon: LayoutDashboard },
  { path: '/requests/new', label: 'Submit Request', icon: PlusCircle, badge: 'AI' },
  { path: '/requests', label: 'My Requests', icon: FileText },
  { path: '/tasks', label: 'Task Inbox', icon: CheckSquare }
];

const ROLE_ICONS = {
  ADMIN: ShieldCheck,
  MANAGER: Briefcase,
  TECHNICIAN: Wrench,
  EMPLOYEE: UserCheck
};

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const RoleIcon = ROLE_ICONS[currentUser.role] || UserCheck;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0D121F] border-r border-slate-800/90 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Zap className="w-5 h-5 fill-white text-transparent" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                AutoFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">
                Orchestrator v2.5
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Main Navigation
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-950 text-indigo-400 border border-indigo-800/60'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="pt-6 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Autonomous Engine
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-900/40 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 2.5 Flash</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              NLP intent classification, entity extraction & automated DAG task generation active.
            </p>
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
              <span>Status</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live Engine
              </span>
            </div>
          </div>
        </div>

        {/* User Footer Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <RoleIcon className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser.full_name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {currentUser.role} • {currentUser.department}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
