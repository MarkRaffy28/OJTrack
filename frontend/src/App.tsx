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

import Register from "@pages/Register";
import Login from "@pages/Login";
import Logout from "@pages/Logout";

import Account from "@pages/Account";
import Activity from "@pages/Activity";
import EditAccount from "@pages/EditAccount";

import Dashboard from "@pages/student/Dashboard";
import DTR from "@pages/student/DTR";
import ReportDetail from "@pages/student/ReportDetail";
import Reports from "@pages/student/Reports";
import UploadReport from "@pages/student/UploadReport";

import Attendance from "@pages/supervisor/Attendance";
import SupervisorDashboard from "@pages/supervisor/SupervisorDashboard";

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
                <IonRouterOutlet>
                  <Route exact path="/register" component={Register} />
                  <Route exact path="/login"    component={Login}    />
                  <Route exact path="/logout"   component={Logout}   />

                  <RoleRoute exact path="/account"       component={Account}       allowedRoles={["student", "supervisor"]} />
                  <RoleRoute exact path="/activity"      component={Activity}      allowedRoles={["student", "supervisor"]} />
                  <RoleRoute exact path="/edit-account"  component={EditAccount}   allowedRoles={["student", "supervisor"]} />

                  <RoleRoute exact path="/dashboard"     component={Dashboard}     allowedRoles={["student"]}               />
                  <RoleRoute exact path="/dtr"           component={DTR}           allowedRoles={["student"]}               />
                  <RoleRoute exact path="/reports"       component={Reports}       allowedRoles={["student"]}               />
                  <RoleRoute exact path="/report-detail" component={ReportDetail}  allowedRoles={["student"]}               />
                  <RoleRoute exact path="/upload-report" component={UploadReport}  allowedRoles={["student"]}               />
                  
                  <RoleRoute exact path="/attendance"           component={Attendance}          allowedRoles={["supervisor"]} />
                  <RoleRoute exact path="/supervisor-dashboard" component={SupervisorDashboard} allowedRoles={["supervisor"]} />

                  <Redirect to="/login" />
                </IonRouterOutlet>
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

