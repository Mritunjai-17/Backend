import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  Search, 
  Loader2, 
  Check, 
  X as XIcon, 
  Eye, 
  Trash2, 
  Shield, 
  Users,
  Calendar,
  Mail,
  User,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface AdminManagementProps {
  currentUser: any;
}

export default function AdminManagement({ currentUser }: AdminManagementProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals / Dialog states
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getAdmins(searchQuery, statusFilter);
      if (res.success) {
        setUsers(res.data);
      } else {
        setError(res.error || 'Failed to fetch administrators.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch administrators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdmins();
  };

  const handleApprove = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await apiService.approveAdmin(id);
      if (res.success) {
        setSuccess(res.message || 'Administrator approved successfully.');
        fetchAdmins();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(res.error || 'Failed to approve administrator.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve administrator.');
    }
  };

  const handleReject = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await apiService.rejectAdmin(id);
      if (res.success) {
        setSuccess(res.message || 'Administrator rejected successfully.');
        fetchAdmins();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(res.error || 'Failed to reject administrator.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reject administrator.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setError('');
    setSuccess('');
    try {
      const res = await apiService.deleteAdmin(userToDelete._id);
      if (res.success) {
        setSuccess('Administrator registration deleted successfully.');
        setIsDeleteOpen(false);
        setUserToDelete(null);
        fetchAdmins();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(res.error || 'Failed to delete administrator.');
        setIsDeleteOpen(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete administrator.');
      setIsDeleteOpen(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Approved': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header bar */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Management</h1>
          <p style={styles.subtitle}>Review, approve, reject, or delete administrator CMS accounts</p>
        </div>
      </div>

      {success && (
        <div className="alert-banner alert-banner-success" style={styles.alert}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner alert-banner-error" style={styles.alert}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters Controls */}
      <div className="glass-card" style={styles.controlsCard}>
        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              className="form-input"
              placeholder="Search admin by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={styles.searchBtn}>
            Search
          </button>
        </form>

        {/* Filter buttons */}
        <div style={styles.filterContainer}>
          {['All', 'Pending', 'Approved', 'Rejected'].map((filter) => {
            const isActive = statusFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => {
                  setStatusFilter(filter);
                }}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={styles.filterBtn}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div style={styles.skeletonContainer}>
          <Loader2 size={36} className="spinner-loader" style={styles.spinner} />
          <span style={{ color: 'var(--text-secondary)' }}>Fetching administrators...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="glass-card" style={styles.emptyCard}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No administrators found.</h3>
          <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
            Try adjusting your search query or status filters.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Approval Status</th>
                <th>Created Date</th>
                <th style={{ width: '220px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((admin) => (
                <tr key={admin._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{admin.name}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{admin.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(admin.status)}`}>
                      {admin.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {admin.isApproved ? (
                        <>
                          <div style={styles.approvedDot} />
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Approved</span>
                        </>
                      ) : (
                        <>
                          <div style={styles.pendingDot} />
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Not Approved</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatDateTime(admin.createdAt)}
                    </div>
                  </td>
                  <td>
                    <div style={styles.tableActions}>
                      {admin.status === 'Pending' && (
                        <>
                          <button
                            className="btn btn-secondary btn-xs"
                            onClick={() => handleApprove(admin._id)}
                            title="Approve Administrator"
                            style={{ color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="btn btn-secondary btn-xs"
                            onClick={() => handleReject(admin._id)}
                            title="Reject Administrator"
                            style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                          >
                            <XIcon size={14} /> Reject
                          </button>
                        </>
                      )}
                      
                      <button
                        className="btn-icon"
                        onClick={() => {
                          setSelectedUser(admin);
                          setIsDetailsOpen(true);
                        }}
                        title="View Details"
                        style={{ color: 'var(--primary)' }}
                      >
                        <Eye size={16} />
                      </button>

                      {admin._id !== (currentUser?.id || currentUser?._id) ? (
                        <button
                          className="btn-icon"
                          onClick={() => {
                            setUserToDelete(admin);
                            setIsDeleteOpen(true);
                          }}
                          title="Delete Administrator"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        // Hidden delete or disabled placeholder
                        <div style={{ width: '28px' }} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsOpen && selectedUser && (
        <div className="modal-overlay" style={styles.modalOverlay}>
          <div className="modal-content glass-card" style={styles.modalContent}>
            <div className="modal-header" style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={22} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Administrator Details</h2>
              </div>
              <button 
                className="btn-icon" 
                onClick={() => setIsDetailsOpen(false)}
                style={{ color: 'var(--text-secondary)' }}
              >
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={styles.modalBody}>
              <div style={styles.detailGroup}>
                <div style={styles.detailIconWrapper}>
                  <User size={18} />
                </div>
                <div>
                  <label style={styles.detailLabel}>Full Name</label>
                  <p style={styles.detailValue}>{selectedUser.name}</p>
                </div>
              </div>

              <div style={styles.detailGroup}>
                <div style={styles.detailIconWrapper}>
                  <Mail size={18} />
                </div>
                <div>
                  <label style={styles.detailLabel}>Email Address</label>
                  <p style={styles.detailValue}>{selectedUser.email}</p>
                </div>
              </div>

              <div style={styles.detailGroup}>
                <div style={styles.detailIconWrapper}>
                  <Shield size={18} />
                </div>
                <div>
                  <label style={styles.detailLabel}>Role Profile</label>
                  <p style={styles.detailValue}>{selectedUser.role}</p>
                </div>
              </div>

              <div style={styles.detailGroup}>
                <div style={styles.detailIconWrapper}>
                  <Calendar size={18} />
                </div>
                <div>
                  <label style={styles.detailLabel}>Registration Date</label>
                  <p style={styles.detailValue}>{formatDateTime(selectedUser.createdAt)}</p>
                </div>
              </div>

              <div style={styles.metaRow}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Status State:</span>
                  <span className={`badge ${getStatusBadgeClass(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Approval Flag:</span>
                  <span style={{ fontWeight: 600, color: selectedUser.isApproved ? '#10b981' : '#f59e0b' }}>
                    {selectedUser.isApproved ? 'Approved' : 'Awaiting Approval'}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={styles.modalFooter}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsDetailsOpen(false)}
              >
                Close Details
              </button>
              {selectedUser.status === 'Pending' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => {
                      handleApprove(selectedUser._id);
                      setIsDetailsOpen(false);
                    }}
                  >
                    Approve
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => {
                      handleReject(selectedUser._id);
                      setIsDetailsOpen(false);
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && userToDelete && (
        <div className="modal-overlay" style={styles.modalOverlay}>
          <div className="modal-content glass-card" style={styles.confirmModalContent}>
            <div style={styles.confirmIconContainer}>
              <AlertTriangle size={32} style={{ color: '#ef4444' }} />
            </div>
            
            <h3 style={styles.confirmTitle}>Delete Administrator Registration?</h3>
            <p style={styles.confirmText}>
              Are you sure you want to delete the administrator registration for <strong>{userToDelete.name}</strong> ({userToDelete.email})?
              This action is permanent and cannot be undone.
            </p>

            <div style={styles.confirmButtons}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setIsDeleteOpen(false);
                  setUserToDelete(null);
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDeleteConfirm}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    padding: '7.5rem 2rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  alert: {
    marginBottom: '1.5rem',
  },
  controlsCard: {
    padding: '1.25rem',
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  searchForm: {
    display: 'flex',
    gap: '0.75rem',
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    paddingLeft: '2.75rem',
  },
  searchBtn: {
    padding: '0.75rem 1.5rem',
  },
  filterContainer: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.4rem 1rem',
    fontSize: '0.85rem',
  },
  skeletonContainer: {
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },
  spinner: {
    color: 'var(--primary)',
  },
  emptyCard: {
    padding: '4rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  approvedDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 6px #10b981',
  },
  pendingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#f59e0b',
    boxShadow: '0 0 6px #f59e0b',
  },
  tableActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '0.5rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalContent: {
    width: '100%',
    maxWidth: '500px',
    borderRadius: 'var(--border-radius-lg)',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  detailGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  detailIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
  },
  detailLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  detailValue: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginTop: '0.15rem',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 0 0',
    borderTop: '1px solid var(--border-color)',
    marginTop: '0.5rem',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  metaLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
    marginTop: '1.5rem',
  },
  confirmModalContent: {
    maxWidth: '400px',
    textAlign: 'center',
    padding: '2rem 1.5rem',
    borderRadius: 'var(--border-radius-lg)',
  },
  confirmIconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.25rem',
  },
  confirmTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  confirmText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    marginBottom: '1.5rem',
  },
  confirmButtons: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
  }
};
