import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  Eye, 
  CornerUpLeft, 
  Trash2, 
  Search, 
  Loader2, 
  Inbox, 
  X, 
  Mail, 
  Phone as PhoneIcon, 
  Briefcase, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// Main Page Component
export default function Contacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals visibility state
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<any | null>(null);

  // Fetch contacts from API
  const fetchContacts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getContacts(page, 10, searchQuery, statusFilter);
      setContacts(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contact messages.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page, filters, or search query changes
  useEffect(() => {
    fetchContacts();
  }, [page, statusFilter]);

  // Handle manual search execution
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchContacts();
  };

  // Handle opening details and marking as read
  const handleOpenDetails = async (contact: any) => {
    setSelectedContact(contact);
    setIsDetailsOpen(true);

    // If message is unread, mark it as read in the background
    if (!contact.isRead) {
      try {
        await apiService.updateContactStatus(contact._id, { isRead: true });
        // Update local state to show it is read
        setContacts(prev =>
          prev.map(c => (c._id === contact._id ? { ...c, isRead: true } : c))
        );
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  // Handle opening reply modal
  const handleOpenReply = (contact: any) => {
    setSelectedContact(contact);
    setIsReplyOpen(true);
  };

  // Handle opening delete modal
  const handleOpenDelete = (contact: any) => {
    setContactToDelete(contact);
    setIsDeleteOpen(true);
  };

  // Submit soft-delete to backend
  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;
    try {
      await apiService.deleteContact(contactToDelete._id);
      setSuccess('Message deleted successfully.');
      setIsDeleteOpen(false);
      setContactToDelete(null);
      
      // Close details modal if the viewed message was deleted
      if (selectedContact?._id === contactToDelete._id) {
        setIsDetailsOpen(false);
      }
      
      // Reset to page 1 if current page would be empty
      if (contacts.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        fetchContacts();
      }

      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete message.');
      setIsDeleteOpen(false);
    }
  };

  // Submit mock reply to backend
  const handleReplySubmit = async (subject: string, replyBody: string) => {
    if (!selectedContact) return;
    try {
      console.log('Mock email reply detail:', { to: selectedContact.email, subject, replyBody });
      // For now: update status to "Replied"
      await apiService.updateContactStatus(selectedContact._id, { status: 'Replied' });
      setSuccess(`Mock reply regarding "${subject}" sent to ${selectedContact.email}! Status updated to Replied.`);
      setIsReplyOpen(false);
      fetchContacts();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to update message status after reply.');
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header bar */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Contact Messages</h1>
          <p style={styles.subtitle}>Manage and reply to inquiries received from the public website</p>
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
              placeholder="Search by name, email, phone, or service..."
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
          {['All', 'New', 'Replied', 'Closed'].map((filter) => {
            const isActive = statusFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => {
                  setStatusFilter(filter);
                  setPage(1);
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
          <span style={{ color: 'var(--text-secondary)' }}>Fetching messages...</span>
        </div>
      ) : contacts.length === 0 ? (
        <div className="glass-card" style={styles.emptyCard}>
          <Inbox size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No contact messages received yet.</h3>
          <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
            When visitors submit forms on the public site, they will appear here.
          </p>
        </div>
      ) : (
        <>
          <ContactTable 
            contacts={contacts} 
            onView={handleOpenDetails} 
            onReply={handleOpenReply} 
            onDelete={handleOpenDelete} 
          />

          {/* Pagination Controls */}
          <div style={styles.pagination}>
            <span style={styles.paginationText}>
              Showing <strong>{((page - 1) * 10) + 1}-{Math.min(page * 10, total)}</strong> of <strong>{total}</strong> messages
            </span>
            <div style={styles.paginationButtons}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {isDetailsOpen && selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={() => setIsDetailsOpen(false)}
          onReply={() => {
            setIsDetailsOpen(false);
            setIsReplyOpen(true);
          }}
          onDelete={() => {
            setIsDetailsOpen(false);
            handleOpenDelete(selectedContact);
          }}
        />
      )}

      {isReplyOpen && selectedContact && (
        <ReplyModal
          contact={selectedContact}
          onClose={() => setIsReplyOpen(false)}
          onSubmit={handleReplySubmit}
        />
      )}

      {isDeleteOpen && contactToDelete && (
        <DeleteConfirmationDialog
          contact={contactToDelete}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------

// 1. Table Component
interface TableProps {
  contacts: any[];
  onView: (contact: any) => void;
  onReply: (contact: any) => void;
  onDelete: (contact: any) => void;
}

function ContactTable({ contacts, onView, onReply, onDelete }: TableProps) {
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'New': return 'badge-danger';
      case 'Replied': return 'badge-success';
      case 'Closed': return 'badge-primary';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Name</th>
            <th>Email / Phone</th>
            <th>Service Requested</th>
            <th>Message Preview</th>
            <th>Date Received</th>
            <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => {
            const isUnread = !contact.isRead;
            return (
              <tr key={contact._id} style={isUnread ? styles.unreadRow : {}}>
                <td>
                  <span className={`badge ${getStatusBadgeClass(contact.status)}`}>
                    {contact.status}
                  </span>
                  {isUnread && <span style={styles.unreadDot} title="Unread Message" />}
                </td>
                <td>
                  <div style={{ fontWeight: isUnread ? 700 : 600 }}>{contact.fullName || contact.name || 'N/A'}</div>
                </td>
                <td>
                  <div style={{ fontSize: '0.85rem' }}>{contact.email}</div>
                  {contact.phone && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {contact.phone}
                    </div>
                  )}
                </td>
                <td>
                  <span style={styles.serviceBadge}>{contact.service || contact.subject || 'General'}</span>
                </td>
                <td>
                  <div style={styles.messagePreview} title={contact.message}>
                    {contact.message.length > 60 
                      ? `${contact.message.substring(0, 60)}...` 
                      : contact.message}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {formatDateTime(contact.createdAt)}
                  </div>
                </td>
                <td>
                  <div style={styles.tableActions}>
                    <button
                      className="btn-icon"
                      onClick={() => onView(contact)}
                      title="View Details"
                      style={{ color: 'var(--primary)' }}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => onReply(contact)}
                      title="Compose Reply"
                      style={{ color: '#10b981' }}
                    >
                      <CornerUpLeft size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => onDelete(contact)}
                      title="Delete"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// 2. View Modal Component
interface ViewModalProps {
  contact: any;
  onClose: () => void;
  onReply: () => void;
  onDelete: () => void;
}

function ContactDetailsModal({ contact, onClose, onReply, onDelete }: ViewModalProps) {
  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>Message Details</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={styles.modalBodyScroll}>
          {/* Metadata Rows */}
          <div style={styles.detailGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>From</span>
              <div style={styles.detailValue}>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{contact.fullName || contact.name || 'N/A'}</strong>
              </div>
            </div>

            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Email Address</span>
              <div style={styles.detailValue}>
                <a href={`mailto:${contact.email}`} style={styles.detailLink}>
                  <Mail size={14} />
                  {contact.email}
                </a>
              </div>
            </div>

            {contact.phone && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Phone Number</span>
                <div style={styles.detailValue}>
                  <a href={`tel:${contact.phone}`} style={styles.detailLink}>
                    <PhoneIcon size={14} />
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}

            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Service Requested</span>
              <div style={styles.detailValue}>
                <span style={styles.iconText}>
                  <Briefcase size={14} style={{ color: 'var(--primary)' }} />
                  {contact.service || contact.subject || 'General'}
                </span>
              </div>
            </div>

            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Received Date</span>
              <div style={styles.detailValue}>
                <span style={styles.iconText}>
                  <Calendar size={14} />
                  {formatFullDate(contact.createdAt)}
                </span>
              </div>
            </div>

            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Status</span>
              <div style={styles.detailValue}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }} className={`badge ${contact.status === 'New' ? 'badge-danger' : contact.status === 'Replied' ? 'badge-success' : 'badge-primary'}`}>
                  {contact.status}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.messageDivider} />

          {/* Message Text area */}
          <div style={styles.messageSection}>
            <span style={styles.detailLabel}>Inquiry Message</span>
            <div style={styles.messageTextBody}>
              {contact.message}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div style={styles.leftActions}>
            <button className="btn btn-danger" onClick={onDelete}>
              <Trash2 size={16} />
              Delete
            </button>
          </div>
          <div style={styles.rightActions}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary" onClick={onReply}>
              <CornerUpLeft size={16} />
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Reply Modal Component
interface ReplyProps {
  contact: any;
  onClose: () => void;
  onSubmit: (subject: string, replyMessage: string) => void;
}

function ReplyModal({ contact, onClose, onSubmit }: ReplyProps) {
  const [subject, setSubject] = useState(`Re: MIDIS Inquiry - ${contact.service}`);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setSending(true);
    setTimeout(() => {
      onSubmit(subject, replyMessage);
      setSending(false);
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h3>Compose Reply</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSend}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">To</label>
              <input
                type="text"
                className="form-input"
                value={contact.email}
                disabled
                style={styles.disabledInput}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject of reply"
                required
                disabled={sending}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reply Message</label>
              <textarea
                className="form-input"
                placeholder="Type your reply here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                required
                disabled={sending}
                style={{ minHeight: '180px' }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              ℹ️ Sending is simulated. The system will update the contact's status to "Replied" in the database.
            </p>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={sending}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={sending || !replyMessage.trim()}>
              {sending ? (
                <>
                  <Loader2 size={16} className="spinner-loader" style={styles.btnSpinner} />
                  Sending...
                </>
              ) : (
                <>
                  <SendIcon size={16} />
                  Send Reply
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Simple Send icon
function SendIcon({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}

// 4. Delete Confirmation Dialog
interface DeleteProps {
  contact: any;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmationDialog({ contact, onClose, onConfirm }: DeleteProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header" style={{ borderBottom: 'none' }}>
          <h3>Delete Message</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ paddingBottom: '0.5rem' }}>
          <p>Are you sure you want to permanently delete the inquiry from <strong>"{contact.fullName}"</strong>?</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            This action will move the message to the trash and hide it from the administration panel.
          </p>
        </div>

        <div className="modal-footer" style={{ borderTop: 'none', backgroundColor: 'transparent' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete Message
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// INLINE STYLES DEFINITION
// ----------------------------------------------------
const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    width: '100%',
    padding: '2rem 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    marginTop: '0.25rem',
  },
  alert: {
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  controlsCard: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1.25rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  searchForm: {
    display: 'flex',
    flex: 1,
    gap: '0.75rem',
    minWidth: '280px',
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
    pointerEvents: 'none',
  },
  searchInput: {
    paddingLeft: '2.5rem',
    width: '100%',
  },
  searchBtn: {
    padding: '0.625rem 1.5rem',
  },
  filterContainer: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
  },
  skeletonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40vh',
    gap: '1rem',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  btnSpinner: {
    animation: 'spin 1s linear infinite',
    marginRight: '0.25rem',
  },
  emptyCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 2rem',
    textAlign: 'center',
    borderRadius: 'var(--border-radius-md)',
  },
  unreadRow: {
    backgroundColor: 'rgba(234, 88, 12, 0.02)',
  },
  unreadDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    marginLeft: '0.5rem',
    verticalAlign: 'middle',
  },
  serviceBadge: {
    fontSize: '0.75rem',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  messagePreview: {
    maxWidth: '240px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  tableActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.25rem',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.5rem',
    padding: '0.5rem 0.25rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  paginationText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  paginationButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  modalBodyScroll: {
    maxHeight: '65vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  detailLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  detailValue: {
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  detailLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: 600,
  },
  iconText: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  messageDivider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '0.5rem 0',
  },
  messageSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  messageTextBody: {
    fontSize: '0.95rem',
    lineHeight: 1.6,
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '1.25rem',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    whiteSpace: 'pre-wrap',
  },
  leftActions: {
    display: 'flex',
  },
  rightActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  disabledInput: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-muted)',
    cursor: 'not-allowed',
    border: '1px solid var(--border-color)',
  }
};
