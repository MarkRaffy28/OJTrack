import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@hooks/useNavigation';
import { IonIcon, IonSpinner } from '@ionic/react';
import { peopleOutline, personAddOutline, checkmarkOutline, alertCircleOutline, closeOutline, checkmarkCircleOutline, printOutline } from 'ionicons/icons';
import { useAuth } from '@context/authContext';
import { useAdminOjt, AdminTrainee } from '@context/adminOjtContext';
import { useUser } from '@context/userContext';
import API from '@api/api';
import AdminSidebar from '@components/AdminSidebar';
import AdminTopbar from '@components/AdminTopbar';
import '@css/AdminDashboard.css';
import '@css/Assignment.css';

interface Supervisor {
  id: number;
  fullName: string;
  employeeId: string;
  position: string;
  officeName: string;
}

const initials = (name: string) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const AVATAR_COLORS = ['#5f0076','#7a1896','#9c27b0','#c752f0','#3d004c','#4a148c'];
const avatarColor = (id: number | string) => {
  const s = String(id);
  return AVATAR_COLORS[s.charCodeAt(s.length - 1) % AVATAR_COLORS.length];
};

function Assignment() {
  const { token } = useAuth();
  const { allTrainees, cohorts, filters, setFilters, fetchTrainees, loading: traineesLoading } = useAdminOjt();
  const { navigate } = useNavigation();
  const { user } = useUser();

  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [supLoading, setSupLoading] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<number | null>(null);
  const [traineeSearch, setTraineeSearch]       = useState('');
  const [supervisorSearch, setSupervisorSearch] = useState('');
  const [toast, setToast]   = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'assign' | 'overview'>('assign');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    const loadSupervisors = async () => {
      setSupLoading(true);
      try {
        const { data } = await API.get('/users/supervisors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSupervisors(data || []);
      } catch (err) {
        console.error("Failed to fetch supervisors", err);
      } finally {
        setSupLoading(false);
      }
    };
    loadSupervisors();
  }, [token]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const traineesBySupervisor = useMemo(() => {
    const map: Record<number, AdminTrainee[]> = {};
    supervisors.forEach(s => map[s.id] = []);
    allTrainees.forEach(t => {
      if (t.supervisorId) {
        if (!map[t.supervisorId]) map[t.supervisorId] = [];
        map[t.supervisorId].push(t);
      }
    });
    return map;
  }, [allTrainees, supervisors]);

  const assignedTo = (supId: number): AdminTrainee[] => traineesBySupervisor[supId] ?? [];

  const toggleAssignment = async (trainee: AdminTrainee) => {
    if (!selectedSupervisor) return;
    if (!trainee.ojtId) {
      showToast('This trainee has no OJT record.', 'error');
      return;
    }
    
    const isAssignedToThisSup = trainee.supervisorId === selectedSupervisor;
    const newSupervisorId = isAssignedToThisSup ? null : selectedSupervisor;

    setProcessingId(trainee.databaseId);
    try {
      await API.patch(`/ojts/${trainee.ojtId}/supervisor`, {
        supervisorId: newSupervisorId,
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      await fetchTrainees();
      showToast(newSupervisorId ? 'Trainee assigned successfully!' : 'Trainee unassigned.');
    } catch (err) {
      console.error("Failed to update assignment", err);
      showToast('Failed to update assignment', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const unassign = async (trainee: AdminTrainee) => {
    if (!trainee.ojtId) return;
    setProcessingId(trainee.databaseId);
    try {
      await API.patch(`/ojts/${trainee.ojtId}/supervisor`, {
        supervisorId: null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      await fetchTrainees();
      showToast('Assignment removed.');
    } catch (err) {
      console.error("Failed to unassign trainee", err);
      showToast('Failed to unassign trainee', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTrainees = allTrainees.filter(t =>
    t.fullName.toLowerCase().includes(traineeSearch.toLowerCase()) ||
    t.traineeId.toLowerCase().includes(traineeSearch.toLowerCase()) ||
    (t.officeName || "").toLowerCase().includes(traineeSearch.toLowerCase())
  );

  const filteredSupervisors = supervisors.filter(s =>
    s.fullName.toLowerCase().includes(supervisorSearch.toLowerCase()) ||
    (s.officeName || "").toLowerCase().includes(supervisorSearch.toLowerCase())
  );

  const totalAssigned   = allTrainees.filter(t => t.supervisorId).length;
  const unassignedCount = allTrainees.length - totalAssigned;
  const selectedSup     = supervisors.find(s => s.id === selectedSupervisor);

  return (
    <div className="shell">
      <AdminSidebar activePath="/admin-assignment" name={user?.fullName} />
      
      <div className="main">
        <AdminTopbar
          breadcrumbs={[
            { label: "Admin", path: "/admin-dashboard" },
            { label: "Assignment" },
          ]}
          cohortKeys={cohorts.map(c => `${c.academicYear}|${c.term}`)}
          cohortLabels={cohorts.map(c => `A.Y. ${c.academicYear} – ${c.term}`)}
          selectedCohort={filters.cohort}
          onCohortChange={(val) => setFilters(prev => ({ ...prev, cohort: val }))}
          onRefresh={fetchTrainees}
          refreshing={traineesLoading}
          onPrint={() => window.print()}
        />

        <div className="page-scroll-area">
          <div className="asgn-page">

            <div className="pg-header">
              <div>
                <div className="pg-title">Trainee Assignment</div>
                <div className="pg-sub">Assign trainees to supervisors and manage their pairings</div>
              </div>
              <div className="header-actions">
                <button className="btn-ghost" onClick={() => window.print()}>
                  <IonIcon icon={printOutline} />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card stat-card-blue">
                <div className="stat-icon-wrap ic-total">
                  <IonIcon icon={peopleOutline} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Total Trainees</div>
                  <div className="stat-val">{allTrainees.length}</div>
                </div>
              </div>
              <div className="stat-card stat-card-green">
                <div className="stat-icon-wrap ic-present">
                  <IonIcon icon={personAddOutline} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Supervisors</div>
                  <div className="stat-val">{supervisors.length}</div>
                </div>
              </div>
              <div className="stat-card stat-card-pink">
                <div className="stat-icon-wrap ic-reports">
                  <IonIcon icon={checkmarkOutline} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Assigned</div>
                  <div className="stat-val">{totalAssigned}</div>
                </div>
              </div>
              <div className="stat-card stat-card-orange">
                <div className="stat-icon-wrap ic-assigned" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  <IonIcon icon={alertCircleOutline} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Unassigned</div>
                  <div className="stat-val">{unassignedCount}</div>
                </div>
              </div>
            </div>

            <div className="tab-row">
              <button className={`tab-btn ${activeTab === 'assign' ? 'active' : ''}`} onClick={() => setActiveTab('assign')}>
                Assign Trainees
              </button>
              <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                Overview
              </button>
            </div>

            {activeTab === 'assign' && (
              <div className="assign-layout">
                <div className="panel">
                  <div className="panel-head">
                    <div className="panel-accent"/>
                    <div className="panel-title">Supervisors</div>
                  </div>
                  <div className="panel-search">
                    <input className="search-input" placeholder="Search supervisors..."
                      value={supervisorSearch} onChange={e => setSupervisorSearch(e.target.value)} />
                  </div>
                  <div className="panel-list">
                    {filteredSupervisors.map(sup => {
                      const count = assignedTo(sup.id).length;
                      return (
                        <div key={sup.id}
                          className={`sup-item ${selectedSupervisor === sup.id ? 'selected' : ''}`}
                          onClick={() => setSelectedSupervisor(sup.id)}
                        >
                          <div className="sup-av" style={{ background: avatarColor(sup.id) }}>
                            {initials(sup.fullName)}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div className="sup-name">{sup.fullName}</div>
                            <div className="sup-dept">{sup.officeName}</div>
                          </div>
                          <div className={`sup-badge ${count === 0 ? 'zero' : ''}`}>{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="panel">
                  {!selectedSupervisor ? (
                    <div className="trainee-panel-empty">
                      <IonIcon icon={peopleOutline} style={{ fontSize:'48px', color:'#ede6f2', marginBottom:'12px' }} />
                      <strong>No Supervisor Selected</strong>
                      <p>Select a supervisor on the left to start assigning trainees</p>
                    </div>
                  ) : (
                    <>
                      <div className="trainee-panel-header">
                        <div className="trainee-panel-sup">
                          <div className="trainee-panel-sup-av" style={{ background: selectedSupervisor ? avatarColor(selectedSupervisor) : '#ede6f2' }}>
                            {selectedSup ? initials(selectedSup.fullName) : ''}
                          </div>
                          <div style={{ minWidth:0 }}>
                            <div className="trainee-panel-sup-name">{selectedSup?.fullName || 'Select Supervisor'}</div>
                            <div className="trainee-panel-sup-dept">{selectedSup?.officeName || '—'}</div>
                          </div>
                        </div>
                        <div className="assigned-count-pill">
                          {assignedTo(selectedSupervisor).length} assigned
                        </div>
                      </div>
                      <div className="panel-search">
                        <input className="search-input" placeholder="Search trainees by name, ID or program..."
                          value={traineeSearch} onChange={e => setTraineeSearch(e.target.value)} />
                      </div>
                      <div className="trainee-grid">
                        {filteredTrainees.map(t => {
                          const isAssignedHere      = t.supervisorId === selectedSupervisor;
                          const isAssignedElsewhere = t.supervisorId !== null && t.supervisorId !== selectedSupervisor;
                          const elsewhereSupName    = isAssignedElsewhere
                            ? supervisors.find(s => s.id === t.supervisorId)?.fullName : null;
                          return (
                            <div key={t.databaseId}
                              className={`trainee-card ${isAssignedHere ? 'assigned' : ''} ${isAssignedElsewhere ? 'assigned-elsewhere' : ''} ${processingId === t.databaseId ? 'processing' : ''}`}
                              onClick={() => toggleAssignment(t)}
                              title={isAssignedElsewhere ? `Currently assigned to ${elsewhereSupName}. Click to reassign.` : ''}
                            >
                              {processingId === t.databaseId && (
                                <div className="trainee-loader">
                                  <IonSpinner name="crescent" color="primary" style={{ transform:'scale(0.8)' }} />
                                </div>
                              )}
                              <div className="trainee-card-check">
                                {isAssignedHere && <IonIcon icon={checkmarkOutline} style={{ color:'#fff', fontSize:'12px' }} />}
                              </div>
                              <div className="trainee-av" style={{ background: avatarColor(t.databaseId) }}>
                                {initials(t.fullName)}
                              </div>
                              <div className="trainee-name">{t.fullName}</div>
                              <div className="trainee-id">{t.traineeId}</div>
                              <div>
                                <span className="trainee-tag" style={{ background:'#f7f4fb', color:'#7b6e89' }}>
                                  {t.academicYear} {t.term}
                                </span>
                              </div>
                              {isAssignedElsewhere && (
                                <div className="trainee-elsewhere-label">↪ {elsewhereSupName || 'Supervisor'}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="overview-grid">
                {supervisors.map(sup => {
                  const assignedTrainees = assignedTo(sup.id);
                  return (
                    <div key={sup.id} className="ov-card">
                      <div className="ov-card-head">
                        <div className="ov-av">{initials(sup.fullName)}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div className="ov-name">{sup.fullName}</div>
                          <div className="ov-dept">{sup.officeName} · {sup.employeeId}</div>
                        </div>
                        <div className="ov-count">
                          {assignedTrainees.length} trainee{assignedTrainees.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="ov-trainee-list">
                        {assignedTrainees.length === 0 ? (
                          <div className="ov-empty">No trainees assigned yet</div>
                        ) : (
                          assignedTrainees.map(t => (
                            <div key={t.databaseId} className="ov-trainee-row">
                              <div className="ov-trainee-av" style={{ background: avatarColor(t.databaseId) }}>
                                {initials(t.fullName)}
                              </div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div className="ov-trainee-name">{t.fullName}</div>
                                <div className="ov-trainee-prog">{t.traineeId} · {t.academicYear} {t.term}</div>
                              </div>
                              <button className="ov-remove-btn" onClick={() => unassign(t)} title="Remove assignment" disabled={processingId === t.databaseId}>
                                {processingId === t.databaseId ? (
                                  <IonSpinner name="dots" color="medium" style={{ width:'14px', height:'14px' }} />
                                ) : (
                                  <IonIcon icon={closeOutline} />
                                )}
                              </button>
                            </div>
                          ))
                        )}
                        <button
                          onClick={() => { setSelectedSupervisor(sup.id); setActiveTab('assign'); }}
                          style={{ width:'100%', marginTop:4, padding:'8px', border:'1.5px dashed #ede6f2', borderRadius:9, background:'none', cursor:'pointer', color:'#7b6e89', fontSize:'.78rem', fontWeight:600, fontFamily:'DM Sans,sans-serif', transition:'all .15s' }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor='#5f0076'; (e.currentTarget as HTMLElement).style.color='#5f0076'; }}
                          onMouseOut={e  => { (e.currentTarget as HTMLElement).style.borderColor='#ede6f2'; (e.currentTarget as HTMLElement).style.color='#7b6e89'; }}
                        >
                          + Assign Trainees
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {toast && (
          <div className={`toast ${toast.type}`}>
              {toast.type === 'success'
                ? <IonIcon icon={checkmarkCircleOutline} style={{ fontSize:'20px' }} />
                : <IonIcon icon={alertCircleOutline} style={{ fontSize:'20px' }} />
              }
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignment;