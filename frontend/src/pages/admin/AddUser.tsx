import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { chevronBackOutline, checkmarkCircleOutline, alertCircleOutline, saveOutline, eyeOutline, eyeOffOutline, briefcaseOutline, ribbonOutline } from 'ionicons/icons';
import { useAdminOjt } from '@context/adminOjtContext';
import { useAuth } from '@context/authContext';
import { useNavigation } from '@hooks/useNavigation';
import { useUser } from '@context/userContext';
import API from '@api/api';
import AvatarCropInput from '@components/AvatarCropInput';
import AdminSidebar from '@components/AdminSidebar';
import AdminTopbar from '@components/AdminTopbar';
import '@css/AddUser.css';
import '@css/AdminDashboard.css';

type AvailStatus = 'idle' | 'checking' | 'available' | 'taken';

interface Office {
  id: number;
  name: string;
}

function AddUser() {
  const { role = 'student' } = useParams<{ role: string }>();
  const isStudent = role === 'student';
  const isSupervisor = role === 'supervisor';
  const isAdmin = role === 'admin';
  
  const { fetchTrainees } = useAdminOjt();
  const { token } = useAuth();
  const { navigate } = useNavigation();
  const { user } = useUser();

  const [draft, setDraft] = useState({
    username: '',
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    extensionName: '',
    userId: '',         // mapped to studentId or employeeId
    birthDate: '',
    gender: 'Male',
    address: '',
    contactNumber: '',
    emailAddress: '',
    // Student specific
    year: '',
    program: '',
    major: '',
    section: '',
    // Supervisor specific
    officeId: '',
    position: '',
    profilePicture: null as string | null
  });

  const [offices, setOffices] = useState<Office[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<AvailStatus>('idle');
  const [emailStatus, setEmailStatus] = useState<AvailStatus>('idle');
  const [userIdStatus, setUserIdStatus] = useState<AvailStatus>('idle');

  useEffect(() => {
    if (isSupervisor && token) {
      const fetchOffices = async () => {
        try {
          const res = await API.get('/offices', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setOffices(res.data || []);
        } catch (err) {
          console.error("Failed to load offices:", err);
        }
      };
      fetchOffices();
    }
  }, [isSupervisor, token]);

  const checkUsername = async (val: string) => {
    val = val?.trim() || '';
    if (!val || val.length < 3) { setUsernameStatus('idle'); return; }
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
    setEmailStatus('checking');
    try {
      const res = await API.get(`/users/exists/email/${val}`);
      setEmailStatus(res.data.available ? 'available' : 'taken');
    } catch { setEmailStatus('taken'); }
  };

  const checkUserId = async (val: string) => {
    val = val?.trim() || '';
    if (!val) { setUserIdStatus('idle'); return; }
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

  const handleChange = (field: string, value: any) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (usernameStatus === 'taken' || emailStatus === 'taken' || userIdStatus === 'taken') {
      setErrorBanner("Cannot save. Some fields are already taken or invalid.");
      return;
    }

    const { username, password, firstName, lastName, userId, emailAddress, birthDate, address, contactNumber } = draft;
    
    if (!username || !password || !firstName || !lastName || !userId || !emailAddress || !birthDate || !address || !contactNumber) {
      setErrorBanner("Please fill out all personal and account fields.");
      return;
    }

    if (isStudent && (!draft.program || !draft.year || !draft.section)) {
      setErrorBanner("Please fill out all academic details.");
      return;
    }
    if (isSupervisor && (!draft.officeId || !draft.position)) {
      setErrorBanner("Please fill out all professional details.");
      return;
    }
    if (isAdmin && !draft.userId) {
      setErrorBanner("Please provide an Admin ID.");
      return;
    }

    setIsSaving(true);
    setErrorBanner(null);

    try {
      const payload: any = {
        username,
        password,
        firstName,
        middleName: draft.middleName || null,
        lastName,
        extensionName: draft.extensionName || null,
        birthDate,
        gender: draft.gender,
        address,
        contactNumber,
        email: emailAddress,
        ...(draft.profilePicture ? { profilePicture: draft.profilePicture } : {})
      };

      if (isStudent) {
        Object.assign(payload, {
          studentId: userId,
          year: String(draft.year),
          program: draft.program,
          major: draft.major || 'None',
          section: draft.section,
        });
      } else if (isSupervisor) {
        Object.assign(payload, {
          employeeId: userId,
          officeId: Number(draft.officeId),
          position: draft.position,
        });
      } else {
        Object.assign(payload, {
          adminId: userId,
        });
      }

      await API.post(`/auth/register/${role}`, payload);

      if (isStudent) await fetchTrainees();
      
      setSuccessBanner(true);
      setTimeout(() => {
        setSuccessBanner(false);
        navigate(`/admin-users/${role}`);
      }, 1500);
    } catch (err: any) {
      console.error(`Failed to add ${role}:`, err);
      setErrorBanner(err.response?.data?.message || err.response?.data?.error || `Failed to add ${role}. Please check your inputs.`);
    } finally {
      setIsSaving(false);
    }
  };

  const userIdLabel = isStudent ? 'Trainee ID' : isAdmin ? 'Admin ID' : 'Employee ID';
  const listLabel = isStudent ? 'Trainees' : isAdmin ? 'Admins' : 'Supervisors';
  const listRoute = `/admin-users/${role}`;

  return (
    <div className="shell">
      <AdminSidebar activePath={listRoute} name={user?.fullName} />
      <div className="main">

        <AdminTopbar
          breadcrumbs={[
            { label: "Admin", path: "/admin-dashboard" },
            { label: listLabel, path: listRoute },
            { label: `Add ${isStudent ? 'Trainee' : isAdmin ? 'Admin' : 'Supervisor'}` },
          ]}
        />

        <div className="page-scroll-area">
          <div className="page-content">

            <div className="top-actions">
              <button type="button" className="back-link" onClick={() => navigate(listRoute)}>
                <IonIcon icon={chevronBackOutline} className="back-icon" />
                Back to {listLabel}
              </button>
              <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                {isSaving
                  ? <><div className="spinner" style={{width: 16, height: 16, borderTopColor: '#fff', borderWidth: 2}}></div>Saving…</>
                  : <><IonIcon icon={saveOutline} className="btn-icon" />Save {isStudent ? 'Trainee' : isAdmin ? 'Admin' : 'Supervisor'}</>
                }
              </button>
            </div>

            {successBanner && (
              <div className="banner banner-success">
                <IonIcon icon={checkmarkCircleOutline} className="banner-icon" />
                {isStudent ? 'Trainee' : isAdmin ? 'Admin' : 'Supervisor'} added successfully. Redirecting...
              </div>
            )}
            {errorBanner && (
              <div className="banner banner-error">
                <IonIcon icon={alertCircleOutline} className="banner-icon" />
                {errorBanner}
              </div>
            )}

            <div className="add-layout">

              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Personal Information */}
                <div className="card editing">
                  <div className="card-head">
                    <div className="card-accent"></div>
                    <div className="card-title">Personal Information</div>
                  </div>
                  <div className="card-body">
                    <div className="info-grid">

                      <div className="info-item">
                        <span className="info-label">Username *</span>
                        <div className="field-avail-wrap">
                          <input className="field-input" value={draft.username} onChange={e => handleChange('username', e.target.value)} onBlur={e => checkUsername(e.target.value)} placeholder="Required" />
                          <div className="avail-icon-area">
                            <AvailIcon status={usernameStatus} />
                          </div>
                        </div>
                      </div>

                      <div className="info-item">
                        <span className="info-label">Password *</span>
                        <div className="field-avail-wrap">
                          <input className="field-input" type={showPassword ? "text" : "password"} value={draft.password} onChange={e => handleChange('password', e.target.value)} placeholder="Min 6 characters" />
                          <div className="avail-icon-area" style={{ cursor: 'pointer', zIndex: 2 }} onClick={() => setShowPassword(!showPassword)}>
                            <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} className="info-icon" />
                          </div>
                        </div>
                      </div>

                      <div className="info-item span-full">
                        <span className="info-label">{userIdLabel} *</span>
                        <div className="field-avail-wrap">
                          <input className="field-input" value={draft.userId} onChange={e => handleChange('userId', e.target.value)} onBlur={e => checkUserId(e.target.value)} placeholder="Required" />
                          <div className="avail-icon-area">
                            <AvailIcon status={userIdStatus} />
                          </div>
                        </div>
                      </div>

                      <div className="info-item">
                        <span className="info-label">First Name *</span>
                        <input className="field-input" value={draft.firstName} onChange={e => handleChange('firstName', e.target.value)} placeholder="Required" />
                      </div>

                      <div className="info-item">
                        <span className="info-label">Middle Name</span>
                        <input className="field-input" value={draft.middleName} onChange={e => handleChange('middleName', e.target.value)} placeholder="Optional" />
                      </div>

                      <div className="info-item">
                        <span className="info-label">Last Name *</span>
                        <input className="field-input" value={draft.lastName} onChange={e => handleChange('lastName', e.target.value)} placeholder="Required" />
                      </div>

                      <div className="info-item">
                        <span className="info-label">Extension Name</span>
                        <input className="field-input" value={draft.extensionName} onChange={e => handleChange('extensionName', e.target.value)} placeholder="e.g. Jr, III (Optional)" />
                      </div>

                      <div className="info-item">
                        <span className="info-label">Birthday *</span>
                        <input className="field-input" type="date" value={draft.birthDate} onChange={e => handleChange('birthDate', e.target.value)} />
                      </div>

                      <div className="info-item">
                        <span className="info-label">Gender</span>
                        <select className="field-select" value={draft.gender} onChange={e => handleChange('gender', e.target.value)}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="info-item">
                        <span className="info-label">Email *</span>
                        <div className="field-avail-wrap">
                          <input className="field-input" type="email" value={draft.emailAddress} onChange={e => handleChange('emailAddress', e.target.value)} onBlur={e => checkEmail(e.target.value)} placeholder="Required" />
                          <div className="avail-icon-area">
                            <AvailIcon status={emailStatus} />
                          </div>
                        </div>
                      </div>

                      <div className="info-item">
                        <span className="info-label">Contact Number *</span>
                        <input className="field-input" value={draft.contactNumber} onChange={e => handleChange('contactNumber', e.target.value)} placeholder="Min 10 digits" />
                      </div>

                      <div className="info-item span-full">
                        <span className="info-label">Address *</span>
                        <input className="field-input" value={draft.address} onChange={e => handleChange('address', e.target.value)} placeholder="Required" />
                      </div>

                      {(usernameStatus === 'taken' || emailStatus === 'taken' || userIdStatus === 'taken') && (
                        <div className="info-item span-full">
                          <div className="validation-error-box">
                            <IonIcon icon={alertCircleOutline} className="error-icon" />
                            <span>
                              {usernameStatus === 'taken' && "Username already taken. "}
                              {userIdStatus === 'taken' && `${userIdLabel} already taken. `}
                              {emailStatus === 'taken' && "Email Address already taken. "}
                            </span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>

                {isStudent ? (
                  <div className="card editing">
                    <div className="card-head">
                      <div className="card-accent" style={{ backgroundColor: '#2563eb' }}></div>
                      <div className="card-title">Academic Details</div>
                    </div>
                    <div className="card-body">
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Program *</span>
                          <input className="field-input" value={draft.program} onChange={e => handleChange('program', e.target.value)} placeholder="e.g. BSIT" />
                        </div>
                        <div className="info-item">
                          <span className="info-label">Major</span>
                          <input className="field-input" value={draft.major} onChange={e => handleChange('major', e.target.value)} placeholder="e.g. Software" />
                        </div>
                        <div className="info-item">
                          <span className="info-label">Year Level *</span>
                          <input className="field-input" value={draft.year} onChange={e => handleChange('year', e.target.value)} placeholder="e.g. 3rd" />
                        </div>
                        <div className="info-item">
                          <span className="info-label">Section *</span>
                          <input className="field-input" value={draft.section} onChange={e => handleChange('section', e.target.value)} placeholder="Required" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isSupervisor ? (
                  <div className="card editing">
                    <div className="card-head">
                      <div className="card-accent" style={{ backgroundColor: '#6366f1' }}></div>
                      <div className="card-title">Professional Details</div>
                    </div>
                    <div className="card-body">
                      <div className="info-grid">
                        <div className="info-item span-full">
                          <span className="info-label">Office Assignment *</span>
                          <div className="field-avail-wrap">
                            <select className="field-select" value={draft.officeId} onChange={e => handleChange('officeId', e.target.value)}>
                              <option value="">Select an office</option>
                              {offices.map(off => (
                                <option key={off.id} value={off.id}>{off.name}</option>
                              ))}
                            </select>
                            <div className="avail-icon-area">
                              <IonIcon icon={briefcaseOutline} className="info-icon" />
                            </div>
                          </div>
                        </div>
                        <div className="info-item span-full">
                          <span className="info-label">Position *</span>
                          <div className="field-avail-wrap">
                            <input className="field-input" value={draft.position} onChange={e => handleChange('position', e.target.value)} placeholder="e.g. IT Manager / Dept Head" />
                            <div className="avail-icon-area">
                              <IonIcon icon={ribbonOutline} className="info-icon" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card editing">
                    <div className="card-head">
                      <div className="card-accent" style={{ backgroundColor: '#db2777' }}></div>
                      <div className="card-title">Administrative Role</div>
                    </div>
                    <div className="card-body">
                      <div className="info-grid">
                        <div className="info-item span-full">
                           <span style={{ fontSize: '0.85rem', color: '#7b6e89' }}>
                             Administrators have full access to the system management dashboard.
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card editing">
                  <div className="card-head">
                    <div className="card-accent"></div>
                    <div className="card-title">Profile Picture</div>
                  </div>
                  <div className="card-body avatar-card-body">
                    <div className="avatar-wrap">
                      <AvatarCropInput 
                        value={draft.profilePicture} 
                        onChange={val => handleChange('profilePicture', val)} 
                      />
                    </div>
                    <div className="avatar-instructions">
                      Upload a square image. Supported formats: JPG, PNG. Max size: 2MB.
                    </div>
                  </div>
                </div>
              </div>

            </div> 
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
