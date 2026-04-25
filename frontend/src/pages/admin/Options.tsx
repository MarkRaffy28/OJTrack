import React, { useState, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import { saveOutline, settingsOutline, calendarOutline, timeOutline, schoolOutline, refreshOutline } from "ionicons/icons";
import { useAuth } from "@context/authContext";
import { useUser } from "@context/userContext";
import API from "@api/api";
import AdminSidebar from "@components/AdminSidebar";
import AdminTopbar from "@components/AdminTopbar";
import "@css/AdminDashboard.css";
import "@css/Users.css";
import "@css/Options.css";

interface Settings {
  current_academic_year: string;
  current_term: string;
  year_2_required_hours: string;
  year_2_start_date: string;
  year_2_end_date: string;
  year_4_required_hours: string;
  year_4_start_date: string;
  year_4_end_date: string;
}

const currentYear = new Date().getFullYear();
const academicYears = Array.from({ length: currentYear - 2020 + 5 }, (_, i) => {
  const start = 2020 + i;
  return `${start}-${start + 1}`;
});

function Options() {
  const { token } = useAuth();
  const { user } = useUser();
  
  const [settings, setSettings] = useState<Settings>({
    current_academic_year: "",
    current_term: "",
    year_2_required_hours: "",
    year_2_start_date: "",
    year_2_end_date: "",
    year_4_required_hours: "",
    year_4_start_date: "",
    year_4_end_date: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchSettings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await API.get("/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(res.data);
    } catch (err) {
      console.error("Failed to load settings:", err);
      setMessage({ text: "Failed to load system settings", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const handleChange = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setSaving(true);
      setMessage(null);
      await API.post("/settings", settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ text: "Settings updated successfully!", type: "success" });
    } catch (err) {
      console.error("Failed to save settings:", err);
      setMessage({ text: "Failed to save settings", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="shell">
      <AdminSidebar activePath="/admin-options" name={user?.fullName} />
      <div className="main">
        <AdminTopbar
          breadcrumbs={[
            { label: "Admin", path: "/admin-dashboard" },
            { label: "System Options" },
          ]}
          onRefresh={fetchSettings}
          refreshing={loading}
        />

        <div className="page-scroll-area">
          <div className="page-content">
            <div className="page-header">
              <div>
                <div className="page-header-title">System Settings</div>
                <div className="page-header-sub">Configure global OJT parameters and automated registration defaults</div>
              </div>
              <div className="header-actions">
                <button className={`btn-save-settings ${saving ? 'saving' : ''}`} onClick={handleSave} disabled={saving || loading}>
                  <div className="btn-save-inner">
                    <IonIcon icon={saving ? refreshOutline : saveOutline} className={saving ? "spin" : ""} />
                    <span>{saving ? "Saving Changes..." : "Save System Settings"}</span>
                  </div>
                </button>
              </div>
            </div>

            {message && (
              <div className={`form-message ${message.type}`} style={{ marginBottom: '20px' }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSave} className="admin-form-grid">
              <div className="form-card">
                <div className="card-head">
                  <IonIcon icon={settingsOutline} />
                  <span>Active Term Configuration</span>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">Current Academic Year</label>
                    <select
                      className="form-input"
                      value={settings.current_academic_year}
                      onChange={(e) => handleChange("current_academic_year", e.target.value)}
                    >
                      <option value="">Select Year</option>
                      {academicYears.map(ay => (
                        <option key={ay} value={ay}>{ay}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Term</label>
                    <select
                      className="form-input"
                      value={settings.current_term}
                      onChange={(e) => handleChange("current_term", e.target.value)}
                    >
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-card">
                <div className="card-head">
                  <IonIcon icon={schoolOutline} />
                  <span>2nd Year OJT Defaults</span>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">Required Hours</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.year_2_required_hours}
                      onChange={(e) => handleChange("year_2_required_hours", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={settings.year_2_start_date ? settings.year_2_start_date.split('T')[0] : ""}
                      onChange={(e) => handleChange("year_2_start_date", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={settings.year_2_end_date ? settings.year_2_end_date.split('T')[0] : ""}
                      onChange={(e) => handleChange("year_2_end_date", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-card">
                <div className="card-head">
                  <IonIcon icon={schoolOutline} />
                  <span>4th Year OJT Defaults</span>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">Required Hours</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.year_4_required_hours}
                      onChange={(e) => handleChange("year_4_required_hours", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={settings.year_4_start_date ? settings.year_4_start_date.split('T')[0] : ""}
                      onChange={(e) => handleChange("year_4_start_date", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={settings.year_4_end_date ? settings.year_4_end_date.split('T')[0] : ""}
                      onChange={(e) => handleChange("year_4_end_date", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;