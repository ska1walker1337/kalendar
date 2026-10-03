import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, getSession, fetchTasks, insertTask, updateTask, deleteTask, subscribeToTasks } from '../lib/supabase';
import { Task } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (task: Task) => Promise<void>;
  editTask: (id: string, updates: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
  isCloud: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  tasks: [],
  setTasks: () => {},
  addTask: async () => {},
  editTask: async () => {},
  removeTask: async () => {},
  refreshTasks: async () => {},
  isCloud: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCloud, setIsCloud] = useState(false);

  // Load local tasks
  const loadLocalTasks = (): Task[] => {
    try {
      const saved = localStorage.getItem('planner-tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  // Save local tasks
  const saveLocalTasks = (tasks: Task[]) => {
    localStorage.setItem('planner-tasks', JSON.stringify(tasks));
  };

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        // Local mode
        setTasks(loadLocalTasks());
        setLoading(false);
        return;
      }

      try {
        const currentSession = await getSession();
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsCloud(true);
          // Load cloud tasks
          const cloudTasks = await fetchTasks();
          setTasks(cloudTasks as Task[]);
        } else {
          // Supabase configured but not logged in
          setTasks(loadLocalTasks());
          setIsCloud(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setTasks(loadLocalTasks());
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const supabase = getSupabase();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setUser(session.user);
          setIsCloud(true);
          const cloudTasks = await fetchTasks();
          setTasks(cloudTasks as Task[]);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsCloud(false);
          setTasks(loadLocalTasks());
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  // Save tasks locally when not in cloud mode
  useEffect(() => {
    if (!isCloud) {
      saveLocalTasks(tasks);
    }
  }, [tasks, isCloud]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!isCloud || !user) return;
    
    const unsubscribe = subscribeToTasks(user.id, () => {
      // Refetch tasks on any change
      fetchTasks().then(cloudTasks => {
        setTasks(cloudTasks as Task[]);
      });
    });

    return unsubscribe;
  }, [isCloud, user]);

  const addTask = async (task: Task) => {
    if (isCloud && user) {
      const { id, ...taskData } = task;
      const newTask = await insertTask({ ...taskData, user_id: user.id, id });
      setTasks(prev => [...prev, newTask as Task]);
    } else {
      setTasks(prev => [...prev, task]);
    }
  };

  const editTask = async (id: string, updates: Partial<Task>) => {
    if (isCloud && user) {
      const updated = await updateTask(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  };

  const removeTask = async (id: string) => {
    if (isCloud && user) {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const refreshTasks = async () => {
    if (isCloud && user) {
      const cloudTasks = await fetchTasks();
      setTasks(cloudTasks as Task[]);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, tasks, setTasks, addTask, editTask, removeTask, refreshTasks, isCloud }}>
      {children}
    </AuthContext.Provider>
  );
};
