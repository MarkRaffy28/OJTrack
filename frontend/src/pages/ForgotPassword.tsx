import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent, IonText, IonImg, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, RefresherEventDetail } from '@ionic/react';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, checkmarkCircleOutline, arrowForwardOutline, alertCircleOutline, chevronDownCircleOutline, keyOutline, arrowBackOutline } from 'ionicons/icons';
import { useNavigation } from '@/hooks/useNavigation';
import API from '@api/api';
import "@css/VerifyEmailModal.css";

function ForgotPassword() {
  const { navigate, goBack } = useNavigation();

  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailTouched, setEmailTouched] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    if (step === 'email') setEmail('');
    else if (step === 'otp') setOtp(['', '', '', '', '', '']);
    else {
      setNewPassword('');
      setConfirmPassword('');
    }
    setError('');
    setSuccess('');
    await new Promise(resolve => setTimeout(resolve, 800));
    event.detail.complete();
  };

  const handleSendOTP = async () => {
    if (!email) return;
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await API.post("/auth/forgot-password-otp", { email });
      setSuccess("OTP sent to your email.");
      setStep('otp');
      setCooldown(60);
    } catch (err: any) {
      if (err.response?.status === 400 && err.response.data.timeLeftSeconds) {
        setCooldown(err.response.data.timeLeftSeconds);
        setStep('otp');
        setError("Please wait before requesting another OTP.");
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) return setError("Please enter the 6-digit OTP.");
    setError("");
    setStep('reset');
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await API.post("/auth/reset-password", {
        email,
        otp: otp.join(''),
        newPassword
      });
      setSuccess("Password reset successfully!");
      setTimeout(() => {
        navigate('/login', 'root');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode="md">
          <IonRefresherContent 
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="crescent"
          />
        </IonRefresher>

        <div className="login-page forgot-page">
          <div className="login-background">
            <div className="bg-gradient" />
            <div className="bg-shape bg-shape-1" />
            <div className="bg-shape bg-shape-2" />
          </div>

          <div className="login-container auth-container">
            <div className="login-header auth-header">
              <div className="logo-wrapper">
                <IonImg src="/logo.svg" alt="OJTrack Logo" className="logo-image" />
              </div>
              <IonText className="header-text">
                <h1 className="title">
                  {step === 'email' && "Forgot Password"}
                  {step === 'otp' && "Verify OTP"}
                  {step === 'reset' && "New Password"}
                </h1>
                <p className="subtitle">
                  {step === 'email' && "Enter your email to receive a reset code"}
                  {step === 'otp' && `Enter the 6-digit code sent to ${email}`}
                  {step === 'reset' && "Set your new account password"}
                </p>
              </IonText>
            </div>

            <div className="login-form auth-form">
              {step === 'email' && (
                <div className="step-content">
                  <div className={`input-group ${isEmailTouched && !email ? 'input-error' : ''}`}>
                    <label className="floating-label">
                      <IonIcon icon={mailOutline} className="label-icons" />
                      Email Address
                    </label>
                    <div className="input-container">
                      <input
                        type="email"
                        value={email}
                        placeholder="Enter your registered email"
                        className={`styled-input
                          ${email && email.includes('@') ? 'input-valid' : ''}
                          ${isEmailTouched && !email ? 'input-invalid' : ''}`}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setEmailTouched(true)}
                      />
                      {email && email.includes('@') && (
                        <IonIcon icon={checkmarkCircleOutline} className="validation-icon success" />
                      )}
                    </div>
                  </div>

                  <button
                    className={`login-button primary-button ${email.includes('@') ? 'button-ready' : ''}`}
                    onClick={handleSendOTP}
                    disabled={!email.includes('@') || isSubmitting}
                  >
                    {isSubmitting ? (
                      <span><IonSpinner className="button-spinner" /> Sending...</span>
                    ) : (
                      <>
                        <span>Send Reset Code</span>
                        <IonIcon icon={arrowForwardOutline} className="button-icon" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {step === 'otp' && (
                <div className="step-content">
                  <div className="vem-otp-container" style={{ marginTop: '1rem' }}>
                    {otp.map((digit, i) => (
                      <React.Fragment key={i}>
                        <input 
                          ref={el => { inputRefs.current[i] = el; }}
                          className="vem-otp-input"
                          type="text"
                          inputMode="numeric"
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          maxLength={1}
                        />
                        {i === 2 && <span className="vem-otp-separator">-</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="vem-resend-container">
                    <button 
                      className="vem-btn-resend"
                      onClick={handleSendOTP} 
                      disabled={isSubmitting || cooldown > 0}
                    >
                      {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                    </button>
                  </div>

                  <button
                    className={`login-button primary-button ${otp.join('').length === 6 ? 'button-ready' : ''}`}
                    onClick={handleVerifyOTP}
                    disabled={otp.join('').length < 6 || isSubmitting}
                    style={{ marginTop: '1.5rem' }}
                  >
                    <span>Verify Code</span>
                    <IonIcon icon={arrowForwardOutline} className="button-icon" />
                  </button>

                  <button 
                    className="forgot-link" 
                    onClick={() => setStep('email')}
                    style={{ width: '100%', textAlign: 'center', marginTop: '1rem' }}
                  >
                    <IonIcon icon={arrowBackOutline} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    Back to Email
                  </button>
                </div>
              )}

              {step === 'reset' && (
                <div className="step-content">
                  <div className="input-group">
                    <label className="floating-label">
                      <IonIcon icon={lockClosedOutline} className="label-icon" />
                      New Password
                    </label>
                    <div className="input-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        placeholder="Min. 6 characters"
                        className={`styled-input ${newPassword.length >= 6 ? 'input-valid' : ''}`}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(p => !p)}
                      >
                        <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="floating-label">
                      <IonIcon icon={lockClosedOutline} className="label-icon" />
                      Confirm Password
                    </label>
                    <div className="input-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        placeholder="Repeat new password"
                        className={`styled-input ${confirmPassword && confirmPassword === newPassword ? 'input-valid' : ''}`}
                        onChange={e => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    className={`login-button primary-button ${newPassword && newPassword === confirmPassword && newPassword.length >= 6 ? 'button-ready' : ''}`}
                    onClick={handleResetPassword}
                    disabled={!newPassword || newPassword !== confirmPassword || newPassword.length < 6 || isSubmitting}
                  >
                    {isSubmitting ? (
                      <span><IonSpinner className="button-spinner" /> Resetting...</span>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <IonIcon icon={checkmarkCircleOutline} className="button-icon" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <IonIcon icon={alertCircleOutline} className="error-icon" />
                  {error}
                </div>
              )}

              {success && (
                <div className="success-message">
                  <IonIcon icon={checkmarkCircleOutline} className="error-icon" />
                  {success}
                </div>
              )}

              <div className="register-section">
                <IonText className="register-text">
                  Remember your password?{' '}
                  <span className="register-link" onClick={() => navigate('/login')}>
                    Log In
                  </span>
                </IonText>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default ForgotPassword;
