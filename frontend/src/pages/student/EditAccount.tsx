import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import {
  arrowBackOutline, personOutline, mailOutline, schoolOutline, calendarOutline,
  shieldCheckmarkOutline, callOutline, locationOutline, checkmarkCircleOutline,
  saveOutline, transgenderOutline, alertCircleOutline, personCircleOutline,
  codeSlashOutline, statsChartOutline,
} from 'ionicons/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, isStudent } from '@context/userContext';
import { useAuth } from '@context/authContext';
import API from '@api/api';
import AvatarCropInput from '@components/AvatarCropInput';
import '@css/EditAccount.css';

// ── Zod schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(30, 'Max 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only'),
  firstName:     z.string().min(2, 'At least 2 characters'),
  middleName:    z.string().optional(),
  lastName:      z.string().min(2, 'At least 2 characters'),
  extensionName: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other'], {
    message: 'Please select your gender',
  }),
  birthDate:     z.string().min(1, 'Please enter your birthday'),
  contactNumber: z.string().regex(/^09\d{9}$/, 'Must be 11 digits starting with 09'),
  email:         z.email('Enter a valid email address'),
  address:       z.string().min(10, 'At least 10 characters'),
  // Locked — passthrough only, no user-facing validation
  studentId:     z.string(),
  year:          z.string(),
  program:       z.string(),
  major:         z.string(),
  profilePicture:z.string().nullable().optional(),
});

type EditAccountForm = z.infer<typeof schema>;

// ── Availability status ───────────────────────────────────────────────────────
type AvailStatus = 'idle' | 'checking' | 'available' | 'taken';

