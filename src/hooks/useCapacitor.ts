import { useEffect, useState } from 'react';

interface CapacitorUtils {
  isCapacitor: boolean;
  platform: 'web' | 'ios' | 'android';
  canGoBack: boolean;
  goBack: () => void;
  exitApp: () => void;
  setStatusBarStyle: (style: 'DARK' | 'LIGHT') => void;
  showSplash: () => void;
  hideSplash: () => void;
}

export const useCapacitor = (): CapacitorUtils => {
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [platform, setPlatform] = useState<'web' | 'ios' | 'android'>('web');
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const capacitorAvailable = !!(window as any).Capacitor;
      setIsCapacitor(capacitorAvailable);
      
      if (capacitorAvailable) {
        const currentPlatform = (window as any).Capacitor.getPlatform();
        setPlatform(currentPlatform);
        
        // Android için geri tuşu kontrolü
        if (currentPlatform === 'android') {
          setCanGoBack(window.history.length > 1);
        }
      }
    }
  }, []);

  const goBack = () => {
    if (canGoBack) {
      window.history.back();
    } else if (isCapacitor && platform === 'android') {
      // Android'de ana sayfaya git veya uygulamadan çık
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      } else {
        exitApp();
      }
    }
  };

  const exitApp = async () => {
    if (isCapacitor && (window as any).Capacitor?.Plugins?.App) {
      try {
        await (window as any).Capacitor.Plugins.App.exitApp();
      } catch (error) {
        console.log('Exit app error:', error);
      }
    }
  };

  const setStatusBarStyle = async (style: 'DARK' | 'LIGHT') => {
    if (isCapacitor && (window as any).Capacitor?.Plugins?.StatusBar) {
      try {
        await (window as any).Capacitor.Plugins.StatusBar.setStyle({ style });
      } catch (error) {
        console.log('Status bar style error:', error);
      }
    }
  };

  const showSplash = async () => {
    if (isCapacitor && (window as any).Capacitor?.Plugins?.SplashScreen) {
      try {
        await (window as any).Capacitor.Plugins.SplashScreen.show();
      } catch (error) {
        console.log('Show splash error:', error);
      }
    }
  };

  const hideSplash = async () => {
    if (isCapacitor && (window as any).Capacitor?.Plugins?.SplashScreen) {
      try {
        await (window as any).Capacitor.Plugins.SplashScreen.hide();
      } catch (error) {
        console.log('Hide splash error:', error);
      }
    }
  };

  return {
    isCapacitor,
    platform,
    canGoBack,
    goBack,
    exitApp,
    setStatusBarStyle,
    showSplash,
    hideSplash
  };
};