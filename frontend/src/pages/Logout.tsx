import React, { useEffect } from 'react'
import { useIonRouter } from '@ionic/react';
import { useAuth } from '@context/authContext';

function Logout() {
  const { logout } = useAuth();
  const ionRouter = useIonRouter();
  
  useEffect(() => {
    const performLogout = async () => {
      await logout();
      ionRouter.push('/login', 'root', 'replace');
    };
    performLogout();
  }, [logout, ionRouter]);

  return (
    <div>Logging out...</div>
  )
}

export default Logout