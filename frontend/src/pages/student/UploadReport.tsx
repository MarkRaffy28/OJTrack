import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { 
  arrowBackOutline, calendarOutline, documentTextOutline, createOutline, cloudUploadOutline, imagesOutline, closeCircleOutline, 
  checkmarkCircleOutline, attachOutline, trashOutline, alertCircleOutline
} from "ionicons/icons";
import { useAuth } from "@context/authContext";
import { useOjt } from "@context/ojtContext";
import { useReport } from "@context/reportContext";
import { useNavigation } from "@hooks/useNavigation";
import API from "@api/api";
import LockedOjtScreen from "@components/LockedOjtScreen";
import "@css/UploadReport.css";

const MAX_FILES = 10;

type ReportType =
  | "daily"
  | "weekly"
  | "monthly"
  | "midterm"
  | "final"
  | "incident";

const REPORT_TYPES: { label: string; value: ReportType }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Midterm", value: "midterm" },
  { label: "Final", value: "final" },
  { label: "Incident", value: "incident" },
];

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  raw: File;
}

function UploadReport() {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { token, databaseId } = useAuth();
  const { navigate } = useNavigation();
  const { currentOjt } = useOjt();
  const { fetchReports } = useReport();

  const [reportDate, setReportDate] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ReportType>("weekly");

  const filesRef = useRef<UploadedFile[]>([]);
  useEffect(() => {
    filesRef.current = uploadedFiles;
  }, [uploadedFiles]);

  useEffect(() => {
    setSubmitted(false);

    return () => {
      filesRef.current.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [location.pathname]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setFileError(null);

    const incoming = Array.from(files);
    const slotsLeft = MAX_FILES - uploadedFiles.length;

    if (slotsLeft <= 0) {
      setFileError(`You've reached the maximum of ${MAX_FILES} files.`);
      return;
    }

    const accepted = incoming.slice(0, slotsLeft);
    const rejected = incoming.length - accepted.length;

    const newFiles: UploadedFile[] = accepted.map((file) => {
      const id = Math.random().toString(36).slice(2);
      const preview = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;
      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        preview,
        raw: file,
      };
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    if (rejected > 0) {
      setFileError(
        `${rejected} file(s) were not added — maximum of ${MAX_FILES} files allowed.`,
      );
    }
  };

  const removeFile = (id: string) => {
    setFileError(null);
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const isFormValid = reportDate && reportTitle.trim() && content.trim();

  const handleSubmit = async () => {
    if (!isFormValid) return;
    if (!databaseId || !currentOjt) {
      setSubmitError("Missing student or OJT information. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const resetForm = () => {
      setReportDate("");
      setReportTitle("");
      setContent("");
      uploadedFiles.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
      setUploadedFiles([]);
      setSelectedType("weekly");
      setSubmitError(null);
      setFileError(null);
    };

    try {
      const formData = new FormData();
      formData.append("studentId", String(databaseId));
      formData.append("ojtId", String(currentOjt.id));
      formData.append("type", selectedType);
      formData.append("reportDate", reportDate);
      formData.append("title", reportTitle.trim());
      formData.append("content", content.trim());

      uploadedFiles.forEach((file) => {
        formData.append("attachments", file.raw);
      });

      await API.post("/reports", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchReports();
      resetForm();
      setSubmitted(true);
      setTimeout(() => navigate('/reports'), 1800);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Something went wrong while submitting your report. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <IonPage>
        <IonContent fullscreen className="ur-content">
          <div className="ur-success-screen">
            <div className="ur-success-icon">
              <IonIcon icon={checkmarkCircleOutline} />
            </div>
            <h2 className="ur-success-title">Report Submitted!</h2>
            <p className="ur-success-sub">
              Your report has been uploaded successfully.
            </p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (currentOjt?.status === 'completed') {
    return (
      <IonPage>
        <IonContent fullscreen>
          <LockedOjtScreen type="completed" backPath="/reports" />
        </IonContent>
      </IonPage>
    );
  }

  if (!currentOjt?.officeName) {
    return (
      <IonPage>
        <IonContent fullscreen>
          <LockedOjtScreen type="unassigned" backPath="/reports" />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="ur-content">
        {/* Hero */}
        <div className="ur-hero">
          <div className="ur-hero-bg" />
          <div className="ur-hero-inner">
            <button
              className="ur-back-btn"
              onClick={() => navigate('/reports')}
            >
              <IonIcon icon={arrowBackOutline} />
            </button>
            <div>
              <h1 className="ur-hero-title">Upload Report</h1>
              <p className="ur-hero-sub">Submit your OJT documentation</p>
            </div>
          </div>
        </div>

        <div className="ur-container">
          <div className="ur-section">
            <div className="ur-section-label">
              <IonIcon icon={documentTextOutline} />
              Report Type
            </div>
            <div className="ur-type-row">
              {REPORT_TYPES.map(({ label, value }) => (
                <button
                  key={value}
                  className={`ur-type-chip ${selectedType === value ? "ur-type-active" : ""}`}
                  onClick={() => setSelectedType(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="ur-section">
            <div className="ur-section-label">
              <IonIcon icon={calendarOutline} />
              Report Date
            </div>
            <div className="ur-input-wrap">
              <IonIcon icon={calendarOutline} className="ur-input-icon" />
              <input
                type="date"
                className="ur-input ur-input-date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
          </div>

          <div className="ur-section">
            <div className="ur-section-label">
              <IonIcon icon={createOutline} />
              Report Title
            </div>
            <div className="ur-input-wrap">
              <IonIcon icon={createOutline} className="ur-input-icon" />
              <input
                type="text"
                className="ur-input"
                placeholder="e.g. Weekly Report – Week 5"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                maxLength={255}
              />
              {reportTitle && (
                <button
                  className="ur-clear-btn"
                  onClick={() => setReportTitle("")}
                >
                  <IonIcon icon={closeCircleOutline} />
                </button>
              )}
            </div>
            <span className="ur-char-count">{reportTitle.length}/255</span>
          </div>

          <div className="ur-section">
            <div className="ur-section-label">
              <IonIcon icon={documentTextOutline} />
              Content
            </div>
            <textarea
              className="ur-textarea"
              placeholder="Describe your activities, learnings, and observations for this report period…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={2000}
            />
            <span className="ur-char-count">{content.length}/2000</span>
          </div>

          <div className="ur-section">
            <div className="ur-section-label">
              <IonIcon icon={imagesOutline} />
              Attachments
              <span className="ur-label-hint">
                Images, PDFs, Docs ({uploadedFiles.length}/{MAX_FILES})
              </span>
            </div>

            <div
              className={`ur-dropzone ${isDragging ? "ur-dropzone--active" : ""} ${uploadedFiles.length >= MAX_FILES ? "ur-dropzone--disabled" : ""}`}
              onClick={() =>
                uploadedFiles.length < MAX_FILES &&
                fileInputRef.current?.click()
              }
              onDragOver={(e) => {
                e.preventDefault();
                if (uploadedFiles.length < MAX_FILES) setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="ur-dropzone-icon">
                <IonIcon icon={cloudUploadOutline} />
              </div>
              <p className="ur-dropzone-title">
                {uploadedFiles.length >= MAX_FILES
                  ? "Maximum files reached"
                  : isDragging
                    ? "Drop files here"
                    : "Tap or drag to upload"}
              </p>
              <p className="ur-dropzone-sub">
                Supports images, PDF, DOCX · Max {MAX_FILES} files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                className="ur-file-input"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {fileError && (
              <div className="ur-inline-error">
                <IonIcon icon={alertCircleOutline} />
                {fileError}
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="ur-file-list">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="ur-file-item">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="ur-file-thumb"
                      />
                    ) : (
                      <div className="ur-file-icon-wrap">
                        <IonIcon icon={attachOutline} />
                      </div>
                    )}
                    <div className="ur-file-info">
                      <span className="ur-file-name">{file.name}</span>
                      <span className="ur-file-size">
                        {formatBytes(file.size)}
                      </span>
                    </div>
                    <button
                      className="ur-file-remove"
                      onClick={() => removeFile(file.id)}
                    >
                      <IonIcon icon={trashOutline} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {submitError && (
            <div className="ur-inline-error ur-inline-error--submit">
              <IonIcon icon={alertCircleOutline} />
              {submitError}
            </div>
          )}

          <button
            className={`ur-submit-btn ${isFormValid ? "ur-submit-ready" : ""} ${isSubmitting ? "ur-submit-loading" : ""}`}
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="ur-spinner" />
                Submitting…
              </>
            ) : (
              <>
                <IonIcon icon={cloudUploadOutline} />
                Submit Report
              </>
            )}
          </button>

          <div className="ur-bottom-space" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default UploadReport;
