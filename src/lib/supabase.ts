import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  
  const url = localStorage.getItem('supabase-url');
  const key = localStorage.getItem('supabase-anon-key');
  
  if (!url || !key) return null;
  
  supabaseInstance = createClient(url, key);
  return supabaseInstance;
}

export function initSupabase(url: string, key: string): SupabaseClient {
  localStorage.setItem('supabase-url', url);
  localStorage.setItem('supabase-anon-key', key);
  supabaseInstance = createClient(url, key);
  return supabaseInstance;
}

export function clearSupabase(): void {
  localStorage.removeItem('supabase-url');
  localStorage.removeItem('supabase-anon-key');
  supabaseInstance = null;
}

export function isSupabaseConfigured(): boolean {
  return !!(localStorage.getItem('supabase-url') && localStorage.getItem('supabase-anon-key'));
}

// Auth functions
export async function signUp(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase не настроен');
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase не настроен');
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase не настроен');
  return supabase.auth.signOut();
}

export async function getSession() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Task CRUD
export async function fetchTasks() {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('date', { ascending: true })
    .order('hour', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function insertTask(task: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase не настроен');
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase не настроен');
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase не настроен');
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Realtime subscription
export function subscribeToTasks(userId: string, callback: () => void) {
  const supabase = getSupabase();
  if (!supabase) return () => {};
  
  const channel = supabase
    .channel('tasks-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, callback)
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}
