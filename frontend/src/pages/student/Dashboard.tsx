import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { IonPage, IonContent, IonIcon, IonSelect, IonSelectOption, IonRefresher, IonRefresherContent, RefresherEventDetail } from '@ionic/react';
import { timeOutline, documentTextOutline, cloudUploadOutline, qrCodeOutline, chevronDownCircleOutline } from 'ionicons/icons';
import { useOjt } from '@context/ojtContext';
import { useUser } from '@context/userContext';
import { useActivity } from '@context/activityContext';
import { useNavigation } from '@hooks/useNavigation';
import { useOjtProgress } from '@hooks/useOJtProgress';
import { getGreeting } from '@utils/date';
import Avatar from '@components/Avatar';
import BottomNav from '@components/BottomNav';
import RecentActivity from '@components/RecentActivity';

function Dashboard() {
  const { navigate } = useNavigation();
  const location = useLocation();
  const { ojtRecords, currentOjt, selectedSchoolYear, selectSchoolYear, fetchAllOjts } = useOjt();
  const { user, refreshUser } = useUser();
  const { activities, getLatestActivities, loadingActivities, fetchActivities } = useActivity();
  const { requiredHours, renderedHours, remainingHours, progressPercentage } = useOjtProgress(currentOjt);

  useEffect(() => {
    fetchActivities();
    refreshUser();
  }, [fetchActivities, refreshUser]);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await Promise.all([
        refreshUser(),
        fetchAllOjts(),
        fetchActivities()
      ]);
    } catch (error) {
      console.error("Refresh failed", error);
    } finally {
      event.detail.complete();
    }
  };
  
  return (
    <IonPage>
      <IonContent fullscreen className="dashboard-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode="md">
          <IonRefresherContent 
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="crescent"
          />
        </IonRefresher>

        {/* Hero Header */}
        <div className="dash-hero">
          <div className="dash-hero-bg" />
          <div className="dash-hero-inner">
            <div className="dash-hero-top">
              <div className="acc-dash-avatar-wrap">
                <Avatar
                  src={user?.profilePicture}
                  name={user?.fullName || 'User'}
                  className="acc-dash-avatar"
                />
              </div>
              
              {/* OJT Selector */}
              <div className="dash-ojt-selector">
                <IonSelect 
                  value={selectedSchoolYear} 
                  interface="popover"
                  onIonChange={e => selectSchoolYear(e.detail.value)}
                  className="dash-year-select"
                >
                  {ojtRecords.map(ojt => (
                    <IonSelectOption key={ojt.id} value={ojt.academicYear}>
                      A.Y. {ojt.academicYear} - {ojt.term} Term
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            </div>
            
            <div className="dash-greeting">
              <p className="dash-greeting-sub">{getGreeting()} 👋</p>
              <h1 className="dash-greeting-name">{user?.firstName}</h1>
            </div>
          </div>
        </div>

        <div className="dash-body" style={{ minHeight: '80vh', paddingBottom: '100px' }}>

          {/* Progress Card */}<br/> <br />
          <div className="dash-card progress-main-card">
            <div className="progress-card-label">
              <span className="progress-card-tag">{currentOjt?.officeName || "OJT Progress"}</span>
              <span className="progress-pct">{progressPercentage.toFixed(1)}%</span>
            </div>

            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }}>
                <div className="progress-glow" />
              </div>
            </div>

            <div className="hours-row">
              <div className="hours-pill required-pill">
                <span className="hours-pill-value">{requiredHours}</span>
                <span className="hours-pill-label">Required</span>
              </div>
              <div className="hours-divider" />
              <div className="hours-pill rendered-pill">
                <span className="hours-pill-value">{renderedHours}</span>
                <span className="hours-pill-label">Rendered</span>
              </div>
              <div className="hours-divider" />
              <div className="hours-pill remaining-pill">
                <span className="hours-pill-value">{remainingHours}</span>
                <span className="hours-pill-label">Remaining</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dash-section-header">
            <span className="dash-section-title">Quick Actions</span>
          </div>
          <div className="quick-actions-grid">
            <button className="qa-card qa-timein" onClick={() => navigate('/dtr')}>
              <div className="qa-icon"><IonIcon icon={qrCodeOutline} /></div>
              <span className="qa-label">Time In/Out</span>
            </button>
            <button className="qa-card qa-report" onClick={() => navigate('/upload-report')}>
              <div className="qa-icon"><IonIcon icon={cloudUploadOutline} /></div>
              <span className="qa-label">New Report</span>
            </button>
            <button className="qa-card qa-activity" onClick={() => navigate('/activity')}>
              <div className="qa-icon"><IonIcon icon={timeOutline} /></div>
              <span className="qa-label">Activities</span>
            </button>
            <button className="qa-card qa-dtr" onClick={() => navigate('/reports')}>
              <div className="qa-icon"><IonIcon icon={documentTextOutline} /></div>
              <span className="qa-label">Reports</span>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="dash-section-header">
            <span className="dash-section-title">Recent Activity</span>
            <button className="dash-view-all" onClick={() => navigate('/activity')}>View All</button>
          </div>

          <RecentActivity activities={activities} loading={loadingActivities} />

        </div>
      </IonContent>
      <BottomNav activeTab="home" />
    </IonPage>
  );
};

export default Dashboard;