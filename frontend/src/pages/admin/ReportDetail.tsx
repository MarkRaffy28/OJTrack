import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IonIcon, IonSpinner } from "@ionic/react";
import {
  arrowBackOutline, calendarOutline, timeOutline, attachOutline, documentTextOutline, checkmarkCircleOutline, closeCircleOutline,
  shieldCheckmarkOutline, refreshOutline, documentOutline, downloadOutline, trashOutline,
} from "ionicons/icons";
import api, { getMediaUrl } from "@api/api";
import { useAuth } from "@context/authContext";
import { useUser } from "@context/userContext";
import { useDownload } from "@hooks/useDownload";
import { useNavigation } from "@hooks/useNavigation";
import { formatDate, getDateTime12 } from "@utils/date";
import AdminSidebar from "@components/AdminSidebar";
import AdminTopbar from "@components/AdminTopbar";
import Avatar from "@components/Avatar";
import Lightbox from "@components/Lightbox";
import DeleteModal from "@components/DeleteModal";
import "@css/AdminReportDetail.css";

interface ReportDetail {
  id: number;
  studentId: number;
  ojtId: number;
  type: string;
  reportDate: string;
  title: string;
  content: string;
  attachments: any[] | null;
  status: "pending" | "approved" | "rejected";
  reviewedBy: number | null;
  reviewedAt: string | null;
  feedback: string | null;
  studentName: string;
  studentProfilePicture: string | null;
  traineeId: string;
  course: string;
  year?: string;
  section?: string;
  officeName: string;
  reviewerName: string | null;
  createdAt: string;
  updatedAt: string;
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

function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { downloadReport } = useDownload();
  const { navigate } = useNavigation();
  const { user: adminUser } = useUser();

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteComplete, setDeleteComplete] = useState(false);

  const fetchReportDetail = async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports/detail/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;

      if (data.studentProfilePicture) {
        const decoded = decodeProfilePicture(data.studentProfilePicture);
        const isBase64 = decoded?.startsWith("data:image");
        data.studentProfilePicture = decoded
          ? isBase64
            ? decoded
            : getMediaUrl(decoded)
          : null;
      }

      setReport(data);
      setFeedback(data.feedback || "");
      setError(null);
    } catch (err) {
      console.error("Failed to fetch report detail:", err);
      setError("Failed to load report details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetail();
  }, [id, token]);

  const handleUpdateStatus = async (newStatus: "approved" | "rejected") => {
    if (!token || !id) return;
    setActionLoading(true);
    try {
      await api.patch(
        `/reports/${id}/status`,
        {
          status: newStatus,
          feedback: feedback.trim() || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Refresh data
      await fetchReportDetail();
    } catch (err) {
      console.error(`Failed to ${newStatus} report:`, err);
      alert(`Failed to ${newStatus} report. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteComplete(true);
      setTimeout(() => navigate("/admin-reports"), 1500);
    } catch (err) {
      console.error("Failed to delete report:", err);
      alert("Failed to delete report. Please try again.");
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="report-detail-page shell">
        <AdminSidebar activePath="/admin-reports" name={adminUser?.fullName} />
        <div className="main">
          <AdminTopbar
            breadcrumbs={[
              { label: "Admin" },
              { label: "Reports", path: "/admin-reports" },
              { label: "Loading..." },
            ]}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg)",
            }}
          >
            <IonSpinner name="crescent" color="primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="report-detail-page shell">
        <AdminSidebar activePath="/admin-reports" name={adminUser?.fullName} />
        <div className="main">
          <AdminTopbar
            breadcrumbs={[
              { label: "Admin" },
              { label: "Reports", path: "/admin-reports" },
              { label: "Error" },
            ]}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg)",
              gap: "16px",
            }}
          >
            <IonIcon
              icon={closeCircleOutline}
              style={{ fontSize: "3rem", color: "var(--danger)" }}
            />
            <p style={{ color: "var(--ink-3)" }}>
              {error || "Report not found."}
            </p>
            <button
              className="btn-back"
              onClick={() => navigate("/admin-reports")}
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  const STATUS_CFG = {
    pending: {
      label: "Pending",
      color: "#8a5a00",
      bg: "#fef3c7",
      ring: "#fcd34d",
      icon: timeOutline,
    },
    approved: {
      label: "Approved",
      color: "#0d7a55",
      bg: "#d6f4e9",
      ring: "#9de8cb",
      icon: checkmarkCircleOutline,
    },
    rejected: {
      label: "Rejected",
      color: "#c0303b",
      bg: "#fee2e2",
      ring: "#fca5a5",
      icon: closeCircleOutline,
    },
  } as const;

  const cfg = STATUS_CFG[report.status] || STATUS_CFG.pending;

  return (
    <div className="report-detail-page shell">
      <AdminSidebar activePath="/admin-reports" name={adminUser?.fullName} />

      <div className="main">
        <AdminTopbar
          breadcrumbs={[
            { label: "Admin", path: "/admin-dashboard" },
            { label: "Reports", path: "/admin-reports" },
            { label: report.studentName },
          ]}
          onRefresh={fetchReportDetail}
          refreshing={loading}
          onPrint={() => window.print()}
        />

        <div className="scroll-area">
          <div className="page-content">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <button
                className="btn-back"
                style={{ marginBottom: 0 }}
                onClick={() => navigate("/admin-reports")}
              >
                <IonIcon icon={arrowBackOutline} style={{ marginRight: 8 }} />
                Back to Reports
              </button>
              <button
                className="btn-ghost-sm"
                style={{
                  color: "var(--danger)",
                  borderColor: "var(--danger-ring)",
                }}
                onClick={() => setShowDeleteModal(true)}
                disabled={actionLoading}
              >
                <IonIcon icon={trashOutline} />
                Delete Report
              </button>
            </div>

            <div className="detail-grid">
              <div className="profile-card">
                <div className="profile-banner" />
                <div className="profile-avatar-wrap">
                  <div className="profile-avatar-lg">
                    <Avatar
                      src={report.studentProfilePicture}
                      name={report.studentName}
                      clickable={false}
                    />
                  </div>
                </div>
                <div className="profile-body">
                  <div className="profile-name">{report.studentName}</div>
                  <div className="profile-id">{report.traineeId}</div>
                  <div className="profile-course">
                    {report.course}{" "}
                    {report.year ? `${report.year}-${report.section}` : ""}
                  </div>

                  <div className="profile-status-row">
                    <span
                      className="profile-status-badge"
                      style={{
                        background: cfg.bg,
                        color: cfg.color,
                        borderColor: cfg.ring,
                      }}
                    >
                      <span
                        className="profile-status-dot"
                        style={{ background: cfg.color }}
                      />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="divider" />

                  <div className="meta-list">
                    <div className="meta-item">
                      <div className="meta-icon-wrap">
                        <IonIcon icon={calendarOutline} />
                      </div>
                      <div>
                        <div className="meta-label">Report Date</div>
                        <div className="meta-val">
                          {formatDate(report.reportDate)}
                        </div>
                      </div>
                    </div>
                    <div className="meta-item">
                      <div className="meta-icon-wrap">
                        <IonIcon icon={documentTextOutline} />
                      </div>
                      <div>
                        <div className="meta-label">Report Type</div>
                        <div
                          className="meta-val"
                          style={{ textTransform: "capitalize" }}
                        >
                          {report.type} Submission
                        </div>
                      </div>
                    </div>
                    <div className="meta-item">
                      <div className="meta-icon-wrap">
                        <IonIcon icon={attachOutline} />
                      </div>
                      <div>
                        <div className="meta-label">Office / Assignment</div>
                        <div className="meta-val">{report.officeName}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-col">
                <div className="detail-card">
                  <div className="card-head">
                    <div className="card-head-icon">
                      <IonIcon icon={documentOutline} />
                    </div>
                    <div className="card-head-title">Report Information</div>
                  </div>
                  <div className="card-body">
                    <div style={{ marginBottom: 20 }}>
                      <p className="meta-label">Title</p>
                      <p className="meta-val" style={{ fontSize: "1.1rem" }}>
                        {report.title || "Untitled Report"}
                      </p>
                    </div>
                    <div>
                      <p className="meta-label">Content / Description</p>
                      <div className="desc-box">{report.content}</div>
                    </div>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="card-head">
                    <div className="card-head-icon">
                      <IonIcon icon={attachOutline} />
                    </div>
                    <div className="card-head-title">
                      Attachments ({report.attachments?.length || 0})
                    </div>
                  </div>
                  <div className="card-body">
                    {report.attachments && report.attachments.length > 0 ? (
                      report.attachments.map((att, idx) => {
                        const isImg = /\.(jpe?g|png|gif|webp)$/i.test(
                          att.filename,
                        );
                        const url = getMediaUrl(att.path);
                        return (
                          <div
                            key={idx}
                            className="attach-row"
                            onClick={() =>
                              isImg
                                ? setSelectedImage(url)
                                : downloadReport(url, att.originalName)
                            }
                          >
                            <div
                              className="attach-file-icon"
                              style={{
                                padding: isImg ? 0 : "",
                                overflow: "hidden",
                              }}
                            >
                              {isImg ? (
                                <img
                                  src={url}
                                  alt="preview"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <IonIcon icon={attachOutline} />
                              )}
                            </div>
                            <div className="attach-info">
                              <div className="attach-name">
                                {att.originalName}
                              </div>
                              <div className="attach-meta">
                                {isImg ? "Image File" : "Document"} · Click to
                                view
                              </div>
                            </div>
                            <div className="attach-dl">
                              <IonIcon
                                icon={isImg ? refreshOutline : downloadOutline}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p
                        style={{
                          color: "var(--ink-3)",
                          fontSize: "0.875rem",
                          fontStyle: "italic",
                        }}
                      >
                        No attachments provided.
                      </p>
                    )}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="card-head">
                    <div className="card-head-icon">
                      <IonIcon icon={shieldCheckmarkOutline} />
                    </div>
                    <div className="card-head-title">Admin Decision</div>
                  </div>
                  <div className="card-body">
                    {report.status === "pending" ? (
                      <>
                        <p className="decision-hint">
                          Review this report and provide feedback. Approved
                          reports will be credited to the trainee's progress.
                        </p>
                        <textarea
                          className="feedback-input"
                          style={{
                            color: "var(--ink)",
                            backgroundColor: "var(--surface)",
                          }}
                          placeholder="Provide feedback (optional)..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        />
                        <div className="action-row">
                          <button
                            className="btn-approve"
                            disabled={actionLoading}
                            onClick={() => handleUpdateStatus("approved")}
                          >
                            {actionLoading ? (
                              <IonSpinner
                                name="crescent"
                                style={{ width: 16, height: 16 }}
                              />
                            ) : (
                              <IonIcon
                                icon={checkmarkCircleOutline}
                                style={{ marginRight: 6 }}
                              />
                            )}
                            Approve Report
                          </button>
                          <button
                            className="btn-decline"
                            disabled={actionLoading}
                            onClick={() => handleUpdateStatus("rejected")}
                          >
                            {actionLoading ? (
                              <IonSpinner
                                name="crescent"
                                style={{ width: 16, height: 16 }}
                              />
                            ) : (
                              <IonIcon
                                icon={closeCircleOutline}
                                style={{ marginRight: 6 }}
                              />
                            )}
                            Reject Report
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="resolved-banner"
                          style={{
                            background: cfg.bg,
                            borderColor: cfg.ring,
                            color: cfg.color,
                          }}
                        >
                          <div
                            className="resolved-icon"
                            style={{ background: cfg.color }}
                          >
                            <IonIcon icon={cfg.icon} />
                          </div>
                          <div>
                            <div className="resolved-title">
                              Report{" "}
                              {report.status === "approved"
                                ? "Approved"
                                : "Rejected"}
                            </div>
                            <div className="resolved-sub">
                              Reviewed by{" "}
                              {report.reviewerName || "Administrator"} on{" "}
                              {formatDate(
                                report.reviewedAt || report.updatedAt,
                              )}
                            </div>
                          </div>
                        </div>

                        {report.feedback && (
                          <div
                            style={{
                              marginTop: 16,
                              padding: 16,
                              background: "var(--bg)",
                              borderRadius: "var(--r-md)",
                              border: "1px solid var(--rule)",
                            }}
                          >
                            <p className="meta-label">Feedback Provided</p>
                            <p
                              style={{
                                fontSize: "0.9rem",
                                color: "var(--ink-2)",
                                marginTop: 4,
                              }}
                            >
                              {report.feedback}
                            </p>
                          </div>
                        )}

                        <div className="action-row" style={{ marginTop: 24 }}>
                          <button
                            className="btn-ghost-action"
                            onClick={() => {
                              setReport({ ...report, status: "pending" });
                            }}
                          >
                            <IonIcon
                              icon={refreshOutline}
                              style={{ marginRight: 6 }}
                            />
                            Change Decision
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedImage && (
        <Lightbox src={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Report"
        description={
          <>
            Are you sure you want to delete the report{" "}
            <strong>{report.title || "Untitled"}</strong>? This action will
            permanently remove the submission.
          </>
        }
        isDeleting={actionLoading}
        deleteComplete={deleteComplete}
      />
    </div>
  );
};

export default ReportDetail;
