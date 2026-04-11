import React, { useEffect, useRef, useCallback } from 'react';
import { IonIcon } from '@ionic/react';
import { powerOutline, arrowBackOutline } from 'ionicons/icons';
import '@css/ExitModal.css';

interface ExitModalProps {
  isOpen: boolean;
  onExit: () => void;
  onCancel: () => void;
}

function ExitModal({ isOpen, onExit, onCancel }: ExitModalProps) {
  const modalRef       = useRef<HTMLDivElement>(null);
  const exitBtnRef     = useRef<HTMLButtonElement>(null);
  const prevActiveElRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    },
    [isOpen, onCancel]
  );

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  const handleModalTab = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  };

  useEffect(() => {
    if (isOpen) {
      prevActiveElRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      const t = setTimeout(() => exitBtnRef.current?.focus(), 150);
      return () => {
        clearTimeout(t);
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
      prevActiveElRef.current?.focus();
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="em-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="em-title"
      aria-describedby="em-subtitle"
    >
      <div ref={modalRef} className="em-sheet" onKeyDown={handleModalTab}>

        {/* Icon */}
        <div className="em-icon-wrap">
          <div className="em-icon-ring em-ring-outer" />
          <div className="em-icon-ring em-ring-inner" />
          <div className="em-icon-circle">
            <IonIcon icon={powerOutline} />
          </div>
        </div>

        {/* Text */}
        <h2 className="em-title" id="em-title">Exit App?</h2>
        <p className="em-subtitle" id="em-subtitle">
          Are you sure you want to exit OJTrack?
        </p>

        <div className="em-divider" />

        {/* Actions */}
        <div className="em-actions">
          <button
            ref={exitBtnRef}
            className="em-btn em-btn-exit"
            onClick={onExit}
          >
            <span className="em-btn-icon em-btn-icon-exit">
              <IonIcon icon={powerOutline} />
            </span>
            Exit App
          </button>
          <button className="em-btn em-btn-stay" onClick={onCancel}>
            <span className="em-btn-icon em-btn-icon-stay">
              <IonIcon icon={arrowBackOutline} />
            </span>
            Stay in App
          </button>
        </div>

      </div>
    </div>
  );
}

export default ExitModal;
