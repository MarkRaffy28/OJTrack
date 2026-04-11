import React, { useState, useMemo, useEffect } from 'react';
import { IonPage, IonContent, IonIcon, IonRefresher, IonRefresherContent, RefresherEventDetail } from '@ionic/react';
import { searchOutline, chevronForwardOutline, schoolOutline, arrowBackOutline, chevronDownCircleOutline } from 'ionicons/icons';
import { useSupervisorOjt } from '@context/supervisorOjtContext';
import { useNavigation } from '@hooks/useNavigation';
import { capitalize } from '@utils/string';
import { progressColor } from '@utils/progress';
import Avatar from '@components/Avatar';
import SupervisorBottomNav from '@components/SupervisorBottomNav';
import '@css/supervisor.css';

function Trainees() {
  const { navigate, goBack } = useNavigation();
  const { filteredOjts, allOjts, loading, filters, setFilters, uniqueCohorts, fetchAllOjts } = useSupervisorOjt();
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'active'>('all');

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchAllOjts();
    event.detail.complete();
  };

  const filteredTrainees = useMemo(() => {
    return filteredOjts.filter(t => {
      const matchesTab = tab === 'all' || t.isActive;
      const matchesSearch =
        t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.officeName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [filteredOjts, tab, searchQuery]);

  const activeCount = filteredOjts.filter(t => t.isActive).length;

  return (
    <IonPage>
      <IonContent fullscreen className="sv-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode="md">
          <IonRefresherContent 
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="crescent"
          />
        </IonRefresher>

        {/* Hero */}
        <div className="sv-hero">
          <div className="sv-hero-bg" />
          <div className="sv-hero-inner">
            <p className="sv-hero-sub">Manage &amp; monitor</p>
            <h1 className="sv-hero-name">Your Trainees</h1>
          </div>
        </div>

        <div className="sv-body">
          {/* Filter Tabs */}
          <div className="act-filter-row sv-tab-row-overlap">
            <button 
              className={`act-filter-btn ${tab === 'all' ? 'act-filter-active' : ''}`}
              onClick={() => setTab('all')}
            >
              Total ({filteredOjts.length})
            </button>
            <button 
              className={`act-filter-btn ${tab === 'active' ? 'act-filter-active' : ''}`}
              onClick={() => setTab('active')}
            >
              Active ({activeCount})
            </button>
          </div>

          {/* Search */}
          <div className="sv-search-bar">
            <IonIcon icon={searchOutline} className="sv-search-icon" />
            <input 
              type="text" 
              placeholder="Search trainees…" 
              className="sv-search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* List Header */}
          <div className="sv-list-header">
            <span className="sv-list-title">{tab === 'all' ? 'All Trainees' : 'Active Trainees'}</span>
            <span className="sv-list-count">{filteredTrainees.length} students</span>
          </div>

          {/* Trainee Cards */}
          <div className="sv-trainee-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : filteredTrainees.length > 0 ? (
              filteredTrainees.map(trainee => {
                return (
                  <div
                    key={trainee.ojtId}
                    className="sv-trainee-card"
                    onClick={() => navigate(`/trainee-detail/${trainee.studentId}`)}
                  >
                    {/* Left: Avatar */}
                    <div onClick={e => e.stopPropagation()}>
                      <Avatar
                        src={trainee.profilePicture}
                        name={trainee.fullName}
                        className="sv-trainee-avatar"
                        clickable={false}
                      />
                    </div>

                    {/* Middle: Info */}
                    <div className="sv-trainee-info">
                      <div className="sv-trainee-name-row">
                        <span className="sv-trainee-name">{trainee.fullName}</span>
                        <div className="sv-flex-gap-6">
                           <span className={`sv-trainee-status ${trainee.isActive ? 'sv-status-active' : 'sv-status-inactive'}`}>
                            {trainee.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`sv-trainee-status status-${trainee.status}`}>
                            {capitalize(trainee.status)}
                          </span>
                        </div>
                      </div>
                      <div className="sv-trainee-meta-row">
                        <span className="sv-trainee-meta">
                          <IonIcon icon={schoolOutline} />
                          {trainee.program} · {trainee.officeName}
                        </span>
                        <span className="sv-trainee-section">{trainee.year} - {trainee.section}</span>
                      </div>

                      {/* Mini Progress */}
                      <div className="sv-trainee-progress-row">
                        <div className="sv-mini-track">
                          <div
                            className="sv-mini-fill"
                            style={{ width: `${trainee.progress}%`, background: progressColor(trainee.progress) }}
                          />
                        </div>
                        <span className="sv-trainee-pct" style={{ color: progressColor(trainee.progress) }}>
                          {trainee.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Right: Arrow */}
                    <IonIcon icon={chevronForwardOutline} className="sv-trainee-arrow" />
                  </div>
                );
              })
            ) : (
              <div className="sv-no-results">
                <div className="sv-no-results-icon">
                  <IonIcon icon={searchOutline} />
                </div>
                <p className="sv-no-results-text">No trainees found</p>
                <p className="sv-no-results-sub">Try adjusting your search</p>
                <button 
                  className="sv-back-button"
                  onClick={() => { setSearchQuery(''); setTab('all'); }}
                >
                  <IonIcon icon={arrowBackOutline} />
                  Back to all trainees
                </button>
              </div>
            )}
          </div>

        </div>
      </IonContent>
      <SupervisorBottomNav activeTab="trainees" />
    </IonPage>
  );
};

export default Trainees;