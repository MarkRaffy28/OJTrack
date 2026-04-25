import React, { useEffect, useState, useCallback } from "react";
import { IonIcon } from "@ionic/react";
import {
  chevronForwardOutline,
  printOutline,
  refreshOutline,
  schoolOutline,
  menuOutline
} from "ionicons/icons";
import { useNavigation } from "@hooks/useNavigation";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface AdminTopbarProps {
  breadcrumbs: BreadcrumbItem[];
  cohortKeys?: string[];
  cohortLabels?: string[];
  selectedCohort?: string;
  onCohortChange?: (value: string) => void;
  onRefresh?: () => void;
  onPrint?: () => void;
  refreshing?: boolean;
}

function useLiveClock() {
  const fmt = useCallback(() => {
    return new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }, []);

  const [time, setTime] = useState(fmt);

  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, [fmt]);

  return time;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({
  breadcrumbs,
  cohortKeys,
  cohortLabels,
  selectedCohort = "all",
  onCohortChange,
  onRefresh,
  onPrint,
  refreshing = false,
}) => {
  const { navigate } = useNavigation({ exitOnBack: false });
  const liveTime = useLiveClock();

  const hasCohorts =
    cohortKeys && cohortKeys.length > 0 && onCohortChange !== undefined;

  const toggleSidebar = () => {
    document.querySelector('.shell')?.classList.toggle('sidebar-open');
  };

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button className="topbar-menu-btn" onClick={toggleSidebar}>
          <IonIcon icon={menuOutline} />
        </button>
        <div className="topbar-breadcrumb">
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <React.Fragment key={i}>
              {isLast ? (
                <span className="crumb-active">{crumb.label}</span>
              ) : (
                <button
                  className="bc-link"
                  onClick={() => crumb.path && navigate(crumb.path)}
                >
                  {crumb.label}
                </button>
              )}
              {!isLast && (
                <IonIcon icon={chevronForwardOutline} className="bc-icon" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>

      <div className="topbar-right">
        {hasCohorts && (
          <div className="topbar-cohort-wrap">
            <IonIcon icon={schoolOutline} className="topbar-cohort-icon" />
            <select
              className="topbar-cohort-select"
              value={selectedCohort}
              onChange={(e) => onCohortChange!(e.target.value)}
              title="Filter by term / cohort"
            >
              <option value="all">All Terms</option>
              {cohortKeys!.map((key, idx) => (
                <option key={key} value={key}>
                  {cohortLabels ? cohortLabels[idx] : key}
                </option>
              ))}
            </select>
          </div>
        )}

        <span className="topbar-date">{liveTime}</span>

        {onRefresh && (
          <button
            className="topbar-btn"
            title="Refresh"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <IonIcon
              icon={refreshOutline}
              className={refreshing ? "spin" : ""}
            />
          </button>
        )}

        {onPrint && (
          <button className="topbar-btn" title="Print" onClick={onPrint}>
            <IonIcon icon={printOutline} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminTopbar;
