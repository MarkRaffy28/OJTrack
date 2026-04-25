import React, { useState, useEffect, useMemo } from "react";
import { IonIcon } from "@ionic/react";
import {
  downloadOutline, searchOutline, documentTextOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline, funnelOutline,
  swapVerticalOutline, calendarOutline, refreshOutline, alertCircleOutline, eyeOutline
} from "ionicons/icons";
import api, { getMediaUrl } from "@api/api";
import { useAuth } from "@context/authContext";
import { useAdminOjt } from "@context/adminOjtContext";
import { useUser } from "@context/userContext";
import { useNavigation } from "@hooks/useNavigation";
import { useDownload } from "@hooks/useDownload";
import { formatDate } from "@utils/date";
import AdminSidebar from "@components/AdminSidebar";
import AdminTopbar from "@components/AdminTopbar";
import Avatar from "@components/Avatar";
import Lightbox from "@components/Lightbox";
import exportCsv from "@components/ExportCsv";
import ServerImage from "@components/ServerImage";
import "@css/AdminDashboard.css";
import "@css/AdminReports.css";

interface Report {
  id: number;
  studentId: number;
  ojtId: number;
  type: string;
  reportDate: string;
  title: string;
  content: string;
  attachments: any[] | null;
  status: string;
  reviewerName: string | null;
  studentName: string;
  studentProfilePicture: string | null;
  traineeId: string;
  course: string;
  officeName: string;
  createdAt: string;
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

function AdminReports() {
  const { token } = useAuth();
  const { cohorts, filters, setFilters } = useAdminOjt();
  const { downloadReport } = useDownload();
  const { navigate } = useNavigation({ exitOnBack: false });
  const { user } = useUser();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchReports = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/reports/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const decodedData = (res.data.data || []).map((r: any) => {
        const decoded = decodeProfilePicture(r.studentProfilePicture);
        const isBase64 = decoded?.startsWith('data:image');
        return {
          ...r,
          studentProfilePicture: decoded ? (isBase64 ? decoded : getMediaUrl(decoded)) : null
        };
      });
      setReports(decodedData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token]);

