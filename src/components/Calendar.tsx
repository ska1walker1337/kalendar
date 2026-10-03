import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isBefore, startOfDay } from 'date-fns';
import { Task } from '../types';
import { getDayStatus, getMonthName } from '../utils';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
  currentMonth: Date;
  onChangeMonth: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate, tasks, currentMonth, onChangeMonth }) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const today = startOfDay(new Date());
  const rows: Date[][] = [];
  let day = calStart;

  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    rows.push(week);
  }

  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(t => t.date === dateStr);
  };

  const isPast = (date: Date): boolean => {
    return isBefore(date, today);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onChangeMonth(addDays(monthStart, -1))}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-white">
            {getMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={() => { onChangeMonth(new Date()); onSelectDate(startOfDay(new Date())); }}
            className="px-2 py-0.5 text-xs bg-blue-600/30 text-blue-300 rounded hover:bg-blue-600/50 transition-colors"
          >
            Сегодня
          </button>
        </div>
        <button
          onClick={() => onChangeMonth(addDays(monthEnd, 1))}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {rows.map((week, wi) =>
          week.map((date, di) => {
            const dayTasks = getTasksForDate(date);
            const status = getDayStatus(dayTasks);
            const past = isPast(date);
            const isToday = isSameDay(date, today);
            const isSelected = isSameDay(date, selectedDate);
            const isCurrentMonth = isSameMonth(date, monthStart);
            const isWeekend = di >= 5;

            return (
              <button
                key={wi + '-' + di}
                onClick={() => onSelectDate(date)}
                className={`
                  relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs sm:text-sm transition-all
                  ${!isCurrentMonth ? 'text-gray-600' : ''}
                  ${isCurrentMonth && !isToday && !isSelected ? 'text-gray-300 hover:bg-gray-700/50' : ''}
                  ${isToday && !isSelected ? 'bg-blue-600/30 text-blue-300 font-bold ring-1 ring-blue-500/50' : ''}
                  ${isSelected ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30' : ''}
                  ${isWeekend && isCurrentMonth ? 'text-purple-300' : ''}
                `}
              >
                <span>{format(date, 'd')}</span>
                
                {/* Status cross for past days */}
                {past && status !== 'empty' && (
                  <span className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                    status === 'completed' ? 'text-green-400/60' : 'text-red-400/60'
                  }`}>
                    <svg className="w-full h-full p-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="4" y1="4" x2="20" y2="20" />
                      <line x1="20" y1="4" x2="4" y2="20" />
                    </svg>
                  </span>
                )}

                {/* Task dots */}
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayTasks.slice(0, 3).map((t, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          t.completed ? 'bg-green-400' :
                          t.priority === 'high' ? 'bg-red-400' :
                          t.priority === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 flex items-center justify-center text-green-400 text-[10px]">✕</span>
          <span>Выполнено</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 flex items-center justify-center text-red-400 text-[10px]">✕</span>
          <span>Не выполнено</span>
        </div>
      </div>
    </div>
  );
};
