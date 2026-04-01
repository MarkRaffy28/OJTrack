import React from 'react';
import { IonIcon } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  home, homeOutline, documentText, documentTextOutline, qrCode, qrCodeOutline, statsChart, statsChartOutline,
  person, personOutline,
} from 'ionicons/icons';
import "@css/BottomNav.css";

interface BottomNavProps {
  activeTab?: string;
}

function BottomNav({ activeTab }: BottomNavProps) {
  const location = useLocation();
  const history = useHistory();

  const getActiveTab = () => {
    if (activeTab) return activeTab;
    const path = location.pathname;
    if (path === '/dashboard') return 'home';
    if (path === '/reports') return 'reports';
    if (path === '/dtr') return 'dtr';
    if (path === '/activity') return 'activity';
    if (path === '/account') return 'account';
    return 'home';
  };

  const currentActiveTab = getActiveTab();

  const handleNavigation = (route: string) => {
    history.push(route);
  };

  const navItems = [
    { key: 'home',     route: '/dashboard', iconActive: home,         iconInactive: homeOutline         },
    { key: 'reports',  route: '/reports',   iconActive: documentText,  iconInactive: documentTextOutline  },
    { key: 'activity', route: '/activity',  iconActive: statsChart,    iconInactive: statsChartOutline    },
    { key: 'account',  route: '/account',   iconActive: person,        iconInactive: personOutline        },
  ];

  return (
    <>
      <div className="bottom-nav">
        {/* Left two items */}
        {navItems.slice(0, 2).map((item) => (
          <div key={item.key} className="nav-slot">
            <button
              className={`nav-btn ${currentActiveTab === item.key ? 'active' : ''}`}
              onClick={() => handleNavigation(item.route)}
            >
              <IonIcon icon={currentActiveTab === item.key ? item.iconActive : item.iconInactive} />
            </button>
          </div>
        ))}

        {/* Center spacer */}
        <div className="nav-slot center-slot" />

        {/* Right two items */}
        {navItems.slice(2).map((item) => (
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

      {/* Center floating DRT button — outside the nav so it can overflow cleanly */}
      <div className="center-btn-wrapper">
        <button
          className={`center-btn ${currentActiveTab === 'dtr' ? 'active' : ''}`}
          onClick={() => handleNavigation('/dtr')}
        >
          <IonIcon icon={currentActiveTab === 'dtr' ? qrCode : qrCodeOutline} />
        </button>
      </div>

    </>
  );
};

export default BottomNav;