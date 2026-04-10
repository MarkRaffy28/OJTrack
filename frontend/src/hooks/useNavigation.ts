import { useEffect } from 'react';
import { useIonRouter, RouterDirection } from '@ionic/react';
import { App } from '@capacitor/app';

interface UseNavigationOptions {
  onBack?: () => void;
  exitOnBack?: boolean;
}

export const useNavigation = (options: UseNavigationOptions = {}) => {
  const { onBack, exitOnBack = true } = options;
  const ionRouter = useIonRouter();

  useEffect(() => {
    const listener = App.addListener('backButton', () => {
      if (onBack) {
        onBack();
        return;
      }

      if (ionRouter.canGoBack()) {
        ionRouter.goBack();
      } else if (exitOnBack) {
        App.exitApp();
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [onBack, exitOnBack]);

  const navigate = (route: string, direction: RouterDirection = 'forward') => {
    const actionMap: Record<RouterDirection, 'push' | 'pop' | 'replace'> = {
      forward : 'push',      // default - forward
      back    : 'pop',       // slide back animation
      root    : 'replace',   // replace, no back history
      none    : 'replace',   // no animation
    };

    ionRouter.push(route, direction, actionMap[direction] ?? 'push');
  };

  const goBack = () => {
    if (ionRouter.canGoBack()) {
      ionRouter.goBack();
    }
  };

  return { navigate, goBack };
};