import React from 'react';
import { IonIcon } from '@ionic/react';
import { lockClosedOutline, businessOutline, checkmarkCircleOutline, arrowBackOutline } from 'ionicons/icons';
import { useNavigation } from '@hooks/useNavigation';
import '@css/LockedOjtScreen.css';

interface LockedOjtScreenProps {
  type: 'unassigned' | 'completed';
  title?: string;
  description?: string;
  backPath?: string;
}

function LockedOjtScreen ({type, title, description, backPath}: LockedOjtScreenProps) {
  const { navigate } = useNavigation();

  const config = {
    unassigned: {
      icon: businessOutline,
      defaultTitle: 'No Office Assigned',
      defaultDesc: 'You haven\'t been assigned to a partner office for this term yet. Please contact your OJT coordinator to proceed.',
      color: 'var(--orange)'
    },
    completed: {
      icon: checkmarkCircleOutline,
      defaultTitle: 'OJT Term Completed',
      defaultDesc: 'This OJT record is already marked as completed. You can no longer record attendance or submit new reports for this term.',
      color: 'var(--ok)'
    }
  }[type];

  return (
    <div className="locked-screen">
      <div className="locked-hero">
        <div className="locked-hero-bg" style={{ background: config.color }} />
        
        {backPath && (
          <button className="locked-back-btn" onClick={() => navigate(backPath)}>
            <IonIcon icon={arrowBackOutline} />
          </button>
        )}

        <div className="locked-hero-inner">
          <div className="locked-main-icon">
            <IonIcon icon={config.icon} />
            <div className="locked-badge">
               <IonIcon icon={lockClosedOutline} />
            </div>
          </div>
        </div>
      </div>

      <div className="locked-content">
        <h1 className="locked-title">{title || config.defaultTitle}</h1>
        <p className="locked-description">{description || config.defaultDesc}</p>
        
        <div className="locked-actions">
           <button className="locked-primary-btn" onClick={() => navigate('/dashboard', 'root')}>
             Return to Dashboard
           </button>
        </div>
      </div>
    </div>
  );
};

export default LockedOjtScreen;
