import React, { useState } from 'react';
import { initSupabase, clearSupabase, isSupabaseConfigured } from '../lib/supabase';

interface SettingsPageProps {
  onClose: () => void;
  onConfigChange: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onClose, onConfigChange }) => {
  const [url, setUrl] = useState(localStorage.getItem('supabase-url') || '');
  const [key, setKey] = useState(localStorage.getItem('supabase-anon-key') || '');
  const [showHelp, setShowHelp] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (url.trim() && key.trim()) {
      initSupabase(url.trim(), key.trim());
      setSaved(true);
      setTimeout(() => {
        onConfigChange();
      }, 1000);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Отключить облачную синхронизацию? Данные на этом устройстве останутся.')) {
      clearSupabase();
      onConfigChange();
    }
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-gray-800 rounded-2xl p-6 w-full max-w-lg border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">⚙️ Настройки</h2>

        {/* Status */}
        <div className={`mb-4 p-3 rounded-lg border ${
          configured ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <p className={`text-sm font-medium ${configured ? 'text-green-300' : 'text-yellow-300'}`}>
            {configured ? '✅ Supabase подключён' : '⚠️ Supabase не настроен'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {configured ? 'Данные синхронизируются между устройствами' : 'Данные хранятся только на этом устройстве'}
          </p>
        </div>

        {/* Supabase config */}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Supabase URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://xxxxx.supabase.co"
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Anon Key</label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!url.trim() || !key.trim()}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saved ? '✅ Сохранено!' : '💾 Сохранить'}
            </button>
            {configured && (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2.5 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-colors font-medium text-sm border border-red-500/30"
              >
                Отключить
              </button>
            )}
          </div>
        </div>

        {/* Help */}
        <div className="mt-6">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showHelp ? '▼' : '▶'} Как настроить Supabase (бесплатно)
          </button>
          
          {showHelp && (
            <div className="mt-3 space-y-3 text-sm text-gray-300 bg-gray-900/50 rounded-lg p-4">
              <div>
                <p className="font-medium text-white mb-1">1. Создай аккаунт на Supabase</p>
                <p className="text-gray-400">Перейди на <span className="text-blue-400">supabase.com</span> и зарегистрируйся (бесплатно)</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">2. Создай новый проект</p>
                <p className="text-gray-400">Нажми "New Project", задай имя и пароль базы данных</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">3. Создай таблицу tasks</p>
                <p className="text-gray-400 mb-2">Перейди в SQL Editor и выполни этот запрос:</p>
                <pre className="bg-gray-800 p-3 rounded text-xs overflow-x-auto text-green-300 border border-gray-700">{`CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  date TEXT NOT NULL,
  hour INTEGER NOT NULL,
  priority TEXT DEFAULT 'medium',
  deadline TEXT DEFAULT '',
  completed BOOLEAN DEFAULT false,
  category TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Включи RLS (безопасность)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Политика: каждый видит только свои задачи
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);`}</pre>
              </div>
              <div>
                <p className="font-medium text-white mb-1">4. Скопируй URL и Anon Key</p>
                <p className="text-gray-400">Перейди в Settings → API и скопируй Project URL и anon/public key</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">5. Включи Email авторизацию</p>
                <p className="text-gray-400">Settings → Authentication → Providers → Email → Enable</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors font-medium text-sm"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
