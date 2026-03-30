import React, { useEffect } from 'react'
import { useIonRouter } from '@ionic/react';
import { useAuth } from '@context/authContext';

function Logout() {
  const { logout } = useAuth();
  const ionRouter = useIonRouter();
  
  useEffect(() => {
    logout();

    ionRouter.push("login");
  });

  return (
    <div>Logout</div>
  )
}

export default Logout