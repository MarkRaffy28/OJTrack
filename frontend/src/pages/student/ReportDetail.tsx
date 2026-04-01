import React, { useState, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import {
  arrowBackOutline, calendarOutline, documentTextOutline, downloadOutline, checkmarkCircleOutline, timeOutline, imageOutline, 
  informationCircleOutline, attachOutline, closeCircleOutline, printOutline, createOutline, trashOutline, alertCircleOutline, 
  saveOutline, banOutline, personOutline, chatbubbleOutline, cloudUploadOutline,
} from 'ionicons/icons';
import { printReport } from '@components/PrintReport';
import { useReport, Report, ReportAttachment } from '@context/reportContext';
import { formatDate, formatDateTime, formatDateForInput } from '@utils/date';
import { capitalize } from '@utils/string';
import '@css/ReportDetail.css';

const API_URL = import.meta.env.VITE_API_URL;
const MAX_FILES = 10;

const statusConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  pending:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', icon: timeOutline,             label: 'Pending'  },
  approved: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: checkmarkCircleOutline,   label: 'Approved' },
  rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: banOutline,              label: 'Rejected' },
};

const REPORT_TYPES: { label: string; value: Report['type'] }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Midterm', value: 'midterm' },
  { label: 'Final', value: 'final' },
  { label: 'Incident', value: 'incident' },
];

interface EditState {
  title: string;
  type: Report['type'];
  reportDate: string;
  content: string;
  existingAttachments: ReportAttachment[];
  newFiles: File[];
  newFilePreviews: { file: File; preview?: string }[];
}

