import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';
import { User, ChevronDown, Check, ShieldCheck, Briefcase, Wrench, UserCheck } from 'lucide-react';

const ROLE_ICONS = {
  ADMIN: ShieldCheck,
  MANAGER: Briefcase,
  TECHNICIAN: Wrench,
  EMPLOYEE: UserCheck
};

export default function UserSelector() {
  const { currentUser, users, switchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const RoleIcon = ROLE_ICONS[currentUser.role] || User;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-indigo-500/50 transition-all text-left shadow-sm group"
        title="Switch active user to test Row-Level Security and permissions"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-semibold text-xs shadow-inner">
          <RoleIcon className="w-4 h-4" />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
              {currentUser.full_name}
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border border-transparent ${
              currentUser.role === 'ADMIN' ? 'bg-purple-900/60 text-purple-300 border-purple-700/50' :
              currentUser.role === 'MANAGER' ? 'bg-indigo-900/60 text-indigo-300 border-indigo-700/50' :
              currentUser.role === 'TECHNICIAN' ? 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50' :
              'bg-slate-700/60 text-slate-300 border-slate-600/50'
            }`}>
              {currentUser.role}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate max-w-[130px]">
            {currentUser.department}
          </p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#111827] border border-slate-700/90 shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Simulate Active Persona
              </span>
              <span className="text-[10px] font-medium text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-800/60">
                Mock RLS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Switch roles to verify row-level security isolation and access scopes.
            </p>
          </div>

          <div className="p-1.5 max-h-72 overflow-y-auto space-y-1">
            {users.map((user) => {
              const isSelected = user.id === currentUser.id;
              const UserRoleIcon = ROLE_ICONS[user.role] || User;

              return (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUser(user.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      <UserRoleIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                        {user.full_name}
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {user.department} • <span className="text-slate-300 font-medium">{user.role}</span>
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
