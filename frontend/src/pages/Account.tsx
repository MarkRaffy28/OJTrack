import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonIcon, IonBadge, IonRefresher, IonRefresherContent, RefresherEventDetail } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import {
  personOutline, mailOutline, calendarOutline, shieldCheckmarkOutline, logOutOutline, lockClosedOutline, documentTextOutline, createOutline, 
  chevronForwardOutline, transgenderOutline, personCircleOutline, locationOutline, checkmarkCircleOutline, statsChartOutline, chevronDownCircleOutline,
  businessOutline, syncOutline
} from 'ionicons/icons';
import { useAuth } from '@context/authContext';
import { useOjt } from '@context/ojtContext';
import { useUser, isStudent, isSupervisor } from '@context/userContext';
import { useSupervisorOjt } from '@context/supervisorOjtContext';
import { useNavigation } from '@hooks/useNavigation';
import { useOjtProgress } from '@hooks/useOJtProgress';
import { formatDate } from '@utils/date';
import { capitalize } from '@utils/string';
import BottomNav from '@components/BottomNav';
import ChangePasswordModal from '@components/ChangePasswordModal';
import LogoutModal from '@components/LogoutModal';
import SupervisorBottomNav from '@components/SupervisorBottomNav';
import TermsModal from '@components/TermsModal';
import VerifyEmailModal from '@components/VerifyEmailModal';

