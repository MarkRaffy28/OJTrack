import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IonIcon, IonSpinner } from "@ionic/react";
import {
  calendarOutline, briefcaseOutline, personOutline, timeOutline, checkmarkCircleOutline, arrowForwardOutline, arrowBackOutline,
  logInOutline, logOutOutline, alertCircleOutline
} from "ionicons/icons";
import { useAuth } from "@context/authContext";
import { useUser } from "@context/userContext";
import { useNavigation } from "@hooks/useNavigation";
import { getDateTime12, formatDate } from "@utils/date";
import API from "@api/api";
import AdminSidebar from "@components/AdminSidebar";
import AdminTopbar from "@components/AdminTopbar";
import Avatar from "@components/Avatar";
import "@css/AdminDashboard.css";
import "@css/AdminAttendance.css";
import "@css/AttendanceDetail.css";

interface AttendanceDetail {
  studentId: number;
  userId: string;
  profilePicture: string | null;
  studentName: string;
  officeName: string;
  supervisorName: string;
  attendanceId: number;
  date: string;
  morningIn: string | null;
  morningOut: string | null;
  afternoonIn: string | null;
  afternoonOut: string | null;
  totalHours: string | number;
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

function AttendanceDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { user } = useUser();
  const { navigate } = useNavigation();

  const [record, setRecord] = useState<AttendanceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    if (!token || !id) return;
    try {
      setLoading(true);
      const res = await API.get(`/attendance/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setRecord({
          ...res.data,
          profilePicture: decodeProfilePicture(res.data.profilePicture)
        });
      }
    } catch (error) {
      console.error("Failed to fetch attendance detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, token]);

  if (loading) {
    return (
      <div className="shell">
        <AdminSidebar activePath="/admin-attendance" name={user?.fullName} />
        <div className="main loading-main">
          <IonSpinner name="crescent" />
          <p>Loading record details...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="shell">
        <AdminSidebar activePath="/admin-attendance" name={user?.fullName} />
        <div className="main error-main">
          <IonIcon icon={alertCircleOutline} className="error-icon" />
          <h3>Record Not Found</h3>
          <p>The attendance record you are looking for does not exist or has been removed.</p>
          <button className="btn-primary" onClick={() => navigate("/admin-attendance")}>
            Back to Attendance
          </button>
        </div>
      </div>
    );
  }

  const hoursNum = parseFloat(record.totalHours as string) || 0;
  const hoursPercent = Math.min((hoursNum / 8) * 100, 100);

  return (
    <div className="shell">
      <AdminSidebar activePath="/admin-attendance" name={user?.fullName} />
      <div className="main">
        <AdminTopbar
          breadcrumbs={[
            { label: "Admin", path: "/admin-dashboard" },
            { label: "Attendance", path: "/admin-attendance" },
            { label: "Record Details" },
          ]}
          onRefresh={fetchDetail}
          refreshing={loading}
        />

        <div className="page-scroll-area">
          <div className="page-content admin-attendance-detail">
            {/* ── Header ── */}
            <div className="page-header">
              <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                <button className="btn-back-circle" onClick={() => navigate("/admin-attendance")} title="Go Back">
                  <IonIcon icon={arrowBackOutline} />
                </button>
                <div>
                  <div className="page-header-title">Log Details</div>
                  <div className="page-header-sub">In-depth view of the trainee's time record and pairings</div>
                </div>
              </div>
            </div>

            <div className="detail-grid">
              <div className="profile-card">
                <div className="profile-card-banner" />
                <div className="profile-avatar-wrap">
                  <Avatar 
                    className="profile-avatar-lg" 
                    src={record.profilePicture} 
                    name={record.studentName} 
                  />
                </div>
                <div className="profile-body">
                  <div className="profile-name">{record.studentName}</div>
                  <div className="profile-trainee-id">ID: {record.userId}</div>

                  <div className="profile-divider" />

                  <div className="profile-meta">
                    <div className="meta-row">
                      <div className="meta-icon-wrap">
                        <IonIcon icon={calendarOutline} />
                      </div>
                      <div>
                        <div className="meta-label">Date of Log</div>
                        <div className="meta-val">{formatDate(record.date)}</div>
                      </div>
                    </div>
                    <div className="meta-row">
                      <div className="meta-icon-wrap">
                        <IonIcon icon={briefcaseOutline} />
                      </div>
                      <div>
                        <div className="meta-label">Office Assignment</div>
                        <div className="meta-val">{record.officeName || "Not Assigned"}</div>
                      </div>
                    </div>
                    <div className="meta-row">
                      <div className="meta-icon-wrap">
                        <IonIcon icon={personOutline} />
                      </div>
                      <div>
                        <div className="meta-label">Supervisor</div>
                        <div className="meta-val">{record.supervisorName || "No Supervisor"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="details-col">
                <div className="detail-card">
                  <div className="detail-card-head">
                    <div className="detail-card-head-icon">
                      <IonIcon icon={timeOutline} />
                    </div>
                    <div className="detail-card-head-title">Time Summary</div>
                  </div>
                  <div className="detail-card-body">
                    <div className="time-summary-grid">
                      <div className="time-summary-block">
                        <div className="time-summary-label">Morning</div>
                        <div className="time-summary-val">
                          {record.morningIn || "--:--"} - {record.morningOut || "--:--"}
                        </div>
                      </div>
                      <div className="time-summary-arrow">
                        <IonIcon icon={arrowForwardOutline} />
                      </div>
                      <div className="time-summary-block">
                        <div className="time-summary-label">Afternoon</div>
                        <div className="time-summary-val">
                          {record.afternoonIn || "--:--"} - {record.afternoonOut || "--:--"}
                        </div>
                      </div>
                    </div>

                    <div className="hours-progress-wrap">
                      <div className="hours-progress-label">
                        <span>Total Hours Rendered</span>
                        <span className="hours-val">{record.totalHours} hrs</span>
                      </div>
                      <div className="hours-progress-track">
                        <div className="hours-progress-fill" style={{ width: `${hoursPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-card-head">
                    <div className="detail-card-head-icon">
                      <IonIcon icon={checkmarkCircleOutline} />
                    </div>
                    <div className="detail-card-head-title">Session Timeline</div>
                  </div>
                  <div className="detail-card-body">
                    <div className="simple-timeline">
                      <div className="timeline-item">
                        <div className={`timeline-node ${record.morningIn ? 'node-active' : ''}`}>
                          <IonIcon icon={logInOutline} />
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-label">Morning Time In</div>
                          <div className="timeline-val">{record.morningIn || "No Record"}</div>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className={`timeline-node ${record.morningOut ? 'node-active' : ''}`}>
                          <IonIcon icon={logOutOutline} />
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-label">Morning Time Out</div>
                          <div className="timeline-val">{record.morningOut || "No Record"}</div>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className={`timeline-node ${record.afternoonIn ? 'node-active' : ''}`}>
                          <IonIcon icon={logInOutline} />
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-label">Afternoon Time In</div>
                          <div className="timeline-val">{record.afternoonIn || "No Record"}</div>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className={`timeline-node ${record.afternoonOut ? 'node-active' : ''}`}>
                          <IonIcon icon={logOutOutline} />
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-label">Afternoon Time Out</div>
                          <div className="timeline-val">{record.afternoonOut || "No Record"}</div>
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

export default AttendanceDetail;