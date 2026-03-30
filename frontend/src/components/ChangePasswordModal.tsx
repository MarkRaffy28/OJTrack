import React, { useState, useEffect } from "react";
import { IonIcon, IonSpinner } from "@ionic/react";
import { eyeOffOutline, eyeOutline, lockClosedOutline } from "ionicons/icons";
import { useAuth } from "@context/authContext";
import API from "@api/api";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { databaseId, token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState(false);
  const [isUpdating, setIsUpdating]           = useState(false);

  const formReady = currentPassword && newPassword && confirmPassword;

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword(''); 
      setNewPassword(''); 
      setConfirmPassword('');
      setShowCurrent(false);  
      setShowNew(false);  
      setShowConfirm(false);
      setError(''); 
      setSuccess(false);
      setIsUpdating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formReady) return;

    setError("");
    setIsUpdating(true);

    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return setError('Please fill in all fields.'); 
      }
      if (newPassword.length < 6) {
        return setError('New password must be at least 6 characters.');
      }
      if (newPassword !== confirmPassword) {
        return setError('New password do not match.');
      }
      if (newPassword === currentPassword) {
        return setError('New password must be different from current password.');
      }

      await API.patch(`/users/update/password/${databaseId}`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setTimeout(() => { onClose(); }, 1000)  ;

    } catch (error: any) {
      console.log("Err: ", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError(error.response.data?.message || "Current password is incorrect.");
        } else {
          setError(error.response.data?.message || "Failed to update password.");
        }
      } else {
        setError("Server error. Please try again later.");
      }

    } finally {
      setIsUpdating(false);
    }
  };

  const fieldConfig = [
    { label: 'Current Password', val: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(p => !p) },
    { label: 'New Password',     val: newPassword,     set: setNewPassword,     show: showNew,     toggle: () => setShowNew(p => !p)     },
    { label: 'Confirm Password', val: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(p => !p) },
  ];

  return (
    <div className="cp-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cp-modal">

        <div className="cp-header">
          <div className="cp-header-icon">
            <IonIcon icon={lockClosedOutline} />
          </div>
          <div>
            <p className="cp-header-title">Change Password</p>
            <p className="cp-header-subtitle">Keep your account secure</p>
          </div>
        </div>

        {fieldConfig.map((field, i) => (
          <div key={i} className="cp-field">
            <p className="cp-field-label">{field.label}</p>
            <div className="cp-field-input-wrapper">
              <input 
                className="cp-field-input"
                type={field.show ? 'text' : 'password'}
                value={field.val}
                onChange={e => field.set(e.target.value)}
                placeholder="••••••••"
              />
              <button className="cp-field-toggle" onClick={field.toggle}>
                <IonIcon icon={field.show ? eyeOffOutline : eyeOutline} />
              </button>
            </div>
          </div>
        ))}

        {error   && <div className="cp-alert-error">  <p>{error}</p></div>}
        {success && <div className="cp-alert-success"><p>✓ Password updated successfully!</p></div>}

        <div className="cp-actions">
          <button className="cp-btn-cancel" onClick={onClose}>Cancel</button>
          <button 
            className="cp-btn-submit" 
            onClick={handleSubmit}
            disabled={!formReady || isUpdating }
          >
            {
              isUpdating ? (
                <span>
                  <IonSpinner className="button-spinner"></IonSpinner>
                    Updating...
                </span>
              ) : (
                <>
                  <span>  
                    Update
                  </span>
                </>
              )
            }
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChangePasswordModal;