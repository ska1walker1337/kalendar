import React, { useState, useEffect } from 'react';
import { format, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Task, SortBy } from './types';
import { loadTasks, saveTasks } from './utils';
import { Calendar } from './components/Calendar';
import { DayScheduleView } from './components/DaySchedule';
import { TaskModal } from './components/TaskModal';
import { TaskList } from './components/TaskList';
import { InstallBanner } from './components/InstallBanner';
import { useInstallPrompt } from './hooks/useInstallPrompt';

function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultHour, setDefaultHour] = useState<number>(7);
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const [activeTab, setActiveTab] = useState<'schedule' | 'tasks'>('schedule');
  const { isInstallable, isInstalled, install } = useInstallPrompt();

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const handleAddTask = (hour: number) => {
    setEditingTask(null);
    setDefaultHour(hour);
    setModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDefaultHour(task.hour);
    setModalOpen(true);
  };

  const handleSaveTask = (task: Task) => {
    setTasks(prev => {
      const existing = prev.findIndex(t => t.id === task.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = task;
        return updated;
      }
      return [...prev, task];
    });
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedToday = todayTasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/20 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                📅 Мой Планировщик
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Юрист • Борец • Трейдер • Программист
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm text-gray-300">
                {format(new Date(), 'd MMMM yyyy', { locale: ru })}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {todayTasks.length} задач | {completedToday} ✅
              </div>
            </div>
          </div>
        </header>

        {/* Install Banner */}
        <InstallBanner isInstallable={isInstallable} isInstalled={isInstalled} onInstall={install} />

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left: Calendar */}
          <div className="lg:col-span-4">
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              tasks={tasks}
              currentMonth={currentMonth}
              onChangeMonth={setCurrentMonth}
            />

            {/* Quick stats */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 text-center">
                <div className="text-lg sm:text-xl font-bold text-blue-400">{tasks.length}</div>
                <div className="text-xs text-gray-400">Всего</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 text-center">
                <div className="text-lg sm:text-xl font-bold text-green-400">{tasks.filter(t => t.completed).length}</div>
                <div className="text-xs text-gray-400">Выполнено</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 text-center">
                <div className="text-lg sm:text-xl font-bold text-yellow-400">{tasks.filter(t => !t.completed).length}</div>
                <div className="text-xs text-gray-400">Активных</div>
              </div>
            </div>

            {/* Schedule info */}
            <div className="mt-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h4 className="text-sm font-medium text-gray-300 mb-2">⏰ Режим дня</h4>
              <div className="space-y-1.5 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>🌅 Подъём</span>
                  <span className="text-white font-medium">7:00</span>
                </div>
                <div className="flex justify-between">
                  <span>🏋️ Тренировка (Пн-Пт)</span>
                  <span className="text-purple-300 font-medium">17:00 - 20:30</span>
                </div>
                <div className="flex justify-between">
                  <span>🌙 Отбой</span>
                  <span className="text-white font-medium">22:00</span>
                </div>
              </div>
            </div>

            {/* How to use on phone */}
            <div className="mt-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h4 className="text-sm font-medium text-gray-300 mb-2">📱 Как пользоваться на телефоне</h4>
              <div className="space-y-2 text-xs text-gray-400">
                <p>1. Открой этот сайт в браузере телефона</p>
                <p>2. Нажми "Поделиться" (iOS) или ⋮ меню (Android)</p>
                <p>3. Выбери "На экран Домой" / "Добавить на главный экран"</p>
                <p>4. Готово! Приложение работает как обычное, даже офлайн</p>
              </div>
            </div>
          </div>

          {/* Right: Schedule / Tasks */}
          <div className="lg:col-span-8">
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700/50'
                }`}
              >
                📆 Расписание
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'tasks'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700/50'
                }`}
              >
                📋 Все задачи
                {tasks.filter(t => !t.completed).length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-blue-500/30 text-blue-300 text-xs rounded-full">
                    {tasks.filter(t => !t.completed).length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === 'schedule' ? (
              <DayScheduleView
                selectedDate={selectedDate}
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
              />
            ) : (
              <TaskList
                tasks={tasks}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onToggleTask={handleToggleTask}
                onEditTask={handleEditTask}
              />
            )}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        task={editingTask}
        defaultDate={format(selectedDate, 'yyyy-MM-dd')}
        defaultHour={defaultHour}
      />
    </div>
  );
}

export default App;
