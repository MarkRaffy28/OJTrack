import React, { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import {
  documentTextOutline, closeOutline, checkmarkCircleOutline,
  arrowForwardOutline, checkmarkOutline,
} from 'ionicons/icons';
import "@css/TermsModal.css";

export const TERMS_SECTIONS: [string, string][] = [
  ['1. Acceptance of Terms',       'By creating an account on OJTrack, you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, you may not use our service.'],
  ['2. User Accounts',             'You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration.\n\nYou must not share your login credentials with any third party. OJTrack reserves the right to suspend or terminate accounts that violate these terms.'],
  ['3. Use of the Platform',       'OJTrack is intended solely for on-the-job training (OJT) management. Prohibited activities include submitting false attendance records, impersonating another user, or attempting unauthorized access.'],
  ['4. Privacy & Data Collection', 'We collect personal information such as your name, email, student/employee ID, and profile photo for the purpose of operating OJTrack. Your data will not be sold to third parties.\n\nBy registering, you consent to data collection per our Privacy Policy.'],
  ['5. Student Responsibilities',  'Students must accurately log their OJT hours and submit timely reports. Falsification of records may result in permanent account suspension.'],
  ['6. Supervisor Responsibilities','Supervisors must review and validate student submissions honestly and fairly.'],
  ['7. Intellectual Property',     'All content and features of OJTrack are the exclusive property of OJTrack and protected by applicable intellectual property laws.'],
  ['8. Limitation of Liability',   'OJTrack shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.'],
  ['9. Modifications to Terms',    'OJTrack may modify these Terms at any time. Continued use after changes constitutes acceptance of the revised terms.'],
  ['10. Contact',                  'Questions? Contact the OJTrack system administrator at your institution.'],
];

interface TermsModalProps {
  onClose: () => void;
  mode?: 'register' | 'view';
  onAccept?: () => void;
}

function TermsModal({ onClose, mode = 'view', onAccept }: TermsModalProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [accepted, setAccepted]           = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 45) setScrolledToEnd(true);
  };

  // Check if content is already at bottom or fits within container
  useEffect(() => {
    if (mode !== 'register' || !bodyRef.current) return;
    
    const checkScroll = () => {
      const el = bodyRef.current;
      if (el) {
        // If content height is less than container height, it's already "read"
        if (el.scrollHeight <= el.clientHeight + 5) {
          setScrolledToEnd(true);
        }
      }
    };

    // Delay slightly to ensure content is fully rendered and layout finished
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [mode]);

  return (
    <div className="tc-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tc-sheet">

        {/* Header */}
        <div className="tc-header">
          <div className="tc-header-left">
            <div className="tc-header-icon">
              <IonIcon icon={documentTextOutline} />
            </div>
            <div>
              <div className="tc-header-title">Terms &amp; Conditions</div>
              <div className="tc-header-subtitle">
                {mode === 'register' ? 'Read carefully before creating your account' : 'OJTrack policies and guidelines'}
              </div>
            </div>
          </div>
          <button className="tc-close-btn" onClick={onClose}>
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        {/* Scroll hint */}
        {mode === 'register' && (
          <div className={`tc-scroll-hint ${scrolledToEnd ? 'done' : 'pending'}`}>
            <IonIcon icon={scrolledToEnd ? checkmarkCircleOutline : arrowForwardOutline} />
            {scrolledToEnd ? "You've finished reading — you may now accept below" : 'Scroll to the bottom to unlock the agreement checkbox'}
          </div>
        )}

        {/* Body */}
        <div className="tc-body" 
             ref={bodyRef}
             onScroll={mode === 'register' ? handleScroll : undefined}>
          {TERMS_SECTIONS.map(([title, body], i) => (
            <div key={i} className="tc-section">
              <div className="tc-section-title">{title}</div>
              {body.split('\n\n').map((para, j) => (
                <p key={j} className="tc-section-para">{para}</p>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="tc-footer">
          {mode === 'register' ? (
            <>
              <label className={`tc-checkbox-label ${scrolledToEnd ? 'unlocked' : 'locked'}`}>
                <div
                  className={`tc-checkbox-box ${accepted ? 'checked' : 'unchecked'}`}
                  onClick={() => scrolledToEnd && setAccepted(v => !v)}
                >
                  {accepted && <IonIcon icon={checkmarkOutline} />}
                </div>
                <span className="tc-checkbox-text">
                  I have read and agree to the <strong>Terms and Conditions</strong>
                </span>
              </label>
              <div className="tc-actions">
                <button className="tc-btn-decline" onClick={onClose}>Decline</button>
                <button
                  className={`tc-btn-agree ${accepted ? 'active' : 'inactive'}`}
                  onClick={() => accepted && onAccept?.()}
                  disabled={!accepted}
                >
                  <IonIcon icon={checkmarkCircleOutline} /> I Agree &amp; Create Account
                </button>
              </div>
            </>
          ) : (
            <button className="tc-btn-close" onClick={onClose}>
              <IonIcon icon={checkmarkCircleOutline} /> Got it
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default TermsModal;