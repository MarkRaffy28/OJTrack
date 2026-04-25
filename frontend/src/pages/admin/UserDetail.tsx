import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import {
  chevronBackOutline, calendarOutline, mailOutline, callOutline, locationOutline, businessOutline, personOutline, timeOutline, 
  checkmarkCircleOutline, alertCircleOutline, createOutline, trashOutline, saveOutline, closeOutline, schoolOutline, idCardOutline, maleFemaleOutline,
  peopleOutline, bookmarkOutline, documentTextOutline, briefcaseOutline, ribbonOutline,
  addOutline,
} from 'ionicons/icons';
import { useAuth } from '@context/authContext';
import { useAdminOjt } from '@context/adminOjtContext';
import { useUser } from '@context/userContext';
import { useNavigation } from '@hooks/useNavigation';
import { formatDate, formatDateForInput, getDateTime12 } from '@utils/date';
import API from '@api/api';
import AdminSidebar from '@components/AdminSidebar';
import AdminTopbar from '@/components/AdminTopbar';
import Avatar from '@components/Avatar';
import AvatarCropInput from '@components/AvatarCropInput';
import DeleteModal from '@/components/DeleteModal';
import '@css/AdminDashboard.css';
import '@css/UserDetail.css';

interface FullStudentData {
  role: 'student';
  databaseId: number;
  traineeId: string;      // userId/studentId
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  fullName: string;
  profilePicture: string | null;
  birthDate: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  contactNumber: string;
  emailAddress: string;
  year: string;
  program: string;
  major: string;
  section: string;
  ojtId?: number;
  officeId?: number;
  supervisorId?: number;
  officeName?: string;
  supervisorName?: string;
  startDate?: string;
  endDate?: string;
  requiredHours?: number;
  renderedHours?: number;
  status?: 'pending' | 'ongoing' | 'completed' | 'dropped';
  academicYear?: string;
  term?: string;
  supervisorNotes?: string;
}

interface FullSupervisorData {
  role: 'supervisor';
  databaseId: number;
  employeeId: string;     // userId
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  fullName: string;
  profilePicture: string | null;
  birthDate: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  contactNumber: string;
  emailAddress: string;
  officeId: number;
  officeName: string;
  position: string;
}

interface FullAdminData {
  role: 'admin';
  databaseId: number;
  adminId: string;     // userId
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  fullName: string;
  profilePicture: string | null;
  birthDate: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  contactNumber: string;
  emailAddress: string;
}

type FullUserData = FullStudentData | FullSupervisorData | FullAdminData;
type AvailStatus = 'idle' | 'checking' | 'available' | 'taken';

interface AssignedTrainee {
  ojtId: number;
  studentId: number;
  fullName: string;
  profilePicture: string | null;
  userId: string;
  status: string;
}

const currentYear = new Date().getFullYear();
const academicYears = Array.from({ length: currentYear - 2020 + 5 }, (_, i) => {
  const start = 2020 + i;
  return `${start}-${start + 1}`;
});

const decodeProfilePicture = (profilePicture: any): string | null => {
  if (!profilePicture) return null;
  if (typeof profilePicture === 'string') return profilePicture;
  if (profilePicture?.data && Array.isArray(profilePicture.data)) {
    const uint8Array = new Uint8Array(profilePicture.data);
    return new TextDecoder().decode(uint8Array);
  }
  return null;
};

function UserDetail() {
  const { token } = useAuth();
  const { offices: contextOffices, fetchTrainees: refreshTraineesList } = useAdminOjt();
  const { navigate, goBack } = useNavigation();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FullUserData | null>(null);
  const [draft, setDraft] = useState<FullUserData | null>(null);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [assignedTrainees, setAssignedTrainees] = useState<AssignedTrainee[]>([]);
  const [traineesLoading, setTraineesLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [allOjts, setAllOjts] = useState<any[]>([]);
  const [showNewOjtModal, setShowNewOjtModal] = useState(false);
  const [isCreatingOjt, setIsCreatingOjt] = useState(false);
  const [newOjtDraft, setNewOjtDraft] = useState({
    academicYear: '',
    term: '',
    requiredHours: 0,
    startDate: '',
    endDate: '',
    officeId: '',
    supervisorId: '',
    status: 'pending' as const
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteComplete, setDeleteComplete] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<AvailStatus>('idle');
  const [emailStatus, setEmailStatus] = useState<AvailStatus>('idle');
  const [userIdStatus, setUserIdStatus] = useState<AvailStatus>('idle');

  const originalUsername = useRef('');
  const originalEmail = useRef('');
  const originalUserId = useRef('');

  const { databaseId: paramDatabaseId, role: paramRole, action: paramAction } =
    useParams<{ databaseId: string; role: string; action?: string }>();
  const databaseId = Number(paramDatabaseId);
  const role = paramRole as 'student' | 'supervisor' | 'admin';

  useEffect(() => {
    if (paramAction === 'edit') {
      if (data && !isEditing) {
        setDraft({ ...data });
        setSaveSuccess(false);
      }
      setIsEditing(true);
      setShowDeleteModal(false);
    } else if (paramAction === 'delete') {
      setIsEditing(false);
      setShowDeleteModal(true);
    } else {
      setIsEditing(false);
      setShowDeleteModal(false);
    }
  }, [paramAction, data]);

  const fetchData = async () => {
    if (!databaseId) {
      navigate(`/admin-users/${role}`);
      return;
    }
    setLoading(true);
    try {
      if (role === 'student') {
        const [profileRes, ojtRes, supervisorsRes] = await Promise.all([
          API.get(`/users/student/${databaseId}/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          API.get(`/ojts/student/${databaseId}`, { headers: { Authorization: `Bearer ${token}` } }),
          API.get('/users/supervisors', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const profile = profileRes.data;
        if (profile) profile.profilePicture = decodeProfilePicture(profile.profilePicture);
        const ojts = ojtRes.data || [];
        setAllOjts(ojts);
        const latestOjt = ojts[0] || {};
        setSupervisors(supervisorsRes.data || []);

        const combined: FullStudentData = {
          role: 'student',
          ...profile,
          traineeId: profile.userId,
          ojtId: latestOjt.id,
          officeId: latestOjt.officeId || latestOjt.office_id,
          supervisorId: latestOjt.supervisorId || latestOjt.supervisor_id,
          officeName: latestOjt.officeName,
          supervisorName: latestOjt.supervisorName,
          startDate: latestOjt.startDate,
          endDate: latestOjt.endDate,
          requiredHours: latestOjt.requiredHours,
          renderedHours: latestOjt.renderedHours,
          status: latestOjt.status,
          academicYear: latestOjt.academicYear || latestOjt.academic_year,
          term: latestOjt.term,
          supervisorNotes: latestOjt.supervisorNotes || latestOjt.supervisor_notes,
        };
        setData(combined);
        setDraft(combined);
        originalUsername.current = combined.username || '';
        originalEmail.current = combined.emailAddress || '';
        originalUserId.current = combined.traineeId || '';
      } else if (role === 'supervisor') {
        const profileRes = await API.get(`/users/supervisor/${databaseId}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = profileRes.data;
        if (profile) profile.profilePicture = decodeProfilePicture(profile.profilePicture);

        const combined: FullSupervisorData = {
          role: 'supervisor',
          databaseId: profile.databaseId,
          employeeId: profile.userId,
          username: profile.username,
          firstName: profile.firstName,
          middleName: profile.middleName,
          lastName: profile.lastName,
          extensionName: profile.extensionName,
          fullName: profile.fullName,
          profilePicture: profile.profilePicture,
          birthDate: profile.birthDate,
          gender: profile.gender,
          address: profile.address,
          contactNumber: profile.contactNumber,
          emailAddress: profile.emailAddress,
          officeId: profile.officeId,
          officeName: profile.officeName,
          position: profile.position,
        };
        setData(combined);
        setDraft(combined);
        originalUsername.current = combined.username || '';
        originalEmail.current = combined.emailAddress || '';
        originalUserId.current = combined.employeeId || '';
        fetchAssignedTrainees(databaseId);
      } else if (role === 'admin') {
        const profileRes = await API.get(`/users/admin/${databaseId}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = profileRes.data;
        if (profile) profile.profilePicture = decodeProfilePicture(profile.profilePicture);

        const combined: FullAdminData = {
          role: 'admin',
          databaseId: profile.databaseId,
          adminId: profile.userId,
          username: profile.username,
          firstName: profile.firstName,
          middleName: profile.middleName,
          lastName: profile.lastName,
          extensionName: profile.extensionName,
          fullName: profile.fullName,
          profilePicture: profile.profilePicture,
          birthDate: profile.birthDate,
          gender: profile.gender,
          address: profile.address,
          contactNumber: profile.contactNumber,
          emailAddress: profile.emailAddress,
        };
        setData(combined);
        setDraft(combined);
        originalUsername.current = combined.username || '';
        originalEmail.current = combined.emailAddress || '';
        originalUserId.current = combined.adminId || '';
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setErrorBanner('Failed to load user information.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTrainees = async (supId: number) => {
    setTraineesLoading(true);
    try {
      const res = await API.get(`/ojts/supervisor/${supId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rows = (res.data || []).map((t: any) => ({
        ojtId: t.ojtId,
        studentId: t.studentId,
        fullName: t.fullName,
        profilePicture: decodeProfilePicture(t.profilePicture),
        userId: t.userId || t.user_id || '',
        status: t.status,
      }));
      setAssignedTrainees(rows);
    } catch (err) {
      console.error('Failed to load assigned trainees:', err);
    } finally {
      setTraineesLoading(false);
    }
  };

  useEffect(() => {
    if (token && databaseId) fetchData();
  }, [token, databaseId, role, paramAction]);

  useEffect(() => {
    if (!paramAction) {
      setIsEditing(false);
      setShowDeleteModal(false);
      setSaveSuccess(false);
      setErrorBanner(null);
    }
  }, [paramAction]);

  const checkUsername = async (val: string) => {
    val = val?.trim() || '';
    if (!val || val.length < 3) { setUsernameStatus('idle'); return; }
    if (val === originalUsername.current) { setUsernameStatus('available'); return; }
    setUsernameStatus('checking');
    try {
      const res = await API.get(`/users/exists/username/${val}`);
      setUsernameStatus(res.data.available ? 'available' : 'taken');
    } catch { setUsernameStatus('taken'); }
  };

  const checkEmail = async (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    val = val?.trim() || '';
    if (!val || !emailRegex.test(val)) { setEmailStatus('idle'); return; }
    if (val === originalEmail.current) { setEmailStatus('available'); return; }
    setEmailStatus('checking');
    try {
      const res = await API.get(`/users/exists/email/${val}`);
      setEmailStatus(res.data.available ? 'available' : 'taken');
    } catch { setEmailStatus('taken'); }
  };

  const checkUserId = async (val: string) => {
    val = val?.trim() || '';
    if (!val) { setUserIdStatus('idle'); return; }
    if (val === originalUserId.current) { setUserIdStatus('available'); return; }
    setUserIdStatus('checking');
    try {
      const res = await API.get(`/users/exists/userId/${val}`);
      setUserIdStatus(res.data.available ? 'available' : 'taken');
    } catch { setUserIdStatus('taken'); }
  };

  const AvailIcon = ({ status }: { status: AvailStatus }) => {
    if (status === 'checking') return <div className="spinner" style={{ borderTopColor: 'var(--brand)', width: '14px', height: '14px', borderWidth: '1.5px' }}></div>;
    if (status === 'available') return <IonIcon icon={checkmarkCircleOutline} style={{ color: '#059669', fontSize: '16px' }} />;
    if (status === 'taken') return <IonIcon icon={alertCircleOutline} style={{ color: '#dc2626', fontSize: '16px' }} />;
    return null;
  };

  const startEdit = () => navigate(`/admin-user-detail/${role}/${databaseId}/edit`, 'none');
  const cancelEdit = () => navigate(`/admin-user-detail/${role}/${databaseId}/view`, 'none');

  const handleChange = (field: string, value: any) => {
    if (!draft) return;
    setDraft(prev => (prev ? { ...prev, [field]: value } as any : null));
  };

  const handleSave = async () => {
    if (!draft || !data) return;
    if (usernameStatus === 'taken' || emailStatus === 'taken' || userIdStatus === 'taken') {
      setErrorBanner('Cannot save changes. Some fields are already taken or invalid.');
      return;
    }
    setIsSaving(true);
    setErrorBanner(null);
    try {
      if (role === 'student') {
        const sd = draft as FullStudentData;
        await API.patch(`/users/student/${data.databaseId}/profile`, {
          username: sd.username,
          firstName: sd.firstName,
          middleName: sd.middleName,
          lastName: sd.lastName,
          extensionName: sd.extensionName,
          studentId: sd.traineeId,
          birthDate: sd.birthDate,
          gender: sd.gender,
          address: sd.address,
          contactNumber: sd.contactNumber,
          email: sd.emailAddress,
          year: String(sd.year),
          program: sd.program,
          major: sd.major,
          section: sd.section,
          ...(typeof sd.profilePicture === 'string' ? { profilePicture: sd.profilePicture } : {}),
        }, { headers: { Authorization: `Bearer ${token}` } });

        const od = data as FullStudentData;
        if (od.ojtId) {
          await API.patch(`/ojts/${od.ojtId}`, {
            officeId: sd.officeId || null,
            supervisorId: sd.supervisorId || null,
            requiredHours: Math.round(Number(sd.requiredHours || 0)),
            renderedHours: Math.round(Number(sd.renderedHours || 0)),
            status: sd.status,
            startDate: sd.startDate,
            endDate: sd.endDate,
            academicYear: sd.academicYear,
            term: sd.term,
            supervisorNotes: sd.supervisorNotes,
          }, { headers: { Authorization: `Bearer ${token}` } });
        }
        await refreshTraineesList();
      } else if (role === 'supervisor') {
        const sd = draft as FullSupervisorData;
        await API.patch(`/users/supervisor/${data.databaseId}/profile`, {
          username: sd.username,
          firstName: sd.firstName,
          middleName: sd.middleName,
          lastName: sd.lastName,
          extensionName: sd.extensionName,
          employeeId: sd.employeeId,
          birthDate: sd.birthDate,
          gender: sd.gender,
          address: sd.address,
          contactNumber: sd.contactNumber,
          email: sd.emailAddress,
          officeId: sd.officeId,
          position: sd.position,
          ...(typeof sd.profilePicture === 'string' ? { profilePicture: sd.profilePicture } : {}),
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else if (role === 'admin') {
        const sd = draft as FullAdminData;
        await API.patch(`/users/admin/${data.databaseId}/profile`, {
          username: sd.username,
          firstName: sd.firstName,
          middleName: sd.middleName,
          lastName: sd.lastName,
          extensionName: sd.extensionName,
          adminId: sd.adminId,
          birthDate: sd.birthDate,
          gender: sd.gender,
          address: sd.address,
          contactNumber: sd.contactNumber,
          email: sd.emailAddress,
          ...(typeof sd.profilePicture === 'string' ? { profilePicture: sd.profilePicture } : {}),
        }, { headers: { Authorization: `Bearer ${token}` } });
      }

      await fetchData();
      setSaveSuccess(true);
      navigate(`/admin-user-detail/${role}/${databaseId}/view`, 'none');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save changes:', err);
      setErrorBanner(err.response?.data?.message || 'Failed to save changes. Please check your inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewOjt = async () => {
    if (!newOjtDraft.academicYear || !newOjtDraft.term || !newOjtDraft.requiredHours) {
      setErrorBanner('Please fill in Academic Year, Term and Required Hours.');
      return;
    }
    setIsCreatingOjt(true);
    setErrorBanner(null);
    try {
      await API.post('/ojts', {
        ...newOjtDraft,
        studentId: databaseId,
      }, { headers: { Authorization: `Bearer ${token}` } });

      await fetchData();
      setShowNewOjtModal(false);
      setSaveSuccess(true);
      setNewOjtDraft({
        academicYear: '',
        term: '',
        requiredHours: 0,
        startDate: '',
        endDate: '',
        officeId: '',
        supervisorId: '',
        status: 'pending' as const
      });
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to create new OJT:', err);
      setErrorBanner(err.response?.data?.message || 'Failed to create new OJT assignment.');
    } finally {
      setIsCreatingOjt(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!data) return;
    setIsDeleting(true);
    try {
      if (role === 'student') {
        const sd = data as FullStudentData;
        if (sd.ojtId) {
          await API.delete(`/ojts/${sd.ojtId}`, { headers: { Authorization: `Bearer ${token}` } });
        }
      }
      await API.delete(`/users/${data.databaseId}`, { headers: { Authorization: `Bearer ${token}` } });
      await refreshTraineesList();
      setDeleteComplete(true);
      setTimeout(() => navigate(`/admin-users/${role}`), 1200);
    } catch (err) {
      console.error('Failed to delete user:', err);
      setIsDeleting(false);
      navigate(`/admin-user-detail/${role}/${databaseId}/view`, 'none');
      setErrorBanner('Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="shell">
        <AdminSidebar activePath={`/admin-users/${role}`} name={user?.fullName} />
        <div className="main">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--brand)' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !draft) return null;

  const isStudent = data.role === 'student';
  const isSupervisor = data.role === 'supervisor';
  const isAdmin = data.role === 'admin';

  const sd = data as FullStudentData;
  const sup = data as FullSupervisorData;
  const adm = data as FullAdminData;
  const sdDraft = draft as FullStudentData;
  const supDraft = draft as FullSupervisorData;
  const admDraft = draft as FullAdminData;

  const progressPct = isStudent
    ? Math.round(((sd.renderedHours || 0) / (sd.requiredHours || 1)) * 100)
    : 0;
  const progressPctCapped = Math.min(100, Math.max(0, progressPct));
  const progressColor = progressPct >= 70 ? '#059669' : progressPct >= 40 ? '#d97706' : '#dc2626';

  const listRoute = `/admin-users/${role}`;
  const listLabel = isStudent ? 'Trainees' : isAdmin ? 'Admins' : 'Supervisors';
  const userIdLabel = isStudent ? 'Trainee ID' : isAdmin ? 'Admin ID' : 'Employee ID';
  const userIdValue = isStudent ? sd.traineeId : isAdmin ? adm.adminId : sup.employeeId;
  const activeSidebar = isStudent ? '/admin-users/student' : isAdmin ? '/admin-users/admin' : '/admin-users/supervisor';

  return (
    <div className="shell">
      <AdminSidebar activePath={activeSidebar} name={user?.fullName} />
      <div className="main">

        <AdminTopbar
          breadcrumbs={[
            { label: "Admin", path: "/admin-dashboard" },
            { label: listLabel, path: listRoute },
            { label: data.fullName },
          ]}
          onRefresh={fetchData}
          refreshing={loading}
          onPrint={() => window.print()}
        />

        <div className="page-scroll-area">
          <div className="page-content">

            <button type="button" className="back-link" onClick={() => navigate(listRoute)}>
              <IonIcon icon={chevronBackOutline} className="back-icon" />
              Back to {listLabel}
            </button>

            {saveSuccess && (
              <div className="banner banner-success">
                <IonIcon icon={checkmarkCircleOutline} className="banner-icon" />
                Changes saved successfully to backend records.
              </div>
            )}
            {errorBanner && (
              <div className="banner banner-error">
                <IonIcon icon={alertCircleOutline} className="banner-icon" />
                {errorBanner}
              </div>
            )}
            {isEditing && (
              <div className="banner banner-edit">
                <IonIcon icon={alertCircleOutline} className="banner-icon" />
                You are editing this user's details. Click&nbsp;<strong>Save Changes</strong>&nbsp;to update backend records.
              </div>
            )}

            <div className="profile-header">
              <div className="profile-left">
                <div className="profile-avatar-wrap">
                  {isEditing ? (
                    <AvatarCropInput
                      value={draft.profilePicture ?? null}
                      onChange={val => handleChange('profilePicture', val)}
                    />
                  ) : (
                    <Avatar
                      src={data.profilePicture}
                      name={data.fullName}
                      className="profile-avatar-main"
                    />
                  )}
                </div>
                <div>
                  <div className="profile-name">{data.fullName}</div>
                  <div className="profile-meta">
                    <span className="profile-id">{userIdValue}</span>
                    {isStudent && (
                      <span className={`status-pill pill-${sd.status || 'pending'}`}>
                        <span className="status-pill-icon">
                          <IonIcon
                            icon={sd.status === 'completed' || sd.status === 'ongoing' ? checkmarkCircleOutline : alertCircleOutline}
                            className="pill-check"
                          />
                        </span>
                        {sd.status || 'Pending'}
                      </span>
                    )}
                    {isSupervisor && sup.position && (
                      <span className="profile-position-tag">
                        <IonIcon icon={ribbonOutline} style={{ fontSize: '13px' }} />
                        {sup.position}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="profile-actions">
                {!isEditing ? (
                  <>
                    <button className="btn-edit" onClick={startEdit}>
                      <IonIcon icon={createOutline} className="btn-icon" />
                      Edit
                    </button>
                    <button className="btn-del" onClick={() => navigate(`/admin-user-detail/${role}/${databaseId}/delete`, 'none')}>
                      <IonIcon icon={trashOutline} className="btn-icon" />
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-cancel-edit" onClick={cancelEdit} disabled={isSaving}>
                      <IonIcon icon={closeOutline} className="btn-icon" />
                      Cancel
                    </button>
                    <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                      {isSaving
                        ? <><div className="spinner"></div>Saving…</>
                        : <><IonIcon icon={saveOutline} className="btn-icon" />Save Changes</>
                      }
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="detail-layout">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className={`card${isEditing ? ' editing' : ''}`}>
                  <div className="card-head">
                    <div className="card-accent"></div>
                    <div className="card-title">Personal Information</div>
                  </div>
                  <div className="card-body">
                    <div className="info-grid">

                      <div className="info-item">
                        <span className="info-label">Username</span>
                        {isEditing
                          ? (
                            <div className="field-avail-wrap">
                              <input className="field-input" value={draft.username} onChange={e => handleChange('username', e.target.value)} onBlur={e => checkUsername(e.target.value)} />
                              <div className="avail-icon-area"><AvailIcon status={usernameStatus} /></div>
                            </div>
                          )
                          : <span className="info-value"><IonIcon icon={personOutline} className="info-icon" />@{data.username}</span>}
                      </div>

                      <div className="info-item">
                        <span className="info-label">{userIdLabel}</span>
                        {isEditing
                          ? (
                            <div className="field-avail-wrap">
                              <input
                                className="field-input"
                                value={isStudent ? sdDraft.traineeId : isAdmin ? admDraft.adminId : supDraft.employeeId}
                                onChange={e => handleChange(isStudent ? 'traineeId' : isAdmin ? 'adminId' : 'employeeId', e.target.value)}
                                onBlur={e => checkUserId(e.target.value)}
                              />
                              <div className="avail-icon-area"><AvailIcon status={userIdStatus} /></div>
                            </div>
                          )
                          : <span className="info-value"><IonIcon icon={idCardOutline} className="info-icon" />{userIdValue}</span>}
                      </div>

                      <div className="info-item">
                        <span className="info-label">First Name</span>
                        {isEditing
                          ? <input className="field-input" value={draft.firstName} onChange={e => handleChange('firstName', e.target.value)} />
                          : <span className="info-value"><IonIcon icon={personOutline} className="info-icon" />{data.firstName}</span>}
                      </div>

                      <div className="info-item">
                        <span className="info-label">Middle Name</span>
                        {isEditing
                          ? <input className="field-input" value={draft.middleName || ''} onChange={e => handleChange('middleName', e.target.value)} />
                          : <span className="info-value"><IonIcon icon={personOutline} className="info-icon" />{data.middleName || 'N/A'}</span>}
                      </div>

                      <div className="info-item">
                        <span className="info-label">Last Name</span>
                        {isEditing
                          ? <input className="field-input" value={draft.lastName} onChange={e => handleChange('lastName', e.target.value)} />
                          : <span className="info-value"><IonIcon icon={personOutline} className="info-icon" />{data.lastName}</span>}
                      </div>

                      <div className="info-item">
                        <span className="info-label">Extension Name</span>
                        {isEditing
                          ? <input className="field-input" value={draft.extensionName || ''} onChange={e => handleChange('extensionName', e.target.value)} />
                          : <span className="info-value"><IonIcon icon={personOutline} className="info-icon" />{data.extensionName || 'N/A'}</span>}
                      </div>

                      <div className="info-item">
                        <span className="info-label">Birthday</span>
                        {isEditing
                          ? <input className="field-input" type="date" value={formatDateForInput(draft.birthDate)} onChange={e => handleChange('birthDate', e.target.value)} />
                          : <span className="info-value"><IonIcon icon={calendarOutline} className="info-icon" />{formatDate(data.birthDate)}</span>}
                      </div>

                      <div className="info-item">
                        <span className="info-label">Gender</span>
                        {isEditing
                          ? (
                            <select className="field-select" value={draft.gender} onChange={e => handleChange('gender', e.target.value)}>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          )
                          : <span className="info-value"><IonIcon icon={maleFemaleOutline} className="info-icon" />{data.gender}</span>}
                      </div>

                      <div className="info-item">
                        <span className="info-label">Email</span>
                        {isEditing
                          ? (
                            <div className="field-avail-wrap">
                              <input className="field-input" type="email" value={draft.emailAddress} onChange={e => handleChange('emailAddress', e.target.value)} onBlur={e => checkEmail(e.target.value)} />
                              <div className="avail-icon-area"><AvailIcon status={emailStatus} /></div>
                            </div>
                          )
                          : <a href={`mailto:${data.emailAddress}`} className="info-value info-link"><IonIcon icon={mailOutline} className="info-icon" />{data.emailAddress}</a>}
                      </div>

                      <div className="info-item">
                        <span className="info-label">Contact Number</span>
                        {isEditing
                          ? <input className="field-input" value={draft.contactNumber} onChange={e => handleChange('contactNumber', e.target.value)} />
                          : <a href={`tel:${data.contactNumber}`} className="info-value info-link"><IonIcon icon={callOutline} className="info-icon" />{data.contactNumber}</a>}
                      </div>

                      <div className="info-item span-full">
                        <span className="info-label">Address</span>
                        {isEditing
                          ? <input className="field-input" value={draft.address} onChange={e => handleChange('address', e.target.value)} />
                          : <span className="info-value"><IonIcon icon={locationOutline} className="info-icon" />{data.address}</span>}
                      </div>

                      {(usernameStatus === 'taken' || emailStatus === 'taken' || userIdStatus === 'taken') && isEditing && (
                        <div className="info-item span-full">
                          <div className="validation-error-box">
                            <IonIcon icon={alertCircleOutline} className="error-icon" />
                            <span>
                              {usernameStatus === 'taken' && 'Username already taken. '}
                              {userIdStatus === 'taken' && `${userIdLabel} already taken. `}
                              {emailStatus === 'taken' && 'Email Address already taken. '}
                            </span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>

                {isStudent && (
                  <div className={`card${isEditing ? ' editing' : ''}`}>
                    <div className="card-head">
                      <div className="card-accent"></div>
                      <div className="card-title">Academic Details</div>
                    </div>
                    <div className="card-body">
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Program</span>
                          {isEditing
                            ? <input className="field-input" value={sdDraft.program} onChange={e => handleChange('program', e.target.value)} />
                            : <span className="info-value"><IonIcon icon={schoolOutline} className="info-icon" />{sd.program}</span>}
                        </div>
                        <div className="info-item">
                          <span className="info-label">Major</span>
                          {isEditing
                            ? <input className="field-input" value={sdDraft.major} onChange={e => handleChange('major', e.target.value)} />
                            : <span className="info-value"><IonIcon icon={bookmarkOutline} className="info-icon" />{sd.major || 'None'}</span>}
                        </div>
                        <div className="info-item">
                          <span className="info-label">Year Level</span>
                          {isEditing
                            ? <input className="field-input" value={sdDraft.year} onChange={e => handleChange('year', e.target.value)} />
                            : <span className="info-value"><IonIcon icon={calendarOutline} className="info-icon" />{sd.year} Year</span>}
                        </div>
                        <div className="info-item">
                          <span className="info-label">Section</span>
                          {isEditing
                            ? <input className="field-input" value={sdDraft.section} onChange={e => handleChange('section', e.target.value)} />
                            : <span className="info-value"><IonIcon icon={peopleOutline} className="info-icon" />{sd.section}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isSupervisor && (
                  <div className={`card${isEditing ? ' editing' : ''}`}>
                    <div className="card-head">
                      <div className="card-accent"></div>
                      <div className="card-title">Position Details</div>
                    </div>
                    <div className="card-body">
                      <div className="info-grid">
                        <div className="info-item span-full">
                          <span className="info-label">Position / Designation</span>
                          {isEditing
                            ? <input className="field-input" value={supDraft.position || ''} onChange={e => handleChange('position', e.target.value)} placeholder="e.g. IT Supervisor" />
                            : (
                              <span className="info-value">
                                <IonIcon icon={ribbonOutline} className="info-icon" />
                                {sup.position || 'Not specified'}
                              </span>
                            )}
                        </div>
                        <div className="info-item">
                          <span className="info-label">Assigned Trainees</span>
                          <span className="info-value">
                            <IonIcon icon={peopleOutline} className="info-icon" />
                            {traineesLoading ? '…' : `${assignedTrainees.length} trainee${assignedTrainees.length !== 1 ? 's' : ''}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isStudent && (
                  <div className={`card${isEditing ? ' editing' : ''}`}>
                    <div className="card-head">
                      <div className="card-accent"></div>
                      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>OJT Assignment</span>
                        {!isEditing && (
                          <button className="btn-add-mini" onClick={() => setShowNewOjtModal(true)} title="Add New OJT Assignment">
                            <IonIcon icon={addOutline} />
                            New Assignment
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="card-body">
                      {!sd.ojtId && !isEditing ? (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <IonIcon icon={briefcaseOutline} style={{ fontSize: '48px', opacity: 0.2 }} />
                          No active OJT assignment found for this trainee.
                        </div>
                      ) : (
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">Supervisor</span>
                            {isEditing
                              ? (
                                <select className="field-select" value={sdDraft.supervisorId} onChange={e => {
                                  const newValue = Number(e.target.value);
                                  handleChange('supervisorId', newValue);
                                  const s = supervisors.find(s => s.id === newValue);
                                  if (s && s.officeId) {
                                    handleChange('officeId', s.officeId);
                                    handleChange('officeName', s.officeName);
                                  }
                                }}>
                                  <option value="">Select Supervisor</option>
                                  {supervisors.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                                </select>
                              )
                              : <span className="info-value"><IonIcon icon={personOutline} className="info-icon" />{sd.supervisorName || 'Not Assigned'}</span>}
                          </div>

                          <div className="info-item">
                            <span className="info-label">Partner Office</span>
                            <span className="info-value"><IonIcon icon={businessOutline} className="info-icon" />{sd.officeName || 'Not Assigned'}</span>
                            {isEditing && <span style={{ fontSize: '.75rem', color: 'var(--ink-3)', marginTop: '4px' }}>(Determined by assigned Supervisor)</span>}
                          </div>

                          <div className="info-item">
                            <span className="info-label">Start Date</span>
                            {isEditing
                              ? <input className="field-input" type="date" value={sdDraft.startDate ? formatDateForInput(sdDraft.startDate) : ''} onChange={e => handleChange('startDate', e.target.value)} />
                              : <span className="info-value"><IonIcon icon={calendarOutline} className="info-icon" />{sd.startDate ? formatDate(sd.startDate) : 'Not Started'}</span>}
                          </div>

                          <div className="info-item">
                            <span className="info-label">End Date</span>
                            {isEditing
                              ? <input className="field-input" type="date" value={sdDraft.endDate ? formatDateForInput(sdDraft.endDate) : ''} onChange={e => handleChange('endDate', e.target.value)} />
                              : <span className="info-value"><IonIcon icon={calendarOutline} className="info-icon" />{sd.endDate ? formatDate(sd.endDate) : 'Not Set'}</span>}
                          </div>

                          <div className="info-item">
                            <span className="info-label">Academic Year</span>
                            {isEditing
                              ? (
                                <select className="field-select" value={sdDraft.academicYear} onChange={e => handleChange('academicYear', e.target.value)}>
                                  <option value="">Select Academic Year</option>
                                  {academicYears.map(ay => <option key={ay} value={ay}>{ay}</option>)}
                                </select>
                              )
                              : <span className="info-value"><IonIcon icon={calendarOutline} className="info-icon" />{sd.academicYear || 'Not Set'}</span>}
                          </div>

                          <div className="info-item">
                            <span className="info-label">Term</span>
                            {isEditing
                              ? (
                                <select className="field-select" value={sdDraft.term} onChange={e => handleChange('term', e.target.value)}>
                                  <option value="">Select Term</option>
                                  <option value="1st">1st Term</option>
                                  <option value="2nd">2nd Term</option>
                                  <option value="Summer">Summer</option>
                                </select>
                              )
                              : <span className="info-value"><IonIcon icon={schoolOutline} className="info-icon" />{sd.term || 'Not Set'}</span>}
                          </div>

                          <div className="info-item span-full">
                            <span className="info-label">Supervisor Notes</span>
                            {isEditing
                              ? <textarea className="field-input no-scroll" value={sdDraft.supervisorNotes || ''} onChange={e => handleChange('supervisorNotes', e.target.value)} rows={3} style={{ resize: 'vertical', paddingTop: '10px' }} />
                              : <span className="info-value" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}><IonIcon icon={documentTextOutline} className="info-icon" />{sd.supervisorNotes || 'No notes provided.'}</span>}
                          </div>

                          {isEditing && (
                            <div className="info-item span-full">
                              <span className="info-label">Status</span>
                              <select className="field-select" value={sdDraft.status} onChange={e => handleChange('status', e.target.value as any)}>
                                <option value="pending">Pending</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="dropped">Dropped</option>
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isStudent && allOjts.length > 1 && (
                  <div className="card" style={{ marginTop: '20px' }}>
                    <div className="card-head">
                      <div className="card-accent" style={{ backgroundColor: 'var(--brand-soft)' }}></div>
                      <div className="card-title">Assignment History</div>
                    </div>
                    <div className="card-body" style={{ padding: '0' }}>
                      <div className="history-list">
                        {allOjts.slice(1).map((ojt, idx) => (
                          <div key={ojt.id} className="history-item" style={{ padding: '16px', borderBottom: idx !== allOjts.length - 2 ? '1px solid var(--border-light)' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>A.Y. {ojt.academicYear} – {ojt.term}</span>
                              <span className={`status-pill pill-${ojt.status}`} style={{ transform: 'scale(0.8)', transformOrigin: 'right' }}>{ojt.status}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--ink-3)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <IonIcon icon={businessOutline} /> {ojt.officeName || 'No Office'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <IonIcon icon={timeOutline} /> {ojt.renderedHours} / {ojt.requiredHours} hrs
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {isSupervisor && (
                  <div className={`card${isEditing ? ' editing' : ''}`}>
                    <div className="card-head">
                      <div className="card-accent"></div>
                      <div className="card-title">Office Assignment</div>
                    </div>
                    <div className="card-body">
                      <div className="info-grid">
                        <div className="info-item span-full">
                          <span className="info-label">Partner / Assigned Office</span>
                          {isEditing
                            ? (
                              <select
                                className="field-select"
                                value={supDraft.officeId || ''}
                                onChange={e => {
                                  const newId = Number(e.target.value);
                                  const office = contextOffices.find(o => o.id === newId);
                                  handleChange('officeId', newId);
                                  handleChange('officeName', office?.name || '');
                                }}
                              >
                                <option value="">Select Office</option>
                                {contextOffices.map(o => (
                                  <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                              </select>
                            )
                            : (
                              <span className="info-value">
                                <IonIcon icon={businessOutline} className="info-icon" />
                                {sup.officeName || 'Not Assigned'}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {isStudent && sd.ojtId && (
                  <div className={`card${isEditing ? ' editing' : ''}`}>
                    <div className="card-head">
                      <div className="card-accent"></div>
                      <div className="card-title">OJT Progress</div>
                    </div>
                    <div className="card-body">
                      <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>

                        <div className="info-item">
                          <span className="info-label">Hours Required</span>
                          {isEditing
                            ? <input className="field-input" type="number" value={sdDraft.requiredHours} onChange={e => handleChange('requiredHours', Number(e.target.value))} min={1} />
                            : <span className="info-value"><IonIcon icon={timeOutline} className="info-icon" />{sd.requiredHours} hrs</span>}
                        </div>

                        <div className="info-item">
                          <span className="info-label">Hours Rendered</span>
                          {isEditing
                            ? <input className="field-input" type="number" value={sdDraft.renderedHours} onChange={e => handleChange('renderedHours', Number(e.target.value))} min={0} />
                            : <span className="info-value"><IonIcon icon={timeOutline} className="info-icon" />{sd.renderedHours} hrs</span>}
                        </div>

                        <div className="info-item span-full">
                          <span className="info-label">Completion Status</span>
                          <div className="progress-wrap">
                            <div className="progress-header">
                              <span className="progress-label">{sd.renderedHours} / {sd.requiredHours} hours</span>
                              <span className="progress-pct" style={{ color: progressColor }}>{progressPct}%</span>
                            </div>
                            <div className="progress-track">
                              <div className="progress-fill" style={{ width: `${progressPctCapped}%`, background: `linear-gradient(90deg, ${progressColor}, ${progressColor}cc)` }}></div>
                            </div>
                            <div className="progress-sub">
                              {(sd.requiredHours || 0) - (sd.renderedHours || 0)} hours remaining
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {isSupervisor && (
                  <div className="card">
                    <div className="card-head">
                      <div className="card-accent"></div>
                      <div className="card-title">
                        Assigned Trainees
                        {!traineesLoading && (
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: 'var(--brand-soft)',
                            color: 'var(--brand)',
                            border: '1px solid var(--brand-glow)',
                            borderRadius: 'var(--r-full)',
                            padding: '2px 8px',
                            fontFamily: 'DM Sans, sans-serif',
                          }}>
                            {assignedTrainees.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="card-body" style={{ padding: '12px 16px' }}>
                      {traineesLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                          <div className="spinner" style={{ width: '28px', height: '28px', borderTopColor: 'var(--brand)' }}></div>
                        </div>
                      ) : assignedTrainees.length === 0 ? (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '32px 16px',
                          color: 'var(--ink-3)',
                          textAlign: 'center',
                        }}>
                          <IonIcon icon={peopleOutline} style={{ fontSize: '40px', opacity: 0.2 }} />
                          <span style={{ fontSize: '0.85rem' }}>No trainees assigned to this supervisor yet.</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {assignedTrainees.map(t => (
                            <button
                              key={t.ojtId}
                              className="assigned-trainee-row"
                              onClick={() => navigate(`/admin-user-detail/student/${t.studentId}/view`)}
                            >
                              <Avatar
                                src={t.profilePicture}
                                name={t.fullName}
                                className="assigned-trainee-avatar"
                              />
                              <div className="assigned-trainee-info">
                                <span className="assigned-trainee-name">{t.fullName}</span>
                                <span className="assigned-trainee-id">{t.userId || `ID: ${t.studentId}`}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <DeleteModal 
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            if (paramAction === 'delete') navigate(`/admin-user-detail/${role}/${databaseId}/view`, 'none');
          }}
          onConfirm={handleDeleteConfirm}
          title={`Delete ${isStudent ? 'Trainee' : isSupervisor ? 'Supervisor' : 'Admin'} Account`}
          description={
            <>
              Are you sure you want to delete <strong>{data?.fullName || "this user"}</strong>? 
              This will permanently remove the user account{isStudent ? ' and all associated OJT records' : ''}.
            </>
          }
          isDeleting={isDeleting}
          deleteComplete={deleteComplete}
        />

        {showNewOjtModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget && !isCreatingOjt) setShowNewOjtModal(false); }}>
            <div className="modal-box" style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <div className="modal-icon-wrap" style={{ backgroundColor: 'var(--brand-soft)', color: 'var(--brand)' }}>
                  <IonIcon icon={addOutline} className="modal-icon" />
                </div>
                <div className="modal-title">New OJT Assignment</div>
              </div>
              <div className="modal-body">
                <p className="modal-desc">Assign a new OJT term for <strong>{data.fullName}</strong>. This is useful for students requiring multiple OJT terms across different years.</p>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Academic Year *</span>
                    <select className="field-select" value={newOjtDraft.academicYear} onChange={e => setNewOjtDraft(p => ({ ...p, academicYear: e.target.value }))}>
                      <option value="">Select Year</option>
                      {academicYears.map(ay => <option key={ay} value={ay}>{ay}</option>)}
                    </select>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Term *</span>
                    <select className="field-select" value={newOjtDraft.term} onChange={e => setNewOjtDraft(p => ({ ...p, term: e.target.value }))}>
                      <option value="">Select Term</option>
                      <option value="1st">1st Term</option>
                      <option value="2nd">2nd Term</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Required Hours *</span>
                    <input className="field-input" type="number" value={newOjtDraft.requiredHours} onChange={e => setNewOjtDraft(p => ({ ...p, requiredHours: Number(e.target.value) }))} min={1} />
                  </div>
                  <div className="info-item">
                    <span className="info-label">Supervisor (Optional)</span>
                    <select className="field-select" value={newOjtDraft.supervisorId} onChange={e => {
                      const val = e.target.value;
                      const s = supervisors.find(sup => sup.id === Number(val));
                      setNewOjtDraft(p => ({ 
                        ...p, 
                        supervisorId: val,
                        officeId: s ? String(s.officeId) : p.officeId 
                      }));
                    }}>
                      <option value="">Not Assigned</option>
                      {supervisors.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                    </select>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Start Date</span>
                    <input className="field-input" type="date" value={newOjtDraft.startDate} onChange={e => setNewOjtDraft(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="info-item">
                    <span className="info-label">End Date</span>
                    <input className="field-input" type="date" value={newOjtDraft.endDate} onChange={e => setNewOjtDraft(p => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="modal-btn-cancel" onClick={() => setShowNewOjtModal(false)} disabled={isCreatingOjt}>Cancel</button>
                <button className="modal-btn-primary" onClick={handleCreateNewOjt} disabled={isCreatingOjt} style={{ backgroundColor: 'var(--brand)', color: '#fff' }}>
                  {isCreatingOjt ? <><div className="spinner"></div>Creating…</> : 'Create Assignment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