// ── Component ─────────────────────────────────────────────────────────────────
function EditAccount() {
  const history = useHistory();
  const location = useLocation();
  const { user, refreshUser } = useUser();
  const { databaseId, token } = useAuth();

  const [usernameStatus, setUsernameStatus] = useState<AvailStatus>('idle');
  const [emailStatus,    setEmailStatus]    = useState<AvailStatus>('idle');
  const [serverError,    setServerError]    = useState('');
  const [saved,          setSaved]          = useState(false);

  // Held outside of form state so effects can compare without re-triggering
  const originalUsername = React.useRef('');
  const originalEmail    = React.useRef('');

  // ── RHF setup ──────────────────────────────────────────────────────────────
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid, touchedFields },
  } = useForm<EditAccountForm>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      username: '', firstName: '', middleName: '', lastName: '',
      extensionName: '', gender: undefined, birthDate: '',
      contactNumber: '', email: '', address: '',
      studentId: '', year: '', program: '', major: '',
      profilePicture: null,
    },
  });

  // ── Seed from user context ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !isStudent(user)) return;
    const vals: EditAccountForm = {
      username:       user.username        ?? '',
      firstName:      user.firstName       ?? '',
      middleName:     user.middleName      ?? '',
      lastName:       user.lastName        ?? '',
      extensionName:  user.extensionName   ?? '',
      gender:         (user.gender as any) ?? undefined,
      birthDate:      (user.birthDate ?? '').split('T')[0],
      contactNumber:  user.contactNumber   ?? '',
      email:          user.emailAddress    ?? '',
      address:        user.address         ?? '',
      studentId:      user.userId          ?? '',
      year:           String(user.year     ?? ''),
      program:        user.program         ?? '',
      major:          user.major           ?? '',
      profilePicture: user.profilePicture  ?? null,
    };
    reset(vals);
    originalUsername.current = vals.username;
    originalEmail.current    = vals.email;
  }, [user, reset]);

  useEffect(() => {
    setSaved(false);
  }, [location.pathname])

  // ── Availability — username ─────────────────────────────────────────────────
  const checkUsername = async (username: string) => {
    const val = username?.trim() ?? '';
    if (!val || val.length < 3 || !/^[a-zA-Z0-9_]+$/.test(val)) {
      setUsernameStatus('idle');
      return;
    }
    if (val === originalUsername.current) {
      setUsernameStatus('available');
      return;
    }
    setUsernameStatus('checking');
    const t = setTimeout(async () => {
      try {
        const res = await API.get(`/users/exists/username/${val}`);
        setUsernameStatus(res.data.available ? 'available' : 'taken');
      } catch { setUsernameStatus('taken'); }
    }, 500);
    return () => clearTimeout(t);
  }

  // ── Availability — email ────────────────────────────────────────────────────
  const checkEmail = async (email: string) => {
    const val = email?.trim() ?? '';
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailStatus('idle');
      return;
    }
    if (val === originalEmail.current) {
      setEmailStatus('available');
      return;
    }
    setEmailStatus('checking');
    const t = setTimeout(async () => {
      try {
        const res = await API.get(`/users/exists/email/${val}`);
        setEmailStatus(res.data.available ? 'available' : 'taken');
      } catch { setEmailStatus('taken'); }
    }, 500);
    return () => clearTimeout(t);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data: EditAccountForm) => {
    if (usernameStatus === 'taken' || emailStatus === 'taken') return;
    setServerError('');
    try {
      await API.patch(`/users/${databaseId}/profile`,
        {
          username:      data.username.trim(),
          firstName:     data.firstName.trim(),
          middleName:    data.middleName?.trim()    ?? '',
          lastName:      data.lastName.trim(),
          extensionName: data.extensionName?.trim() ?? '',
          gender:        data.gender,
          birthDate:     data.birthDate,
          contactNumber: data.contactNumber.trim(),
          email:         data.email.trim(),
          address:       data.address.trim(),
          studentId:     data.studentId,
          year:          data.year,
          program:       data.program,
          major:         data.major,
          ...(data.profilePicture ? { profilePicture: data.profilePicture } : {}),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await refreshUser();
      setSaved(true);
      setTimeout(() => history.push('/account'), 1800);
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Failed to update profile. Please try again.');
    }
  };

  // ── UI helpers ──────────────────────────────────────────────────────────────
  const inputClass = (name: keyof EditAccountForm, avail?: AvailStatus) => {
    const touched  = touchedFields[name];
    const hasError = !!errors[name] || avail === 'taken';
    const isOk     = touched && !errors[name] && (!avail || avail === 'available');
    return `ea-styled-input${hasError ? ' ea-input-invalid' : isOk ? ' ea-input-valid' : ''}`;
  };

  const FieldIcon = ({ name }: { name: keyof EditAccountForm }) => {
    if (!touchedFields[name]) return null;
    if (errors[name]) return <IonIcon icon={alertCircleOutline}     className="ea-validation-icon ea-error" />;
    if (watch(name))  return <IonIcon icon={checkmarkCircleOutline} className="ea-validation-icon ea-valid" />;
    return null;
  };

  const AvailIcon = ({ status }: { status: AvailStatus }) => {
    if (status === 'available') return <IonIcon icon={checkmarkCircleOutline} className="ea-validation-icon ea-valid" />;
    if (status === 'taken')     return <IonIcon icon={alertCircleOutline}     className="ea-validation-icon ea-error" />;
    return null;
  };

  const FieldError = ({ name }: { name: keyof EditAccountForm }) =>
    errors[name] ? <span className="ea-field-hint ea-error">{errors[name]?.message as string}</span> : null;

  const AvailMsg = ({ status, msg }: { status: AvailStatus; msg: string }) => {
    if (status === 'checking') return <span className="ea-field-hint ea-checking">Checking…</span>;
    if (status === 'taken')    return <span className="ea-field-hint ea-error">{msg}</span>;
    return null;
  };

  const submitDisabled =
    isSubmitting ||
    usernameStatus === 'taken'    || emailStatus === 'taken' ||
    usernameStatus === 'checking' || emailStatus === 'checking' ||
    !isValid;

  // ── Success screen ──────────────────────────────────────────────────────────
  if (saved) {
    return (
      <IonPage>
        <IonContent fullscreen className="ea-content">
          <div className="ea-success-screen">
            <div className="ea-success-icon"><IonIcon icon={checkmarkCircleOutline} /></div>
            <h2 className="ea-success-title">Changes Saved!</h2>
            <p className="ea-success-sub">Your profile has been updated successfully.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <IonPage>
      <IonContent fullscreen className="ea-content">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Hero */}
          <div className="ea-hero">
            <div className="ea-hero-bg" />
            <div className="ea-hero-nav">
              <button type="button" className="ea-back-btn" onClick={() => history.push('/account')}>
                <IonIcon icon={arrowBackOutline} />
              </button>
              <div>
                <h1 className="ea-hero-title">Edit Profile</h1>
                <p className="ea-hero-sub">Update your account information</p>
              </div>
            </div>

            <Controller
              name="profilePicture"
              control={control}
              render={({ field }) => (
                <AvatarCropInput value={field.value ?? null} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="ea-container">

            {/* Personal Information */}
            <div className="ea-section">
              <p className="ea-section-label">Personal Information</p>

              {/* Username */}
              <div className={`ea-input-group ${errors.username || usernameStatus === 'taken' ? 'ea-group-error' : ''}`}>
                <label className="ea-floating-label">
                  <IonIcon icon={personCircleOutline} className="ea-label-icon" />Username
                </label>
                <div className="ea-input-container">
                  <input {...register('username')} 
                    type="text" 
                    maxLength={30} 
                    placeholder="Your username"
                    className={inputClass('username', usernameStatus)} 
                    onBlur={(e) => {
                      register('username').onBlur(e);
                      checkUsername(e.target.value);
                    }}
                  />
                  <AvailIcon status={usernameStatus} />
                  {errors.username && <IonIcon icon={alertCircleOutline} className="ea-validation-icon ea-error" />}
                </div>
                <FieldError name="username" />
                {!errors.username && <AvailMsg status={usernameStatus} msg="Username already taken" />}
              </div>

              {/* First Name */}
              <div className={`ea-input-group ${errors.firstName ? 'ea-group-error' : ''}`}>
                <label className="ea-floating-label">
                  <IonIcon icon={personOutline} className="ea-label-icon" />First Name
                </label>
                <div className="ea-input-container">
                  <input {...register('firstName')} type="text" maxLength={100} placeholder="First name"
                    className={inputClass('firstName')} />
                  <FieldIcon name="firstName" />
                </div>
                <FieldError name="firstName" />
              </div>

              {/* Middle Name */}
              <div className="ea-input-group">
                <label className="ea-floating-label">
                  <IonIcon icon={personOutline} className="ea-label-icon" />
                  Middle Name <span className="ea-optional">(optional)</span>
                </label>
                <div className="ea-input-container">
                  <input {...register('middleName')} type="text" maxLength={50} placeholder="Middle name"
                    className={`ea-styled-input ${watch('middleName') ? 'ea-input-valid' : ''}`} />
                  {watch('middleName') && <IonIcon icon={checkmarkCircleOutline} className="ea-validation-icon ea-valid" />}
                </div>
              </div>

              {/* Last Name */}
              <div className={`ea-input-group ${errors.lastName ? 'ea-group-error' : ''}`}>
                <label className="ea-floating-label">
                  <IonIcon icon={personOutline} className="ea-label-icon" />Last Name
                </label>
                <div className="ea-input-container">
                  <input {...register('lastName')} type="text" maxLength={50} placeholder="Last name"
                    className={inputClass('lastName')} />
                  <FieldIcon name="lastName" />
                </div>
                <FieldError name="lastName" />
              </div>

              {/* Extension Name */}
              <div className="ea-input-group">
                <label className="ea-floating-label">
                  <IonIcon icon={personOutline} className="ea-label-icon" />
                  Extension Name <span className="ea-optional">(optional)</span>
                </label>
                <div className="ea-input-container">
                  <input {...register('extensionName')} type="text" maxLength={10} placeholder="e.g. Jr., III"
                    className={`ea-styled-input ${watch('extensionName') ? 'ea-input-valid' : ''}`} />
                  {watch('extensionName') && <IonIcon icon={checkmarkCircleOutline} className="ea-validation-icon ea-valid" />}
                </div>
              </div>

              {/* Gender */}
              <div className={`ea-input-group ${errors.gender ? 'ea-group-error' : ''}`}>
                <label className="ea-floating-label">
                  <IonIcon icon={transgenderOutline} className="ea-label-icon" />Gender
                </label>
                <div className="ea-input-container">
                  <select {...register('gender')} className={inputClass('gender')}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <FieldIcon name="gender" />
                </div>
                <FieldError name="gender" />
              </div>

              {/* Birthday */}
              <div className={`ea-input-group ${errors.birthDate ? 'ea-group-error' : ''}`}>
                <label className="ea-floating-label">
                  <IonIcon icon={calendarOutline} className="ea-label-icon" />Birthday
                </label>
                <div className="ea-input-container">
                  <input
                    {...register('birthDate')} type="date"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 17)).toISOString().split('T')[0]}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 80)).toISOString().split('T')[0]}
                    className={inputClass('birthDate')}
                  />
                  <FieldIcon name="birthDate" />
                </div>
                <FieldError name="birthDate" />
              </div>

              {/* Contact Number */}
              <div className={`ea-input-group ${errors.contactNumber ? 'ea-group-error' : ''}`}>
                <label className="ea-floating-label">
                  <IonIcon icon={callOutline} className="ea-label-icon" />Contact Number
                </label>
                <div className="ea-input-container">
                  <input {...register('contactNumber')} type="tel" maxLength={11} placeholder="09XXXXXXXXX"
                    className={inputClass('contactNumber')} />
                  <FieldIcon name="contactNumber" />
                </div>
                <FieldError name="contactNumber" />
              </div>

              {/* Email */}
              <div className={`ea-input-group ${errors.email || emailStatus === 'taken' ? 'ea-group-error' : ''}`}>
                <label className="ea-floating-label">
                  <IonIcon icon={mailOutline} className="ea-label-icon" />Email Address
                </label>
                <div className="ea-input-container">
                  <input {...register('email')} 
                    type="email" 
                    maxLength={100} 
                    placeholder="your@email.com"
                    className={inputClass('email', emailStatus)} 
                    onBlur={(e) => { 
                      register('email').onBlur(e);
                      checkEmail(e.target.value);
                    }} 
                  />
                  <AvailIcon status={emailStatus} />
                  {errors.email && <IonIcon icon={alertCircleOutline} className="ea-validation-icon ea-error" />}
                </div>
                <FieldError name="email" />
                {!errors.email && <AvailMsg status={emailStatus} msg="Email already taken" />}
              </div>

              {/* Address */}
              <div className={`ea-input-group ${errors.address ? 'ea-group-error' : ''}`}>
                <label className="ea-floating-label">
                  <IonIcon icon={locationOutline} className="ea-label-icon" />Address
                </label>
                <div className="ea-input-container">
                  <textarea {...register('address')} maxLength={255}
                    placeholder="Barangay, Town, Province/City"
                    className={`${inputClass('address')} no-scroll`} />
                  <FieldIcon name="address" />
                </div>
                <FieldError name="address" />
              </div>
            </div>

            {/* Academic Details */}
            <div className="ea-section">
              <p className="ea-section-label">Academic Details</p>
              <p className="ea-section-hint">Some fields are managed by your institution</p>

              {/* Student ID — locked */}
              <div className="ea-input-group">
                <label className="ea-floating-label">
                  <IonIcon icon={shieldCheckmarkOutline} className="ea-label-icon" />Student ID
                </label>
                <div className="ea-input-container">
                  <input {...register('studentId')} type="text" readOnly disabled
                    className="ea-styled-input ea-input-locked" />
                  <span className="ea-lock-badge">Locked</span>
                </div>
              </div>

              {/* Year Level */}
              <div className={`ea-input-group ${errors.year ? 'ea-group-error' : ''}`}>
                <label className="ea-floating-label">
                  <IonIcon icon={statsChartOutline} className="ea-label-icon" />Year Level
                </label>
                <div className="ea-input-container">
                  <select {...register('year')} className={inputClass('year')}>
                    <option value="">Select year level</option>
                    <option value="2">2nd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  <FieldIcon name="year" />
                </div>
                <FieldError name="year" />
              </div>

              {/* Program — locked */}
              <div className="ea-input-group">
                <label className="ea-floating-label">
                  <IonIcon icon={schoolOutline} className="ea-label-icon" />Program / Course
                </label>
                <div className="ea-input-container">
                  <input {...register('program')} type="text" readOnly disabled
                    className="ea-styled-input ea-input-locked" />
                  <span className="ea-lock-badge">Locked</span>
                </div>
              </div>

              {/* Major — locked */}
              <div className="ea-input-group">
                <label className="ea-floating-label">
                  <IonIcon icon={codeSlashOutline} className="ea-label-icon" />Major
                </label>
                <div className="ea-input-container">
                  <input {...register('major')} type="text" readOnly disabled
                    className="ea-styled-input ea-input-locked" />
                  <span className="ea-lock-badge">Locked</span>
                </div>
              </div>
            </div>

            {/* Server error */}
            {serverError && (
              <div className="ea-server-error">
                <IonIcon icon={alertCircleOutline} />
                <span>{serverError}</span>
              </div>
            )}

            {/* Save */}
            <button
              type="submit"
              className={`ea-save-btn ${!submitDisabled ? 'ea-save-ready' : ''} ${isSubmitting ? 'ea-save-loading' : ''}`}
              disabled={submitDisabled}
            >
              {isSubmitting
                ? <><span className="ea-spinner" />Saving Changes…</>
                : <><IonIcon icon={saveOutline} />Save Changes</>}
            </button>

            <div className="ea-bottom-space" />
          </div>

        </form>
      </IonContent>
    </IonPage>
  );
};

export default EditAccount;