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

import { lazy, Suspense } from "react";
import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { StatusBar, Style } from "@capacitor/status-bar";

import { ActivityProvider } from "./context/activityContext";
import { AuthProvider } from "@context/authContext";
import { OjtProvider } from "@context/ojtContext";
import { SupervisorOjtProvider } from "./context/supervisorOjtContext";
import { ReportProvider } from "@context/reportContext";
import { UserProvider } from "@context/userContext";
import RoleRoute from "@components/RoleRoute";

const Register            = lazy(() => import("@pages/Register"));
const Login               = lazy(() => import("@pages/Login"));
const Logout              = lazy(() => import("@pages/Logout"));

const Account             = lazy(() => import("@pages/Account"));
const Activity            = lazy(() => import("@pages/Activity"));
const EditAccount         = lazy(() => import("@pages/EditAccount"));

const Dashboard           = lazy(() => import("@pages/student/Dashboard"));
const DTR                 = lazy(() => import("@pages/student/DTR"));
const ReportDetail        = lazy(() => import("@pages/student/ReportDetail"));
const Reports             = lazy(() => import("@pages/student/Reports"));
const UploadReport        = lazy(() => import("@pages/student/UploadReport"));

const Attendance          = lazy(() => import("@pages/supervisor/Attendance"));
const SupervisorDashboard = lazy(() => import("@pages/supervisor/SupervisorDashboard"));

StatusBar.setOverlaysWebView({ overlay: false });
StatusBar.setStyle({ style: Style.Default });

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <UserProvider>
        <OjtProvider>
          <SupervisorOjtProvider>
            <ReportProvider>
              <ActivityProvider>
                <IonReactRouter>
                  <Suspense fallback={<div>Loading...</div>}>
                    <IonRouterOutlet>
                      <Route     exact path="/register"             component={Register}             />
                      <Route     exact path="/login"                component={Login}                />
                      <Route     exact path="/logout"               component={Logout}               />

                      <RoleRoute exact path="/account"              component={Account}              allowedRoles={["student", "supervisor"]} />
                      <RoleRoute exact path="/activity"             component={Activity}             allowedRoles={["student", "supervisor"]} />
                      <RoleRoute exact path="/edit-account"         component={EditAccount}          allowedRoles={["student", "supervisor"]} />
        
                      <RoleRoute exact path="/dashboard"            component={Dashboard}            allowedRoles={["student"]}               />
                      <RoleRoute exact path="/dtr"                  component={DTR}                  allowedRoles={["student"]}               />
                      <RoleRoute exact path="/reports"              component={Reports}              allowedRoles={["student"]}               />
                      <RoleRoute exact path="/report-detail"        component={ReportDetail}         allowedRoles={["student"]}               />
                      <RoleRoute exact path="/upload-report"        component={UploadReport}         allowedRoles={["student"]}               />
                      
                      <RoleRoute exact path="/attendance"           component={Attendance}           allowedRoles={["supervisor"]}            />
                      <RoleRoute exact path="/supervisor-dashboard" component={SupervisorDashboard}  allowedRoles={["supervisor"]}            />

                      <Redirect to="/login" />
                    </IonRouterOutlet>
                  </Suspense>
                </IonReactRouter>
              </ActivityProvider>
            </ReportProvider>
          </SupervisorOjtProvider>
        </OjtProvider>
      </UserProvider>
    </AuthProvider>
  </IonApp>
);

export default App;

