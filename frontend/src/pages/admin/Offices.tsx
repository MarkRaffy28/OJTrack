import React, { useEffect, useState, MouseEvent, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { addOutline, eyeOutline, createOutline, trashOutline, businessOutline, searchOutline, downloadOutline, mailOutline, callOutline } from "ionicons/icons";
import { useAuth } from "@context/authContext";
import { useUser } from "@context/userContext";
import { useNavigation } from "@hooks/useNavigation";
import API from "@api/api";
import AdminSidebar from "@components/AdminSidebar";
import AdminTopbar from "@components/AdminTopbar";
import exportCsv from "@components/ExportCsv";
import printDocument from "@components/PrintDocument";
import "@css/AdminDashboard.css";
import "@css/Offices.css";

interface Office {
  id: number;
  name: string;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
}

function Offices() {
  const location = useLocation();
  const { user } = useUser();
  const { token } = useAuth();
  const { navigate } = useNavigation();

  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [hasEmailFilter, setHasEmailFilter] = useState("all");
  const [hasPhoneFilter, setHasPhoneFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"nameAsc" | "nameDesc" | "newestFirst" | "oldestFirst">("nameAsc");

  const fetchOffices = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.get("/offices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffices(res.data || []);
    } catch (err) {
      console.error("Failed to load offices:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOffices();
  }, [fetchOffices, location.key]);

  const filteredOffices = offices
    .filter((o) => {
      const q = searchInput.trim().toLowerCase();
      const matchesSearch =
        !q ||
        o.name.toLowerCase().includes(q) ||
        (o.address && o.address.toLowerCase().includes(q)) ||
        (o.contact_email && o.contact_email.toLowerCase().includes(q)) ||
        (o.contact_phone && o.contact_phone.toLowerCase().includes(q));

      const matchesEmail = hasEmailFilter === "all" || (hasEmailFilter === "yes" ? !!o.contact_email : !o.contact_email);
      const matchesPhone = hasPhoneFilter === "all" || (hasPhoneFilter === "yes" ? !!o.contact_phone : !o.contact_phone);

      return matchesSearch && matchesEmail && matchesPhone;
    })
    .sort((a, b) => {
      if (sortOrder === "nameDesc") return b.name.localeCompare(a.name);
      if (sortOrder === "newestFirst") return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortOrder === "oldestFirst") return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      return a.name.localeCompare(b.name);
    });

  const stats = {
    total: offices.length,
    withEmail: offices.filter(o => o.contact_email).length,
    withPhone: offices.filter(o => o.contact_phone).length,
  };

  const handleExportCsv = async () => {
    await exportCsv({
      filename: `offices_export_${new Date().toISOString().split("T")[0]}.csv`,
      columns: [
        { key: "name", label: "Office Name" },
        { key: "address", label: "Address" },
        { key: "contact_email", label: "Contact Email" },
        { key: "contact_phone", label: "Contact Phone" },
      ],
      rows: filteredOffices.map((o) => ({
        name: o.name,
        address: o.address || "N/A",
        contact_email: o.contact_email || "N/A",
        contact_phone: o.contact_phone || "N/A",
      })),
    });
  };

  const handlePrint = async () => {
    await printDocument({
      title: "Partner Offices Directory",
      subtitle: "Admin partner offices listing with active filters",
      generatedBy: user?.fullName || "Admin",
      summary: [
        { label: "Total Offices", value: stats.total },
        { label: "With Email", value: stats.withEmail },
        { label: "With Phone", value: stats.withPhone },
      ],
      columns: [
        { key: "name", label: "Office Name" },
        { key: "address", label: "Address" },
        { key: "contact_email", label: "Contact Email" },
        { key: "contact_phone", label: "Contact Phone" },
      ],
      rows: filteredOffices.map(o => ({
        name: o.name,
        address: o.address || "N/A",
        contact_email: o.contact_email || "N/A",
        contact_phone: o.contact_phone || "N/A",
      })),
    });
  };

  const goToDetail = (e: MouseEvent, officeId: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin-office-detail/${officeId}/view`);
  };
  const goToEdit = (e: MouseEvent, officeId: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin-office-detail/${officeId}/edit`);
  };
  const goToDelete = (e: MouseEvent, officeId: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin-office-detail/${officeId}/delete`);
  };

  return (
    <div className="shell">
      <AdminSidebar activePath="/admin-offices" name={user?.fullName} />
      <div className="main">
        <AdminTopbar
          breadcrumbs={[
            { label: "Admin", path: "/admin-dashboard" },
            { label: "Offices" },
          ]}
          onRefresh={fetchOffices}
          refreshing={loading}
          onPrint={handlePrint}
        />

        <div className="page-scroll-area">
          <div className="page-content admin-trainees-page">
            {/* ── Page Header ── */}
            <div className="page-header">
              <div>
                <div className="page-header-title">Office Management</div>
                <div className="page-header-sub">View, filter, and manage all partner offices and their contact info.</div>
              </div>
              <div className="header-actions">
                <button className="btn-ghost" onClick={handleExportCsv}>
                  <IonIcon icon={downloadOutline} />
                  Export
                </button>
                <button className="btn-primary" onClick={() => navigate("/admin-add-office")}>
                  <IonIcon icon={addOutline} />
                  Add New
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrap ic-total"><IonIcon icon={businessOutline} /></div>
                <div>
                  <div className="stat-label">Total Offices</div>
                  <div className="stat-val">{stats.total}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap ic-active"><IonIcon icon={mailOutline} /></div>
                <div>
                  <div className="stat-label">With Email</div>
                  <div className="stat-val">{stats.withEmail}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap ic-assigned"><IonIcon icon={callOutline} /></div>
                <div>
                  <div className="stat-label">With Phone</div>
                  <div className="stat-val">{stats.withPhone}</div>
                </div>
              </div>
            </div>

            <div className="filters-bar">
              <div className="search-wrap">
                <IonIcon icon={searchOutline} />
                <input
                  type="text"
                  className="search-input"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, address, or contact..."
                />
              </div>
              <div className="filter-group">
                <span className="filter-label">Email</span>
                <select className="filter-select" value={hasEmailFilter} onChange={(e) => setHasEmailFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="yes">With Email</option>
                  <option value="no">Without Email</option>
                </select>
              </div>
              <div className="filter-group">
                <span className="filter-label">Phone</span>
                <select className="filter-select" value={hasPhoneFilter} onChange={(e) => setHasPhoneFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="yes">With Phone</option>
                  <option value="no">Without Phone</option>
                </select>
              </div>
              <div className="filter-group">
                <span className="filter-label">Sort</span>
                <select className="filter-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
                  <option value="nameAsc">Name A-Z</option>
                  <option value="nameDesc">Name Z-A</option>
                  <option value="newestFirst">Newest First</option>
                  <option value="oldestFirst">Oldest First</option>
                </select>
              </div>
            </div>

            <div className="trainees-section">
              <div className="section-head">
                <div className="section-head-title">
                  Partner Offices Directory{" "}
                  <span className="count-badge">
                    {filteredOffices.length} entries
                  </span>
                </div>
              </div>

              <div className="list-col-header office-grid-header">
                <div className="col-label">Office Name</div>
                <div className="col-label">Address</div>
                <div className="col-label">Email</div>
                <div className="col-label">Phone</div>
                <div className="col-label">Actions</div>
              </div>

              <div className="trainee-list">
                {loading ? (
                  <div className="empty-state">
                    <div className="spinner"></div>
                    <div>Loading offices...</div>
                  </div>
                ) : filteredOffices.length === 0 ? (
                  <div className="empty-state">
                    <IonIcon icon={businessOutline} style={{ fontSize: "48px", opacity: 0.2 }} />
                    <div style={{ marginTop: "12px", color: "var(--ink-2)" }}>No offices found.</div>
                  </div>
                ) : (
                  <>
                    {filteredOffices.map((off) => (
                      <div
                        className="trainee-row trainee-row-clickable office-row"
                        key={off.id}
                        onClick={(e) => goToDetail(e, off.id)}
                      >
                        <div className="trainee-identity">
                          <div className="trainee-info">
                            <div className="trainee-name">{off.name}</div>
                          </div>
                        </div>
                        <div className="trainee-office">
                          <span className="office-name" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                            {off.address || 'N/A'}
                          </span>
                        </div>
                        <div className="trainee-office">
                          <span className="office-name" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--ink-2)' }}>
                            <IonIcon icon={mailOutline} style={{ fontSize: '1rem' }} />
                            {off.contact_email || 'N/A'}
                          </span>
                        </div>
                        <div className="trainee-office">
                          <span className="office-name" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--ink-2)' }}>
                            <IonIcon icon={callOutline} style={{ fontSize: '1rem' }} />
                            {off.contact_phone || 'N/A'}
                          </span>
                        </div>
                        <div className="trainee-actions">
                          <button className="action-btn action-view" title="View" onClick={(e) => goToDetail(e, off.id)}>
                            <IonIcon icon={eyeOutline} />
                          </button>
                          <button className="action-btn action-edit" title="Edit" onClick={(e) => goToEdit(e, off.id)}>
                            <IonIcon icon={createOutline} />
                          </button>
                          <button className="action-btn action-delete" title="Delete" onClick={(e) => goToDelete(e, off.id)}>
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offices;
