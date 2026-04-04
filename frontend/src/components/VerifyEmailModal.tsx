import React, { useState, useEffect, useRef } from "react";
import { IonIcon, IonSpinner } from "@ionic/react";
import { mailOutline, checkmarkCircleOutline, keyOutline, alertCircleOutline } from "ionicons/icons";
import { useUser } from "@context/userContext";
import API from "@api/api";
import "@css/VerifyEmailModal.css";

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function VerifyEmailModal({ isOpen, onClose }: VerifyEmailModalProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep('request');
      setOtp(['', '', '', '', '', '']);
      setError('');
      setSuccess('');
      setIsLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleSendOTP = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await API.post(`/auth/send-email-otp`, { email: user?.emailAddress });
      setSuccess("OTP sent to your email.");
      setStep('verify');
      setCooldown(60);
    } catch (err: any) {
      if (err.response?.status === 400 && err.response.data.timeLeftSeconds) {
        setCooldown(err.response.data.timeLeftSeconds);
        setStep('verify');
        setError("Please wait before requesting another OTP.");
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) return setError("Please enter the 6-digit OTP.");
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await API.post(`/auth/verify-email-otp`, { 
        email: user?.emailAddress, 
        otp: fullOtp 
      });
      setSuccess("Email verified successfully!");
      refreshUser(); // Intentionally fire background refresh
      setTimeout(() => { onClose(); }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next
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
    <div className="cp-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cp-modal">
        
        <div className="cp-header">
          <div className="cp-header-icon">
            <IonIcon icon={step === 'request' ? mailOutline : keyOutline} />
          </div>
          <div>
            <p className="cp-header-title">Verify Email</p>
            <p className="cp-header-subtitle">
              {step === 'request' ? 'Enhance your account security' : 'Enter the code sent to your email'}
            </p>
          </div>
        </div>

        <div className="cp-field vem-email-container">
          <p className="vem-email-display">
            {user?.emailAddress}
          </p>
        </div>
        
        {step === 'verify' && (
          <div className="vem-otp-container">
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
        )}

        {error && <div className="cp-alert-error"><p><IonIcon icon={alertCircleOutline} className="vem-error-icon"/> {error}</p></div>}
        {success && <div className="cp-alert-success"><p><IonIcon icon={checkmarkCircleOutline} className="vem-success-icon"/> {success}</p></div>}

        <div className="cp-actions">
          <button className="cp-btn-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
          
          {step === 'request' ? (
            <button 
              className="cp-btn-submit" 
              onClick={handleSendOTP}
              disabled={isLoading || cooldown > 0}
            >
              {isLoading ? (
                <span className="vem-btn-content">
                  <IonSpinner className="button-spinner" /> Sending...
                </span>
              ) : (
                cooldown > 0 ? `Wait ${cooldown}s` : 'Send OTP'
              )}
            </button>
          ) : (
            <button 
              className="cp-btn-submit" 
              onClick={handleVerify}
              disabled={isLoading || otp.join('').length < 6}
            >
              {isLoading ? (
                <span className="vem-btn-content">
                  <IonSpinner className="button-spinner" /> Verifying...
                </span>
              ) : (
                'Verify'
              )}
            </button>
          )}
        </div>
        
        {step === 'verify' && (
           <div className="vem-resend-container">
             <button 
               className="vem-btn-resend"
               onClick={handleSendOTP} 
               disabled={isLoading || cooldown > 0}
             >
               {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
             </button>
           </div>
        )}

      </div>
    </div>
  );
}

export default VerifyEmailModal;
