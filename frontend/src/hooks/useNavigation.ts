import { useEffect, useRef } from 'react';
import { useIonRouter, RouterDirection } from '@ionic/react';
import { useExitModal } from '@context/exitModalContext';

interface UseNavigationOptions {
  onBack?: () => void;
  exitOnBack?: boolean;
}

export const useNavigation = (options: UseNavigationOptions = {}) => {
  const { onBack, exitOnBack = true } = options;
  const ionRouter = useIonRouter();
  const { promptExit } = useExitModal();

  const onBackRef      = useRef(onBack);
  const exitOnBackRef  = useRef(exitOnBack);
  const promptExitRef  = useRef(promptExit);

  useEffect(() => {
    onBackRef.current     = onBack;
    exitOnBackRef.current = exitOnBack;
    promptExitRef.current = promptExit;
  }, [onBack, exitOnBack, promptExit]);

  useEffect(() => {
    const handler = (ev: any) => {
      ev.detail.register(999, () => {
        if (onBackRef.current) {
          onBackRef.current();
          return;
        }

        if (ionRouter.canGoBack()) {
          ionRouter.goBack();
        } else if (exitOnBackRef.current) {
          promptExitRef.current();   // Show confirmation modal instead of exiting directly
        }
      });
    };

    document.addEventListener('ionBackButton', handler);

    return () => {
      document.removeEventListener('ionBackButton', handler);
    };
  }, [ionRouter]);

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