function Account() {
  const location = useLocation();
  const { currentOjt } = useOjt();
  const { logout } = useAuth();
  const { user, refreshUser } = useUser();
  const { progressPercentage } = useOjtProgress(currentOjt);
  const { stats } = useSupervisorOjt();
  const [showLogoutModal, setShowLogoutModal]       = useState(false);
  const [isLoggingOut, setIsLoggingOut]             = useState(false);
  const [showTermsModal, setShowTermsModal]         = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showVerifyModal, setShowVerifyModal]       = useState(false);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await refreshUser();
    event.detail.complete();
  };

  const hasOpenModal = showLogoutModal || showTermsModal || showChangePassword || showVerifyModal;

  const { navigate } = useNavigation(hasOpenModal ? {
    onBack: () => {
      if (showLogoutModal) setShowLogoutModal(false);
      else if (showTermsModal) setShowTermsModal(false);
      else if (showChangePassword) setShowChangePassword(false);
      else if (showVerifyModal) setShowVerifyModal(false);
    }
  } : {});

  useEffect(() => {
    refreshUser();
  }, [location.pathname]);

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
    { icon: personCircleOutline,    label: 'Username',         value: user?.username                               || '—' },
    { icon: shieldCheckmarkOutline, label: isStudent(user) ? 'Student ID' : 'Employee ID', value: user?.userId     || '—' },
    { icon: calendarOutline,        label: 'Birthday',         value: user?.birthDate ? formatDate(user?.birthDate) : '—' },
    { icon: transgenderOutline,     label: 'Gender',           value: user?.gender                                 || '—' },
    { icon: locationOutline,        label: 'Address',          value: user?.address                                || '—' },
    { 
      icon: mailOutline,            
      label: 'Email Address',    
      value: user?.emailAddress || '—',
      extra: user?.emailAddress ? (
        user.isEmailVerified ? (
          <span className="acc-verified-badge"><IonIcon icon={checkmarkCircleOutline} /> Verified</span>
        ) : (
          <button className="acc-verify-btn" onClick={() => setShowVerifyModal(true)}>Verify</button>
        )
      ) : null
    },
  ];

  const ojtDetails = (isStudent(user) && currentOjt) ? [
    { icon: syncOutline,            label: 'Progress',             value: `${progressPercentage}%`                               || '—' },
    { icon: shieldCheckmarkOutline, label: 'Status',               value: capitalize(currentOjt.status)                          || '—' },
    { icon: calendarOutline,        label: 'Start Date',           value: currentOjt.startDate ? formatDate(currentOjt.startDate) : '—' },
    { icon: calendarOutline,        label: 'End Date',             value: currentOjt.endDate ? formatDate(currentOjt.endDate)     : '—' },
    { icon: personOutline,          label: 'Supervisor Name',      value: currentOjt.supervisorName                              || '—' },
    { icon: personCircleOutline,    label: 'Supervisor Position',  value: currentOjt.supervisorPosition                          || '—' },
    { icon: businessOutline,        label: 'Office Name',          value: currentOjt.officeName                                  || '—' },
  ] : [];

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="acc-content"
        scrollY={!showLogoutModal && !showTermsModal && !showChangePassword}
      >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode="md">
          <IonRefresherContent 
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="crescent"
          />
        </IonRefresher>
        <div className="acc-container" style={{ minHeight: '100%', paddingBottom: '100px' }}>

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
                <button className="acc-avatar-edit" onClick={() => navigate('/edit-account')}>
                  <IonIcon icon={createOutline} />
                </button>
              </div>
              <p className="acc-name">{user?.fullName}</p>
              <p className="acc-role">{isSupervisor(user) ? 'OJT Supervisor' : 'Trainee'}</p>
              {isStudent(user) && (
                <>
                  <span className="acc-program-badge">{user.program}</span>
                  <span className="acc-program-badge">{user.major}</span>
                </>
              )}
              {isSupervisor(user) && (
                <>
                  <span className="acc-program-badge">{user.officeName}</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="acc-stats-card">
            {isStudent(user) ? (
              <>
                <div className="acc-stat">
                  <p className="acc-stat-val">{currentOjt?.academicYear}</p>
                  <p className="acc-stat-lbl">Academic Year</p>
                </div>
                <div className="acc-stat-div" />
                <div className="acc-stat">
                  <p className="acc-stat-val">{currentOjt?.term ? capitalize(currentOjt.term) : '—'}</p>
                  <p className="acc-stat-lbl">Term</p>
                </div>
                <div className="acc-stat-div" />
                <div className="acc-stat">
                  <p className="acc-stat-val">{user.year} - {user.section}</p>
                  <p className="acc-stat-lbl">Year & Section</p>
                </div>
              </>
            ) : (
              <>
                <div className="acc-stat">
                  <p className="acc-stat-val">{isSupervisor(user) ? user.position : 'Supervisor'}</p>
                  <p className="acc-stat-lbl">Position</p>
                </div>
                <div className="acc-stat-div" />
                <div className="acc-stat">
                  <p className="acc-stat-val">{stats?.total || '0'}</p>
                  <p className="acc-stat-lbl">Trainees</p>
                </div>
              </>
            )}
          </div>


          {/* OJT Information (Student only) */}
          {isStudent(user) && currentOjt && (
            <div className="acc-section-card">
              <div className="acc-section-header">
                <span className="acc-section-title">OJT Information</span>
              </div>
              <div className="acc-detail-list">
                {ojtDetails.map((d, i) => (
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
          )}

          {/* Profile Info */}
          <div className="acc-section-card">
            <div className="acc-section-header">
              <span className="acc-section-title">Profile Information</span>
              <button className="acc-edit-btn" onClick={() => navigate('/edit-account')}>
                <IonIcon icon={createOutline} /> Edit
              </button>
            </div>
            <div className="acc-detail-list">
              {details.map((d, i) => (
                <div key={i} className="acc-detail-item">
                  <div className="acc-detail-icon"><IonIcon icon={d.icon} /></div>
                  <div className="acc-detail-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                      <p className="acc-detail-lbl">{d.label}</p>
                      <p className="acc-detail-val">{d.value}</p>
                    </div>
                    {d.extra && d.extra}
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

      {isSupervisor(user) ? (
        <SupervisorBottomNav activeTab="account" />
      ) : (
        <BottomNav activeTab="account" />
      )}

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

      <VerifyEmailModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />
    </IonPage>
  );
};

export default Account;