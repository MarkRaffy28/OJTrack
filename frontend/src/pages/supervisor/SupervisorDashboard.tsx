import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IonPage, IonContent, IonIcon, IonSelect, IonSelectOption } from '@ionic/react';
import { peopleOutline, documentTextOutline, personOutline, schoolOutline, analyticsOutline, calendarOutline, statsChartOutline } from 'ionicons/icons';
import { useActivity } from '@context/activityContext';
import { useUser, isSupervisor } from '@context/userContext';
import { useSupervisorOjt } from '@context/supervisorOjtContext';
import { getGreeting } from '@utils/date';
import Avatar from '@components/Avatar';
import RecentActivity from '@components/RecentActivity';
import SupervisorBottomNav from '@components/SupervisorBottomNav';
import '@css/Supervisor.css';

function SupervisorDashboard() {
  const history = useHistory();
  const { user } = useUser();
  const { dashboardStats, stats, loading, fetchDashboardStats, setFilters, filters, allOjts, uniqueCohorts } = useSupervisorOjt();
  const { activities, loadingActivities, fetchActivities } = useActivity();
  const location = useLocation();

  const handleNavigation = (route: string) => {
    history.push(route);
  };

  const handleSearch = (e: any) => {
    setFilters({ ...filters, search: e.detail.value || "" });
    if (e.detail.value) {
      history.push('/manage-trainees');
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  useEffect(() => {
    fetchActivities();
  }, [location.pathname, fetchActivities]);


  return (
    <IonPage>
      <IonContent fullscreen className="sv-content">
        <div className="sv-hero">
          <div className="sv-hero-bg" />
          <div className="sv-hero-inner">
            <div className="sv-hero-top">
              <div className="acc-dash-avatar-wrap">
                <Avatar
                   src={user?.profilePicture}
                   name={user?.fullName || 'User'}
                   className="acc-dash-avatar"
                />
              </div>
              <div className="dash-ojt-selector" style={{ marginLeft: 'auto' }}>
                <IonSelect 
                  value={filters.academicYear === 'all' ? 'all' : `${filters.academicYear}|${filters.term}`} 
                  interface="popover"
                  onIonChange={e => {
                    const val = e.detail.value;
                    if (val === 'all') {
                      setFilters(prev => ({ ...prev, academicYear: 'all', term: 'all' }));
                    } else {
                      const [ay, t] = val.split('|');
                      setFilters(prev => ({ ...prev, academicYear: ay, term: t }));
                    }
                  }}
                  className="dash-year-select"
                >
                  <IonSelectOption value="all">All Terms</IonSelectOption>
                  {uniqueCohorts.map(c => (
                    <IonSelectOption key={`${c.academicYear}|${c.term}`} value={`${c.academicYear}|${c.term}`}>
                      A.Y. {c.academicYear} - {c.term} Term
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            </div>
            
            <div className="sv-greeting">
              <p className="sv-greeting-sub">{getGreeting()} 👋</p>
              <h1 className="sv-greeting-name">{user?.firstName}</h1>
              <span className="sv-role-badge">{isSupervisor(user) ? user.position : 'OJT Supervisor'}</span>
            </div>
          </div>
        </div>

        <div className="sv-body">

          {/* Quick Stats Grid */}
          <div className="sv-stats-grid">
            <div className="sv-stat-card sv-stat-purple" onClick={() => handleNavigation('/manage-trainees')}>
              <div className="sv-stat-icon-wrap">
                <IonIcon icon={peopleOutline} />
              </div>
              <p className="sv-stat-num">{stats.total}</p>
              <p className="sv-stat-lbl">Trainees</p>
            </div>
            <div className="sv-stat-card sv-stat-amber" onClick={() => handleNavigation('/review-reports')}>
              <div className="sv-stat-icon-wrap">
                <IonIcon icon={documentTextOutline} />
              </div>
              <p className="sv-stat-num">{dashboardStats?.pendingReports || 0}</p>
              <p className="sv-stat-lbl">Pending</p>
            </div>
            <div className="sv-stat-card sv-stat-green" onClick={() => handleNavigation('/attendance-logs')}>
              <div className="sv-stat-icon-wrap">
                <IonIcon icon={personOutline} />
              </div>
              <p className="sv-stat-num">{dashboardStats?.activeToday || 0}</p>
              <p className="sv-stat-lbl">Active Today</p>
            </div>
          </div>

          {/* Progress Overview Card */}
          <div className="sv-card">
            <div className="sv-card-header">
              <div>
                <p className="sv-card-label">Program Progress</p>
                <h2 className="sv-card-title">Average Completion Rate</h2>
              </div>
              <span className="sv-pct-badge">{stats.completionRate}%</span>
            </div>
            <div className="sv-progress-track">
              <div className="sv-progress-fill" style={{ width: `${stats.completionRate}%` }}>
                <div className="sv-progress-glow" />
              </div>
            </div>
            <div className="sv-progress-legend">
              <span className="sv-legend-item">
                <span className="sv-legend-dot" style={{ background: 'var(--c-amber)' }} />
                Pending: {stats.pending}
              </span>
              <span className="sv-legend-item">
                <span className="sv-legend-dot" style={{ background: 'var(--c-purple)' }} />
                Ongoing: {stats.ongoing}
              </span>
              <span className="sv-legend-item">
                <span className="sv-legend-dot" style={{ background: 'var(--c-green)' }} />
                Completed: {stats.completed}
              </span>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="sv-section-header">
            <span className="sv-section-title">Quick Actions</span>
          </div>
          <div className="sv-qa-grid">
            <button className="sv-qa-card" onClick={() => handleNavigation('/trainees')}>
              <div className="sv-qa-icon qa-purple"><IonIcon icon={schoolOutline} /></div>
              <span className="sv-qa-label">Trainees</span>
            </button>
            <button className="sv-qa-card" onClick={() => handleNavigation('/attendance')}>
              <div className="sv-qa-icon qa-green"><IonIcon icon={calendarOutline} /></div>
              <span className="sv-qa-label">Attendance</span>
            </button>
            <button className="sv-qa-card" onClick={() => handleNavigation('/reports')}>
              <div className="sv-qa-icon qa-amber"><IonIcon icon={analyticsOutline} /></div>
              <span className="sv-qa-label">Reports</span>
            </button>
            <button className="sv-qa-card" onClick={() => handleNavigation('/activity')}>
              <div className="sv-qa-icon qa-dark"><IonIcon icon={statsChartOutline} /></div>
              <span className="sv-qa-label">Activities</span>
            </button>
          </div>

          {/* Recent Student Activity */}
          <div className="sv-section-header">
            <span className="sv-section-title">Recent Activity</span>
            <button className="sv-view-all" onClick={() => handleNavigation('/activity')}>View All</button>
          </div>

          <RecentActivity 
            activities={activities} 
            loading={loadingActivities} 
          />

        </div>
      </IonContent>
      <SupervisorBottomNav activeTab="home" />
    </IonPage>
  );
};

export default SupervisorDashboard;