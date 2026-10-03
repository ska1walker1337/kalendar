import React, { useState } from 'react';
import { signUp, signIn } from '../lib/supabase';

interface AuthPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onSuccess();
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setMessage('✅ Аккаунт создан! Проверь почту для подтверждения, затем войди.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            📅 Мой Планировщик
          </h1>
          <p className="text-sm text-gray-400 mt-2">Войди или создай аккаунт</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                isLogin ? 'bg-blue-600 text-white' : 'bg-gray-700/50 text-gray-400'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                !isLogin ? 'bg-blue-600 text-white' : 'bg-gray-700/50 text-gray-400'
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? '⏳ Загрузка...' : isLogin ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>

          {isLogin && (
            <p className="text-xs text-gray-500 text-center mt-4">
              Забыл пароль? Восстанови через Supabase Dashboard
            </p>
          )}
        </div>

        <button
          onClick={onBack}
          className="w-full mt-4 py-2.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700/50 transition-colors text-sm"
        >
          ← Продолжить без аккаунта (локально)
        </button>
      </div>
    </div>
  );
};
