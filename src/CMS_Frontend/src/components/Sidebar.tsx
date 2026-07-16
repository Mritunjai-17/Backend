import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Mail, 
  LogOut, 
  Server,
  ServerOff
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { name: string; email: string; role: string } | null;
  onLogout: () => void;
  isBackendConnected: boolean;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout,
  isBackendConnected 
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'blogs', label: 'Blogs', icon: FileText },
    { id: 'portfolios', label: 'Portfolios', icon: Briefcase },
    { id: 'contacts', label: 'Contact Messages', icon: Mail },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brandContainer}>
        <div style={styles.logoBadge}>M</div>
        <div style={styles.brandInfo}>
          <h2 style={styles.brandName}>Midis CMS</h2>
          <span style={styles.brandSub}>Admin Portal</span>
        </div>
      </div>

      {/* Connection Indicator */}
      <div style={{
        ...styles.connectionBadge,
        backgroundColor: isBackendConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        borderColor: isBackendConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
        color: isBackendConnected ? '#6ee7b7' : '#fde047'
      }}>
        {isBackendConnected ? <Server size={14} /> : <ServerOff size={14} />}
        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
          {isBackendConnected ? 'API Connected' : 'Local Storage'}
        </span>
      </div>

      {/* Nav Menu */}
      <nav style={styles.navMenu}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
            >
              <Icon size={18} style={isActive ? { color: 'var(--primary)' } : {}} />
              <span>{item.label}</span>
              {isActive && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div style={styles.footerProfile}>
        {user && (
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userMeta}>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userRole}>
                <span className="badge badge-primary" style={{ padding: '1px 8px', fontSize: '0.65rem' }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}
        <button className="btn btn-secondary" onClick={onLogout} style={styles.logoutBtn}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    zIndex: 100,
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  logoBadge: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1.25rem',
    boxShadow: '0 0 15px var(--primary-glow)',
  },
  brandInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandName: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  brandSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  connectionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid',
    marginBottom: '2rem',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    color: 'var(--text-secondary)',
    background: 'none',
    border: 'none',
    borderRadius: 'var(--border-radius-md)',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.9rem',
    fontWeight: 600,
    transition: 'all var(--transition-fast)',
    position: 'relative',
  },
  navItemActive: {
    color: 'var(--text-primary)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  activeIndicator: {
    position: 'absolute',
    left: '0',
    top: '25%',
    bottom: '25%',
    width: '3px',
    backgroundColor: 'var(--primary)',
    borderRadius: '0 4px 4px 0',
  },
  footerProfile: {
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-tertiary)',
    border: '2px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: 'var(--primary)',
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  userRole: {
    display: 'flex',
  },
  logoutBtn: {
    width: '100%',
    gap: '0.5rem',
    justifyContent: 'center',
  }
};
