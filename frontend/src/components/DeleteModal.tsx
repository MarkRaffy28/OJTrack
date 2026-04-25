import React from 'react';
import { IonIcon } from '@ionic/react';
import { trashOutline, alertCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  isDeleting: boolean;
  deleteComplete: boolean;
}

function DeleteModal ({isOpen, onClose, onConfirm, title, description, isDeleting, deleteComplete}: DeleteModalProps) {
  return (
    <div className={`modal-overlay ${isOpen ? 'is-open' : ''}`} onClick={e => { if (e.target === e.currentTarget && !isDeleting && !deleteComplete) onClose(); }}>

      <div className="modal-box">
        {!deleteComplete ? (
          <>
            <div className="modal-header">
              <div className="modal-icon-wrap">
                <IonIcon icon={trashOutline} className="modal-icon" />
              </div>
              <div className="modal-title">{title}</div>
            </div>
            <div className="modal-body">
              <p className="modal-desc">{description}</p>
              <div className="modal-warning">
                <IonIcon icon={alertCircleOutline} className="warning-icon" />
                <span>This action is permanent and cannot be undone. All associated data will be lost.</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={onClose} disabled={isDeleting}>
                Cancel
              </button>
              <button 
                className="modal-btn-delete" 
                onClick={onConfirm} 
                disabled={isDeleting}
              >
                {isDeleting ? <><div className="spinner"></div>Deleting…</> : <><IonIcon icon={trashOutline} className="btn-icon" />Confirm Delete</>}
              </button>
            </div>
          </>
        ) : (
          <div className="modal-success">
            <div className="modal-success-icon">
              <IonIcon icon={checkmarkCircleOutline} className="success-icon" />
            </div>
            <div className="modal-success-title">Successfully Deleted</div>
            <div className="modal-success-sub">The record has been permanently removed. Redirecting…</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteModal;
