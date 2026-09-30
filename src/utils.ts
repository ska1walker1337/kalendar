import { Task } from './types';

export const WAKE_HOUR = 7;
export const SLEEP_HOUR = 22;
export const TRAINING_START = 17;
export const TRAINING_END = 20.5;

export const HOURS = Array.from({ length: SLEEP_HOUR - WAKE_HOUR }, (_, i) => WAKE_HOUR + i);

export function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = (hour % 1) * 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function isTrainingBlock(hour: number, dayOfWeek: number): boolean {
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  return hour >= TRAINING_START && hour < Math.ceil(TRAINING_END);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getDayStatus(tasks: Task[]): 'completed' | 'incomplete' | 'empty' {
  if (tasks.length === 0) return 'empty';
  const allDone = tasks.every(t => t.completed);
  return allDone ? 'completed' : 'incomplete';
}

export function getPriorityBg(priority: string): string {
  switch (priority) {
    case 'high': return 'bg-red-500/20 border-red-500/40';
    case 'medium': return 'bg-yellow-500/20 border-yellow-500/40';
    case 'low': return 'bg-green-500/20 border-green-500/40';
    default: return 'bg-gray-500/20 border-gray-500/40';
  }
}

export function getPriorityValue(priority: string): number {
  switch (priority) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

export function sortTasks(tasks: Task[], sortBy: string): Task[] {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return getPriorityValue(b.priority) - getPriorityValue(a.priority);
      case 'deadline':
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      case 'date':
        return a.date.localeCompare(b.date);
      default:
        return 0;
    }
  });
}

export function loadTasks(): Task[] {
  try {
    const saved = localStorage.getItem('planner-tasks');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem('planner-tasks', JSON.stringify(tasks));
}

export function getDayName(dayOfWeek: number): string {
  const names = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  return names[dayOfWeek];
}

export function getMonthName(month: number): string {
  const names = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return names[month];
}
