import React, { useState } from 'react';

interface InstallBannerProps {
  isInstallable: boolean;
  isInstalled: boolean;
  onInstall: () => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ isInstallable, isInstalled, onInstall }) => {
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">📱</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white mb-1">Установи на телефон!</h4>
          <p className="text-xs text-gray-300 mb-3">
            {isInstallable ? (
              'Нажми кнопку ниже, чтобы добавить планировщик на главный экран'
            ) : isIOS ? (
              'В Safari нажми кнопку "Поделиться" ↗️ → "На экран «Домой»"'
            ) : isAndroid ? (
              'В Chrome нажми ⋮ → "Добавить на главный экран"'
            ) : (
              'Открой этот сайт в браузере на телефоне и добавь на главный экран'
            )}
          </p>
          <div className="flex gap-2">
            {isInstallable && (
              <button
                onClick={onInstall}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                ⬇️ Установить
              </button>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs rounded-lg transition-colors"
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
