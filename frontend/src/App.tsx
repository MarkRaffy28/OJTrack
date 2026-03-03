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
import { RoleRoute } from './components/RoleRoute';

import Register from './pages/Register';
import Login from './pages/Login';

import Dashboard from './pages/user/Dashboard';

StatusBar.setOverlaysWebView({ overlay: false });
StatusBar.setStyle({ style: Style.Default });

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />

          <RoleRoute exact path="/dashboard" component={Dashboard} allowedRoles={['user']} />
          <Redirect to="login" />
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
); 

export default App;