const ReportDetail: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ report: Report }>();
  const { updateReport, deleteReport } = useReport();
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  // Edit modal
  const [editState, setEditState] = useState<EditState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal
  const [showDelete, setShowDelete] = useState(false);

  const report = location.state?.report;

  if (!report) {
    return (
      <IonPage>
        <IonContent fullscreen className="rd-content">
          <div className="rd-not-found">
            <IonIcon icon={documentTextOutline} />
            <p>Report not found.</p>
            <button className="rd-back-link" onClick={() => history.push('/reports')}>
              Go back to Reports
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const cfg = statusConfig[report.status] ?? statusConfig.pending;
  const isApproved = report.status === 'approved';

  const handleDownload = () => {
    setDownloading(true);
    const content = [
      `REPORT TITLE: ${report.title ?? 'Untitled'}`,
      `TYPE:         ${capitalize(report.type)}`,
      `DATE:         ${formatDate(report.reportDate)}`,
      `STATUS:       ${capitalize(report.status)}`,
      '',
      'CONTENT',
      '------------',
      report.content,
      '',
      'ATTACHMENTS',
      '------------',
      report.attachments && report.attachments.length > 0
        ? report.attachments.map(a => a.originalName).join(', ')
        : 'No attachments.',
      '',
      ...(report.reviewerName ? [
        'REVIEW INFO',
        '------------',
        `Reviewed by: ${report.reviewerName}`,
        `Reviewed at: ${report.reviewedAt ? formatDateTime(report.reviewedAt) : 'N/A'}`,
        `Feedback: ${report.feedback ?? 'None'}`,
      ] : []),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(report.title ?? 'report').replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => { setDownloading(false); setDownloaded(true); }, 800);
  };

  const openEdit = () => {
    if (isApproved) return;
    setEditState({
      title: report.title ?? '',
      type: report.type,
      reportDate: formatDateForInput(report.reportDate),
      content: report.content,
      existingAttachments: report.attachments ? [...report.attachments] : [],
      newFiles: [],
      newFilePreviews: [],
    });
  };

  const removeExistingAttachment = (index: number) => {
    setEditState(s => {
      if (!s) return s;
      const updated = [...s.existingAttachments];
      updated.splice(index, 1);
      return { ...s, existingAttachments: updated };
    });
  };

  const addEditFiles = (files: FileList | null) => {
    if (!files || !editState) return;
    const totalSlots = MAX_FILES - editState.existingAttachments.length - editState.newFiles.length;
    const incoming = Array.from(files).slice(0, Math.max(0, totalSlots));

    const previews = incoming.map(f => ({
      file: f,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }));

    setEditState(s => s ? {
      ...s,
      newFiles: [...s.newFiles, ...incoming],
      newFilePreviews: [...s.newFilePreviews, ...previews],
    } : s);
  };

  const removeNewFile = (index: number) => {
    setEditState(s => {
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
    if (!editState || !report) return;
    setIsSaving(true);
    await updateReport(report.id, {
      title: editState.title.trim() || null,
      type: editState.type,
      reportDate: editState.reportDate,
      content: editState.content.trim(),
      existingAttachments: editState.existingAttachments,
      files: editState.newFiles.length > 0 ? editState.newFiles : undefined,
    });
    setIsSaving(false);
    setEditState(null);
    history.push('/reports');
  };

  const handleDelete = () => {
    if (!report || isApproved) return;
    deleteReport(report.id);
    setShowDelete(false);
    history.push('/reports');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="rd-content">

        {/* Hero */}
        <div className="rd-hero">
          <div className="rd-hero-bg" />
          <div className="rd-hero-inner">
            <button className="rd-back-btn" onClick={() => history.push('/reports')}>
              <IonIcon icon={arrowBackOutline} />
            </button>
            <div className="rd-hero-text">
              <span className="rd-hero-eyebrow">{capitalize(report.type)} Report</span>
              <h1 className="rd-hero-title">{report.title ?? 'Untitled Report'}</h1>
            </div>
            <span className="rd-hero-status" style={{ color: cfg.color, background: cfg.bg }}>
              <IonIcon icon={cfg.icon} />
              {cfg.label}
            </span>
            {!isApproved && (
              <div className="rd-hero-actions-inline">
                <button className="rd-hero-action-btn rd-hero-edit" onClick={openEdit} title="Edit report">
                  <IonIcon icon={createOutline} />
                </button>
                <button className="rd-hero-action-btn rd-hero-delete" onClick={() => setShowDelete(true)} title="Delete report">
                  <IonIcon icon={trashOutline} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="rd-container">

          {/* Meta strip */} <br />
          <div className="rd-meta-strip">
            <div className="rd-meta-item">
              <IonIcon icon={calendarOutline} />
              <span>{formatDate(report.reportDate)}</span>
            </div>
            <div className="rd-meta-divider" />
            <div className="rd-meta-item">
              <IonIcon icon={documentTextOutline} />
              <span>{capitalize(report.type)}</span>
            </div>
            {report.attachments && report.attachments.length > 0 && (
              <>
                <div className="rd-meta-divider" />
                <div className="rd-meta-item">
                  <IonIcon icon={imageOutline} />
                  <span>{report.attachments.length} file{report.attachments.length !== 1 ? 's' : ''}</span>
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="rd-section">
            <div className="rd-section-header">
              <IonIcon icon={informationCircleOutline} />
              <span>Content</span>
            </div>
            <p className="rd-section-text">{report.content}</p>
          </div>

          {/* Review Information */}
          {(report.reviewedBy || report.feedback) && (
            <div className="rd-section rd-review-section">
              <div className="rd-section-header">
                <IonIcon icon={chatbubbleOutline} />
                <span>Review Information</span>
              </div>
              <div className="rd-review-grid">
                {report.reviewerName && (
                  <div className="rd-review-item">
                    <IonIcon icon={personOutline} />
                    <div className="rd-review-item-content">
                      <span className="rd-review-label">Reviewed By</span>
                      <span className="rd-review-value">{report.reviewerName}</span>
                    </div>
                  </div>
                )}
                {report.reviewedAt && (
                  <div className="rd-review-item">
                    <IonIcon icon={calendarOutline} />
                    <div className="rd-review-item-content">
                      <span className="rd-review-label">Reviewed At</span>
                      <span className="rd-review-value">{formatDateTime(report.reviewedAt)}</span>
                    </div>
                  </div>
                )}
                {report.feedback && (
                  <div className="rd-review-feedback">
                    <span className="rd-review-label">Feedback</span>
                    <p className="rd-review-feedback-text">{report.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attachments */}
          <div className="rd-section">
            <div className="rd-section-header">
              <IonIcon icon={attachOutline} />
              <span>Attachments</span>
              {report.attachments && report.attachments.length > 0 && (
                <span className="rd-section-count">{report.attachments.length}</span>
              )}
            </div>
            {report.attachments && report.attachments.length > 0 ? (
              <div className="rd-attachments">
                {report.attachments.map((att, i) => {
                  const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(att.filename);
                  const fullPath = att.path.replace(/\\/g, '/').replace(/^\.\//, '');
                  const fileUrl = `${API_URL}/${fullPath}`;
                  return (
                    <div
                      key={i}
                      className="rd-attachment-card"
                      onClick={() => isImage ? setSelectedImage(fileUrl) : window.open(fileUrl, '_blank')}
                    >
                      {isImage ? (
                        <img src={fileUrl} alt={att.originalName} className="rd-attachment-thumb-img" />
                      ) : (
                        <div className="rd-attachment-thumb">
                          <IonIcon icon={attachOutline} />
                        </div>
                      )}
                      <div className="rd-attachment-info">
                        <span className="rd-attachment-name">{att.originalName}</span>
                        <span className="rd-attachment-type">Tap to {isImage ? 'view' : 'open'}</span>
                      </div>
                      <IonIcon icon={imageOutline} className="rd-attachment-arrow" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rd-empty-attachments">No attachments for this report.</p>
            )}
          </div>

          <div className="rd-bottom-space" />
        </div>

        {/* Sticky Action Bar — Print + Download side by side */}
        <div className="rd-sticky-bar">
          <div className="rd-action-row">
            <button
              className="rd-print-btn"
              onClick={() => printReport(report)}
            >
              <IonIcon icon={printOutline} />
              Print
            </button>
            <button
              className={`rd-dl-btn ${downloading ? 'rd-dl-btn--loading' : ''} ${downloaded ? 'rd-dl-btn--done' : ''}`}
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <><span className="rd-spinner" />Saving…</>
              ) : downloaded ? (
                <><IonIcon icon={checkmarkCircleOutline} />Downloaded</>
              ) : (
                <><IonIcon icon={downloadOutline} />Download</>
              )}
            </button>
          </div>
        </div>

        {/* Image Lightbox */}
        {selectedImage && (
          <div className="rd-lightbox-overlay" onClick={() => setSelectedImage(null)}>
            <button className="rd-lightbox-close" onClick={() => setSelectedImage(null)}>
              <IonIcon icon={closeCircleOutline} />
            </button>
            <div className="rd-lightbox-body" onClick={e => e.stopPropagation()}>
              <div className="rd-lightbox-img-wrap">
                <img src={selectedImage} alt="attachment" />
              </div>
            </div>
          </div>
        )}

      </IonContent>

      {/* ── EDIT MODAL ────────────────────────────────────────────────── */}
      {editState && (
        <div className="rp-modal-overlay" onClick={() => setEditState(null)}>
          <div className="rp-modal" onClick={e => e.stopPropagation()}>
            <div className="rp-modal-header">
              <div className="rp-modal-title-row">
                <IonIcon icon={createOutline} className="rp-modal-icon" />
                <h2 className="rp-modal-title">Edit Report</h2>
              </div>
              <button className="rp-modal-close" onClick={() => setEditState(null)}>
                <IonIcon icon={closeCircleOutline} />
              </button>
            </div>
            <div className="rp-modal-body">
              <div className="rp-field">
                <label className="rp-field-label">Title</label>
                <input
                  className="rp-field-input"
                  value={editState.title}
                  onChange={e => setEditState(s => s && ({ ...s, title: e.target.value }))}
                  maxLength={80}
                  placeholder="Report title"
                />
              </div>
              <div className="rp-field-row">
                <div className="rp-field">
                  <label className="rp-field-label">Type</label>
                  <select
                    className="rp-field-select"
                    value={editState.type}
                    onChange={e => setEditState(s => s && ({ ...s, type: e.target.value as Report['type'] }))}
                  >
                    {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="rp-field">
                  <label className="rp-field-label">Date</label>
                  <input
                    type="date"
                    className="rp-field-input"
                    value={editState.reportDate}
                    onChange={e => setEditState(s => s && ({ ...s, reportDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="rp-field">
                <label className="rp-field-label">Content</label>
                <textarea
                  className="rp-field-textarea"
                  value={editState.content}
                  onChange={e => setEditState(s => s && ({ ...s, content: e.target.value }))}
                  rows={5}
                  maxLength={2000}
                  placeholder="Report content"
                />
                <span className="rp-field-count">{editState.content.length}/2000</span>
              </div>

              {/* Attachments Management */}
              <div className="rp-field">
                <label className="rp-field-label">
                  Attachments ({editState.existingAttachments.length + editState.newFiles.length}/{MAX_FILES})
                </label>
                {editState.existingAttachments.length > 0 && (
                  <div className="rp-edit-file-list">
                    {editState.existingAttachments.map((att, i) => {
                      const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(att.filename);
                      const thumbUrl = isImage ? `${API_URL}/${att.path.replace(/\\/g, '/')}` : undefined;
                      return (
                        <div key={`existing-${i}`} className="rp-edit-file-item">
                          {thumbUrl ? (
                            <img src={thumbUrl} alt={att.originalName} className="rp-edit-file-thumb" />
                          ) : (
                            <div className="rp-edit-file-icon-wrap"><IonIcon icon={attachOutline} /></div>
                          )}
                          <span className="rp-edit-file-name">{att.originalName}</span>
                          <button className="rp-edit-file-remove" onClick={() => removeExistingAttachment(i)} title="Remove">
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
                      <div key={`new-${i}`} className="rp-edit-file-item rp-edit-file-new">
                        {item.preview ? (
                          <img src={item.preview} alt={item.file.name} className="rp-edit-file-thumb" />
                        ) : (
                          <div className="rp-edit-file-icon-wrap"><IonIcon icon={attachOutline} /></div>
                        )}
                        <span className="rp-edit-file-name">{item.file.name}</span>
                        <button className="rp-edit-file-remove" onClick={() => removeNewFile(i)} title="Remove">
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
                <input
                  ref={editFileRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={e => { addEditFiles(e.target.files); e.target.value = ''; }}
                />
              </div>
            </div>
            <div className="rp-modal-footer">
              <button className="rp-modal-btn rp-modal-cancel" onClick={() => setEditState(null)}>
                Cancel
              </button>
              <button
                className={`rp-modal-btn rp-modal-save ${isSaving ? 'rp-modal-save--loading' : ''}`}
                onClick={handleSaveEdit}
                disabled={isSaving || !editState.content.trim()}
              >
                {isSaving
                  ? <><span className="rp-btn-spinner" /> Saving…</>
                  : <><IonIcon icon={saveOutline} /> Save Changes</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ──────────────────────────────────────────────── */}
      {showDelete && report && !isApproved && (
        <div className="rp-modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="rp-modal rp-modal--delete" onClick={e => e.stopPropagation()}>
            <div className="rp-modal-header">
              <div className="rp-modal-title-row">
                <IonIcon icon={alertCircleOutline} className="rp-modal-icon rp-modal-icon--danger" />
                <h2 className="rp-modal-title">Delete Report?</h2>
              </div>
              <button className="rp-modal-close" onClick={() => setShowDelete(false)}>
                <IonIcon icon={closeCircleOutline} />
              </button>
            </div>
            <div className="rp-modal-body rp-delete-body">
              <p className="rp-delete-msg">You're about to permanently delete:</p>
              <div className="rp-delete-card">
                <p className="rp-delete-name">{report.title ?? 'Untitled Report'}</p>
                <p className="rp-delete-meta">{capitalize(report.type)} · {formatDate(report.reportDate)}</p>
              </div>
              <p className="rp-delete-warn">This action cannot be undone.</p>
            </div>
            <div className="rp-modal-footer">
              <button className="rp-modal-btn rp-modal-cancel" onClick={() => setShowDelete(false)}>
                Cancel
              </button>
              <button className="rp-modal-btn rp-modal-delete" onClick={handleDelete}>
                <IonIcon icon={trashOutline} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </IonPage>
  );
};

export default ReportDetail;