  const filteredReports = useMemo(() => {
    let result = reports.filter(r => {
      const matchesSearch = 
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.traineeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      
      const reportDate = new Date(r.reportDate).getTime();
      const matchesStart = !startDate || reportDate >= new Date(startDate).getTime();
      const matchesEnd = !endDate || reportDate <= new Date(endDate).getTime();

      return matchesSearch && matchesStatus && matchesStart && matchesEnd;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.reportDate).getTime();
      const dateB = new Date(b.reportDate).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [reports, searchQuery, statusFilter, startDate, endDate, sortOrder]);

  const stats = useMemo(() => {
    return {
      all: filteredReports.length,
      pending: filteredReports.filter(r => r.status === "pending").length,
      approved: filteredReports.filter(r => r.status === "approved").length,
      rejected: filteredReports.filter(r => r.status === "rejected").length,
    };
  }, [filteredReports]);

  const handleExport = async () => {
    const columns = [
      { key: "ID", label: "Trainee ID" },
      { key: "Name", label: "Student Name" },
      { key: "Office", label: "Office" },
      { key: "Date", label: "Report Date" },
      { key: "Type", label: "Type" },
      { key: "Status", label: "Status" }
    ];

    const rows = filteredReports.map(r => ({
      ID: r.traineeId,
      Name: r.studentName,
      Office: r.officeName,
      Date: formatDate(r.reportDate),
      Type: r.type,
      Status: r.status
    }));

    await exportCsv({
      filename: `admin_reports_${new Date().toISOString().split('T')[0]}`,
      columns,
      rows
    });
  };

  return (
    <div className="shell reports-page">
      <AdminSidebar activePath="/admin-reports" name={user?.fullName} />
      <div className="main">
        <AdminTopbar
          breadcrumbs={[
            { label: "Admin", path: "/admin-dashboard" },
            { label: "Reports" },
          ]}
          cohortKeys={cohorts.map(c => `${c.academicYear}|${c.term}`)}
          cohortLabels={cohorts.map(c => `A.Y. ${c.academicYear} – ${c.term}`)}
          selectedCohort={filters.cohort}
          onCohortChange={(val) => setFilters(prev => ({ ...prev, cohort: val }))}
          onRefresh={fetchReports}
          refreshing={loading}
          onPrint={() => window.print()}
        />

        <div className="page-scroll-area">
          <div className="page-content">
            <div className="page-header">
              <div>
                <div className="page-header-title">Reports Management</div>
                <div className="page-header-sub">Monitor and audit all trainee report submissions</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrap ic-all">
                  <IonIcon icon={documentTextOutline} />
                </div>
                <div>
                  <div className="stat-label">Total Reports</div>
                  <div className="stat-val">{stats.all}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap ic-pending">
                  <IonIcon icon={timeOutline} />
                </div>
                <div>
                  <div className="stat-label">Pending</div>
                  <div className="stat-val">{stats.pending}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap ic-approved">
                  <IonIcon icon={checkmarkCircleOutline} />
                </div>
                <div>
                  <div className="stat-label">Approved</div>
                  <div className="stat-val">{stats.approved}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap ic-rejected">
                  <IonIcon icon={closeCircleOutline} />
                </div>
                <div>
                  <div className="stat-label">Declined</div>
                  <div className="stat-val">{stats.rejected}</div>
                </div>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="filters-bar">
              <div className="search-wrap">
                <IonIcon icon={searchOutline} />
                <input 
                  className="search-input" 
                  type="text" 
                  placeholder="Search by name, ID or title…" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-sep"></div>
              
              <div className="filter-group">
                <IonIcon icon={funnelOutline} style={{ fontSize: 14, color: 'var(--ink-3)' }} />
                <select 
                  className="filter-select" 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Declined</option>
                </select>
              </div>

              <div className="filter-sep"></div>

              <div className="filter-group">
                <IonIcon icon={calendarOutline} style={{ fontSize: 14, color: 'var(--ink-3)' }} />
                <input 
                  type="date" 
                  className="date-input" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  title="Start Date"
                />
                <span style={{ color: 'black', fontSize: 18, fontWeight: 700 }}>→</span>
                <input 
                  type="date" 
                  className="date-input" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  title="End Date"
                />
              </div>

              <div className="filter-sep"></div>

              <div className="filter-group">
                <IonIcon icon={swapVerticalOutline} style={{ fontSize: 14, color: 'var(--ink-3)' }} />
                <select 
                  className="filter-select" 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Reports List Section */}
            <div className="reports-section">
              <div className="section-head">
                <div className="section-head-title">
                  Submission History
                </div>
                <div className="section-head-actions">
                  <span className="count-badge">{filteredReports.length} matches</span>
                  <button className="btn-ghost-sm" onClick={handleExport}>
                    <IonIcon icon={downloadOutline} />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="list-col-header">
                <div className="col-label">Student / Trainee</div>
                <div className="col-label">Date Submitted</div>
                <div className="col-label">Attachments</div>
                <div className="col-label">Status</div>
                <div className="col-label" style={{ textAlign: 'right' }}>Action</div>
              </div>

              <div className="reports-list">
                {loading ? (
                  <div style={{ padding: '60px', textAlign: 'center' }}>
                    <IonIcon icon={refreshOutline} className="spin" style={{ fontSize: '2rem', color: 'var(--brand)', opacity: 0.5 }} />
                    <p style={{ marginTop: '12px', color: 'var(--ink-3)' }}>Fetching reports...</p>
                  </div>
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((r) => (
                    <div 
                      className="report-row report-row-clickable" 
                      key={r.id}
                      onClick={() => navigate(`/admin-report-detail/${r.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="trainee-identity">
                        <Avatar 
                          src={r.studentProfilePicture} 
                          name={r.studentName} 
                          className="report-avatar"
                        />
                        <div className="trainee-info">
                          <div className="trainee-name">{r.studentName}</div>
                          <div className="trainee-meta">{r.traineeId} · {r.officeName}</div>
                        </div>
                      </div>

                      <div className="cell-date">
                        {formatDate(r.reportDate)}
                        <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', fontWeight: 500, marginTop: 2 }}>
                          {r.type.toUpperCase()}
                        </div>
                      </div>

                      <div className="attachments-cell">
                        {r.attachments && r.attachments.length > 0 ? (
                          r.attachments.map((att, idx) => {
                            const isImg = /\.(jpe?g|png|gif|webp)$/i.test(att.filename);
                            const url = getMediaUrl(att.path);
                            return (
                              <div 
                                key={idx} 
                                className="attachment-preview"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isImg) setSelectedImage(url);
                                  else downloadReport(url, att.originalName);
                                }}
                                title={att.originalName}
                              >
                                {isImg ? (
                                  <ServerImage src={url} alt="preview" />
                                ) : (
                                  <IonIcon icon={documentTextOutline} />
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--ink-3)', opacity: 0.5 }}>None</span>
                        )}
                      </div>

                      <div className="status-and-action">
                        <div>
                          <span className={`status-badge status-${r.status}`}>
                            <span className="status-icon">
                              <IonIcon icon={r.status === 'approved' ? checkmarkCircleOutline : r.status === 'rejected' ? closeCircleOutline : timeOutline} />
                            </span>
                            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                          </span>
                        </div>

                        <div className="actions-cell">
                          <button 
                            className="btn-action action-view" 
                            style={{ background: '#dbeafe', color: '#1d4ed8', border: 'none' }}
                            title="View Details"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin-report-detail/${r.id}`);
                            }}
                          >
                            <IonIcon icon={eyeOutline} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state" style={{ padding: '80px', textAlign: 'center' }}>
                    <IonIcon icon={alertCircleOutline} style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '16px' }} />
                    <p style={{ color: 'var(--ink-3)' }}>No reports match your filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedImage && (
        <Lightbox 
          src={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
};

export default AdminReports;