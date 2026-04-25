import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { IonPage, IonContent, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, RefresherEventDetail } from "@ionic/react";
import { 
  logInOutline, logOutOutline, documentTextOutline, cloudUploadOutline, searchOutline, closeOutline, personOutline, shieldCheckmarkOutline, 
  keyOutline, trashOutline, createOutline, statsChartOutline, arrowBackOutline, chevronDownCircleOutline, businessOutline, settingsOutline, 
  personRemoveOutline, peopleOutline, checkmarkDoneOutline,
} from "ionicons/icons";
import { useActivity } from "@context/activityContext";
import { useAuth } from "@context/authContext";
import { useUser } from "@context/userContext";
import { useNavigation } from "@hooks/useNavigation";
import { formatRelativeDate, formatTime12 } from "@utils/date";
import AdminSidebar from "@components/AdminSidebar";
import AdminTopbar from "@components/AdminTopbar";
import BottomNav from "@components/BottomNav";
import SupervisorBottomNav from "@components/SupervisorBottomNav";
import "@css/Supervisor.css";

function Activity() {
  useNavigation();
  const location = useLocation();
  const { activities, loadingActivities, getLatestActivities, fetchActivities } = useActivity();
  const { role } = useAuth();
  const { user } = useUser();
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchActivities();
    event.detail.complete();
  };

  const latestActivities = useMemo(
    () => getLatestActivities(50),
    [activities, getLatestActivities],
  );

  const typeConfig: Record<
    string,
    { icon: string; color: string; bg: string; label: string; category: string }
  > = {
    TIME_IN: {
      icon: logInOutline,
      color: "#34d399",
      bg: "rgba(52,211,153,0.15)",
      label: "Time In",
      category: "Attendance",
    },
    TIME_OUT: {
      icon: logOutOutline,
      color: "#f87171",
      bg: "rgba(248,113,113,0.15)",
      label: "Time Out",
      category: "Attendance",
    },
    SUBMIT_REPORT: {
      icon: cloudUploadOutline,
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.15)",
      label: "Report",
      category: "Reports",
    },
    CREATE_REPORT: {
      icon: cloudUploadOutline,
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.15)",
      label: "Report",
      category: "Reports",
    },
    UPDATE_REPORT: {
      icon: createOutline,
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.15)",
      label: "Update",
      category: "Reports",
    },
    DELETE_REPORT: {
      icon: trashOutline,
      color: "#f87171",
      bg: "rgba(248,113,113,0.15)",
      label: "Delete",
      category: "Reports",
    },
    LOGIN: {
      icon: personOutline,
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.15)",
      label: "Login",
      category: "Account",
    },
    LOGOUT: {
      icon: personOutline,
      color: "#ec4899",
      bg: "rgba(236,72,153,0.15)",
      label: "Logout",
      category: "Account",
    },
    REGISTER: {
      icon: shieldCheckmarkOutline,
      color: "#10b981",
      bg: "rgba(16,185,129,0.15)",
      label: "Register",
      category: "Account",
    },
    UPDATE_PROFILE: {
      icon: personOutline,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.15)",
      label: "Profile",
      category: "Account",
    },
    UPDATE_PASSWORD: {
      icon: keyOutline,
      color: "#6366f1",
      bg: "rgba(99,102,241,0.15)",
      label: "Password",
      category: "Account",
    },
    DTR: {
      icon: documentTextOutline,
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.15)",
      label: "DTR",
      category: "OJT",
    },
    UPDATE_SUPERVISOR_NOTES: {
      icon: createOutline,
      color: "#9e00c2",
      bg: "rgba(158,0,194,0.15)",
      label: "Notes",
      category: "OJT",
    },
    CREATE_OFFICE: {
      icon: businessOutline,
      color: "#10b981",
      bg: "rgba(16,185,129,0.15)",
      label: "New Office",
      category: "System",
    },
    UPDATE_OFFICE: {
      icon: businessOutline,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.15)",
      label: "Edit Office",
      category: "System",
    },
    DELETE_OFFICE: {
      icon: trashOutline,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.15)",
      label: "Drop Office",
      category: "System",
    },
    UPDATE_SETTINGS: {
      icon: settingsOutline,
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.15)",
      label: "Settings",
      category: "System",
    },
    DELETE_TRAINEE: {
      icon: personRemoveOutline,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.15)",
      label: "Drop User",
      category: "System",
    },
    ASSIGN_SUPERVISOR: {
      icon: peopleOutline,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.15)",
      label: "Assign Sup",
      category: "System",
    },
    EDIT_USER: {
      icon: createOutline,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.15)",
      label: "Edit User",
      category: "System",
    },
    EVALUATE_REPORT: {
      icon: checkmarkDoneOutline,
      color: "#10b981",
      bg: "rgba(16,185,129,0.15)",
      label: "Evaluate",
      category: "Reports",
    },
  };

  const isSupervisor = role === "supervisor";
  const isAdmin = role === "admin";

  const filters = [
    { key: "all", label: "All" },
    { key: "attendance", label: "Attendance" },
    { key: "reports", label: "Reports" },
    { key: "ojt", label: "OJT" },
    { key: "account", label: "Account" },
    { key: "system", label: "System" },
  ].filter((f) => {
    if (isSupervisor && f.key === "attendance") return false;
    if (!isAdmin && f.key === "system") return false;
    if (!isSupervisor && f.key === "ojt") return false;
    return true;
  });

  useEffect(() => {
    fetchActivities();
  }, [location.pathname]);

  const filtered = latestActivities.filter((a) => {
    const q = searchText.toLowerCase();
    const config = typeConfig[a.action] || {
      category: "Other",
      label: a.action,
    };

    const matcheName = a.fullName?.toLowerCase().includes(q);
    const match =
      a.description.toLowerCase().includes(q) ||
      config.label.toLowerCase().includes(q) ||
      matcheName;
    const fmatch =
      selectedFilter === "all" ||
      config.category.toLowerCase() === selectedFilter;
    return match && fmatch;
  });

  const renderTimeline = () => (
    <div className="act-timeline">
      {loadingActivities && filtered.length === 0 && (
        <div
          className="act-loading"
          style={{
            minHeight: "40vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IonSpinner name="crescent" />
        </div>
      )}

      {!loadingActivities && filtered.length === 0 && (
        <div className="sv-no-results">
          <div className="sv-no-results-icon">
            <IonIcon icon={searchOutline} />
          </div>
          <p className="sv-no-results-text">No activity found</p>
          <p className="sv-no-results-sub">
            Try adjusting your filters or search query
          </p>
          <button
            className="sv-back-button"
            onClick={() => {
              setSearchText("");
              setSelectedFilter("all");
            }}
          >
            <IonIcon icon={arrowBackOutline} />
            Clear all filters
          </button>
        </div>
      )}

      {filtered.map((activity, idx) => {
        const cfg = typeConfig[activity.action] || {
          icon: documentTextOutline,
          color: "#6b7280",
          bg: "rgba(107,114,128,0.15)",
          label: activity.action,
          category: "Other",
        };
        const isLast = idx === filtered.length - 1;

        return (
          <div key={activity.id} className="act-tl-item">
            <div className="act-tl-left">
              <p className="act-tl-time">{formatTime12(activity.createdAt)}</p>
              <p className="act-tl-date">
                {formatRelativeDate(activity.createdAt)}
              </p>
            </div>
            <div className="act-tl-spine">
              <div className="act-tl-dot" style={{ background: cfg.color }} />
              {!isLast && <div className="act-tl-line" />}
            </div>
            <div className="act-tl-card">
              <div className="act-tl-card-top">
                <div
                  className="act-tl-icon-wrap"
                  style={{ background: cfg.bg }}
                >
                  <IonIcon icon={cfg.icon} style={{ color: cfg.color }} />
                </div>
                <span
                  className="act-tl-type-chip"
                  style={{ color: cfg.color, background: cfg.bg }}
                >
                  {cfg.label}
                </span>
              </div>
              {activity.fullName && (
                <p className="act-tl-card-student">{activity.fullName}</p>
              )}
              <p className="act-tl-card-title">{cfg.label}</p>
              <p className="act-tl-card-desc">{activity.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderContent = () => (
    <div
      className="act-container"
      style={{ minHeight: "100%", paddingBottom: isAdmin ? "40px" : "100px" }}
    >
      <br />

      <div className="act-filter-row">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`act-filter-btn ${
              selectedFilter === f.key ? "act-filter-active" : ""
            }`}
            onClick={() => setSelectedFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="act-search-wrap">
        <IonIcon icon={searchOutline} className="act-search-icon" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search activities..."
          className="act-search-input"
        />
        {searchText && (
          <button
            className="act-search-clear"
            onClick={() => setSearchText("")}
          >
            <IonIcon icon={closeOutline} />
          </button>
        )}
      </div>

      <div className="act-timeline-head">
        <span className="act-timeline-title">
          {isSupervisor || isAdmin
            ? "Activity Logs"
            : "Recent Activity History"}
        </span>
        <span className="act-timeline-count">{filtered.length} activities</span>
      </div>

      {renderTimeline()}
    </div>
  );

  if (isAdmin) {
    return (
      <div className="shell">
        <AdminSidebar activePath="/admin-dashboard" name={user?.fullName} />
        <div className="main">
          <AdminTopbar
            breadcrumbs={[
              { label: "Admin", path: "/admin-dashboard" },
              { label: "Activity Logs" },
            ]}
            onRefresh={fetchActivities}
            refreshing={loadingActivities}
          />
          <div className="page-scroll-area">
            <div
              className="page-content"
              style={{ maxWidth: "900px", margin: "0 auto" }}
            >
              <div className="page-header" style={{ marginBottom: "0" }}>
                <div>
                  <div className="page-header-title">System Activity</div>
                  <div className="page-header-sub">
                    Full audit trail of all system events and user actions
                  </div>
                </div>
              </div>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="act-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode="md">
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="crescent"
          />
        </IonRefresher>

        <div className="act-hero">
          <div className="act-hero-bg" />
          <div className="act-hero-inner">
            <h1 className="act-hero-title">
              {isSupervisor ? "Activity History" : "Your Activity"}
            </h1>
            <p className="act-hero-sub">Monitor system interactions</p>
          </div>
        </div>

        {renderContent()}
      </IonContent>
      {isSupervisor ? (
        <SupervisorBottomNav activeTab="activity" />
      ) : (
        <BottomNav activeTab="activity" />
      )}
    </IonPage>
  );
}

export default Activity;