import React, { useState } from "react";
import { IonIcon } from "@ionic/react";
import {
  homeOutline, peopleOutline, personAddOutline, gitNetworkOutline, calendarOutline, documentTextOutline, statsChartOutline, logOutOutline,
  shieldCheckmarkOutline, businessOutline, optionsOutline, closeOutline, menuOutline
} from "ionicons/icons";
import { useAuth } from "@context/authContext";
import { useUser } from "@context/userContext";
import { useNavigation } from "@hooks/useNavigation";
import { getMediaUrl } from "@api/api";
import LogoutModal from "@components/LogoutModal";
import Avatar from "@components/Avatar";

interface AdminSidebarProps {
  activePath?: string;
  name?: string;
}

function AdminSidebar({ activePath = "/admin-dashboard", name }: AdminSidebarProps) {
  const { logout } = useAuth();
  const { user } = useUser();
  const { navigate } = useNavigation({ exitOnBack: false });
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = name || user?.fullName || "Admin User";
  
  const avatarSrc = user?.profilePicture 
    ? (user.profilePicture.startsWith("data:image") 
        ? user.profilePicture 
        : getMediaUrl(user.profilePicture))
    : null;

  const mainItems = [
    { path: "/admin-dashboard",        label: "Dashboard",     icon: homeOutline       },
  ];

  const userItems = [
    { path: "/admin-users/student",    label: "Trainees",      icon: peopleOutline     },
    { path: "/admin-users/supervisor", label: "Supervisors",   icon: personAddOutline  },
    { path: "/admin-users/admin",      label: "System Admins", icon: shieldCheckmarkOutline },
  ];

  const ojtItems = [
    { path: "/admin-offices",          label: "Offices",       icon: businessOutline   },
    { path: "/admin-assignment",       label: "Assignment",    icon: gitNetworkOutline },
    { path: "/admin-attendance",       label: "Attendance",    icon: calendarOutline   },
    { path: "/admin-reports",          label: "Reports",       icon: documentTextOutline },
    { path: "/admin-progress",         label: "Progress",      icon: statsChartOutline   },
  ];

  const systemItems = [
    { path: "/admin-options",          label: "System Options", icon: optionsOutline    },
  ];

  const handleLogoutTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const handleLogoutComplete = () => {
    setIsLoggingOut(false);
    navigate("/login", "root");
  };

  const closeMobileSidebar = () => {
    document.querySelector('.shell')?.classList.remove('sidebar-open');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    closeMobileSidebar();
  };

  return (
    <>
    <div className="sidebar-overlay" onClick={closeMobileSidebar} />
    <aside className="sidebar">
      <button className="sidebar-close-btn" onClick={closeMobileSidebar}>
        <IonIcon icon={closeOutline} />
      </button>
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <img src="/assets/icon/icon.png" alt="OJTrack Logo" className="sidebar-logo-image" />
          <div>
            <div className="sidebar-logo-text">OJTrack</div>
            <div className="sidebar-logo-sub">Admin Panel</div>
          </div>
        </div>
      </div>

      <div className="sidebar-profile">
        <Avatar 
          src={avatarSrc} 
          name={displayName} 
          className="sidebar-avatar"
          clickable={false}
        />
        <div className="sidebar-profile-info">
          <div className="sidebar-profile-name">{displayName}</div>
          <div className="sidebar-profile-role">Administrator</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        <ul>
          {mainItems.map((item) => (
            <li key={item.path}>
              <button onClick={() => handleNavClick(item.path)} className={`nav-item-btn ${activePath === item.path ? "active" : ""}`}>
                <IonIcon className="nav-icon" icon={item.icon} />
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-section-label" style={{ marginTop: "16px" }}>User Management</div>
        <ul>
          {userItems.map((item) => (
            <li key={item.path}>
              <button onClick={() => handleNavClick(item.path)} className={`nav-item-btn ${activePath === item.path ? "active" : ""}`}>
                <IonIcon className="nav-icon" icon={item.icon} />
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-section-label" style={{ marginTop: "16px" }}>OJT Management</div>
        <ul>
          {ojtItems.map((item) => (
            <li key={item.path}>
              <button onClick={() => handleNavClick(item.path)} className={`nav-item-btn ${activePath === item.path ? "active" : ""}`}>
                <IonIcon className="nav-icon" icon={item.icon} />
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-section-label" style={{ marginTop: "16px" }}>System</div>
        <ul>
          {systemItems.map((item) => (
            <li key={item.path}>
              <button onClick={() => handleNavClick(item.path)} className={`nav-item-btn ${activePath === item.path ? "active" : ""}`}>
                <IonIcon className="nav-icon" icon={item.icon} />
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" id="logout-trigger" onClick={handleLogoutTrigger}>
          <IonIcon className="nav-icon" icon={logOutOutline} />
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <LogoutModal
      isOpen={showModal}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      isLoading={isLoggingOut}
      onComplete={handleLogoutComplete}
    />
    </>
  );
};

export default AdminSidebar;
