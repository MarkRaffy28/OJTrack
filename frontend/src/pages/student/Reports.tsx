import React, { useEffect, useState, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { 
  documentTextOutline, downloadOutline, eyeOutline, addOutline, calendarOutline, checkmarkCircleOutline, timeOutline, searchOutline, 
  closeOutline, printOutline, createOutline, trashOutline, closeCircleOutline, alertCircleOutline, saveOutline, cloudUploadOutline, 
  imagesOutline, attachOutline, banOutline,
} from "ionicons/icons";
import BottomNav from "@components/BottomNav";
import { useReport, Report, ReportAttachment } from "@context/reportContext";
import { printReport } from "@components/PrintReport";
import { formatDate, formatDateForInput } from "@utils/date";
import { capitalize } from "@utils/string";
import "@css/ReportsModal.css";

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

const Reports: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { reports, deleteReport, fetchReports, updateReport, loadingReports } = useReport();
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<number>>(new Set());
  const [editState, setEditState] = useState<EditState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
    setEditState(null);
  };

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
            <h1 className="rp-hero-title">Your Reports</h1>
            <p className="rp-hero-sub">Manage and track all submissions</p>
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
              <div className="rp-empty">
                <IonIcon icon={documentTextOutline} />
                <p>No reports found.</p>
              </div>
            ) : (
              filtered.map((report: Report) => {
                const cfg = statusConfig[report.status] ?? statusConfig.pending;
                const isDownloading = downloadingId === report.id;
                const isDownloaded = downloadedIds.has(report.id);
                const approved = isApproved(report);
                return (
                  <div key={report.id} className="rp-card">
                    <div className="rp-card-top">
                      <span className="rp-type-chip">
                        <IonIcon icon={documentTextOutline} />
                        {capitalize(report.type)}
                      </span>
                      <div className="rp-card-top-right">
                        <span
                          className="rp-status-chip"
                          style={{ color: cfg?.color, background: cfg?.bg }}
                        >
                          <IonIcon icon={cfg?.icon} />
                          {capitalize(report.status)}
                        </span>
                        {!approved && (
                          <div className="rp-card-corner-actions">
                            <button
                              className="rp-side-btn rp-side-edit"
                              onClick={() => openEdit(report)}
                              title="Edit report"
                            >
                              <IonIcon icon={createOutline} />
                            </button>
                            <button
                              className="rp-side-btn rp-side-delete"
                              onClick={() => confirmDelete(report)}
                              title="Delete report"
                            >
                              <IonIcon icon={trashOutline} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="rp-card-body">
                      <p className="rp-card-title">
                        {report.title ?? "Untitled Report"}
                      </p>
                      <p className="rp-card-desc">{report.content}</p>
                    </div>

                    <div className="rp-card-footer">
                      <div className="rp-card-date">
                        <IonIcon icon={calendarOutline} />
                        {formatDate(report.reportDate)}
                      </div>
                      <div className="rp-card-actions">
                        <button
                          className="rp-btn rp-btn-view"
                          onClick={() =>
                            history.push("/report-detail", { report })
                          }
                        >
                          <IonIcon icon={eyeOutline} /> View
                        </button>
                        <button
                          className="rp-btn rp-btn-print"
                          onClick={() => printReport(report)}
                        >
                          <IonIcon icon={printOutline} /> Print
                        </button>
                        <button
                          className={`rp-btn rp-btn-dl ${isDownloading ? "rp-btn-dl--loading" : ""} ${isDownloaded ? "rp-btn-dl--done" : ""}`}
                          onClick={() => handleDownload(report)}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <>
                              <span className="rp-btn-spinner" /> Saving…
                            </>
                          ) : isDownloaded ? (
                            <>
                              <IonIcon icon={checkmarkCircleOutline} /> Saved
                            </>
                          ) : (
                            <>
                              <IonIcon icon={downloadOutline} /> Download
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* FAB */}
        <div className="rp-fab-wrap">
          <button
            className="rp-fab"
            onClick={() => history.push("/upload-report")}
          >
            <IonIcon icon={addOutline} />
            <span>Upload Report</span>
          </button>
        </div>
      </IonContent>

      {/* ── EDIT MODAL ──────────────────────────────────────────────────── */}
      {editState && (
        <div className="rp-modal-overlay" onClick={() => setEditState(null)}>
          <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rp-modal-header">
              <div className="rp-modal-title-row">
                <IonIcon icon={createOutline} className="rp-modal-icon" />
                <h2 className="rp-modal-title">Edit Report</h2>
              </div>
              <button
                className="rp-modal-close"
                onClick={() => setEditState(null)}
              >
                <IonIcon icon={closeCircleOutline} />
              </button>
            </div>

            <div className="rp-modal-body">
              {/* Title */}
              <div className="rp-field">
                <label className="rp-field-label">Title</label>
                <input
                  className="rp-field-input"
                  value={editState.title}
                  onChange={(e) =>
                    setEditState((s) => s && { ...s, title: e.target.value })
                  }
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
                    onChange={(e) =>
                      setEditState(
                        (s) =>
                          s && { ...s, type: e.target.value as Report["type"] },
                      )
                    }
                  >
                    {REPORT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rp-field">
                  <label className="rp-field-label">Date</label>
                  <input
                    type="date"
                    className="rp-field-input"
                    value={editState.reportDate}
                    onChange={(e) =>
                      setEditState(
                        (s) => s && { ...s, reportDate: e.target.value },
                      )
                    }
                  />
                </div>
              </div>

              {/* Content */}
              <div className="rp-field">
                <label className="rp-field-label">Content</label>
                <textarea
                  className="rp-field-textarea"
                  value={editState.content}
                  onChange={(e) =>
                    setEditState((s) => s && { ...s, content: e.target.value })
                  }
                  rows={5}
                  maxLength={2000}
                  placeholder="Report content"
                />
                <span className="rp-field-count">
                  {editState.content.length}/2000
                </span>
              </div>

              <div className="rp-field">
                <label className="rp-field-label">
                  Attachments ({editState.existingAttachments.length + editState.newFiles.length}/{MAX_FILES})
                </label>
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
                            <div className="rp-edit-file-icon-wrap">
                              <IonIcon icon={attachOutline} />
                            </div>
                          )}
                          <div className="rp-edit-file-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <span className="rp-edit-file-name">{att.originalName}</span>
                            {thumbUrl && <span style={{ fontSize: '10px', color: 'var(--c-text-muted)', marginTop: '-2px' }}>Tap to view</span>}
                          </div>
                          <button
                            className="rp-edit-file-remove"
                            onClick={(e) => { e.stopPropagation(); removeExistingAttachment(i); }}
                            title="Remove attachment"
                          >
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* New files */}
                {editState.newFilePreviews.length > 0 && (
                  <div className="rp-edit-file-list" style={{ marginTop: 8 }}>
                    {editState.newFilePreviews.map((item, i) => (
                      <div key={`new-${i}`} className="rp-edit-file-item rp-edit-file-new" onClick={() => item.preview && setSelectedImage(item.preview)} style={{ cursor: item.preview ? 'pointer' : 'default' }}>
                        {item.preview ? (
                          <img src={item.preview} alt={item.file.name} className="rp-edit-file-thumb" />
                        ) : (
                          <div className="rp-edit-file-icon-wrap">
                            <IonIcon icon={attachOutline} />
                          </div>
                        )}
                        <div className="rp-edit-file-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <span className="rp-edit-file-name">{item.file.name}</span>
                          {item.preview && <span style={{ fontSize: '10px', color: 'var(--c-text-muted)', marginTop: '-2px' }}>Tap to view</span>}
                        </div>
                        <button
                          className="rp-edit-file-remove"
                          onClick={(e) => { e.stopPropagation(); removeNewFile(i); }}
                          title="Remove file"
                        >
                          <IonIcon icon={trashOutline} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add more files */}
                {editState.existingAttachments.length + editState.newFiles.length < MAX_FILES && (
                  <button
                    className="rp-edit-add-files-btn"
                    onClick={() => editFileRef.current?.click()}
                  >
                    <IonIcon icon={cloudUploadOutline} />
                    Add Files
                  </button>
                )}
                <input
                  ref={editFileRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    addEditFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            <div className="rp-modal-footer">
              <button
                className="rp-modal-btn rp-modal-cancel"
                onClick={() => setEditState(null)}
              >
                Cancel
              </button>
              <button
                className={`rp-modal-btn rp-modal-save ${isSaving ? "rp-modal-save--loading" : ""}`}
                onClick={handleSaveEdit}
                disabled={isSaving || !editState.content.trim()}
              >
                {isSaving ? (
                  <>
                    <span className="rp-btn-spinner" /> Saving…
                  </>
                ) : (
                  <>
                    <IonIcon icon={saveOutline} /> Save Changes
                  </>
                )}
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
        <div className="rd-lightbox-overlay" style={{ zIndex: 2000 }} onClick={() => setSelectedImage(null)}>
          <button className="rd-lightbox-close" onClick={() => setSelectedImage(null)}>
            <IonIcon icon={closeCircleOutline} />
          </button>
          <div className="rd-lightbox-body" onClick={e => e.stopPropagation()}>
            <div className="rd-lightbox-img-wrap" style={{ background: '#1e2535', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={selectedImage} alt="attachment" style={{ maxHeight: '80vh', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="reports" />
    </IonPage>
  );
};

export default Reports;
