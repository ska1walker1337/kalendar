import React, { useState } from 'react';
import { format, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Task, SortBy } from './types';
import { Calendar } from './components/Calendar';
import { DayScheduleView } from './components/DaySchedule';
import { TaskModal } from './components/TaskModal';
import { TaskList } from './components/TaskList';
import { InstallBanner } from './components/InstallBanner';
import { SettingsPage } from './components/SettingsPage';
import { AuthPage } from './components/AuthPage';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { useAuth, AuthProvider } from './context/AuthContext';
import { isSupabaseConfigured, signOut } from './lib/supabase';

function AppContent() {
  const { user, loading, tasks, addTask, editTask, removeTask, isCloud } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultHour, setDefaultHour] = useState<number>(7);
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const [activeTab, setActiveTab] = useState<'schedule' | 'tasks'>('schedule');
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { isInstallable, isInstalled, install } = useInstallPrompt();

  const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedToday = todayTasks.filter(t => t.completed).length;

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

  const handleSaveTask = async (task: Task) => {
    const existing = tasks.find(t => t.id === task.id);
    if (existing) {
      await editTask(task.id, task);
    } else {
      await addTask(task);
    }
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await editTask(id, { completed: !task.completed });
    }
  };

  const handleDeleteTask = async (id: string) => {
    await removeTask(id);
  };

  const handleLogout = async () => {
    if (confirm('Выйти из аккаунта?')) {
      await signOut();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📅</div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Show auth page if Supabase configured but not logged in
  if (isSupabaseConfigured() && !user && showAuth) {
    return (
      <AuthPage
        onSuccess={() => setShowAuth(false)}
        onBack={() => setShowAuth(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
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
            <div className="flex items-center gap-2">
              {/* Cloud status */}
              <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${
                isCloud ? 'bg-green-500/10 text-green-300 border border-green-500/30' : 'bg-gray-700/50 text-gray-400 border border-gray-600'
              }`}>
                <span>{isCloud ? '☁️' : '💾'}</span>
                <span>{isCloud ? 'Облако' : 'Локально'}</span>
              </div>

              {/* Settings button */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Настройки"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* User / Login button */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-xs text-gray-300 transition-colors border border-gray-600"
                  title={user.email || 'Выйти'}
                >
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    {(user.email || '?')[0].toUpperCase()}
                  </span>
                  <span className="max-w-[100px] truncate">{user.email}</span>
                </button>
              ) : isSupabaseConfigured() ? (
                <button
                  onClick={() => setShowAuth(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-xs text-blue-300 transition-colors border border-blue-500/30"
                >
                  Войти
                </button>
              ) : null}
            </div>
          </div>
        </header>

        {/* Install Banner */}
        <InstallBanner isInstallable={isInstallable} isInstalled={isInstalled} onInstall={install} />

        {/* Mobile user bar */}
        <div className="sm:hidden flex items-center justify-between mb-3 gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${
            isCloud ? 'bg-green-500/10 text-green-300 border border-green-500/30' : 'bg-gray-700/50 text-gray-400 border border-gray-600'
          }`}>
            <span>{isCloud ? '☁️' : '💾'}</span>
            <span>{isCloud ? 'Облако' : 'Локально'}</span>
          </div>
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2 py-1 bg-gray-700/50 rounded-lg text-xs text-gray-300 border border-gray-600"
            >
              <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                {(user.email || '?')[0].toUpperCase()}
              </span>
              <span className="max-w-[120px] truncate">{user.email}</span>
            </button>
          ) : isSupabaseConfigured() ? (
            <button
              onClick={() => setShowAuth(true)}
              className="px-3 py-1 bg-blue-600/20 rounded-lg text-xs text-blue-300 border border-blue-500/30"
            >
              Войти
            </button>
          ) : null}
        </div>

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

            {/* Sync info */}
            {!isCloud && (
              <div className="mt-4 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <h4 className="text-sm font-medium text-blue-300 mb-2">🔄 Синхронизация</h4>
                <p className="text-xs text-gray-400 mb-3">
                  Настрой Supabase чтобы задачи синхронизировались между телефоном и компьютером!
                </p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-medium rounded-lg transition-colors border border-blue-500/30"
                >
                  Настроить облако
                </button>
              </div>
            )}
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

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPage
          onClose={() => setShowSettings(false)}
          onConfigChange={() => { setShowSettings(false); window.location.reload(); }}
        />
      )}

      {/* Auth Modal */}
      {showAuth && isSupabaseConfigured() && (
        <AuthPage
          onSuccess={() => setShowAuth(false)}
          onBack={() => setShowAuth(false)}
        />
      )}

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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
