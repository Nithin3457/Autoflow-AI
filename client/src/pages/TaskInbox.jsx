import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskBoard from '../components/TaskBoard';
import { CheckSquare, RefreshCw, AlertCircle, Shield } from 'lucide-react';

export default function TaskInbox() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks', {
        headers: {
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        }
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUser]);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to update task');
      }

      const result = await res.json();

      // Show toast
      setNotification(`Task updated to ${newStatus}. ${result.request?.status === 'RESOLVED' ? '🎉 Parent request is now RESOLVED!' : ''}`);
      setTimeout(() => setNotification(null), 4000);

      // Refresh tasks
      fetchTasks();
    } catch (err) {
      alert(`Error updating task: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/90 border border-indigo-500/80 text-white text-xs font-semibold shadow-2xl flex items-center justify-between animate-in fade-in zoom-in-95 duration-150">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-indigo-300 hover:text-white ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Task Action Inbox
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs font-semibold font-mono">
              {tasks.length} tasks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
            <span>Scoped to</span>
            <span className="text-indigo-400 font-medium">{currentUser.role}</span>
            <span>in</span>
            <span className="text-slate-300 font-medium">{currentUser.department}</span>
          </p>
        </div>

        <button
          onClick={fetchTasks}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto flex items-center gap-2 text-xs font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Main TaskBoard Component */}
      <TaskBoard
        tasks={tasks}
        onUpdateStatus={handleUpdateStatus}
        loading={loading}
      />
    </div>
  );
}
