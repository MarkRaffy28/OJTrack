import React, { createContext, useContext, useEffect, useState, FC, ReactNode } from 'react';
import { Network, ConnectionStatus } from '@capacitor/network';

interface NetworkContextType {
  isConnected: boolean;
  connectionType: string;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  connectionType: 'unknown',
});

export const NetworkProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: true,
    connectionType: 'unknown',
  });

  useEffect(() => {
    let handler: any;

    const setup = async () => {
      const initialStatus = await Network.getStatus();
      setStatus(initialStatus);

      handler = await Network.addListener('networkStatusChange', (newStatus) => {
        setStatus(newStatus);
      });
    };

    setup();

    return () => {
      if (handler) {
        handler.remove();
      }
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ 
      isConnected: status.connected, 
      connectionType: status.connectionType 
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
