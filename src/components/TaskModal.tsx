import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { generateId, HOURS, formatHour } from '../utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task | null;
  defaultDate: string;
  defaultHour?: number;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, defaultDate, defaultHour }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [hour, setHour] = useState(defaultHour || 7);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setDate(task.date);
        setHour(task.hour);
        setPriority(task.priority);
        setDeadline(task.deadline);
        setCategory(task.category);
      } else {
        setTitle('');
        setDescription('');
        setDate(defaultDate);
        setHour(defaultHour || 7);
        setPriority('medium');
        setDeadline('');
        setCategory('');
      }
    }
  }, [task, defaultDate, defaultHour, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: task?.id || generateId(),
      title: title.trim(),
      description: description.trim(),
      date,
      hour,
      priority,
      deadline,
      completed: task?.completed || false,
      category: category.trim(),
    });
    onClose();
  };

  const categories = ['Учёба', 'Борьба', 'Трейдинг', 'Программирование', 'Личное', 'Другое'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-gray-800 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-4">
          {task ? 'Редактировать задачу' : 'Новая задача'}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Название *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Что нужно сделать?"
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Описание</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Детали задачи..."
              rows={2}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Дата</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Время</label>
              <select
                value={hour}
                onChange={e => setHour(Number(e.target.value))}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {HOURS.map(h => (
                  <option key={h} value={h}>{formatHour(h)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Приоритет</label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    priority === p
                      ? p === 'high' ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                        : p === 'medium' ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50'
                        : 'bg-green-500/30 text-green-300 border border-green-500/50'
                      : 'bg-gray-700/50 text-gray-400 border border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {p === 'high' ? '🔴 Высокий' : p === 'medium' ? '🟡 Средний' : '🟢 Низкий'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Дедлайн</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Категория</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? '' : cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                      : 'bg-gray-700/50 text-gray-400 border border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {task ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
};
