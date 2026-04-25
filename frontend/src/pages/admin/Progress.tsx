import React, { useState, useMemo } from "react";
import { IonIcon } from "@ionic/react";
import {
 downloadOutline, searchOutline, peopleOutline, trendingUpOutline, alertCircleOutline, statsChartOutline, checkmarkCircleOutline, 
 closeCircleOutline, warningOutline,
} from "ionicons/icons";
import { useAdminOjt } from "@context/adminOjtContext";
import { useUser } from "@context/userContext";
import { useNavigation } from "@hooks/useNavigation";
import AdminSidebar from "@components/AdminSidebar";
import AdminTopbar from "@components/AdminTopbar";
import Avatar from "@components/Avatar";
import exportCsv from "@components/ExportCsv";
import "@css/AdminDashboard.css";
import "@css/Progress.css";

function Progress() {
  const { visibleTrainees, cohorts, filters, setFilters, stats, loading, fetchTrainees } = useAdminOjt();
  const { navigate } = useNavigation();
  const { user } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [officeFilter, setOfficeFilter] = useState("all");

  const filteredProgress = useMemo(() => {
    return visibleTrainees.filter((t) => {
      const matchesSearch =
        t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.traineeId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesOffice =
        officeFilter === "all" || String(t.officeId) === officeFilter;

      return matchesSearch && matchesStatus && matchesOffice;
    });
  }, [visibleTrainees, searchQuery, statusFilter, officeFilter]);

  const progressStats = useMemo(() => {
    const total = filteredProgress.length;
    if (total === 0) return { onTrack: 0, atRisk: 0, avg: 0 };

    let totalPct = 0;
    let onTrack = 0;
    let atRisk = 0;

    filteredProgress.forEach((t) => {
      const req = t.requiredHours || 0;
      const ren = t.renderedHours || 0;
      const pct = req > 0 ? (ren / req) * 100 : 0;
      totalPct += pct;

      if (pct >= 50) onTrack++;
      else if (pct > 0 && pct < 50) atRisk++;
    });

    return {
      onTrack,
      atRisk,
      avg: Math.round(totalPct / total),
    };
  }, [filteredProgress]);

  const handleExport = () => {
    const columns = [
      { key: "ID", label: "Trainee ID" },
      { key: "Name", label: "Full Name" },
      { key: "Office", label: "Office" },
      { key: "Required", label: "Required Hours" },
      { key: "Rendered", label: "Rendered Hours" },
      { key: "Progress", label: "Progress %" },
      { key: "Status", label: "Status" },
    ];

    const rows = filteredProgress.map((t) => {
      const pct = t.requiredHours
        ? Math.round(((t.renderedHours || 0) / t.requiredHours) * 100)
        : 0;
      return {
        ID: t.traineeId,
        Name: t.fullName,
        Office: t.officeName || "N/A",
        Required: t.requiredHours,
        Rendered: t.renderedHours,
        Progress: `${pct}%`,
        Status: t.status,
      };
    });

    exportCsv({
      filename: `trainee_progress_${new Date().toISOString().split("T")[0]}`,
      columns,
      rows,
    });
  };

  const uniqueOffices = useMemo(() => {
    const map = new Map();
    visibleTrainees.forEach((t) => {
      if (t.officeId && t.officeName) {
        map.set(t.officeId, t.officeName);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [visibleTrainees]);

  return (
    <div className="shell progress-page">
      <AdminSidebar activePath="/admin-progress" name={user?.fullName} />
      <div className="main">
        <AdminTopbar
          breadcrumbs={[
            { label: "Admin", path: "/admin-dashboard" },
            { label: "Progress" },
          ]}
          cohortKeys={cohorts.map((c) => `${c.academicYear}|${c.term}`)}
          cohortLabels={cohorts.map(
            (c) => `A.Y. ${c.academicYear} – ${c.term}`,
          )}
          selectedCohort={filters.cohort}
          onCohortChange={(val) =>
            setFilters((prev) => ({ ...prev, cohort: val }))
          }
          onRefresh={fetchTrainees}
          refreshing={loading}
          onPrint={() => window.print()}
        />

        <div className="page-scroll-area">
          <div className="page-content">
            <div className="page-header">
              <div>
                <div className="page-header-title">Trainee Progress</div>
                <div className="page-header-sub">
                  Track OJT completion progress for all active trainees
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card stat-card-blue">
                <div className="stat-icon-wrap ic-total">
                  <IonIcon icon={peopleOutline} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Total Trainees</div>
                  <div className="stat-val">{filteredProgress.length}</div>
                </div>
              </div>
              <div className="stat-card stat-card-green">
                <div className="stat-icon-wrap ic-on-track">
                  <IonIcon icon={trendingUpOutline} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">On Track</div>
                  <div className="stat-val">{progressStats.onTrack}</div>
                </div>
              </div>
              <div className="stat-card stat-card-orange">
                <div className="stat-icon-wrap ic-at-risk">
                  <IonIcon icon={warningOutline} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">At Risk</div>
                  <div className="stat-val">{progressStats.atRisk}</div>
                </div>
              </div>
              <div className="stat-card stat-card-pink">
                <div className="stat-icon-wrap ic-avg">
                  <IonIcon icon={statsChartOutline} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Avg. Progress</div>
                  <div className="stat-val">{progressStats.avg}%</div>
                </div>
              </div>
            </div>

            <div className="filters-bar">
              <div className="search-wrap">
                <IonIcon icon={searchOutline} />
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search by name or ID…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-sep"></div>

              <div className="filter-group">
                <label className="filter-label">Status</label>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <div className="filter-sep"></div>

              <div className="filter-group">
                <label className="filter-label">Office</label>
                <select
                  className="filter-select"
                  value={officeFilter}
                  onChange={(e) => setOfficeFilter(e.target.value)}
                >
                  <option value="all">All Offices</option>
                  {uniqueOffices.map(([id, name]) => (
                    <option key={id} value={String(id)}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="progress-section">
              <div className="section-head">
                <div className="section-head-title">
                  Progress Tracker
                  <span className="count-badge">
                    {filteredProgress.length} trainees
                  </span>
                </div>
                <button className="btn-ghost-sm" onClick={handleExport}>
                  <IonIcon icon={downloadOutline} />
                  Export CSV
                </button>
              </div>

              <div className="list-col-header">
                <div className="col-label">Trainee</div>
                <div className="col-label">Progress</div>
                <div className="col-label">Completion Bar</div>
                <div className="col-label">Status</div>
              </div>

              <div className="progress-list">
                {filteredProgress.length > 0 ? (
                  filteredProgress.map((t) => {
                    const pct = t.requiredHours
                      ? Math.round(
                          ((t.renderedHours || 0) / t.requiredHours) * 100,
                        )
                      : 0;
                    const barClass =
                      pct >= 80
                        ? "high"
                        : pct >= 50
                        ? "mid"
                        : pct >= 20
                        ? "low"
                        : "danger";
                    const statusClass =
                      pct >= 50
                        ? "status-on-track"
                        : pct >= 20
                        ? "status-at-risk"
                        : "status-behind";
                    const statusIcon =
                      pct >= 50
                        ? checkmarkCircleOutline
                        : pct >= 20
                        ? warningOutline
                        : closeCircleOutline;
                    const statusLabel =
                      pct >= 50 ? "On Track" : pct >= 20 ? "At Risk" : "Behind";

                    return (
                      <div
                        className="progress-row"
                        key={t.databaseId}
                        onClick={() =>
                          navigate(
                            `/admin-user-detail/student/${t.databaseId}/view`,
                          )
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <div className="trainee-identity">
                          <Avatar
                            className="trainee-avatar"
                            src={t.profilePicture}
                            name={t.fullName}
                          />
                          <div className="trainee-info">
                            <div className="trainee-name">{t.fullName}</div>
                            <div className="trainee-id">
                              {t.traineeId} · {t.officeName || "Unassigned"}
                            </div>
                          </div>
                        </div>
                        <div className="pct-val">{pct}%</div>
                        <div className="bar-wrap">
                          <div className="bar-track">
                            <div
                              className={`bar-fill ${barClass}`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <span className={`status-badge ${statusClass}`}>
                            <span className="status-icon">
                              <IonIcon icon={statusIcon} />
                            </span>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="empty-state"
                    style={{
                      padding: "60px",
                      textAlign: "center",
                      color: "var(--ink-3)",
                    }}
                  >
                    <IonIcon
                      icon={alertCircleOutline}
                      style={{
                        fontSize: "3rem",
                        opacity: 0.2,
                        marginBottom: "16px",
                      }}
                    />
                    <p>No trainees found matching your filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
