import React from 'react';
import { IonIcon } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  home, homeOutline, people, peopleOutline, documentText, documentTextOutline,
  person, personOutline,
} from 'ionicons/icons';
import "@css/BottomNav.css";

interface BottomNavProps {
  activeTab?: string;
}

function SupervisorBottomNav({ activeTab }: BottomNavProps) {
  const location = useLocation();
  const history = useHistory();

  const getActiveTab = () => {
    if (activeTab) return activeTab;
    const path = location.pathname;
    if (path === '/supervisor-dashboard') return 'home';
    if (path === '/supervisor-trainees') return 'trainees';
    if (path === '/pending-reports') return 'reports';
    if (path === '/supervisor-account') return 'account';
    return 'home';
  };

  const currentActiveTab = getActiveTab();

  const handleNavigation = (route: string) => {
    history.push(route);
  };

  const navItems = [
    { key: 'home',     route: '/supervisor-dashboard',       iconActive: home,         iconInactive: homeOutline         },
    { key: 'trainees', route: '/supervisor-trainees',        iconActive: people,       iconInactive: peopleOutline       },
    { key: 'reports',  route: '/supervisor-pending-reports', iconActive: documentText, iconInactive: documentTextOutline },
    { key: 'account',  route: '/supervisor-account',         iconActive: person,       iconInactive: personOutline       },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <div key={item.key} className="nav-slot">
          <button
            className={`nav-btn ${currentActiveTab === item.key ? 'active' : ''}`}
            onClick={() => handleNavigation(item.route)}
          >
            <IonIcon icon={currentActiveTab === item.key ? item.iconActive : item.iconInactive} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default SupervisorBottomNav;
