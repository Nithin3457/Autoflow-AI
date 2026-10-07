import React from 'react';
import UserSelector from './UserSelector';
import { Menu, Sparkles, Database, CheckCircle2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Navbar({ onOpenSidebar }) {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Analytics & Bottleneck Dashboard';
      case '/requests/new':
        return 'AI Request Orchestrator';
      case '/requests':
        return 'My Submitted Requests';
      case '/tasks':
        return 'Task Inbox & Kanban';
      default:
        if (location.pathname.startsWith('/requests/')) {
          return 'Request Workflow Pipeline';
        }
        return 'AutoFlow AI';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right side: Cloud status & User Selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Supabase status pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Supabase Connected</span>
        </div>

        {/* Persona Switcher */}
        <UserSelector />
      </div>
    </header>
  );
}
