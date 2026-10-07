import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Dashboard from './pages/Dashboard';
import SubmitRequest from './pages/SubmitRequest';
import MyRequests from './pages/MyRequests';
import TaskInbox from './pages/TaskInbox';
import RequestDetails from './pages/RequestDetails';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
          {/* Navigation Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main App Container */}
          <div className="lg:pl-64 flex flex-col min-h-screen">
            {/* Top Navigation Bar */}
            <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

            {/* Page Content View */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/requests/new" element={<SubmitRequest />} />
                <Route path="/requests" element={<MyRequests />} />
                <Route path="/tasks" element={<TaskInbox />} />
                <Route path="/requests/:id" element={<RequestDetails />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="py-6 px-8 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
              <div>
                AutoFlow AI • Autonomous Enterprise Workflow Orchestrator
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500">
                <span>Google Gemini 2.5 Flash</span>
                <span>•</span>
                <span>Supabase PostgreSQL</span>
                <span>•</span>
                <span>React Vite</span>
              </div>
            </footer>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
