import React, { useEffect, useState, MouseEvent, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import {
  addOutline, checkmarkOutline, downloadOutline, eyeOutline, createOutline, trashOutline, peopleOutline, briefcaseOutline, 
  statsChartOutline, searchOutline, calendarOutline,
} from "ionicons/icons";
import { useAdminOjt } from "@context/adminOjtContext";
import { useAuth } from "@context/authContext";
import { useUser } from "@context/userContext";
import { useNavigation } from "@hooks/useNavigation";
import { formatDate } from "@utils/date";
import API from "@api/api";
import AdminSidebar from "@components/AdminSidebar";
import AdminTopbar from "@components/AdminTopbar";
import Avatar from "@components/Avatar";
import exportCsv from "@components/ExportCsv";
import printDocument from "@components/PrintDocument";
import "@css/AdminDashboard.css";
import "@css/Users.css";

interface Supervisor {
  id: number;
  employeeId: string;
  fullName: string;
  position: string;
  officeName: string;
  officeId: number;
  profilePicture?: string | null;
  createdAt?: string | null;
}

interface Admin {
  id: number;
  adminId: string;
  fullName: string;
  username: string;
  emailAddress: string;
  profilePicture?: string | null;
  createdAt?: string | null;
}

const decodeProfilePicture = (profilePicture: any): string | null => {
  if (!profilePicture) return null;
  if (typeof profilePicture === "string") return profilePicture;
  if (profilePicture?.data && Array.isArray(profilePicture.data)) {
    const uint8Array = new Uint8Array(profilePicture.data);
    return new TextDecoder().decode(uint8Array);
  }
  return null;
};

function Users() {
  const location = useLocation();
  const { loading: studentLoading, visibleTrainees, cohorts, offices, filters, stats, setFilters, setSearchInput: setContextSearchInput, fetchTrainees } = useAdminOjt();
  const { token } = useAuth();
  const { navigate } = useNavigation({ exitOnBack: false });
  const { role = "student" } = useParams<{ role: string }>();
  const { user } = useUser();

  const [searchInput, setSearchInput] = useState("");
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [supLoading, setSupLoading] = useState(false);
  const [supSearch, setSupSearch] = useState("");
  const [supOfficeFilter, setSupOfficeFilter] = useState("all");
  const [supPositionFilter, setSupPositionFilter] = useState("all");
  const [supSort, setSupSort] = useState<"nameAsc" | "nameDesc" | "newestFirst" | "oldestFirst">("nameAsc");

  const isStudent = role === "student";
  const isSupervisor = role === "supervisor";
  const isAdmin = role === "admin";

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");

  const fetchSupervisors = useCallback(async () => {
    if (!token) return;
    setSupLoading(true);
    try {
      const res = await API.get("/users/supervisors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const decoded = (res.data || []).map((s: any) => ({
        ...s,
        profilePicture: decodeProfilePicture(s.profilePicture),
      }));
      setSupervisors(decoded);
    } catch (err) {
      console.error("Failed to load supervisors:", err);
    } finally {
      setSupLoading(false);
    }
  }, [token]);

  const fetchAdmins = useCallback(async () => {
    if (!token) return;
    setAdminLoading(true);
    try {
      const res = await API.get("/users/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const decoded = (res.data || []).map((a: any) => ({
        ...a,
        profilePicture: decodeProfilePicture(a.profilePicture),
      }));
      setAdmins(decoded);
    } catch (err) {
      console.error("Failed to load admins:", err);
    } finally {
      setAdminLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isStudent) return;
    const timer = setTimeout(() => {
      setContextSearchInput(searchInput);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, setContextSearchInput, isStudent]);

  useEffect(() => {
    if (isSupervisor) fetchSupervisors();
  }, [role, isSupervisor, fetchSupervisors]);

  useEffect(() => {
    if (isAdmin) fetchAdmins();
  }, [role, isAdmin, fetchAdmins]);

  useEffect(() => {
    if (isStudent) fetchTrainees();
  }, [role, isStudent, fetchTrainees]);

  const supOffices = Array.from(
    new Map(
      supervisors
        .filter((s) => s.officeId && s.officeName)
        .map((s) => [s.officeId, { id: s.officeId, name: s.officeName }])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const supPositions = Array.from(
    new Set(supervisors.map((s) => s.position).filter(Boolean))
  ).sort();

  const filteredSupervisors = [...supervisors]
    .filter((s) => {
      const q = supSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.employeeId.toLowerCase().includes(q) ||
        (s.officeName || "").toLowerCase().includes(q) ||
        (s.position || "").toLowerCase().includes(q);
      const matchesOffice = supOfficeFilter === "all" || String(s.officeId) === supOfficeFilter;
      const matchesPosition = supPositionFilter === "all" || s.position === supPositionFilter;
      return matchesSearch && matchesOffice && matchesPosition;
    })
    .sort((a, b) => {
      if (supSort === "nameDesc") return b.fullName.localeCompare(a.fullName);
      if (supSort === "newestFirst") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (supSort === "oldestFirst") return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      return a.fullName.localeCompare(b.fullName); // nameAsc
    });

  const filteredAdmins = [...admins]
    .filter((a) => {
      const q = adminSearch.trim().toLowerCase();
      return (
        !q ||
        a.fullName.toLowerCase().includes(q) ||
        a.adminId.toLowerCase().includes(q) ||
        a.username.toLowerCase().includes(q) ||
        a.emailAddress.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const loading = isStudent ? studentLoading : isSupervisor ? supLoading : adminLoading;

  const goToDetail = (e: MouseEvent, databaseId: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin-user-detail/${role}/${databaseId}/view`);
  };
  const goToEdit = (e: MouseEvent, databaseId: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin-user-detail/${role}/${databaseId}/edit`);
  };
  const goToDelete = (e: MouseEvent, databaseId: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin-user-detail/${role}/${databaseId}/delete`);
  };

  const handleExportCsv = async () => {
    if (isStudent) {
      await exportCsv({
        filename: `trainees_export_${new Date().toISOString().split("T")[0]}.csv`,
        columns: [
          { key: "traineeId", label: "Trainee ID" },
          { key: "fullName",  label: "Name"       },
          { key: "terms",     label: "Terms"      },
          { key: "startDate", label: "Start Date" },
          { key: "officeName",label: "Office"     },
          { key: "status",    label: "Status"     },
        ],
        rows: visibleTrainees.map((item) => ({
          traineeId:  item.traineeId,
          fullName:   item.fullName,
          terms:      `${item.academicYear || "N/A"} ${item.term || ""}`.trim(),
          startDate:  item.startDate ? formatDate(item.startDate) : "N/A",
          officeName: item.officeName || "Not Assigned",
          status:     item.status,
        })),
      });
    } else {
      await exportCsv({
        filename: `supervisors_export_${new Date().toISOString().split("T")[0]}.csv`,
        columns: [
          { key: "employeeId", label: "Employee ID" },
          { key: "fullName",   label: "Name"        },
          { key: "position",   label: "Position"    },
          { key: "officeName", label: "Office"      },
        ],
        rows: filteredSupervisors.map((s) => ({
          employeeId: s.employeeId,
          fullName:   s.fullName,
          position:   s.position,
          officeName: s.officeName || "Not Assigned",
        })),
      });
    }
  };

  const handlePrint = async () => {
    if (isStudent) {
      await printDocument({
        title: "Trainees Directory",
        subtitle: "Admin trainee listing with active filters",
        generatedBy: user?.fullName || "Admin",
        summary: [
          { label: "Total",           value: stats.total        },
          { label: "Ongoing",         value: stats.active       },
          { label: "Assigned",        value: stats.assigned     },
          { label: "Partner Offices", value: stats.officesCount },
        ],
        columns: [
          { key: "traineeId",  label: "Trainee ID" },
          { key: "fullName",   label: "Name"       },
          { key: "cohort",     label: "Terms"      },
          { key: "officeName", label: "Office"     },
          { key: "status",     label: "Status"     },
        ],
        rows: visibleTrainees.map((item) => ({
          traineeId:  item.traineeId,
          fullName:   item.fullName,
          cohort:     `${item.academicYear || "N/A"} ${item.term || ""}`.trim(),
          officeName: item.officeName || "Not Assigned",
          status:     item.status,
        })),
      });
    } else {
      await printDocument({
        title: "Supervisors Directory",
        subtitle: "Admin supervisor listing",
        generatedBy: user?.fullName || "Admin",
        columns: [
          { key: "employeeId", label: "Employee ID" },
          { key: "fullName",   label: "Name"        },
          { key: "position",   label: "Position"    },
          { key: "officeName", label: "Office"      },
        ],
        rows: filteredSupervisors.map((s) => ({
          employeeId: s.employeeId,
          fullName:   s.fullName,
          position:   s.position,
          officeName: s.officeName || "Not Assigned",
        })),
      });
    }
  };

  const pageTitle      = isStudent ? "Trainee Management"    : isAdmin ? "Admin Management" : "Supervisor Management";
  const pageSub        = isStudent ? "View, filter, and manage all trainees from backend records." : isAdmin ? "View and manage system administrators." : "View and manage all supervisors and their partner offices.";
  const activeSidebar  = isStudent ? "/admin-users/student" : isAdmin ? "/admin-users/admin" : "/admin-users/supervisor";
  const addRoute       = `/admin-add-user/${role}`;
  const entryLabel     = isStudent ? "Trainees Directory"   : isAdmin ? "Administrators Directory" : "Supervisors Directory";

  return (
    <div className="shell">
      <AdminSidebar activePath={activeSidebar} name={user?.fullName} />
      <div className="main">
        <AdminTopbar
          breadcrumbs={[
            { label: "Admin", path: "/admin-dashboard" },
            { label: isStudent ? "Trainees" : isAdmin ? "Admins" : "Supervisors" },
          ]}
          {...(isStudent ? {
            cohortKeys: cohorts.map(c => `${c.academicYear}|${c.term}`),
            cohortLabels: cohorts.map(c => `A.Y. ${c.academicYear} – ${c.term}`),
            selectedCohort: filters.cohort,
            onCohortChange: (val: string) => setFilters(prev => ({ ...prev, cohort: val })),
          } : {})}
          onRefresh={isStudent ? fetchTrainees : isSupervisor ? fetchSupervisors : isAdmin ? fetchAdmins : undefined}
          refreshing={loading}
          onPrint={handlePrint}
        />

        <div className="page-scroll-area">
          <div className="page-content admin-trainees-page">
            <div className="page-header">
              <div>
                <div className="page-header-title">{pageTitle}</div>
                <div className="page-header-sub">{pageSub}</div>
              </div>
              <div className="header-actions">
                <button className="btn-ghost" onClick={handleExportCsv}>
                  <IonIcon icon={downloadOutline} />
                  Export
                </button>
                <button className="btn-primary" onClick={() => navigate(addRoute)}>
                  <IonIcon icon={addOutline} />
                  Add New
                </button>
              </div>
            </div>

            {isStudent && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-wrap ic-total"><IonIcon icon={peopleOutline} /></div>
                  <div>
                    <div className="stat-label">Total Students</div>
                    <div className="stat-val">{stats.total}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-wrap ic-active"><IonIcon icon={statsChartOutline} /></div>
                  <div>
                    <div className="stat-label">Ongoing</div>
                    <div className="stat-val">{stats.active}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-wrap ic-offices"><IonIcon icon={briefcaseOutline} /></div>
                  <div>
                    <div className="stat-label">Assigned</div>
                    <div className="stat-val">{stats.assigned}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-wrap ic-rate"><IonIcon icon={checkmarkOutline} /></div>
                  <div>
                    <div className="stat-label">Active Rate</div>
                    <div className="stat-val">{stats.activeRate}%</div>
                  </div>
                </div>
              </div>
            )}

            <div className="filters-bar">
              {isStudent ? (
                <>
                  <div className="search-wrap">
                    <IonIcon icon={searchOutline} />
                    <input
                      className="search-input"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search by name, ID, or office..."
                    />
                  </div>
                  <div className="filter-group">
                    <span className="filter-label">Status</span>
                    <select className="filter-select" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
                      <option value="all">All</option>
                      <option value="pending">Pending</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="dropped">Dropped</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <span className="filter-label">Terms</span>
                    <select className="filter-select" value={filters.cohort} onChange={(e) => setFilters((prev) => ({ ...prev, cohort: e.target.value }))}>
                      <option value="all">All Terms</option>
                      {cohorts.map((cohort) => (
                        <option key={`${cohort.academicYear}|${cohort.term}`} value={`${cohort.academicYear}|${cohort.term}`}>
                          A.Y. {cohort.academicYear} - {cohort.term}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <span className="filter-label">Office</span>
                    <select className="filter-select" value={filters.officeId} onChange={(e) => setFilters((prev) => ({ ...prev, officeId: e.target.value }))}>
                      <option value="all">All Offices</option>
                      {offices.map((office) => (
                        <option key={office.id} value={office.id}>{office.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <span className="filter-label">Assignment</span>
                    <select className="filter-select" value={filters.assignment} onChange={(e) => setFilters((prev) => ({ ...prev, assignment: e.target.value as "all" | "assigned" | "unassigned" }))}>
                      <option value="all">All</option>
                      <option value="assigned">Assigned</option>
                      <option value="unassigned">Unassigned</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <span className="filter-label">Sort</span>
                    <select className="filter-select" value={filters.sort} onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value as "nameAsc" | "nameDesc" | "startNewest" | "startOldest" }))}>
                      <option value="nameAsc">Name A-Z</option>
                      <option value="nameDesc">Name Z-A</option>
                      <option value="startNewest">Newest Start</option>
                      <option value="startOldest">Oldest Start</option>
                    </select>
                  </div>
                </>
              ) : isAdmin ? (
                <div className="search-wrap">
                  <IonIcon icon={searchOutline} />
                  <input
                    className="search-input"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search by name, ID, username, or email..."
                  />
                </div>
              ) : (
                <>
                  <div className="search-wrap">
                    <IonIcon icon={searchOutline} />
                    <input
                      className="search-input"
                      value={supSearch}
                      onChange={(e) => setSupSearch(e.target.value)}
                      placeholder="Search by name, ID, office, or position..."
                    />
                  </div>
                  <div className="filter-group">
                    <span className="filter-label">Office</span>
                    <select className="filter-select" value={supOfficeFilter} onChange={(e) => setSupOfficeFilter(e.target.value)}>
                      <option value="all">All Offices</option>
                      {supOffices.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <span className="filter-label">Position</span>
                    <select className="filter-select" value={supPositionFilter} onChange={(e) => setSupPositionFilter(e.target.value)}>
                      <option value="all">All Positions</option>
                      {supPositions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <span className="filter-label">Sort</span>
                    <select className="filter-select" value={supSort} onChange={(e) => setSupSort(e.target.value as "nameAsc" | "nameDesc" | "newestFirst" | "oldestFirst")}>
                      <option value="nameAsc">Name A-Z</option>
                      <option value="nameDesc">Name Z-A</option>
                      <option value="newestFirst">Newest First</option>
                      <option value="oldestFirst">Oldest First</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="trainees-section">
              <div className="section-head">
                <div className="section-head-title">
                  {entryLabel}{" "}
                  <span className="count-badge">
                    {isStudent ? visibleTrainees.length : isAdmin ? filteredAdmins.length : filteredSupervisors.length} entries
                  </span>
                </div>
              </div>

              <div className="list-col-header">
                <div className="col-label">{isStudent ? "Trainee" : isAdmin ? "Administrator" : "Supervisor"}</div>
                <div className="col-label">{isStudent ? "Office" : isAdmin ? "Email" : "Office"}</div>
                <div className="col-label">{isStudent ? "Status" : isAdmin ? "Username" : "Position"}</div>
                <div className="col-label">Actions</div>
              </div>

              <div className="trainees-list">
                {isStudent && (
                  <>
                    {!loading && visibleTrainees.length === 0 && (
                      <div className="empty-state-card">
                        <div className="empty-state-icon">
                          <IonIcon icon={searchOutline} />
                        </div>
                        <div className="empty-state-title">No Students Found</div>
                        <div className="empty-state-desc">We couldn't find any trainees matching your selected filters. Try adjusting your search criteria.</div>
                      </div>
                    )}
                    {visibleTrainees.map((trainee) => (
                      <div
                        className="trainee-row trainee-row-clickable"
                        key={trainee.databaseId}
                        onClick={(e) => goToDetail(e, trainee.databaseId)}
                      >
                        <div className="trainee-identity">
                          <Avatar className="trainee-avatar" src={trainee.profilePicture} name={trainee.fullName || "Trainee"} clickable={true} />
                          <div className="trainee-info">
                            <div className="trainee-name">{trainee.fullName}</div>
                            <div className="trainee-id">
                              {trainee.traineeId} ·{" "}
                              {trainee.academicYear ? `A.Y. ${trainee.academicYear} - ${trainee.term} term` : "No terms"}
                              {trainee.startDate && (
                                <span className="trainee-date">
                                  <IonIcon icon={calendarOutline} />
                                  {formatDate(trainee.startDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="trainee-office">
                          <IonIcon icon={briefcaseOutline} />
                          <span className="office-name">{trainee.officeName || "Not Assigned"}</span>
                        </div>
                        <div>
                          <span className={`status-badge status-${trainee.status}`}>{trainee.status}</span>
                        </div>
                        <div className="trainee-actions">
                          <button className="action-btn action-view" title="View" onClick={(e) => goToDetail(e, trainee.databaseId)}>
                            <IonIcon icon={eyeOutline} />
                          </button>
                          <button className="action-btn action-edit" title="Edit" onClick={(e) => goToEdit(e, trainee.databaseId)}>
                            <IonIcon icon={createOutline} />
                          </button>
                          <button className="action-btn action-delete" title="Delete" onClick={(e) => goToDelete(e, trainee.databaseId)}>
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {isAdmin && (
                  <>
                    {!adminLoading && filteredAdmins.length === 0 && (
                      <div className="empty-state-card">
                        <div className="empty-state-icon">
                          <IonIcon icon={searchOutline} />
                        </div>
                        <div className="empty-state-title">No Administrators Found</div>
                        <div className="empty-state-desc">We couldn't find any administrators matching your search criteria.</div>
                      </div>
                    )}
                    {filteredAdmins.map((adm) => (
                      <div
                        className="trainee-row trainee-row-clickable"
                        key={adm.id}
                        onClick={(e) => goToDetail(e, adm.id)}
                      >
                        <div className="trainee-identity">
                          <Avatar className="trainee-avatar" src={adm.profilePicture} name={adm.fullName || "Admin"} clickable={true} />
                          <div className="trainee-info">
                            <div className="trainee-name">{adm.fullName}</div>
                            <div className="trainee-id">{adm.adminId}</div>
                          </div>
                        </div>
                        <div className="trainee-office">
                          <span className="office-name" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                            {adm.emailAddress}
                          </span>
                        </div>
                        <div>
                          <span className="status-badge" style={{ maxWidth:'180px', overflow:'hidden', textOverflow:'ellipsis' }}>
                            <span style={{ opacity: 0.6, marginRight: '2px' }}>@</span>
                            {adm.username}
                          </span>
                        </div>
                        <div className="trainee-actions">
                          <button className="action-btn action-view" title="View" onClick={(e) => goToDetail(e, adm.id)}>
                            <IonIcon icon={eyeOutline} />
                          </button>
                          <button className="action-btn action-edit" title="Edit" onClick={(e) => goToEdit(e, adm.id)}>
                            <IonIcon icon={createOutline} />
                          </button>
                          <button className="action-btn action-delete" title="Delete" onClick={(e) => goToDelete(e, adm.id)}>
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {isSupervisor && (
                  <>
                    {!supLoading && filteredSupervisors.length === 0 && (
                      <div className="empty-state-card">
                        <div className="empty-state-icon">
                          <IonIcon icon={searchOutline} />
                        </div>
                        <div className="empty-state-title">No Supervisors Found</div>
                        <div className="empty-state-desc">We couldn't find any supervisors matching your search criteria or office filters.</div>
                      </div>
                    )}
                    {filteredSupervisors.map((sup) => (
                      <div
                        className="trainee-row trainee-row-clickable"
                        key={sup.id}
                        onClick={(e) => goToDetail(e, sup.id)}
                      >
                        <div className="trainee-identity">
                          <Avatar className="trainee-avatar" src={sup.profilePicture} name={sup.fullName || "Supervisor"} clickable={true} />
                          <div className="trainee-info">
                            <div className="trainee-name">{sup.fullName}</div>
                            <div className="trainee-id">{sup.employeeId}</div>
                          </div>
                        </div>
                        <div className="trainee-office">
                          <IonIcon icon={briefcaseOutline} />
                          <span className="office-name">{sup.officeName || "Not Assigned"}</span>
                        </div>
                        <div>
                          <span className="status-badge" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', border: '1px solid var(--brand-glow)' }}>
                            {sup.position || "—"}
                          </span>
                        </div>
                        <div className="trainee-actions">
                          <button className="action-btn action-view" title="View" onClick={(e) => goToDetail(e, sup.id)}>
                            <IonIcon icon={eyeOutline} />
                          </button>
                          <button className="action-btn action-edit" title="Edit" onClick={(e) => goToEdit(e, sup.id)}>
                            <IonIcon icon={createOutline} />
                          </button>
                          <button className="action-btn action-delete" title="Delete" onClick={(e) => goToDelete(e, sup.id)}>
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
