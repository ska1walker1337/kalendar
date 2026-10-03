import React from 'react';
import { format, isPast, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Task, SortBy } from '../types';
import { sortTasks, getPriorityBg } from '../utils';

interface TaskListProps {
  tasks: Task[];
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, sortBy, onSortChange, onToggleTask, onEditTask }) => {
  const today = startOfDay(new Date());
  const activeTasks = tasks.filter(t => !t.completed);
  const sortedTasks = sortTasks(activeTasks, sortBy);

  const isOverdue = (task: Task): boolean => {
    if (!task.deadline) return false;
    const deadlineDate = new Date(task.deadline + 'T00:00:00');
    return isPast(startOfDay(deadlineDate)) && task.deadline < format(today, 'yyyy-MM-dd');
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">📋 Все задачи</h3>
          <p className="text-xs text-gray-400">{activeTasks.length} активных задач</p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['priority', 'deadline', 'date'] as SortBy[]).map(s => (
            <button
              key={s}
              onClick={() => onSortChange(s)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                sortBy === s
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              {s === 'priority' ? 'По важности' : s === 'deadline' ? 'По дедлайну' : 'По дате'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-[60vh] sm:max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-3xl mb-2">✨</div>
            <p>Нет активных задач</p>
            <p className="text-xs">Добавьте задачу из расписания</p>
          </div>
        ) : (
          sortedTasks.map(task => {
            const overdue = isOverdue(task);
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-lg border transition-all ${getPriorityBg(task.priority)} ${
                  overdue ? 'ring-1 ring-red-500/50' : ''
                }`}
              >
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="w-5 h-5 rounded border border-gray-500 hover:border-green-400 flex-shrink-0 flex items-center justify-center transition-colors"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-white truncate">{task.title}</span>
                    {overdue && (
                      <span className="text-xs bg-red-500/30 text-red-300 px-1.5 py-0.5 rounded flex-shrink-0">
                        Просрочено!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">
                      {format(new Date(task.date + 'T00:00:00'), 'd MMM', { locale: ru })}
                    </span>
                    {task.deadline && (
                      <span className={`text-xs ${overdue ? 'text-red-400' : 'text-gray-400'}`}>
                        → до {format(new Date(task.deadline + 'T00:00:00'), 'd MMM', { locale: ru })}
                      </span>
                    )}
                    {task.category && (
                      <span className="text-xs text-gray-500 bg-gray-700/50 px-1.5 py-0.5 rounded">
                        {task.category}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onEditTask(task)}
                  className="p-1.5 hover:bg-gray-600/50 rounded text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {tasks.filter(t => t.completed).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <p className="text-xs text-gray-500">
            ✅ Выполнено: {tasks.filter(t => t.completed).length} из {tasks.length}
          </p>
        </div>
      )}
    </div>
  );
};
