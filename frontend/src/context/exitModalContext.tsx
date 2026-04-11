import React, { createContext, useCallback, useContext, useState, FC, ReactNode } from 'react';
import { App } from '@capacitor/app';
import ExitModal from '@components/ExitModal';

interface ExitModalContextValue {
  promptExit: () => void;
}

const ExitModalContext = createContext<ExitModalContextValue>({
  promptExit: () => {},
});

export const useExitModal = () => useContext(ExitModalContext);

export const ExitModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const promptExit = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleExit = useCallback(() => {
    setIsOpen(false);
    App.exitApp();
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ExitModalContext.Provider value={{ promptExit }}>
      {children}
      <ExitModal isOpen={isOpen} onExit={handleExit} onCancel={handleCancel} />
    </ExitModalContext.Provider>
  );
};
