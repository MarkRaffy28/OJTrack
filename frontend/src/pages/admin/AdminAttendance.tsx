import React, { useState, useEffect, useMemo } from "react";
import { IonIcon } from "@ionic/react";
import { downloadOutline, searchOutline, eyeOutline, documentTextOutline, timeOutline, peopleOutline } from "ionicons/icons";
import { useAuth } from "@context/authContext";
import { useUser } from "@context/userContext";
import { useAdminOjt } from "@context/adminOjtContext";
import { useNavigation } from "@hooks/useNavigation";
import { formatDate } from "@utils/date";
import API from "@api/api";
import AdminSidebar from "@components/AdminSidebar";
import AdminTopbar from "@components/AdminTopbar";
import Avatar from "@components/Avatar";
import exportCsv from "@components/ExportCsv";
import printDocument from "@components/PrintDocument";

import "@css/AdminDashboard.css";
import "@css/Users.css";
import "@css/AdminAttendance.css";

interface AttendanceRecord {
  studentId: number;
  userId: string;
  profilePicture: string | null;
  studentName: string;
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

const AdminAttendance: React.FC = () => {
  const { navigate } = useNavigation({ exitOnBack: false });
  const { user } = useUser();
  const { token } = useAuth();
  const { cohorts, allTrainees, filters, setFilters } = useAdminOjt();

  const traineeCohortMap = useMemo(() => {
    const map = new Map<number, string>();
    allTrainees.forEach(t => {
      if (t.academicYear && t.term) {
        map.set(t.databaseId, `${t.academicYear}|${t.term}`);
      }
    });
    return map;
  }, [allTrainees]);
  
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchAttendance = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await API.get(`/attendance/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const decoded = (response.data || []).map((r: any) => ({
        ...r,
        profilePicture: decodeProfilePicture(r.profilePicture),
      }));
      setRecords(decoded);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [token]);

  const filteredRecords = useMemo(() => {
    return records
      .filter(r => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          r.studentName.toLowerCase().includes(q) ||
          r.userId.toLowerCase().includes(q);
        
        const recordDate = new Date(r.date).toISOString().split('T')[0];
        const matchesStartDate = !startDate || recordDate >= startDate;
        const matchesEndDate = !endDate || recordDate <= endDate;

        // Cohort filter: cross-reference studentId with trainee cohort map
        const matchesCohort =
          filters.cohort === "all" ||
          traineeCohortMap.get(r.studentId) === filters.cohort;

        return matchesSearch && matchesStartDate && matchesEndDate && matchesCohort;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [records, searchQuery, startDate, endDate, sortOrder, filters.cohort, traineeCohortMap]);

  const stats = useMemo(() => {
    const totalHrs = filteredRecords.reduce((acc, curr) => acc + parseFloat(curr.totalHours as string || "0"), 0);
    const uniqueStus = new Set(filteredRecords.map(r => r.studentId)).size;
    return {
      totalRecords: filteredRecords.length,
      totalHours: totalHrs,
      uniqueTrainees: uniqueStus
    };
  }, [filteredRecords]);

  const handleExport = async () => {
    await exportCsv({
      filename: `attendance_export_${new Date().toISOString().split("T")[0]}.csv`,
      columns: [
        { key: "userId", label: "User ID" },
        { key: "name", label: "Name" },
        { key: "date", label: "Date" },
        { key: "morningIn", label: "Morning In" },
        { key: "morningOut", label: "Morning Out" },
        { key: "afternoonIn", label: "Afternoon In" },
        { key: "afternoonOut", label: "Afternoon Out" },
        { key: "totalHours", label: "Total Hours" },
      ],
      rows: filteredRecords.map((r) => ({
        userId: r.userId,
        name: r.studentName,
        date: formatDate(r.date),
        morningIn: r.morningIn || "—",
        morningOut: r.morningOut || "—",
        afternoonIn: r.afternoonIn || "—",
        afternoonOut: r.afternoonOut || "—",
        totalHours: r.totalHours || "0",
      })),
    });
  };

  const handlePrint = async () => {
    await printDocument({
      title: "Attendance Logs",
      subtitle: "Comprehensive trainee attendance records",
      generatedBy: user?.fullName || "Admin",
      summary: [
        { label: "Total Records", value: stats.totalRecords },
        { label: "Total Hours", value: `${stats.totalHours.toFixed(1)}h` },
        { label: "Unique Trainees", value: stats.uniqueTrainees },
      ],
      columns: [
        { key: "name", label: "Trainee" },
        { key: "date", label: "Date" },
        { key: "timeLogs", label: "AM / PM Logs" },
        { key: "hours", label: "Total Hours" },
      ],
      rows: filteredRecords.map(r => ({
        name: r.studentName,
        date: formatDate(r.date),
        timeLogs: `AM: ${r.morningIn || '—'} - ${r.morningOut || '—'} | PM: ${r.afternoonIn || '—'} - ${r.afternoonOut || '—'}`,
        hours: `${r.totalHours}h`,
      })),
    });
  };

  return (
    <div className="shell">
      <AdminSidebar activePath="/admin-attendance" name={user?.fullName} />
      <div className="main">
        <AdminTopbar
          breadcrumbs={[
            { label: "Admin", path: "/admin-dashboard" },
            { label: "Attendance" },
          ]}
          cohortKeys={cohorts.map(c => `${c.academicYear}|${c.term}`)}
          cohortLabels={cohorts.map(c => `A.Y. ${c.academicYear} – ${c.term}`)}
          selectedCohort={filters.cohort}
          onCohortChange={(val) => setFilters(prev => ({ ...prev, cohort: val }))}
          onRefresh={fetchAttendance}
          refreshing={loading}
          onPrint={handlePrint}
        />

        <div className="page-scroll-area">
          <div className="page-content admin-attendance-page">
            {/* ── Page Header ── */}
            <div className="page-header">
              <div>
                <div className="page-header-title">Attendance Logs</div>
                <div className="page-header-sub">Track and manage trainee attendance records across the organization</div>
              </div>
              <div className="header-actions">
                <button className="btn-ghost" onClick={handleExport} disabled={records.length === 0}>
                  <IonIcon icon={downloadOutline} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* ── Stats Grid ── */}
              <div className="stats-grid">
                <div className="stat-card stat-card-blue">
                  <div className="stat-icon-wrap ic-total"><IonIcon icon={documentTextOutline} /></div>
                  <div className="stat-content">
                    <div className="stat-label">Total Records</div>
                    <div className="stat-val">{stats.totalRecords}</div>
                  </div>
                </div>
                <div className="stat-card stat-card-green">
                  <div className="stat-icon-wrap ic-active"><IonIcon icon={timeOutline} /></div>
                  <div className="stat-content">
                    <div className="stat-label">Total Hours</div>
                    <div className="stat-val">{stats.totalHours.toFixed(1)}h</div>
                  </div>
                </div>
                <div className="stat-card stat-card-orange">
                  <div className="stat-icon-wrap ic-assigned"><IonIcon icon={peopleOutline} /></div>
                  <div className="stat-content">
                    <div className="stat-label">Unique Trainees</div>
                    <div className="stat-val">{stats.uniqueTrainees}</div>
                  </div>
                </div>
              </div>

            <div className="filters-bar">
              <div className="search-wrap">
                <IonIcon icon={searchOutline} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by trainee name or ID…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <span className="filter-label">From</span>
                <input
                  className="date-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <span className="filter-label">To</span>
                <input
                  className="date-input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <span className="filter-label">Sort</span>
                <select 
                  className="filter-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            <div className="trainees-section">
              <div className="section-head">
                <div className="section-head-title">
                  Attendance Records
                  <span className="count-badge">{filteredRecords.length} results</span>
                </div>
              </div>

              <div className="list-col-header">
                <div className="col-label">Trainee</div>
                <div className="col-label">Date</div>
                <div className="col-label">Time Logs (AM / PM)</div>
                <div className="col-label">Total Hours</div>
                <div className="col-label">Actions</div>
              </div>

              <div className="attendance-list">
                {loading ? (
                  <div className="loading-state">Loading attendance records...</div>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((record, idx) => (
                    <div className="attendance-row" key={record.attendanceId} onClick={() => navigate(`/admin-attendance-detail/${record.attendanceId}`)}>
                      <div className="trainee-identity">
                        <Avatar
                          className="trainee-avatar"
                          src={record.profilePicture}
                          name={record.studentName}
                        />
                        <div className="trainee-info">
                          <div className="trainee-name">{record.studentName}</div>
                          <div className="trainee-id">ID: {record.userId}</div>
                        </div>
                      </div>

                      <div className="date-text">
                        {formatDate(record.date)}
                      </div>

                      <div className="time-slots">
                        <div className="time-slot">
                          <span>AM</span> <b>{record.morningIn || "—"}</b> <span style={{width:'auto', margin:'0 4px'}}>→</span> <b>{record.morningOut || "—"}</b>
                        </div>
                        <div className="time-slot">
                          <span>PM</span> <b>{record.afternoonIn || "—"}</b> <span style={{width:'auto', margin:'0 4px'}}>→</span> <b>{record.afternoonOut || "—"}</b>
                        </div>
                      </div>

                      <div className="hours-text">
                        {record.totalHours} hrs
                      </div>

                      <div className="row-actions">
                        <button
                          className="action-btn action-view"
                          title="View Details"
                          onClick={() => navigate(`/admin-attendance-detail/${record.attendanceId}`)}
                        >
                          <IonIcon icon={eyeOutline} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📂</div>
                    <p>No attendance records found for the selected criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;