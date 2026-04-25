import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, alertCircleOutline, saveOutline, businessOutline, mailOutline, callOutline, locationOutline, chevronBackOutline } from 'ionicons/icons';
import { useAuth } from '@context/authContext';
import { useUser } from '@context/userContext';
import { useNavigation } from '@hooks/useNavigation';
import API from '@api/api';
import AdminSidebar from '@components/AdminSidebar';
import AdminTopbar from '@components/AdminTopbar';
import '@css/AdminDashboard.css';
import '@css/AddOffice.css';

function AddOffice() {
  const { navigate } = useNavigation();
  const { token } = useAuth();
  const { user } = useUser();

  const [draft, setDraft] = useState({
    name: '',
    address: '',
    contact_email: '',
    contact_phone: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);

  const handleChange = (field: string, val: string) => {
    setDraft(prev => ({ ...prev, [field]: val }));
    setErrorBanner(null);
  };

  const handleSave = async () => {
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
      await API.post(`/offices`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessBanner(true);
      setTimeout(() => {
        navigate(`/admin-offices`);
      }, 1500);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorBanner(err.response?.data?.message || "Failed to create office. Please check the fields and try again.");
      setIsSaving(false);
    }
  };

  return (
    <div className="shell">
      <AdminSidebar activePath="/admin-offices" name={user?.fullName} />
      <div className="main">
        <AdminTopbar
          breadcrumbs={[
            { label: "Admin", path: "/admin-dashboard" },
            { label: "Offices", path: "/admin-offices" },
            { label: "Add New Office" },
          ]}
        />

        <div className="page-scroll-area">
          <div className="page-content">
            <div className="top-actions">
              <button type="button" className="back-link" onClick={() => navigate('/admin-offices')}>
                <IonIcon icon={chevronBackOutline} className="back-icon" />
                Back to Offices
              </button>
              <button className="btn-save" onClick={handleSave} disabled={isSaving || successBanner}>
                {isSaving ? (
                  <><div className="spinner" style={{width: 16, height: 16, borderTopColor: '#fff', borderWidth: 2}}></div>Saving…</>
                ) : (
                  <><IonIcon icon={saveOutline} className="btn-icon" />Save Office</>
                )}
              </button>
            </div>

            {successBanner && (
              <div className="banner banner-success">
                <IonIcon icon={checkmarkCircleOutline} className="banner-icon" />
                Office added successfully. Redirecting...
              </div>
            )}
            {errorBanner && (
              <div className="banner banner-error">
                <IonIcon icon={alertCircleOutline} className="banner-icon" />
                {errorBanner}
              </div>
            )}

            <div className="add-layout">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card editing">
                  <div className="card-head">
                    <div className="card-accent" style={{ backgroundColor: 'var(--brand)' }}></div>
                    <div className="card-title">Office Information</div>
                  </div>
                  <div className="card-body">
                    <div className="info-grid">
                      
                      <div className="info-item">
                        <span className="info-label">Office Name *</span>
                        <div className="field-avail-wrap">
                          <input 
                            className="field-input" 
                            value={draft.name} 
                            onChange={e => handleChange('name', e.target.value)} 
                            placeholder="Required" 
                          />
                          <div className="avail-icon-area">
                            <IonIcon icon={businessOutline} className="info-icon" />
                          </div>
                        </div>
                      </div>

                      <div className="info-item span-full">
                        <span className="info-label">Address</span>
                        <div className="field-avail-wrap">
                          <input 
                            className="field-input" 
                            value={draft.address} 
                            onChange={e => handleChange('address', e.target.value)} 
                            placeholder="Optional"
                          />
                          <div className="avail-icon-area">
                            <IonIcon icon={locationOutline} className="info-icon" />
                          </div>
                        </div>
                      </div>

                      <div className="info-item">
                        <span className="info-label">Contact Email</span>
                        <div className="field-avail-wrap">
                          <input 
                            className="field-input" 
                            type="email"
                            value={draft.contact_email} 
                            onChange={e => handleChange('contact_email', e.target.value)} 
                            placeholder="Optional"
                          />
                          <div className="avail-icon-area">
                            <IonIcon icon={mailOutline} className="info-icon" />
                          </div>
                        </div>
                      </div>

                      <div className="info-item">
                        <span className="info-label">Contact Phone</span>
                        <div className="field-avail-wrap">
                          <input 
                            className="field-input" 
                            value={draft.contact_phone} 
                            onChange={e => handleChange('contact_phone', e.target.value)} 
                            placeholder="Optional"
                            minLength={7}
                            maxLength={11}
                          />
                          <div className="avail-icon-area">
                            <IonIcon icon={callOutline} className="info-icon" />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOffice;
