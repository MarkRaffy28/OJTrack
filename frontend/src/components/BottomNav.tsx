import React from 'react';
import { IonIcon } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  home, homeOutline,
  documentText, documentTextOutline,
  qrCode, qrCodeOutline,
  statsChart, statsChartOutline,
  person, personOutline,
} from 'ionicons/icons';

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
      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: #ffffff;
          border-top: 1.5px solid #ebebeb;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0;
          z-index: 100;
          /* Make room for the protruding center button */
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        .nav-slot {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }

        /* Empty slot to take up space for the center button */
        .nav-slot.center-slot {
          /* not clickable, just a spacer */
          pointer-events: none;
        }

        .nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          outline: none;
          cursor: pointer;
          padding: 8px 16px;
          color: #aaaaaa;
          transition: color 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-btn ion-icon {
          font-size: 24px;
          transition: color 0.2s ease;
        }

        .nav-btn.active {
          color: #5b4fcf;
        }

        /* Center (DRT) floating button */
        .center-btn-wrapper {
          position: absolute;
          bottom: calc(64px - 28px + env(safe-area-inset-bottom, 0px));
          left: 50%;
          transform: translateX(-50%);
          z-index: 101;
        }

        .center-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #5b4fcf;
          border: none;
          outline: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(91, 79, 207, 0.35);
          -webkit-tap-highlight-color: transparent;
          transition: background 0.2s ease, transform 0.15s ease;
        }

        .center-btn:active {
          transform: scale(0.93);
        }

        .center-btn ion-icon {
          font-size: 26px;
          color: #ffffff;
        }
      `}</style>

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
          className="center-btn"
          onClick={() => handleNavigation('/dtr')}
        >
          <IonIcon icon={currentActiveTab === 'dtr' ? qrCode : qrCodeOutline} />
        </button>
      </div>
    </>
  );
};

export default BottomNav;