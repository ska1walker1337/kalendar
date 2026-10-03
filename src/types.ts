export interface Task {
  id: string;
  user_id?: string; // для Supabase
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  hour: number; // 7-21
  priority: 'high' | 'medium' | 'low';
  deadline: string; // YYYY-MM-DD or empty
  completed: boolean;
  category: string;
}

export type SortBy = 'priority' | 'deadline' | 'date';
