import { LogOut } from 'lucide-react';

interface DashboardNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function DashboardNavbar({ activeTab, setActiveTab, onLogout }: DashboardNavbarProps) {
  const navItems = [
    { id: 'blogs', label: 'Blogs' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <nav style={styles.navContainer}>
      <div style={styles.navPill}>
        {navItems.map((item) => {
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
              {item.label}
              {isActive && <span style={styles.activeDot} />}
            </button>
          );
        })}

        {/* Divider line before logout */}
        <div style={styles.divider} />

        {/* Logout button */}
        <button
          onClick={onLogout}
          style={styles.logoutBtn}
          title="Sign out of Admin CMS"
        >
          <LogOut size={16} />
          <span style={{ fontSize: '0.85rem' }}>Logout</span>
        </button>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  navContainer: {
    position: 'fixed',
    top: '1.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    width: 'auto',
    pointerEvents: 'none',
  },
  navPill: {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '9999px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(15, 23, 42, 0.08)',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
  },
  navItem: {
    position: 'relative',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#475569',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '0.6rem 1.25rem',
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    outline: 'none',
  },
  navItemActive: {
    color: '#ea580c',
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
    border: '1px solid rgba(234, 88, 12, 0.2)',
  },
  activeDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#ea580c',
    boxShadow: '0 0 8px #ea580c',
  },
  divider: {
    width: '1px',
    height: '20px',
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
    margin: '0 0.5rem',
  },
  logoutBtn: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 600,
    color: '#ef4444',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '0.6rem 1rem',
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    outline: 'none',
  }
};
