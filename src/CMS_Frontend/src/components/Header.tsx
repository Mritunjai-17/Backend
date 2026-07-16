import React, { useState, useEffect } from 'react';
import { User, Bell, Calendar } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
}

export default function Header({ activeTab }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'System Overview';
      case 'blogs':
        return 'Blog Articles Manager';
      case 'portfolios':
        return 'Portfolio Items Manager';
      case 'contacts':
        return 'Client Enquiries Inbox';
      default:
        return 'CMS Portal';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.title}>{getTitle()}</h1>
        <p style={styles.subtitle}>Welcome back to your workspace</p>
      </div>

      <div style={styles.rightContent}>
        {/* Date Time */}
        <div style={styles.dateTime}>
          <Calendar size={15} style={{ color: 'var(--primary)' }} />
          <span>{formatDate(currentTime)}</span>
        </div>

        {/* Notifications Mock */}
        <button style={styles.headerBtn} aria-label="Notifications">
          <Bell size={18} />
          <div style={styles.notificationDot} />
        </button>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Role Badge */}
        <div style={styles.profileBadge}>
          <User size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Administrator</span>
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: 'var(--header-height)',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 90,
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem',
  },
  rightContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  dateTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-secondary)',
    padding: '0.5rem 0.85rem',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
  },
  headerBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: 'var(--border-radius-md)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  },
  notificationDot: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '6px',
    height: '6px',
    backgroundColor: 'var(--danger)',
    borderRadius: '50%',
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: 'var(--border-color)',
  },
  profileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--primary-glow)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
  }
};
