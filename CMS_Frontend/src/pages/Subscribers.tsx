import React, { useState, useEffect } from 'react';
import { apiService, type Subscriber } from '../services/api';
import {
  Users,
  Search,
  Loader2,
  Trash2,
  Mail,
  Briefcase,
  Calendar,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check
} from 'lucide-react';

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Modal State
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getSubscribers(page, 10, searchQuery, statusFilter);
      setSubscribers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subscribers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubscribers();
  };

  const handleToggleRead = async (sub: Subscriber) => {
    try {
      await apiService.updateSubscriberStatus(sub._id, { isRead: !sub.isRead });
      setSubscribers(prev =>
        prev.map(item => (item._id === sub._id ? { ...item, isRead: !sub.isRead } : item))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update subscriber state');
    }
  };

  const handleStatusChange = async (sub: Subscriber, newStatus: string) => {
    try {
      await apiService.updateSubscriberStatus(sub._id, { status: newStatus });
      setSubscribers(prev =>
        prev.map(item => (item._id === sub._id ? { ...item, status: newStatus as any } : item))
      );
      setSuccess(`Status updated to ${newStatus}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!subscriberToDelete) return;
    try {
      await apiService.deleteSubscriber(subscriberToDelete._id);
      setSuccess('Subscriber deleted successfully.');
      setIsDeleteOpen(false);
      setSubscriberToDelete(null);
      fetchSubscribers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete subscriber.');
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleExportCSV = () => {
    if (!subscribers.length) return;
    const headers = ['Name', 'Email', 'Domain', 'Status', 'Date'];
    const rows = subscribers.map(s => [
      `"${s.fullName}"`,
      `"${s.email}"`,
      `"${s.domain}"`,
      `"${s.status}"`,
      `"${new Date(s.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `midis_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const unreadCount = subscribers.filter(s => !s.isRead).length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badge}>
            <Users size={14} /> Website Leads & Subscriptions
          </div>
          <h1 style={styles.title}>Subscribers Directory</h1>
          <p style={styles.subtitle}>
            Manage users who subscribed for services via the Midis footer bar.
          </p>
        </div>

        <button onClick={handleExportCSV} style={styles.exportBtn} disabled={!subscribers.length}>
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div style={styles.errorBanner}>
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={() => setError('')} style={styles.closeBannerBtn}>
            <X size={14} />
          </button>
        </div>
      )}

      {success && (
        <div style={styles.successBanner}>
          <CheckCircle size={18} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} style={styles.closeBannerBtn}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stats row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total Subscribers</span>
          <span style={styles.statValue}>{total}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Unread Subscriptions</span>
          <span style={{ ...styles.statValue, color: unreadCount > 0 ? '#ea580c' : '#10b981' }}>
            {unreadCount}
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div style={styles.controlsBar}>
        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email, or domain..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </form>

        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Status:</span>
          {['All', 'Active', 'Contacted', 'Unsubscribed'].map(st => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              style={{
                ...styles.filterTab,
                ...(statusFilter === st ? styles.filterTabActive : {})
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#ea580c' }} />
            <span style={{ marginTop: '0.75rem', color: '#64748b' }}>Loading subscribers...</span>
          </div>
        ) : subscribers.length === 0 ? (
          <div style={styles.emptyContainer}>
            <Users size={48} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
            <h3 style={{ color: '#334155', margin: '0 0 0.5rem 0' }}>No Subscribers Found</h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
              No subscribers match your search or filter options.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Subscriber Name</th>
                  <th style={styles.th}>Email Address</th>
                  <th style={styles.th}>Service Domain</th>
                  <th style={styles.th}>Date Subscribed</th>
                  <th style={styles.th}>State</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map(sub => (
                  <tr
                    key={sub._id}
                    style={{
                      ...styles.tr,
                      backgroundColor: sub.isRead ? 'transparent' : 'rgba(234, 88, 12, 0.03)'
                    }}
                  >
                    <td style={styles.td}>
                      <button
                        onClick={() => handleToggleRead(sub)}
                        title={sub.isRead ? 'Mark as Unread' : 'Mark as Read'}
                        style={sub.isRead ? styles.readDot : styles.unreadDot}
                      />
                    </td>
                    <td style={{ ...styles.td, fontWeight: sub.isRead ? 500 : 700 }}>
                      {sub.fullName}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={14} style={{ color: '#94a3b8' }} />
                        <a href={`mailto:${sub.email}`} style={styles.emailLink}>
                          {sub.email}
                        </a>
                        <button
                          onClick={() => handleCopyEmail(sub.email)}
                          style={styles.iconBtn}
                          title="Copy Email"
                        >
                          {copiedEmail === sub.email ? (
                            <Check size={14} style={{ color: '#10b981' }} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.domainBadge}>
                        <Briefcase size={12} />
                        {sub.domain}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: '#64748b', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} />
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <select
                        value={sub.status}
                        onChange={e => handleStatusChange(sub, e.target.value)}
                        style={styles.statusSelect}
                      >
                        <option value="Active">Active</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Unsubscribed">Unsubscribed</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => {
                          setSubscriberToDelete(sub);
                          setIsDeleteOpen(true);
                        }}
                        style={styles.deleteBtn}
                        title="Delete Subscriber"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.paginationRow}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Page {page} of {totalPages} ({total} total subscribers)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                style={styles.pageBtn}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                style={styles.pageBtn}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && subscriberToDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertTriangle size={24} style={{ color: '#ef4444' }} />
              <h3 style={{ margin: 0, color: '#0f172a' }}>Delete Subscriber</h3>
            </div>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>{subscriberToDelete.fullName}</strong> ({subscriberToDelete.email})?
            </p>
            <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setIsDeleteOpen(false)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} style={styles.confirmDeleteBtn}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    width: '100%',
    paddingBottom: '3rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.3rem 0.75rem',
    borderRadius: '9999px',
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
    color: '#ea580c',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '0.5rem'
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.025em'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
    margin: '0.35rem 0 0 0'
  },
  exportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.25rem',
    borderRadius: '0.75rem',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1.25rem',
    borderRadius: '0.75rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    fontSize: '0.9rem'
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1.25rem',
    borderRadius: '0.75rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
    fontSize: '0.9rem'
  },
  closeBannerBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    marginLeft: 'auto',
    color: 'inherit'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem'
  },
  statCard: {
    padding: '1.25rem',
    borderRadius: '1rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  statLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#0f172a'
  },
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  searchForm: {
    position: 'relative',
    flex: '1 1 300px'
  },
  searchIcon: {
    position: 'absolute',
    left: '0.875rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8'
  },
  searchInput: {
    width: '100%',
    padding: '0.65rem 1rem 0.65rem 2.6rem',
    borderRadius: '0.75rem',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },
  filterLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#64748b',
    marginRight: '0.35rem'
  },
  filterTab: {
    padding: '0.45rem 0.85rem',
    borderRadius: '9999px',
    border: '1px solid transparent',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  filterTabActive: {
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
    color: '#ea580c',
    borderColor: 'rgba(234, 88, 12, 0.3)'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
  },
  loadingContainer: {
    padding: '4rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyContainer: {
    padding: '4rem 2rem',
    textAlign: 'center'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    padding: '0.85rem 1rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease'
  },
  td: {
    padding: '1rem',
    fontSize: '0.875rem',
    color: '#1e293b'
  },
  readDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#cbd5e1',
    border: 'none',
    cursor: 'pointer'
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ea580c',
    border: 'none',
    boxShadow: '0 0 6px #ea580c',
    cursor: 'pointer'
  },
  emailLink: {
    color: '#0284c7',
    textDecoration: 'none',
    fontWeight: 500
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.2rem',
    display: 'inline-flex'
  },
  domainBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.3rem 0.65rem',
    borderRadius: '0.5rem',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    fontSize: '0.8rem',
    fontWeight: 600
  },
  statusSelect: {
    padding: '0.35rem 0.65rem',
    borderRadius: '0.5rem',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#334155',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '0.45rem',
    borderRadius: '0.5rem',
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0'
  },
  pageBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.4rem 0.85rem',
    borderRadius: '0.5rem',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#334155',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    padding: '1.75rem',
    maxWidth: '450px',
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  cancelBtn: {
    padding: '0.6rem 1.25rem',
    borderRadius: '0.5rem',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer'
  },
  confirmDeleteBtn: {
    padding: '0.6rem 1.25rem',
    borderRadius: '0.5rem',
    border: 'none',
    backgroundColor: '#ef4444',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#ffffff',
    cursor: 'pointer'
  }
};
