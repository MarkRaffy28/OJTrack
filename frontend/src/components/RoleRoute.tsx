import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { IonSpinner } from '@ionic/react';
import { useAuth } from '@context/authContext';

interface RoleRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  allowedRoles: string[];
}

function RoleRoute({component: Component, allowedRoles, ...rest}: RoleRouteProps) {
  const { role, loading } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (loading) return (
          <div className="app-route">
            <IonSpinner name="crescent" color="primary" />
          </div>
        );

        return role && allowedRoles.includes(role) ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        );
      }}
    />
  );
}

export default RoleRoute;