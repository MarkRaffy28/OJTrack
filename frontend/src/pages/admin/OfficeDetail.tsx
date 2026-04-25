import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import {
  mailOutline, callOutline, chevronBackOutline, locationOutline, businessOutline, alertCircleOutline, createOutline, trashOutline,
  saveOutline, closeOutline,
} from 'ionicons/icons';
import { useAuth } from '@context/authContext';
import { useUser } from '@context/userContext';
import { useNavigation } from '@hooks/useNavigation';
import API from '@api/api';
import AdminSidebar from '@components/AdminSidebar';
import AdminTopbar from '@components/AdminTopbar';
import DeleteModal from '@components/DeleteModal';
import '@css/AdminDashboard.css';
import '@css/OfficeDetail.css';

interface Office {
  id: number;
  name: string;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

function OfficeDetail() {
  const { officeId, action } = useParams<{ officeId: string; action?: string }>();
  
  const { token } = useAuth();
  const { user } = useUser();
  const { navigate } = useNavigation();

  const [data, setData] = useState<Office | null>(null);
  const [draft, setDraft] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(action === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteComplete, setDeleteComplete] = useState(false);

  useEffect(() => {
    if (action === 'delete') {
      setShowDeleteModal(true);
    } else {
      setIsEditing(action === 'edit');
    }
  }, [action]);

  useEffect(() => {
    if (!token || !officeId) return;
    const fetchOffice = async () => {
      setLoading(true);
      setErrorBanner(null);
      try {
        const res = await API.get(`/offices/${officeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
        setDraft(res.data);
      } catch (err) {
        console.error('Failed to fetch office details:', err);
        setErrorBanner('Failed to load office information.');
      } finally {
        setLoading(false);
      }
    };
    fetchOffice();
  }, [token, officeId]);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await API.delete(`/offices/${officeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteComplete(true);
      setTimeout(() => navigate('/admin-offices'), 1500);
    } catch (err: any) {
      console.error('Failed to delete office:', err);
      alert(err.response?.data?.message || 'Failed to delete office');
      setIsDeleting(false);
      setShowDeleteModal(false);
      navigate(`/admin-office-detail/${officeId}/view`, 'none');
    }
  };

  const handleChange = (field: keyof Office, value: any) => {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  };

  const startEdit = () => {
    navigate(`/admin-office-detail/${officeId}/edit`, 'none');
  };

  const cancelEdit = () => {
    setDraft(data);
    setErrorBanner(null);
    navigate(`/admin-office-detail/${officeId}/view`, 'none');
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      setErrorBanner("Office Name is required.");
      return;
    }

    setIsSaving(true);
    setErrorBanner(null);

    const payload = {
      name: draft.name,
      address: draft.address || undefined,
      contact_email: draft.contact_email || undefined,
      contact_phone: draft.contact_phone || undefined
    };

    try {
      await API.patch(`/offices/${officeId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const res = await API.get(`/offices/${officeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setData(res.data);
      setDraft(res.data);
      navigate(`/admin-office-detail/${officeId}/view`, 'none');
    } catch (err: any) {
      console.error("Failed to save changes:", err);
      setErrorBanner(err.response?.data?.message || "Failed to update office.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="shell">
        <AdminSidebar activePath="/admin-offices" name={user?.fullName} />
        <div className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!data || !draft) return null;

  return (
    <div className="shell">
      <AdminSidebar activePath="/admin-offices" name={user?.fullName} />
      <div className="main">

        <AdminTopbar
          breadcrumbs={[
            { label: "Admin", path: "/admin-dashboard" },
            { label: "Offices", path: "/admin-offices" },
            { label: data.name },
          ]}
          onRefresh={async () => {
            setLoading(true);
            try {
              const res = await API.get(`/offices/${officeId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setData(res.data);
              setDraft(res.data);
            } finally {
              setLoading(false);
            }
          }}
          refreshing={loading}
        />

        <div className="page-scroll-area">
          <div className="page-content">

            <button type="button" className="back-link" onClick={() => navigate('/admin-offices')}>
              <IonIcon icon={chevronBackOutline} className="back-icon" />
              Back to Offices
            </button>

            {errorBanner && (
              <div className="banner banner-error">
                <IonIcon icon={alertCircleOutline} className="banner-icon" />
                {errorBanner}
              </div>
            )}
            {isEditing && (
              <div className="banner banner-edit">
                <IonIcon icon={alertCircleOutline} className="banner-icon" />
                You are editing this office's details. Click&nbsp;<strong>Save Changes</strong>&nbsp;to update backend records.
              </div>
            )}

            <div className="profile-header">
              <div className="profile-left">
                <div>
                  <div className="profile-name">{data.name}</div>
                  <div className="profile-meta">
                    <span className="profile-id">Partner Office</span>
                  </div>
                </div>
              </div>
              <div className="profile-actions">
                {!isEditing ? (
                  <>
                    <button className="btn-edit" onClick={startEdit}>
                      <IonIcon icon={createOutline} className="btn-icon" />
                      Edit
                    </button>
                    <button className="btn-del" onClick={() => navigate(`/admin-office-detail/${officeId}/delete`, 'none')}>
                      <IonIcon icon={trashOutline} className="btn-icon" />
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-cancel-edit" onClick={cancelEdit} disabled={isSaving}>
                      <IonIcon icon={closeOutline} className="btn-icon" />
                      Cancel
                    </button>
                    <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                      {isSaving
                        ? <><div className="spinner"></div>Saving…</>
                        : <><IonIcon icon={saveOutline} className="btn-icon" />Save Changes</>
                      }
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="detail-layout">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className={`card${isEditing ? ' editing' : ''}`}>
                  <div className="card-head">
                    <div className="card-accent"></div>
                    <div className="card-title">Office Information</div>
                  </div>
                  <div className="card-body">
                    <div className="info-grid">

                      <div className="info-item">
                        <span className="info-label">Office Name</span>
                        {isEditing ? (
                          <input className="field-input" value={draft.name} onChange={e => handleChange('name', e.target.value)} />
                        ) : (
                          <span className="info-value"><IonIcon icon={businessOutline} className="info-icon" />{data.name}</span>
                        )}
                      </div>

                      <div className="info-item span-full">
                        <span className="info-label">Address</span>
                        {isEditing ? (
                          <input className="field-input" value={draft.address || ''} onChange={e => handleChange('address', e.target.value)} />
                        ) : (
                          <span className="info-value"><IonIcon icon={locationOutline} className="info-icon" />{data.address || 'N/A'}</span>
                        )}
                      </div>

                      <div className="info-item">
                        <span className="info-label">Contact Email</span>
                        {isEditing ? (
                          <input className="field-input" type="email" value={draft.contact_email || ''} onChange={e => handleChange('contact_email', e.target.value)} />
                        ) : (
                          data.contact_email ? (
                            <a href={`mailto:${data.contact_email}`} className="info-value info-link"><IonIcon icon={mailOutline} className="info-icon" />{data.contact_email}</a>
                          ) : <span className="info-value"><IonIcon icon={mailOutline} className="info-icon" />N/A</span>
                        )}
                      </div>

                      <div className="info-item">
                        <span className="info-label">Contact Phone</span>
                        {isEditing ? (
                          <input className="field-input" value={draft.contact_phone || ''} onChange={e => handleChange('contact_phone', e.target.value)} minLength={7} maxLength={11} />
                        ) : (
                          data.contact_phone ? (
                            <a href={`tel:${data.contact_phone}`} className="info-value info-link"><IonIcon icon={callOutline} className="info-icon" />{data.contact_phone}</a>
                          ) : <span className="info-value"><IonIcon icon={callOutline} className="info-icon" />N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <DeleteModal 
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          if (action === 'delete') navigate(`/admin-office-detail/${officeId}/view`, 'none');
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Partner Office"
        description={
          <>
            Are you sure you want to delete <strong>{data?.name || "this office"}</strong>? 
            This will permanently remove the office record and all related assignments.
          </>
        }
        isDeleting={isDeleting}
        deleteComplete={deleteComplete}
      />
    </div>
  );
};

export default OfficeDetail;
