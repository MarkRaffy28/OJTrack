import React from 'react';
import { IonIcon } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import {
  calendar, calendarOutline, home, homeOutline, people, peopleOutline, documentText, documentTextOutline, person, personOutline, 
  statsChart, statsChartOutline, 
} from 'ionicons/icons';
import { useNavigation } from '@hooks/useNavigation';
import "@css/BottomNav.css";

interface BottomNavProps {
  activeTab?: string;
}

function SupervisorBottomNav({ activeTab }: BottomNavProps) {
  const location = useLocation();
  const { navigate } = useNavigation();

  const getActiveTab = () => {
    if (activeTab) return activeTab;
    const path = location.pathname;
    if (path === '/supervisor-dashboard') return 'home';
    if (path === '/trainees') return 'trainees';
    if (path === '/attendance') return 'attendance';
    if (path === '/reports') return 'reports';
    if (path === '/activity') return 'activity';
    if (path === '/account') return 'account';
    return 'home';
  };

  const currentActiveTab = getActiveTab();

  const navItems = [
    { key: 'home',       route: '/supervisor-dashboard',       iconActive: home,         iconInactive: homeOutline         },
    { key: 'trainees',   route: '/trainees',                   iconActive: people,       iconInactive: peopleOutline       },
    { key: 'attendance', route: '/attendance',                 iconActive: calendar,     iconInactive: calendarOutline     },
    { key: 'reports',    route: '/reports',                    iconActive: documentText, iconInactive: documentTextOutline },
    { key: 'activity',   route: '/activity',                   iconActive: statsChart,   iconInactive: statsChartOutline   },
    { key: 'account',    route: '/account',                    iconActive: person,       iconInactive: personOutline       },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <div key={item.key} className="nav-slot">
          <button
            className={`nav-btn ${currentActiveTab === item.key ? 'active' : ''}`}
            onClick={(e) => {
              e.currentTarget.blur();
              navigate(item.route);
            }}
          >
            <IonIcon icon={currentActiveTab === item.key ? item.iconActive : item.iconInactive} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default SupervisorBottomNav;
