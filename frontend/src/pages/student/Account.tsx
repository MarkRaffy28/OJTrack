import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonIcon, IonBadge } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  personOutline, mailOutline, calendarOutline, shieldCheckmarkOutline, logOutOutline, lockClosedOutline, documentTextOutline,
  createOutline, chevronForwardOutline, transgenderOutline, personCircleOutline, locationOutline,
} from 'ionicons/icons';
import { useUser, isStudent } from '@context/userContext';
import { useOjt } from '@context/ojtContext';
import { useOjtProgress } from '@hooks/useOJtProgress';
import { useAuth } from '@context/authContext';
import BottomNav from '@components/BottomNav';
import ChangePasswordModal from '@components/ChangePasswordModal';
import LogoutModal from '@components/LogoutModal';
import TermsModal from '@components/TermsModal';
import { formatDate } from '@utils/date';

function Account() {
  const history = useHistory();
  const { currentOjt } = useOjt();
  const { logout } = useAuth();
  const { user, refreshUser } = useUser();
  const { progressPercentage } = useOjtProgress(currentOjt);
  const [showLogoutModal, setShowLogoutModal]       = useState(false);
  const [isLoggingOut, setIsLoggingOut]             = useState(false);
  const [showTermsModal, setShowTermsModal]         = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    refreshUser();
  }, []);

  const menuItems = [
    {
      icon: lockClosedOutline,
      title: 'Change Password',
      subtitle: 'Update your account password',
      badge: null, badgeColor: '',
      onPress: () => setShowChangePassword(true),
    },
    {
      icon: documentTextOutline,
      title: 'Terms of Service',
      subtitle: 'Read our policies',
      badge: null, badgeColor: '',
      onPress: () => setShowTermsModal(true),
    },
  ];

  const confirmLogout = () => { setIsLoggingOut(true); };

  const details = [
    { icon: personCircleOutline,    label: 'Username',         value: user?.username                 || '—' },
    { icon: shieldCheckmarkOutline, label: 'Student ID',       value: isStudent(user) ? user.userId   : '—' },
    { icon: calendarOutline,        label: 'Birthday',         value: formatDate(user?.birthDate || '') },
    { icon: transgenderOutline,     label: 'Gender',           value: user?.gender                   || '—' },
    { icon: locationOutline,        label: 'Address',          value: user?.address                  || '—' },
    { icon: mailOutline,            label: 'Email Address',    value: user?.emailAddress             || '—' },
  ];

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="acc-content"
        scrollY={!showLogoutModal && !showTermsModal && !showChangePassword}
      >
        <div className="acc-container">

          {/* Profile Hero */}
          <div className="acc-profile-card">
            <div className="acc-cover" />
            <div className="acc-profile-body">
              <div className="acc-avatar-wrap">
                {user?.profilePicture ? (
                  <div className="acc-avatar" style={{ overflow: 'hidden', background: 'transparent', padding: 0 }}>
                    <img src={user?.profilePicture} alt={user?.fullName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
                  </div>
                ) : (
                  <div className="acc-avatar">
                    <IonIcon icon={personOutline} />
                  </div>
                )}
                <button className="acc-avatar-edit" onClick={() => history.push('/edit-account')}>
                  <IonIcon icon={createOutline} />
                </button>
              </div>
              <p className="acc-name">{user?.fullName}</p>
              <p className="acc-role">Trainee</p>
              <span className="acc-program-badge">{isStudent(user) ? user.program : "-"}</span>
              <span className="acc-program-badge">{isStudent(user) ? user.major   : "-"}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="acc-stats-card">
            <div className="acc-stat">
              <p className="acc-stat-val">{isStudent(user) ? user.year : "-"}</p>
              <p className="acc-stat-lbl">Year Level</p>
            </div>
            <div className="acc-stat-div" />
            <div className="acc-stat">
              <p className="acc-stat-val">{user?.userId}</p>
              <p className="acc-stat-lbl">Student ID</p>
            </div>
            <div className="acc-stat-div" />
            <div className="acc-stat">
              <p className="acc-stat-val">{progressPercentage.toFixed(1)}%</p>
              <p className="acc-stat-lbl">OJT Progress</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="acc-section-card">
            <div className="acc-section-header">
              <span className="acc-section-title">Profile Information</span>
              <button className="acc-edit-btn" onClick={() => history.push('/edit-account')}>
                <IonIcon icon={createOutline} /> Edit
              </button>
            </div>
            <div className="acc-detail-list">
              {details.map((d, i) => (
                <div key={i} className="acc-detail-item">
                  <div className="acc-detail-icon"><IonIcon icon={d.icon} /></div>
                  <div className="acc-detail-text">
                    <p className="acc-detail-lbl">{d.label}</p>
                    <p className="acc-detail-val">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings & Support */}
          <div className="acc-section-card">
            <div className="acc-section-header">
              <span className="acc-section-title">Settings &amp; Support</span>
            </div>
            <div className="acc-menu-list">
              {menuItems.map((item, i) => (
                <button key={i} className="acc-menu-item" onClick={item.onPress}>
                  <div className="acc-menu-icon"><IonIcon icon={item.icon} /></div>
                  <div className="acc-menu-text">
                    <p className="acc-menu-title">{item.title}</p>
                    <p className="acc-menu-sub">{item.subtitle}</p>
                  </div>
                  {item.badge
                    ? <IonBadge className="acc-menu-badge" color={item.badgeColor}>{item.badge}</IonBadge>
                    : <IonIcon icon={chevronForwardOutline} className="acc-menu-arrow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <button className="acc-logout-btn" onClick={() => setShowLogoutModal(true)}>
            <IonIcon icon={logOutOutline} /><span>Log Out</span>
          </button>

        </div>
      </IonContent>

      <BottomNav activeTab="account" />

      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        isLoading={isLoggingOut}
        onComplete={logout}
      />

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      {showTermsModal && (
        <TermsModal
          mode="view"
          onClose={() => setShowTermsModal(false)}
        />
      )}
    </IonPage>
  );
};

export default Account;