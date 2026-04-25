import React from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import {  
  logInOutline,  logOutOutline,  cloudUploadOutline,  personOutline,  shieldCheckmarkOutline, keyOutline,  trashOutline,  
  createOutline,  timeOutline, businessOutline, settingsOutline, personRemoveOutline, peopleOutline, checkmarkDoneOutline
} from 'ionicons/icons';
import { formatRelativeDate, formatTime12 } from '@utils/date';

export interface ActivityItem {
  id: number;
  fullName?: string;
  action: string;
  targetType?: string;
  description: string;
  createdAt: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  loading: boolean;
  maxItems?: number;
}

const typeConfig: Record<string, { icon: string; color: string; bg: string; label: string; badge: string }> = {
  'TIME_IN':        { icon: logInOutline,           color: '#34d399', bg: 'rgba(52,211,153,0.15)',  label: 'Time In',      badge: 'badge-success' },
  'TIME_OUT':       { icon: logOutOutline,          color: '#f87171', bg: 'rgba(248,113,113,0.15)', label: 'Time Out',     badge: 'badge-danger'  },
  'SUBMIT_REPORT':  { icon: cloudUploadOutline,     color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  label: 'Report',       badge: 'badge-blue'    },
  'CREATE_REPORT':  { icon: cloudUploadOutline,     color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  label: 'Report',       badge: 'badge-blue'    },
  'UPDATE_REPORT':  { icon: createOutline,          color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  label: 'Update',       badge: 'badge-blue'    },
  'DELETE_REPORT':  { icon: trashOutline,           color: '#f87171', bg: 'rgba(248,113,113,0.15)', label: 'Delete',       badge: 'badge-danger'  },
  'LOGIN':          { icon: personOutline,          color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', label: 'Login',        badge: 'badge-purple'  },
  'LOGOUT':         { icon: personOutline,          color: '#ec4899', bg: 'rgba(236,72,153,0.15)',  label: 'Logout',       badge: 'badge-pink'    },
  'REGISTER':       { icon: shieldCheckmarkOutline, color: '#10b981', bg: 'rgba(16,185,129,0.15)',  label: 'Register',     badge: 'badge-success' },
  'UPDATE_PROFILE': { icon: personOutline,          color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  label: 'Profile',      badge: 'badge-orange'  },
  'UPDATE_PASSWORD':{ icon: keyOutline,             color: '#6366f1', bg: 'rgba(99,102,241,0.15)',  label: 'Password',     badge: 'badge-indigo'  },
  'CREATE_OFFICE':  { icon: businessOutline,        color: '#10b981', bg: 'rgba(16,185,129,0.15)',  label: 'New Office',   badge: 'badge-success' },
  'UPDATE_OFFICE':  { icon: businessOutline,        color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  label: 'Edit Office',  badge: 'badge-orange'  },
  'DELETE_OFFICE':  { icon: trashOutline,           color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   label: 'Drop Office',  badge: 'badge-danger'  },
  'UPDATE_SETTINGS':{ icon: settingsOutline,        color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)',  label: 'Settings',     badge: 'badge-purple'  },
  'DELETE_TRAINEE': { icon: personRemoveOutline,    color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   label: 'Drop User',    badge: 'badge-danger'  },
  'ASSIGN_SUPERVISOR':{icon: peopleOutline,         color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  label: 'Assign Sup',   badge: 'badge-blue'    },
  'EDIT_USER':      { icon: createOutline,          color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  label: 'Edit User',    badge: 'badge-orange'  },
  'EVALUATE_REPORT':{ icon: checkmarkDoneOutline,   color: '#10b981', bg: 'rgba(16,185,129,0.15)',  label: 'Evaluate',     badge: 'badge-success' },
};

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, loading, maxItems = 5 }) => {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="activity-feed">
      {loading && activities.length === 0 && (
        <div className="dash-loading">
          <IonSpinner name="crescent" />
        </div>
      )}

      {!loading && displayActivities.length === 0 && (
        <p className="no-data-msg">No recent activity</p>
      )}

      {displayActivities.map((activity, idx) => {
        const cfg = typeConfig[activity.action] || { 
          icon: timeOutline, 
          color: '#6b7280', 
          bg: 'rgba(107,114,128,0.1)', 
          label: activity.action,
          badge: 'badge-gray'
        };
        const isLast = idx === displayActivities.length - 1;

        return (
          <div key={activity.id} className={`activity-feed-item ${isLast ? 'last-item' : ''}`}>
            <div className={`feed-dot`} style={{ background: cfg.color }} />
            {!isLast && <div className="feed-line" />}
            <div className="feed-content">
              <div className="feed-icon-wrap" style={{ background: cfg.bg, color: cfg.color }}>
                <IonIcon icon={cfg.icon} />
              </div>
              <div className="feed-info">
                <span className="feed-title">
                  {activity.fullName ? `${activity.fullName} - ` : ''}{cfg.label}
                </span>
                <span className="feed-meta">
                  {formatTime12(activity.createdAt)} · {formatRelativeDate(activity.createdAt)}
                </span>
              </div>
              <span className={`feed-badge ${cfg.badge}`}>
                {activity.targetType || 'Log'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentActivity;
