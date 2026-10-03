import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Task } from '../types';
import { HOURS, formatHour, isTrainingBlock, getDayName, getPriorityBg } from '../utils';

interface DayScheduleProps {
  selectedDate: Date;
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (hour: number) => void;
}

export const DayScheduleView: React.FC<DayScheduleProps> = ({
  selectedDate, tasks, onToggleTask, onEditTask, onDeleteTask, onAddTask
}) => {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayOfWeek = selectedDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayTasks = tasks.filter(t => t.date === dateStr);

  const getTasksForHour = (hour: number): Task[] => {
    return dayTasks.filter(t => t.hour === hour);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">
            {format(selectedDate, 'd MMMM', { locale: ru })}
          </h3>
          <p className="text-sm text-gray-400">
            {getDayName(dayOfWeek)} {isWeekend && '• Выходной'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">
            {dayTasks.filter(t => t.completed).length}/{dayTasks.length} выполнено
          </div>
          {dayTasks.length > 0 && (
            <div className="w-20 h-1.5 bg-gray-700 rounded-full mt-1">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${(dayTasks.filter(t => t.completed).length / dayTasks.length) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-0.5 max-h-[60vh] sm:max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {HOURS.map(hour => {
          const hourTasks = getTasksForHour(hour);
          const isTraining = isTrainingBlock(hour, dayOfWeek);
          const isTrainingStart = hour === 17 && !isWeekend;

          return (
            <div key={hour} className={`relative group ${isTrainingStart ? 'mt-3' : ''}`}>
              {isTraining && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500/50 rounded-full" />
              )}

              <div className={`flex items-start gap-2 py-1.5 px-2 rounded-lg transition-colors ${
                isTraining ? 'bg-purple-500/5' : 'hover:bg-gray-700/30'
              }`}>
                <div className={`w-11 text-xs font-mono pt-0.5 flex-shrink-0 ${
                  isTraining ? 'text-purple-400' : 'text-gray-500'
                }`}>
                  {formatHour(hour)}
                </div>

                <div className="flex-1 min-w-0">
                  {isTraining && hour === 17 ? (
                    <div className="flex items-center gap-2 text-purple-300 text-sm font-medium bg-purple-500/10 rounded px-2 py-1.5">
                      <span>🏋️</span>
                      <span>Тренировка</span>
                      <span className="text-xs text-purple-400/70 ml-auto hidden sm:inline">17:00 - 20:30</span>
                    </div>
                  ) : isTraining ? null : (
                    <>
                      {hourTasks.map(task => (
                        <div
                          key={task.id}
                          className={`flex items-center gap-2 py-1.5 px-2 rounded border ${getPriorityBg(task.priority)} mb-1 ${
                            task.completed ? 'opacity-60' : ''
                          }`}
                        >
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                              task.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-500 hover:border-green-400'
                            }`}
                          >
                            {task.completed && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                              {task.title}
                            </span>
                            {task.category && (
                              <span className="ml-2 text-xs text-gray-400 bg-gray-700/50 px-1.5 py-0.5 rounded">
                                {task.category}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditTask(task)}
                              className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 hover:bg-red-600/30 rounded text-gray-400 hover:text-red-400"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => onAddTask(hour)}
                        className="w-full text-left text-xs text-gray-600 hover:text-gray-400 py-0.5 px-1 rounded hover:bg-gray-700/30 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        + добавить
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
