import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';
import './css/App.css'

import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { StatusBar, Style } from '@capacitor/status-bar';

import { AuthProvider } from './context/authContext';
import { OjtProvider } from './context/ojtContext';
import { UserProvider } from './context/userContext';
import { RoleRoute } from './components/RoleRoute';

import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './pages/Logout';

import Qr from './pages/Qr';

import Dashboard from './pages/student/Dashboard';
import DTR from './pages/student/DTR';


StatusBar.setOverlaysWebView({ overlay: false });
StatusBar.setStyle({ style: Style.Default });

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <UserProvider>
        <OjtProvider>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/logout" component={Logout} />
              <Route exact path="/qr" component={Qr} />

              <RoleRoute exact path="/dashboard" component={Dashboard} allowedRoles={['student']} />
              <RoleRoute exact path="/dtr" component={DTR} allowedRoles={['student']} />

              <Redirect to="login" />
            </IonRouterOutlet>
          </IonReactRouter>
        </OjtProvider>
      </UserProvider>
    </AuthProvider>
  </IonApp>
); 

export default App;
