import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed top-14 left-4 right-4 z-50 mx-auto max-w-md flex items-center justify-between gap-2 rounded-xl bg-amber-500/95 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-slate-950 shadow-lg">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>Modo Offline ativo — Seus treinos e cargas continuam salvos no dispositivo.</span>
      </div>
    </div>
  );
};

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable ? (
        <button
          type="button"
          onClick={install}
          className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors whitespace-nowrap shrink-0 ${
            compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm w-full'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Instalar App</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13151B] hover:border-orange-500/50 text-slate-800 dark:text-slate-200 font-medium transition-colors whitespace-nowrap shrink-0 ${
            compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm w-full'
          }`}
        >
          <Download className="w-4 h-4 text-orange-500" />
          <span>{isIOS ? 'Instalar no iPhone' : 'Instalar na Tela de Início'}</span>
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#13151B] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Instalar IRONLOG no iPhone / iOS
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Para usar o IRONLOG em tela cheia como aplicativo nativo e com cache offline completo:
            </p>
            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800">
                <Share className="w-5 h-5 text-orange-500 shrink-0" />
                <span>
                  1. Toque no ícone <strong>Compartilhar</strong> na barra inferior do Safari.
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800">
                <PlusSquare className="w-5 h-5 text-orange-500 shrink-0" />
                <span>
                  2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Nota sobre iOS e Safari: após instalado na Tela de Início (iOS 16.4+), o aplicativo mantém armazenamento isolado e funciona mesmo sem internet na academia.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full min-h-[48px] rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
