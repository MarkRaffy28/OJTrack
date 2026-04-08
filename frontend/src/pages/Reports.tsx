import React, { useEffect, useState, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { personOutline } from "ionicons/icons";
import { 
  documentTextOutline, downloadOutline, eyeOutline, addOutline, calendarOutline, checkmarkCircleOutline, timeOutline, searchOutline, 
  closeOutline, printOutline, createOutline, trashOutline, closeCircleOutline, alertCircleOutline, saveOutline, cloudUploadOutline, 
  attachOutline, banOutline, documentOutline, checkmarkOutline, arrowBackOutline
} from "ionicons/icons";
import { useAuth } from "@context/authContext";
import { useReport, Report, ReportAttachment } from "@context/reportContext";
import { formatDate, formatDateForInput } from "@utils/date";
import { capitalize } from "@utils/string";
import Avatar from "@components/Avatar";
import BottomNav from "@components/BottomNav";
import printReport from "@components/PrintReport";
import SupervisorBottomNav from "@components/SupervisorBottomNav";
import "@css/ReportsModal.css";
import "@css/Supervisor.css";

const API_URL = import.meta.env.VITE_API_URL;
const MAX_FILES = 10;

/* ── Edit modal state ──────────────────────────────────────────────────── */
interface EditState {
  id: number;
  title: string;
  reportDate: string;
  type: Report["type"];
  content: string;
  existingAttachments: ReportAttachment[];
  newFiles: File[];
  newFilePreviews: { file: File; preview?: string }[];
}

const REPORT_TYPES: { label: string; value: Report["type"] }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Midterm", value: "midterm" },
  { label: "Final", value: "final" },
  { label: "Incident", value: "incident" },
];

