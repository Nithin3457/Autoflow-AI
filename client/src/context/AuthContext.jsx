import React, { createContext, useContext, useState, useEffect } from 'react';

const FALLBACK_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Sarah Jenkins',
    email: 'sarah.jenkins@autoflow.ai',
    role: 'EMPLOYEE',
    department: 'Marketing'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    full_name: 'Priya Patel',
    email: 'priya.patel@autoflow.ai',
    role: 'EMPLOYEE',
    department: 'Design'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    full_name: 'Alex Rivera',
    email: 'alex.rivera@autoflow.ai',
    role: 'TECHNICIAN',
    department: 'IT'
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    full_name: 'Marcus Vance',
    email: 'marcus.vance@autoflow.ai',
    role: 'TECHNICIAN',
    department: 'Facilities'
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    full_name: 'Elena Rostova',
    email: 'elena.rostova@autoflow.ai',
    role: 'MANAGER',
    department: 'Finance'
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    full_name: 'David Sterling',
    email: 'david.sterling@autoflow.ai',
    role: 'ADMIN',
    department: 'Executive Administration'
  }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(FALLBACK_USERS);
  const [currentUser, setCurrentUser] = useState(() => {
    const savedId = localStorage.getItem('autoflow_user_id');
    const found = FALLBACK_USERS.find(u => u.id === savedId);
    return found || FALLBACK_USERS[0];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setUsers(data);
            const savedId = localStorage.getItem('autoflow_user_id');
            const match = data.find(u => u.id === savedId) || data[0];
            setCurrentUser(match);
          }
        }
      } catch (err) {
        console.warn('Could not fetch remote users, using fallback users:', err.message);
      }
    }
    fetchUsers();
  }, []);

  const switchUser = (userId) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('autoflow_user_id', target.id);
    }
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': currentUser.id,
    'x-user-role': currentUser.role
  });

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        getHeaders,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
