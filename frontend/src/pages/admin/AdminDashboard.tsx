import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { peopleOutline, documentTextOutline, checkmarkCircleOutline, trendingUpOutline, alertCircleOutline } from 'ionicons/icons';
import { useActivity } from '@context/activityContext';
import { useAdminOjt } from '@context/adminOjtContext';
import { useAuth } from '@context/authContext';
import { Report } from '@context/reportContext';
import { useUser } from '@context/userContext';
import { useNavigation } from '@hooks/useNavigation';
import { formatRelativeDate } from '@utils/date';
import API from '@api/api';
import AdminSidebar from '@components/AdminSidebar';
import AdminTopbar from '@components/AdminTopbar';
import RecentActivity from '@components/RecentActivity';
import printReport from '@components/PrintReport';
import '@css/AdminDashboard.css';

interface DashboardStats {
  totalTrainees: number;
  pendingReports: number;
  presentToday: number;
}

function AdminDashboard() {
  const { token, databaseId } = useAuth();
  const { getLatestActivities, loadingActivities, fetchActivities } = useActivity();
  const { navigate } = useNavigation();
  const { user } = useUser();
  const { cohorts, filters, setFilters } = useAdminOjt();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalTrainees: 0,
    pendingReports: 0,
    presentToday: 0,
  });

  const fetchDashboardData = async () => {
    if (!token || !databaseId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await API.get(`/users/admin/${databaseId}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { cohort: filters.cohort }
      });

      setStats({
        totalTrainees: Number(data?.stats?.totalTrainees || 0),
        pendingReports: Number(data?.stats?.pendingReports || 0),
        presentToday: Number(data?.stats?.presentToday || 0),
      });

    } catch (error) {
      console.error('Failed to fetch admin dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, databaseId, filters.cohort]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const activities = getLatestActivities(5);

  const handlePrintDashboard = () => {
    const reportPayload: Report = {
      id: Number(databaseId || 0),
      studentId: Number(databaseId || 0),
      ojtId: 0,
      type: 'monthly',
      reportDate: new Date().toISOString(),
      title: 'Admin Dashboard Summary',
      content: [
        `Total Trainees: ${stats.totalTrainees}`,
        `Pending Reports: ${stats.pendingReports}`,
        `Present Today: ${stats.presentToday}`,
        '',
        'Recent Activities:',
        ...activities.map((activity) => `- ${activity.description || activity.action} (${formatRelativeDate(activity.createdAt)})`),
      ].join('\n'),
      attachments: null,
      status: 'approved',
      reviewedBy: null,
      reviewedAt: null,
      reviewerName: null,
      feedback: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentName: user?.fullName || 'Admin User',
      studentProfilePicture: undefined,
    };

    printReport(reportPayload);
  };

  return (
    <>
      <div className="shell">
        <AdminSidebar
          activePath="/admin-dashboard"
          name={user?.fullName}
        />

        <div className="main">
          <AdminTopbar
            breadcrumbs={[
              { label: "Admin" },
              { label: "Dashboard" },
            ]}
            cohortKeys={cohorts.map(c => `${c.academicYear}|${c.term}`)}
            cohortLabels={cohorts.map(c => `A.Y. ${c.academicYear} – ${c.term}`)}
            selectedCohort={filters.cohort}
            onCohortChange={(val) => setFilters(prev => ({ ...prev, cohort: val }))}
            onRefresh={() => { fetchDashboardData(); fetchActivities(); }}
            refreshing={isLoading}
            onPrint={handlePrintDashboard}
          />

          <div className="page-scroll-area">
            <div className="page-content">
              <div className="page-header">
                <div>
                  <div className="page-header-title">Welcome back, {user?.firstName || 'Admin'}!</div>
                  <div className="page-header-sub">Here's what's happening in your OJT system today.</div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card stat-card-trainees">
                  <div className="stat-icon-wrap ic-trainees">
                    <IonIcon icon={peopleOutline} />
                  </div>
                  <div>
                    <div className="stat-label">Total Trainees</div>
                    <div className="stat-val">{isLoading ? '--' : stats.totalTrainees}</div>
                    <div className="stat-trend trend-up">
                      <IonIcon icon={trendingUpOutline} />
                      +2 this month
                    </div>
                  </div>
                </div>
                <div className="stat-card stat-card-reports">
                  <div className="stat-icon-wrap ic-reports">
                    <IonIcon icon={documentTextOutline} />
                  </div>
                  <div>
                    <div className="stat-label">Pending Reports</div>
                    <div className="stat-val">{isLoading ? '--' : stats.pendingReports}</div>
                    <div className="stat-trend trend-warn">
                      <IonIcon icon={alertCircleOutline} />
                      Needs attention
                    </div>
                  </div>
                </div>
                <div className="stat-card stat-card-present">
                  <div className="stat-icon-wrap ic-present">
                    <IonIcon icon={checkmarkCircleOutline} />
                  </div>
                  <div>
                    <div className="stat-label">Present Today</div>
                    <div className="stat-val">{isLoading ? '--' : stats.presentToday}</div>
                    <div className="stat-trend trend-up">
                      <IonIcon icon={checkmarkCircleOutline} />
                      60% attendance rate
                    </div>
                  </div>
                </div>
              </div>

              <div className="activity-section">
                <div className="section-head">
                  <div className="section-head-title">Recent Activity</div>
                  <button className="btn-ghost" onClick={() => navigate('/activity')}>
                    <IonIcon icon={trendingUpOutline} />
                    View All
                  </button>
                </div>
                <div className="activity-list">
                  <RecentActivity activities={activities} loading={loadingActivities} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;