function Reports() {
  const history = useHistory();
  const location = useLocation();
  const { role } = useAuth();
  const isSupervisor = role === "supervisor";
  const { reports, deleteReport, fetchReports, updateReport, updateReportStatus, loadingReports } = useReport();
  const [viewState, setViewState] = useState<Report | null>(null);
  const [imgExpanded, setImgExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<number>>(new Set());
  const [editState, setEditState] = useState<EditState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const stats = {
    total: reports.length,
    approved: reports.filter((r: Report) => r.status === "approved").length,
    pending: reports.filter((r: Report) => r.status === "pending").length,
    rejected: reports.filter((r: Report) => r.status === "rejected").length,
  };

  const statusConfig: Record<
    string,
    { color: string; bg: string; icon: string }
  > = {
    pending: {
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.12)",
      icon: timeOutline,
    },
    approved: {
      color: "#34d399",
      bg: "rgba(52,211,153,0.12)",
      icon: checkmarkCircleOutline,
    },
    rejected: {
      color: "#f87171",
      bg: "rgba(248,113,113,0.12)",
      icon: banOutline,
    },
  };

  const filtered = reports
    .filter((r: Report) => {
      const q = searchText.toLowerCase();
      const titleMatch = (r.title ?? "").toLowerCase().includes(q);
      const typeMatch = r.type.toLowerCase().includes(q);
      const filterMatch =
        selectedFilter === "all" || r.status === selectedFilter;
      return (titleMatch || typeMatch) && filterMatch;
    })
    .sort(
      (a: Report, b: Report) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const filters = ["all", "pending", "approved", "rejected"];

  useEffect(() => {
    fetchReports();
  }, [location.pathname]);

  /* ── Download ─────────────────────────────────────────────────────────── */
  const handleDownload = (report: Report) => {
    setDownloadingId(report.id);
    const content = [
      `REPORT TITLE: ${report.title ?? "Untitled"}`,
      `TYPE: ${capitalize(report.type)}`,
      `DATE: ${formatDate(report.reportDate)}`,
      `STATUS: ${capitalize(report.status)}`,
      ``,
      `CONTENT`,
      `------------`,
      report.content,
      ``,
      `ATTACHMENTS`,
      `------------`,
      report.attachments && report.attachments.length > 0
        ? report.attachments.map((a) => a.originalName).join(", ")
        : "No attachments.",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(report.title ?? "report").replace(/[^a-z0-9]/gi, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => {
      setDownloadingId(null);
      setDownloadedIds((prev) => new Set(prev).add(report.id));
    }, 800);
  };

  /* ── Edit handlers ────────────────────────────────────────────────────── */
  const openEdit = (report: Report) => {
    if (report.status === "approved") return;
    setEditState({
      id: report.id,
      title: report.title ?? "",
      reportDate: formatDateForInput(report.reportDate),
      type: report.type,
      content: report.content,
      existingAttachments: report.attachments ? [...report.attachments] : [],
      newFiles: [],
      newFilePreviews: [],
    });
  };

  const removeExistingAttachment = (index: number) => {
    if (!editState) return;
    setEditState((s) => {
      if (!s) return s;
      const updated = [...s.existingAttachments];
      updated.splice(index, 1);
      return { ...s, existingAttachments: updated };
    });
  };

  const addEditFiles = (files: FileList | null) => {
    if (!files || !editState) return;
    const totalSlots =
      MAX_FILES -
      editState.existingAttachments.length -
      editState.newFiles.length;
    const incoming = Array.from(files).slice(0, Math.max(0, totalSlots));

    const previews = incoming.map((f) => ({
      file: f,
      preview: f.type.startsWith("image/")
        ? URL.createObjectURL(f)
        : undefined,
    }));

    setEditState((s) =>
      s
        ? {
            ...s,
            newFiles: [...s.newFiles, ...incoming],
            newFilePreviews: [...s.newFilePreviews, ...previews],
          }
        : s,
    );
  };

  const removeNewFile = (index: number) => {
    if (!editState) return;
    setEditState((s) => {
      if (!s) return s;
      const updatedFiles = [...s.newFiles];
      const updatedPreviews = [...s.newFilePreviews];
      if (updatedPreviews[index]?.preview) {
        URL.revokeObjectURL(updatedPreviews[index].preview!);
      }
      updatedFiles.splice(index, 1);
      updatedPreviews.splice(index, 1);
      return { ...s, newFiles: updatedFiles, newFilePreviews: updatedPreviews };
    });
  };

  const closeEdit = () => {
    if (editState) {
      editState.newFilePreviews.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
    }
    setEditState(null);
  };

  const handleSaveEdit = async () => {
    if (!editState) return;
    setIsSaving(true);
    await updateReport(editState.id, {
      title: editState.title.trim() || null,
      type: editState.type,
      reportDate: editState.reportDate,
      content: editState.content.trim(),
      existingAttachments: editState.existingAttachments,
      files: editState.newFiles.length > 0 ? editState.newFiles : undefined,
    });
    setIsSaving(false);
    closeEdit();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editState) {
        editState.newFilePreviews.forEach((item) => {
          if (item.preview) URL.revokeObjectURL(item.preview);
        });
      }
    };
  }, [editState]);

  /* ── Delete handlers ──────────────────────────────────────────────────── */
  const confirmDelete = (report: Report) => {
    if (report.status === "approved") return;
    setDeleteTarget(report);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteReport(deleteTarget.id);
    setDeleteTarget(null);
  };

  const isApproved = (report: Report) => report.status === "approved";

  return (
    <IonPage>
      <IonContent fullscreen className="rp-content">
        {/* Hero */}
        <div className="rp-hero">
          <div className="rp-hero-bg" />
          <div className="rp-hero-inner">
            <h1 className="rp-hero-title">{isSupervisor ? "Activity Reports" : "Your Reports"}</h1>
            <p className="rp-hero-sub">{isSupervisor ? "Review and manage trainee reports" : "Manage and track all submissions"}</p>
          </div>
        </div>

        <div className="rp-container">
          {/* Stats Row */} <br />
          <div className="rp-stats-row">
            <div className="rp-stat-card rp-stat-total">
              <IonIcon icon={documentTextOutline} className="rp-stat-icon" />
              <span className="rp-stat-num">{stats.total}</span>
              <span className="rp-stat-lbl">Total</span>
            </div>
            <div className="rp-stat-card rp-stat-pending">
              <IonIcon icon={timeOutline} className="rp-stat-icon" />
              <span className="rp-stat-num">{stats.pending}</span>
              <span className="rp-stat-lbl">Pending</span>
            </div>
            <div className="rp-stat-card rp-stat-submitted">
              <IonIcon icon={checkmarkCircleOutline} className="rp-stat-icon" />
              <span className="rp-stat-num">{stats.approved}</span>
              <span className="rp-stat-lbl">Approved</span>
            </div>
            <div className="rp-stat-card rp-stat-rejected">
              <IonIcon icon={banOutline} className="rp-stat-icon" />
              <span className="rp-stat-num">{stats.rejected}</span>
              <span className="rp-stat-lbl">Rejected</span>
            </div>
          </div>
          {/* Filter Tabs */}
          <div className="rp-filter-row">
            {filters.map((f) => (
              <button
                key={f}
                className={`rp-filter-btn ${selectedFilter === f ? "rp-filter-active" : ""}`}
                onClick={() => setSelectedFilter(f)}
              >
                {capitalize(f)}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="rp-search-wrap">
            <IonIcon icon={searchOutline} className="rp-search-icon" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search reports..."
              className="rp-search-input"
            />
            {searchText && (
              <button
                className="rp-search-clear"
                onClick={() => setSearchText("")}
              >
                <IonIcon icon={closeOutline} />
              </button>
            )}
          </div>
          {/* List Header */}
          <div className="rp-list-header">
            <span className="rp-list-title">All Reports</span>
            <span className="rp-list-count">{filtered.length} items</span>
          </div>
          {/* Report Cards */}
          <div className="rp-list">
            {loadingReports ? (
              <div className="rp-loading-state">
                <span className="rp-spinner-large" />
                <p>Loading reports...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="sv-no-results">
                <div className="sv-no-results-icon">
                  <IonIcon icon={searchOutline} />
                </div>
                <p className="sv-no-results-text">No reports found</p>
                <p className="sv-no-results-sub">Try adjusting your filters or search query</p>
                <button 
                  className="sv-back-button"
                  onClick={() => { setSearchText(""); setSelectedFilter("all"); }}
                >
                  <IonIcon icon={arrowBackOutline} />
                  Clear all filters
                </button>
              </div>
            ) : (
              filtered.map((report: Report) => {
                const cfg = statusConfig[report.status] ?? statusConfig.pending;
                const isDownloading = downloadingId === report.id;
                const isDownloaded = downloadedIds.has(report.id);
                const approved = isApproved(report);
                return (
                  <div key={report.id} className="sv-report-card">
                    {/* Card header */}
                    <div className="sv-report-card-header">
                      {isSupervisor && report.studentName && (
                        <Avatar
                          src={report.studentProfilePicture}
                          name={report.studentName}
                          className="sv-report-avatar"
                        />
                      )}
                      <div className="sv-report-header-info">
                        {isSupervisor && report.studentName ? (
                          <span className="sv-report-student">{report.studentName}</span>
                        ) : (
                          <span className="rp-card-title-premium">
                            {report.title || "Untitled Report"}
                          </span>
                        )}
                        <span className="sv-report-status-chip" style={{ color: cfg?.color, background: cfg?.bg, border: `1px solid ${cfg?.color}` }}>
                          <IonIcon icon={cfg?.icon} className="rp-icon-margin" />
                          {capitalize(report.status)}
                        </span>
                      </div>
                      <span className="rp-type-chip ml-auto">
                        <IonIcon icon={documentTextOutline} /> {capitalize(report.type)}
                      </span>
                      {!approved && !isSupervisor && (
                        <div className="rp-card-corner-actions rp-side-actions-wrap">
                          <button
                            className="rp-side-btn rp-side-edit"
                            onClick={() => openEdit(report)}
                            title="Edit report"
                          >
                            <IonIcon icon={createOutline} />
                          </button>
                          <button
                            className="rp-side-btn rp-side-delete border-danger-faint"
                            onClick={() => confirmDelete(report)}
                            title="Delete report"
                          >
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="sv-report-meta">
                      <span className="sv-report-meta-item">
                        <IonIcon icon={calendarOutline} />
                        {formatDate(report.reportDate)}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="sv-report-desc-block">
                      <div className="sv-report-desc-title">
                        <IonIcon icon={documentOutline} /> Report Description
                      </div>
                      <p className="sv-report-desc-text">{report.content}</p>
                    </div>

                    {/* Attachment button */}
                    {report.attachments && report.attachments.length > 0 && (
                      report.attachments.map((att, idx) => {
                        const isImg = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(att.filename);
                        const fullPath = att.path.replace(/\\\\/g, "/").replace(/^\.\//, "");
                        const thumbUrl = isImg ? `${API_URL}/${fullPath}` : undefined;
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (isImg) {
                                setSelectedImage(thumbUrl!);
                              } else {
                                handleDownload({ ...report, id: idx, title: att.originalName, content: '', attachments: [att] } as any);
                              }
                            }}
                            className="rp-attachment-btn-wrapper"
                          >
                            {/* Filename bar */}
                            <div className={`rp-attachment-filename-bar ${isImg ? 'rp-attachment-radius-img rp-border-bottom-none' : 'rp-attachment-radius-all'}`}>
                              <IonIcon icon={documentOutline} className="rp-attachment-icon-premium" />
                              <span className="rp-attachment-filename-text">
                                {att.originalName}
                              </span>
                              <span className="rp-attachment-action-text">
                                {isImg ? "View →" : "Download ↓"}
                              </span>
                            </div>

                            {/* Thumbnail strip */}
                            {isImg && thumbUrl && (
                              <div className="rp-attachment-thumb-strip">
                                <img
                                  src={thumbUrl}
                                  alt="preview"
                                  className="rp-attachment-thumb-img"
                                />
                              </div>
                            )}
                          </button>
                        );
                      })
                    )}

                    {/* Actions */}
                    <div className="unified-sv-report-actions">
                      <button className="unified-sv-btn unified-sv-btn-view" onClick={() => { setViewState(report); setFeedbackText(report.feedback || ""); setIsEditingFeedback(false); }}>
                        <IonIcon icon={eyeOutline} /> {isSupervisor && report.status !== 'pending' ? 'View Details' : 'View'}
                      </button>

                      {!isSupervisor ? (
                        <>
                          <button className="unified-sv-btn unified-sv-btn-print" onClick={() => printReport(report)}>
                            <IonIcon icon={printOutline} /> Print
                          </button>
                          <button className={`unified-sv-btn unified-sv-btn-dl ${isDownloading ? "rp-btn-dl--loading" : ""} ${isDownloaded ? "rp-btn-dl--done" : ""}`} onClick={() => handleDownload(report)} disabled={isDownloading}>
                            {isDownloading ? <><span className="rp-btn-spinner" /> Saving…</> : isDownloaded ? <><IonIcon icon={checkmarkCircleOutline} /> Saved</> : <><IonIcon icon={downloadOutline} /> Download</>}
                          </button>
                        </>
                      ) : (
                        report.status === 'pending' && (
                          <>
                            <button className="unified-sv-btn unified-sv-btn-approve" onClick={() => updateReportStatus(report.id, 'approved')}>
                              <IonIcon icon={checkmarkCircleOutline} /> Approve
                            </button>
                            <button className="unified-sv-btn unified-sv-btn-reject" onClick={() => updateReportStatus(report.id, 'rejected')}>
                              <IonIcon icon={closeCircleOutline} /> Reject
                            </button>
                          </>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* FAB */}
        {!isSupervisor && (
        <div className="rp-fab-wrap">
          <button
            className="rp-fab"
            onClick={() => history.push("/upload-report")}
          >
            <IonIcon icon={addOutline} />
            <span>Upload Report</span>
          </button>
        </div>
      )}
      </IonContent>

            
      {/* ── VIEW MODAL (BOTTOM SHEET) ────────────────────────────────────── */}
      {viewState && (
        <div className="premium-modal-overlay" onClick={() => { setViewState(null); setFeedbackText(""); setIsEditingFeedback(false); }}>
          <div className="premium-modal-sheet" onClick={e => e.stopPropagation()}>
            
            {/* Handle */}
            <div className="premium-modal-handle-wrap">
              <div className="premium-modal-handle" />
            </div>

            {/* Sheet header */}
            <div className="premium-sheet-header">
              <div className="premium-sheet-header-left">
                <div className="premium-sheet-icon-wrap">
                  <IonIcon icon={documentTextOutline} style={{ color: '#fff', fontSize: 20 }} />
                </div>
                <div>
                  <p className="premium-sheet-header-title">
                    {viewState.title || "Activity Report"}
                  </p>
                  <p className="premium-sheet-header-subtitle">
                    #RPT-{String(viewState.id).padStart(4, '0')}
                  </p>
                </div>
              </div>
              <button onClick={() => { setViewState(null); setFeedbackText(""); setIsEditingFeedback(false); }} className="premium-sheet-close">
                <IonIcon icon={closeOutline} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="premium-scroll-content">
              
              {isSupervisor && viewState.studentName && (
                <div className="trainee-profile-card">
                  <div className="trainee-profile-info">
                    <Avatar
                      src={viewState.studentProfilePicture}
                      name={viewState.studentName}
                      className="sv-detail-avatar"
                      style={{ width: 46, height: 46 }}
                    />
                    <div>
                      <p className="trainee-name-big">{viewState.studentName}</p>
                      <p className="trainee-label-small">OJT Trainee</p>
                    </div>
                  </div>
                  <span className="status-badge-premium" style={{
                    color: statusConfig[viewState.status]?.color, 
                    background: statusConfig[viewState.status]?.bg, 
                    border: `1.5px solid ${statusConfig[viewState.status]?.color}`, 
                  }}>
                    {capitalize(viewState.status)}
                  </span>
                </div>
              )}

              {/* Report Type (Added for Supervisor View Mode) */}
              <div className="mb-14">
                <p className="detail-section-label">
                  Report Type
                </p>
                <div className="report-type-pill">
                  <IonIcon icon={documentTextOutline} className="rp-icon-margin" />
                  {capitalize(viewState.type)} Submission
                </div>
              </div>

              {/* Date */}
              <div className="mb-14">
                <p className="detail-section-label">
                  Date
                </p>
                <div className="date-card-premium">
                  <div className="date-icon-label-wrap">
                    <IonIcon icon={calendarOutline} className="date-icon-small" />
                    <span className="date-label-tiny">
                      Date Submitted
                    </span>
                  </div>
                  <p className="date-val-text">{formatDate(viewState.reportDate)}</p>
                </div>
              </div>

              {/* Reviewer Feedback Section */}
              <div className="feedback-container">
                <div className="feedback-header-row">
                  <p className="feedback-label feedback-label-no-margin">
                    {viewState.status === 'pending' ? 'Provide Feedback (Optional)' : 'Reviewer Feedback'}
                  </p>
                  {isSupervisor && !isEditingFeedback && (
                    <button 
                      onClick={() => { setIsEditingFeedback(true); setFeedbackText(viewState.feedback || ""); }}
                      className="sv-edit-btn"
                    >
                      <IonIcon icon={createOutline} /> Edit
                    </button>
                  )}
                </div>

                {isSupervisor && isEditingFeedback ? (
                  <div className="sv-notes-edit" style={{ marginTop: 8 }}>
                    <textarea
                      className="modal-feedback-textarea"
                      placeholder="Enter feedback notes..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={4}
                    />
                    <div className="sv-notes-actions" style={{ marginTop: 10 }}>
                      <button
                        className="sv-notes-btn sv-notes-btn-cancel"
                        onClick={() => { setIsEditingFeedback(false); setFeedbackText(viewState.feedback || ""); }}
                      >
                        <IonIcon icon={closeOutline} /> Cancel
                      </button>
                      <button
                        className="sv-notes-btn sv-notes-btn-save"
                        disabled={savingFeedback}
                        onClick={async () => {
                          setSavingFeedback(true);
                          try {
                            await updateReportStatus(viewState.id, viewState.status, feedbackText);
                            setIsEditingFeedback(false);
                            setViewState(prev => prev ? { ...prev, feedback: feedbackText } : null);
                          } catch (err) {
                            console.error("Failed to save feedback:", err);
                          } finally {
                            setSavingFeedback(false);
                          }
                        }}
                      >
                        <IonIcon icon={checkmarkOutline} /> 
                        {savingFeedback ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="date-card-premium">
                    {viewState.status !== 'pending' && (
                      <>
                        <div className="feedback-reviewer-row">
                          <IonIcon icon={personOutline} style={{ fontSize: 13, color: '#5f0076' }} />
                          <span className="feedback-reviewer-name">
                            Reviewed By: {viewState.reviewerName || 'Supervisor'}
                          </span>
                        </div>
                        {viewState.reviewedAt && (
                          <div className="feedback-review-date">
                            <IonIcon icon={timeOutline} style={{ fontSize: 13, color: '#9e92ab' }} />
                            <span className="feedback-date-text">
                              On: {formatDate(viewState.reviewedAt)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="feedback-content-card">
                      <p className="feedback-text-main" style={{ fontStyle: viewState.feedback ? 'normal' : 'italic' }}>
                        {viewState.feedback || 'No additional feedback provided.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-14">
                <p className="detail-section-label">
                  Report Content
                </p>
                <div className="report-content-card">
                  <p className="report-content-text">{viewState.content}</p>
                </div>
              </div>

              {/* Attached Files */}
              <div style={{ marginBottom: 6 }}>
                <p className="detail-section-label">
                  Attached Documentation ({viewState.attachments?.length || 0})
                </p>
                {viewState.attachments?.map((att, i) => {
                  const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(att.filename);
                  const fullPath = att.path.replace(/\\/g, "/").replace(/^\.\//, "");
                  const fileUrl = `${API_URL}/${fullPath}`;

                  return (
                    <div key={i} className="mb-12">
                      {isImage ? (
                        <div className="attachment-image-wrap">
                          <img
                            src={fileUrl}
                            alt={att.originalName}
                            className="attachment-image-main"
                            onClick={() => { setImgExpanded(true); setSelectedImage(fileUrl); }}
                          />
                        </div>
                      ) : (
                        <div className="attachment-file-pill">
                          <div className="attachment-file-icon-box">
                            <IonIcon icon={documentOutline} style={{ fontSize: 16, color: '#5f0076' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="attachment-file-name-text">
                              {att.originalName}
                            </p>
                          </div>
                          <button onClick={() => handleDownload({ ...viewState, id: i, title: att.originalName, content: '', attachments: [att] } as any)} className="attachment-file-dl-icon">
                            <IonIcon icon={downloadOutline} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Action buttons */}
            <div className="premium-modal-footer">
              <button className="unified-sv-btn unified-sv-btn-print footer-btn-half" onClick={() => printReport(viewState)}>
                <IonIcon icon={printOutline} style={{ fontSize: 18 }} /> Print
              </button>
              <button
                className="unified-sv-btn unified-sv-btn-dl footer-btn-half"
                onClick={() => handleDownload(viewState)}
              >
                <IonIcon icon={downloadOutline} style={{ fontSize: 18 }} /> Download
              </button>

              {isSupervisor && viewState.status === 'pending' && (
                <>
                  <button className="unified-sv-btn unified-sv-btn-approve footer-btn-half" onClick={() => { updateReportStatus(viewState.id, 'approved', feedbackText); setViewState(null); setFeedbackText(""); }}>
                    <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 18 }} /> Approve
                  </button>
                  <button className="unified-sv-btn unified-sv-btn-reject footer-btn-half" onClick={() => { updateReportStatus(viewState.id, 'rejected', feedbackText); setViewState(null); setFeedbackText(""); }}>
                    <IonIcon icon={closeCircleOutline} style={{ fontSize: 18 }} /> Reject
                  </button>
                </>
              )}
              
              {isSupervisor && (
                <button className="unified-sv-btn unified-sv-btn-delete footer-btn-full" onClick={() => { setDeleteTarget(viewState); setViewState(null); setFeedbackText(""); }}>
                  <IonIcon icon={trashOutline} style={{ fontSize: 18 }} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL (BOTTOM SHEET) ──────────────────────────────────────────────────── */}
      {/* ── EDIT MODAL (BOTTOM SHEET) ──────────────────────────────────────────────────── */}
      {editState && (
        <div className="premium-modal-overlay" onClick={() => { closeEdit(); setIsSaving(false); }}>
          <div className="premium-modal-sheet" onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div className="premium-modal-handle-wrap">
              <div className="premium-modal-handle" />
            </div>

            {/* Sheet header */}
            <div className="premium-sheet-header">
              <div className="premium-sheet-header-left">
                <IonIcon icon={createOutline} style={{ color: '#5f0076', fontSize: 24 }} />
                <h2 className="premium-sheet-header-title">Edit Report</h2>
              </div>
              <button onClick={() => { closeEdit(); setIsSaving(false); }} className="premium-sheet-close">
                <IonIcon icon={closeOutline} />
              </button>
            </div>

            <div className="premium-scroll-content">
              {/* Title */}
              <div className="rp-field">
                <label className="rp-field-label">Title</label>
                <input
                  className="rp-field-input"
                  value={editState.title}
                  onChange={(e) => setEditState((s) => s && { ...s, title: e.target.value })}
                  maxLength={80}
                  placeholder="Report title"
                />
              </div>

              {/* Type + Date row */}
              <div className="rp-field-row">
                <div className="rp-field">
                  <label className="rp-field-label">Type</label>
                  <select
                    className="rp-field-select"
                    value={editState.type}
                    onChange={(e) => setEditState((s) => s && { ...s, type: e.target.value as Report["type"] })}
                  >
                    {REPORT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="rp-field">
                  <label className="rp-field-label">Date</label>
                  <input
                    type="date"
                    className="rp-field-input"
                    value={editState.reportDate}
                    onChange={(e) => setEditState((s) => s && { ...s, reportDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="rp-field">
                <label className="rp-field-label">Content</label>
                <textarea
                  className="rp-field-textarea"
                  value={editState.content}
                  onChange={(e) => setEditState((s) => s && { ...s, content: e.target.value })}
                  rows={5}
                  maxLength={2000}
                  placeholder="Report content"
                />
                <span className="rp-field-count">{editState.content.length}/2000</span>
              </div>

              <div className="rp-field">
                <label className="rp-field-label">Attachments ({editState.existingAttachments.length + editState.newFiles.length}/{MAX_FILES})</label>
                
                {editState.existingAttachments.length > 0 && (
                  <div className="rp-edit-file-list">
                    {editState.existingAttachments.map((att, i) => {
                      const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(att.filename);
                      const fullPath = att.path.replace(/\\/g, "/").replace(/^\.\//, "");
                      const thumbUrl = isImage ? `${API_URL}/${fullPath}` : undefined;
                      return (
                        <div key={`existing-${i}`} className="rp-edit-file-item" onClick={() => thumbUrl && setSelectedImage(thumbUrl)} style={{ cursor: thumbUrl ? 'pointer' : 'default' }}>
                          {thumbUrl ? (
                            <img src={thumbUrl} alt={att.originalName} className="rp-edit-file-thumb" />
                          ) : (
                            <div className="rp-edit-file-icon-wrap"><IonIcon icon={attachOutline} /></div>
                          )}
                          <div className="rp-edit-file-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <span className="rp-edit-file-name">{att.originalName}</span>
                            {thumbUrl && <span style={{ fontSize: '10px', color: 'var(--c-text-muted)', marginTop: '-2px' }}>Tap to view</span>}
                          </div>
                          <button className="rp-edit-file-remove" onClick={(e) => { e.stopPropagation(); removeExistingAttachment(i); }} title="Remove attachment">
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {editState.newFilePreviews.length > 0 && (
                  <div className="rp-edit-file-list" style={{ marginTop: 8 }}>
                    {editState.newFilePreviews.map((item, i) => (
                      <div key={`new-${i}`} className="rp-edit-file-item rp-edit-file-new" onClick={() => item.preview && setSelectedImage(item.preview)} style={{ cursor: item.preview ? 'pointer' : 'default' }}>
                        {item.preview ? (
                          <img src={item.preview} alt={item.file.name} className="rp-edit-file-thumb" />
                        ) : (
                          <div className="rp-edit-file-icon-wrap"><IonIcon icon={attachOutline} /></div>
                        )}
                        <div className="rp-edit-file-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <span className="rp-edit-file-name">{item.file.name}</span>
                          {item.preview && <span style={{ fontSize: '10px', color: 'var(--c-text-muted)', marginTop: '-2px' }}>Tap to view</span>}
                        </div>
                        <button className="rp-edit-file-remove" onClick={(e) => { e.stopPropagation(); removeNewFile(i); }} title="Remove file">
                          <IonIcon icon={trashOutline} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {editState.existingAttachments.length + editState.newFiles.length < MAX_FILES && (
                  <button className="rp-edit-add-files-btn" onClick={() => editFileRef.current?.click()}>
                    <IonIcon icon={cloudUploadOutline} /> Add Files
                  </button>
                )}
                <input ref={editFileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => { addEditFiles(e.target.files); e.target.value = ""; }} />
              </div>
            </div>

            <div className="premium-edit-footer">
              <button onClick={() => { closeEdit(); setIsSaving(false); }} className="premium-edit-btn btn-cancel-premium">
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={isSaving || !editState.content.trim()} className="premium-edit-btn btn-save-premium">
                {isSaving ? <><span className="rp-btn-spinner" /> Saving…</> : <><IonIcon icon={saveOutline} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ────────────────────────────────────── */}
      {deleteTarget && (
        <div className="rp-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="rp-modal rp-modal--delete"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rp-modal-header">
              <div className="rp-modal-title-row">
                <IonIcon
                  icon={alertCircleOutline}
                  className="rp-modal-icon rp-modal-icon--danger"
                />
                <h2 className="rp-modal-title">Delete Report?</h2>
              </div>
              <button
                className="rp-modal-close"
                onClick={() => setDeleteTarget(null)}
              >
                <IonIcon icon={closeCircleOutline} />
              </button>
            </div>

            <div className="rp-modal-body rp-delete-body">
              <p className="rp-delete-msg">
                You're about to permanently delete:
              </p>
              <div className="rp-delete-card">
                <p className="rp-delete-name">
                  {deleteTarget.title ?? "Untitled Report"}
                </p>
                <p className="rp-delete-meta">
                  {capitalize(deleteTarget.type)} ·{" "}
                  {formatDate(deleteTarget.reportDate)}
                </p>
              </div>
              <p className="rp-delete-warn">This action cannot be undone.</p>
            </div>

            <div className="rp-modal-footer">
              <button
                className="rp-modal-btn rp-modal-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="rp-modal-btn rp-modal-delete"
                onClick={handleDelete}
              >
                <IonIcon icon={trashOutline} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 20000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setSelectedImage(null)}>
          <button style={{
            position: 'absolute', top: 20, right: 20,
            background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer'
          }} onClick={() => setSelectedImage(null)}>
            <IonIcon icon={closeCircleOutline} />
          </button>
          <div style={{ padding: 20, maxWidth: '100%', maxHeight: '100%', display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
            <img src={selectedImage} alt="attachment" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
          </div>
        </div>
      )}

      {isSupervisor ? <SupervisorBottomNav activeTab="reports" /> : <BottomNav activeTab="reports" />}
    </IonPage>
  );
};

export default Reports;
