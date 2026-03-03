import React from 'react';
import { IonIcon } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import { homeOutline, documentOutline, documentTextOutline, barChartOutline, personOutline } from 'ionicons/icons';

interface BottomNavProps {
  activeTab?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const location = useLocation();
  const history = useHistory();

  // Determine active tab from current location if not provided
  const getActiveTab = () => {
    if (activeTab) return activeTab;
    
    const path = location.pathname;
    if (path === '/dashboard') return 'home';
    if (path === '/dtr') return 'dtr';
    if (path === '/reports') return 'reports';
    if (path === '/activity') return 'activity';
    if (path === '/account') return 'account';
    return 'home';
  };

  const currentActiveTab = getActiveTab();

  const handleNavigation = (route: string) => {
    history.push(route);
  };

  return (
    <div className="bottom-nav">
      <button
        className={`nav-item ${currentActiveTab === 'home' ? 'active' : ''}`}
        onClick={() => handleNavigation('/dashboard')}
      >
        <IonIcon icon={homeOutline} />
        <span>Home</span>
      </button>
      <button
        className={`nav-item ${currentActiveTab === 'dtr' ? 'active' : ''}`}
        onClick={() => handleNavigation('/dtr')}
      >
        <IonIcon icon={documentOutline} />
        <span>DTR</span>
      </button>
      <button
        className={`nav-item ${currentActiveTab === 'reports' ? 'active' : ''}`}
        onClick={() => handleNavigation('/reports')}
      >
        <IonIcon icon={documentTextOutline} />
        <span>Reports</span>
      </button>
      <button
        className={`nav-item ${currentActiveTab === 'activity' ? 'active' : ''}`}
        onClick={() => handleNavigation('/activity')}
      >
        <IonIcon icon={barChartOutline} />
        <span>Activity</span>
      </button>
      <button
        className={`nav-item ${currentActiveTab === 'account' ? 'active' : ''}`}
        onClick={() => handleNavigation('/account')}
      >
        <IonIcon icon={personOutline} />
        <span>Account</span>
      </button>
    </div>
  );
};

export default BottomNav;
