import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent, IonText, IonIcon } from '@ionic/react';
import { 
  documentTextOutline, downloadOutline, eyeOutline, addOutline, calendarOutline, checkmarkCircleOutline, timeOutline, createOutline, 
  searchOutline, closeOutline, 
} from 'ionicons/icons';
import BottomNav from '@components/BottomNav';

interface Report {
  id: number;
  title: string;
  date: string;
  status: 'Submitted' | 'Pending' | 'Draft';
  type: string;
  description: string;
}

const Reports: React.FC = () => {
  const history = useHistory();
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const reports: Report[] = [
    { id: 1, title: 'Weekly Report – Week 1', date: 'Jan 6, 2025', status: 'Submitted', type: 'Weekly', description: 'First week of OJT activities and observations' },
    { id: 2, title: 'Weekly Report – Week 2', date: 'Jan 13, 2025', status: 'Submitted', type: 'Weekly', description: 'Second week progress and learnings' },
    { id: 3, title: 'Weekly Report – Week 3', date: 'Jan 20, 2025', status: 'Pending', type: 'Weekly', description: 'Third week documentation pending' },
    { id: 4, title: 'Monthly Report – January', date: 'Jan 31, 2025', status: 'Draft', type: 'Monthly', description: 'Monthly comprehensive report draft' },
    { id: 5, title: 'Weekly Report – Week 4', date: 'Feb 3, 2025', status: 'Submitted', type: 'Weekly', description: 'Fourth week summary and achievements' },
    { id: 6, title: 'Midterm Report', date: 'Feb 10, 2025', status: 'Pending', type: 'Midterm', description: 'Midterm evaluation and progress report' },
  ];

  const stats = {
    total: reports.length,
    submitted: reports.filter(r => r.status === 'Submitted').length,
    pending: reports.filter(r => r.status === 'Pending').length,
    draft: reports.filter(r => r.status === 'Draft').length,
  };

  const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
    'Submitted': { color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: checkmarkCircleOutline },
    'Pending':   { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', icon: timeOutline },
    'Draft':     { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)', icon: createOutline },
  };

  const filtered = reports.filter(r => {
    const q = searchText.toLowerCase();
    const matches = r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
    const filterMatch = selectedFilter === 'all' || r.status.toLowerCase() === selectedFilter;
    return matches && filterMatch;
  });

  const filters = ['all', 'submitted', 'pending', 'draft'];

  return (
    <IonPage>
      <IonContent fullscreen className="rp-content">

        {/* Hero */}
        <div className="rp-hero">
          <div className="rp-hero-bg" />
          <div className="rp-hero-inner">
            <h1 className="rp-hero-title">Your Reports</h1>
            <p className="rp-hero-sub">Manage and track all submissions</p>
          </div>
        </div>

        <div className="rp-container">

          {/* Stats Row */} <br />
          <div className="rp-stats-row">
            <div className="rp-stat-card rp-stat-total">
              <IonIcon icon={documentTextOutline} className="rp-stat-icon" />
              <span className="rp-stat-num">{stats.total}</span>
              <span className="rp-stat-lbl">Total</span>
            </div>
            <div className="rp-stat-card rp-stat-submitted">
              <IonIcon icon={checkmarkCircleOutline} className="rp-stat-icon" />
              <span className="rp-stat-num">{stats.submitted}</span>
              <span className="rp-stat-lbl">Submitted</span>
            </div>
            <div className="rp-stat-card rp-stat-pending">
              <IonIcon icon={timeOutline} className="rp-stat-icon" />
              <span className="rp-stat-num">{stats.pending}</span>
              <span className="rp-stat-lbl">Pending</span>
            </div>
            <div className="rp-stat-card rp-stat-draft">
              <IonIcon icon={createOutline} className="rp-stat-icon" />
              <span className="rp-stat-num">{stats.draft}</span>
              <span className="rp-stat-lbl">Drafts</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="rp-filter-row">
            {filters.map(f => (
              <button
                key={f}
                className={`rp-filter-btn ${selectedFilter === f ? 'rp-filter-active' : ''}`}
                onClick={() => setSelectedFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="rp-search-wrap">
            <IonIcon icon={searchOutline} className="rp-search-icon" />
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search reports..."
              className="rp-search-input"
            />
            {searchText && (
              <button className="rp-search-clear" onClick={() => setSearchText('')}>
                <IonIcon icon={closeOutline} />
              </button>
            )}
          </div>

          {/* List Header */}
          <div className="rp-list-header">
            <span className="rp-list-title">All Reports</span>
            <span className="rp-list-count">{filtered.length} items</span>
          </div>

          {/* Report Cards */}
          <div className="rp-list">
            {filtered.map(report => {
              const cfg = statusConfig[report.status];
              return (
                <div key={report.id} className="rp-card">
                  <div className="rp-card-top">
                    <span className="rp-type-chip">
                      <IonIcon icon={documentTextOutline} />
                      {report.type}
                    </span>
                    <span className="rp-status-chip" style={{ color: cfg.color, background: cfg.bg }}>
                      <IonIcon icon={cfg.icon} />
                      {report.status}
                    </span>
                  </div>
                  <div className="rp-card-body">
                    <p className="rp-card-title">{report.title}</p>
                    <p className="rp-card-desc">{report.description}</p>
                  </div>
                  <div className="rp-card-footer">
                    <div className="rp-card-date">
                      <IonIcon icon={calendarOutline} />
                      {report.date}
                    </div>
                    <div className="rp-card-actions">
                      <button className="rp-btn rp-btn-view">
                        <IonIcon icon={eyeOutline} /> View
                      </button>
                      <button className="rp-btn rp-btn-dl">
                        <IonIcon icon={downloadOutline} /> Download
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* FAB */}
        <div className="rp-fab-wrap">
          <button className="rp-fab" onClick={() => history.push('/upload-report')}>
            <IonIcon icon={addOutline} />
            <span>Upload Report</span>
          </button>
        </div>

      </IonContent>
      <BottomNav activeTab="reports" />
    </IonPage>
  );
};

export default Reports;