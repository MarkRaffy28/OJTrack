import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";
import "@theme/variables.css";
import "@css/App.css";

import React, { lazy, Suspense } from "react";
import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact, IonSpinner } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { StatusBar, Style } from "@capacitor/status-bar";

import { initAPI } from "@api/api";

import { ActivityProvider } from "@context/activityContext";
import { AuthProvider, useAuth } from "@context/authContext";
import { ExitModalProvider } from "@context/exitModalContext"; 
import { OjtProvider } from "@context/ojtContext";
import { NetworkProvider } from "@context/networkContext";
import { ReportProvider } from "@context/reportContext";
import { SupervisorOjtProvider } from "@context/supervisorOjtContext";
import { UserProvider } from "@context/userContext";
import NetworkAlert from "@components/NetworkAlert";
import RoleRoute from "@components/RoleRoute";

const Register            = lazy(() => import("@pages/Register"));
const Login               = lazy(() => import("@pages/Login"));
const Logout              = lazy(() => import("@pages/Logout"));

const Account             = lazy(() => import("@pages/Account"));
const Activity            = lazy(() => import("@pages/Activity"));
const EditAccount         = lazy(() => import("@pages/EditAccount"));
const Reports             = lazy(() => import("@pages/Reports"));

const Dashboard           = lazy(() => import("@pages/student/Dashboard"));
const DTR                 = lazy(() => import("@pages/student/DTR"));
const UploadReport        = lazy(() => import("@pages/student/UploadReport"));

const Attendance          = lazy(() => import("@pages/supervisor/Attendance"));
const SupervisorDashboard = lazy(() => import("@pages/supervisor/SupervisorDashboard"));
const Trainees            = lazy(() => import("@pages/supervisor/Trainees"));
const TraineeDetail       = lazy(() => import("@pages/supervisor/TraineeDetail"));

StatusBar.setOverlaysWebView({ overlay: false });
StatusBar.setStyle({ style: Style.Default });

setupIonicReact();
initAPI();

const AppRoutes: React.FC = () => {
  const { loading, role } = useAuth();

  return (
    <Suspense fallback={
      <div className="app-route">
        <IonSpinner name="crescent" color="primary" />
        <p>Loading...</p>
      </div>
    }>
      <IonRouterOutlet>
        <Route     exact path="/register"             component={Register}             />
        <Route     exact path="/login"                component={Login}                />
        <Route     exact path="/logout"               component={Logout}               />

        <RoleRoute exact path="/account"              component={Account}              allowedRoles={["student", "supervisor"]} />
        <RoleRoute exact path="/activity"             component={Activity}             allowedRoles={["student", "supervisor"]} />
        <RoleRoute exact path="/reports"              component={Reports}              allowedRoles={["student", "supervisor"]} />
        <RoleRoute exact path="/edit-account"         component={EditAccount}          allowedRoles={["student", "supervisor"]} />

        <RoleRoute exact path="/dashboard"            component={Dashboard}            allowedRoles={["student"]}               />
        <RoleRoute exact path="/dtr"                  component={DTR}                  allowedRoles={["student"]}               />
        <RoleRoute exact path="/upload-report"        component={UploadReport}         allowedRoles={["student"]}               />

        <RoleRoute exact path="/attendance"           component={Attendance}           allowedRoles={["supervisor"]}            />
        <RoleRoute exact path="/supervisor-dashboard" component={SupervisorDashboard}  allowedRoles={["supervisor"]}            />
        <RoleRoute exact path="/trainees"             component={Trainees}             allowedRoles={["supervisor"]}            />
        <RoleRoute exact path="/trainee-detail/:id"   component={TraineeDetail}        allowedRoles={["supervisor"]}            />

        <Route exact path="/">
          <Redirect to={loading ? "/login" : role === 'student' ? "/dashboard" : role === 'supervisor' ? "/supervisor-dashboard" : "/login"} />
        </Route>
      </IonRouterOutlet>
    </Suspense>
  );
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <NetworkProvider>
        <NetworkAlert />
        <AuthProvider>
          <UserProvider>
            <OjtProvider>
              <SupervisorOjtProvider>
                <ReportProvider>
                  <ActivityProvider>
                    <ExitModalProvider>
                      <AppRoutes />
                    </ExitModalProvider>
                  </ActivityProvider>
                </ReportProvider>
              </SupervisorOjtProvider>
            </OjtProvider>
          </UserProvider>
        </AuthProvider>
      </NetworkProvider>
    </IonReactRouter>
  </IonApp>
);

export default App;
