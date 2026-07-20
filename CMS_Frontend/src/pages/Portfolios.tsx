import React, { useState, useEffect, useRef } from 'react';
import { apiService, PortfolioItem } from '../services/api';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2,
  RefreshCw,
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  X,
  Plus,
  Calendar
} from 'lucide-react';

export default function Portfolios() {
  // Gallery list state
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Local selection state for adding a new image
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>('');

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Alert messaging & Delete modal state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all portfolio images from backend GET /api/portfolio
  const fetchPortfolios = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getPortfolio();
      if (res.success && Array.isArray(res.data)) {
        setPortfolios(res.data);
      } else if (res.data && !Array.isArray(res.data)) {
        // In case API returns single object fallback
        setPortfolios([res.data]);
      } else {
        setPortfolios([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch portfolio gallery.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  // Format absolute URL for serving image
  const getFullFileUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
    return `${backendOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (JPG, PNG, WEBP)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '');

    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      setError('Invalid file type. Only JPG, PNG, and WEBP images are allowed.');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds 10MB limit. Please select a smaller file.');
      return;
    }

    setError('');
    setSuccess('');
    setSelectedFile(file);

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
  };

  // Clear locally selected file
  const handleRemoveSelectedFile = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setSelectedFile(null);
    setLocalPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit & append new image to portfolio
  const handleUploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    try {
      const res = await apiService.uploadPortfolioFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      if (res.success) {
        setSuccess('New portfolio image uploaded and added to gallery successfully!');
        handleRemoveSelectedFile();
        await fetchPortfolios();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(res.error || 'Failed to upload image to portfolio.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while uploading the file.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete a specific portfolio item by ID
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete._id;
    setItemToDelete(null);
    setDeletingId(id);
    setError('');
    setSuccess('');

    try {
      const res = await apiService.deletePortfolioImage(id);
      if (res.success) {
        setSuccess('Portfolio image removed from gallery and deleted from disk.');
        await fetchPortfolios();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(res.error || 'Failed to delete portfolio image.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete portfolio image.');
    } finally {
      setDeletingId(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.headerFlex}>
        <div>
          <h1 style={styles.title}>Portfolio Work Gallery</h1>
          <p style={styles.subtitle}>
            Upload and manage work showcase images. Each upload appends a new item to the public website gallery.
          </p>
        </div>
        <div style={styles.statsBadge}>
          <ImageIcon size={18} style={{ color: 'var(--primary)' }} />
          <span>{portfolios.length} {portfolios.length === 1 ? 'Image' : 'Images'} in Gallery</span>
        </div>
      </div>

      {success && (
        <div className="alert-banner alert-banner-success" style={styles.alert}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner alert-banner-error" style={styles.alert}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Card */}
      <div className="glass-card" style={styles.uploadCard}>
        <div style={styles.cardHeaderFlex}>
          <div>
            <h3 style={styles.cardTitle}>Add New Work Image</h3>
            <p style={styles.cardSubtitle}>Upload work images (.jpg, .jpeg, .png, .webp) to append to the portfolio.</p>
          </div>
          <button 
            type="button" 
            onClick={fetchPortfolios} 
            disabled={loading}
            style={styles.refreshBtn}
            title="Refresh gallery"
          >
            <RefreshCw size={14} className={loading ? "spinner-loader" : ""} />
          </button>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".jpg,.jpeg,.png,.webp" 
          style={{ display: 'none' }}
        />

        {selectedFile ? (
          <div style={styles.stagedCard}>
            <div style={styles.stagedHeader}>
              <span style={styles.stagedTitle}>Selected Image Ready to Add</span>
              <button 
                type="button" 
                onClick={handleRemoveSelectedFile}
                disabled={uploading}
                style={styles.closeBtn}
                title="Cancel selection"
              >
                <X size={16} />
              </button>
            </div>

            <div style={styles.stagedPreviewContainer}>
              <img src={localPreviewUrl} alt="Local Preview" style={styles.localImage} />
            </div>

            <div style={styles.stagedActions}>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleUploadFile}
                disabled={uploading}
                style={{ flex: 1 }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="spinner-loader" style={{ marginRight: '0.5rem' }} />
                    Uploading ({uploadProgress}%)
                  </>
                ) : (
                  <>
                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                    Add Image to Gallery
                  </>
                )}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={triggerFileInput}
                disabled={uploading}
              >
                Change Image
              </button>
            </div>
          </div>
        ) : (
          <div 
            style={styles.dropZone}
            onClick={triggerFileInput}
          >
            <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Click to select a work image to upload
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Supports JPG, JPEG, PNG, WEBP (Max 10MB)
            </p>
          </div>
        )}

        {uploading && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBarWrapper}>
              <div style={{ ...styles.progressBar, width: `${uploadProgress}%` }} />
            </div>
            <span style={styles.progressText}>{uploadProgress}% uploaded</span>
          </div>
        )}
      </div>

      {/* Portfolio Gallery Grid Section */}
      <div style={{ marginTop: '2.5rem' }}>
        <h3 style={styles.sectionTitle}>Uploaded Portfolio Images</h3>

        {loading && portfolios.length === 0 ? (
          <div style={styles.loaderContainer}>
            <Loader2 size={36} className="spinner-loader" style={{ color: 'var(--primary)' }} />
            <span style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>Loading gallery images...</span>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="glass-card" style={styles.emptyContainer}>
            <ImageIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.25rem' }}>
              No portfolio images uploaded yet
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click the upload box above to add your first work image to the portfolio gallery.
            </p>
          </div>
        ) : (
          <div style={styles.galleryGrid}>
            {portfolios.map((item, index) => {
              const path = item.imageUrl || item.image || '';
              const isDeleting = deletingId === item._id;

              return (
                <div key={item._id || index} className="glass-card" style={styles.galleryCard}>
                  {/* Image Container */}
                  <div style={styles.cardImageWrapper}>
                    <img 
                      src={getFullFileUrl(path)} 
                      alt={`Portfolio item ${index + 1}`} 
                      style={styles.cardImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/MIDIS/71c06f41f9f6c6715b4de3690ed53236 copy.webp';
                      }}
                    />
                    <div style={styles.imageIndexTag}>#{index + 1}</div>
                  </div>

                  {/* Card Content & Info */}
                  <div style={styles.cardBody}>
                    <div style={styles.dateRow}>
                      <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                      <span style={styles.dateText}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Uploaded work'}
                      </span>
                    </div>

                    <code style={styles.pathCode}>{path}</code>

                    {/* Delete Action */}
                    <button 
                      type="button" 
                      className="btn btn-danger" 
                      onClick={() => setItemToDelete(item)}
                      disabled={isDeleting}
                      style={styles.deleteBtn}
                    >
                      {isDeleting ? (
                        <Loader2 size={14} className="spinner-loader" />
                      ) : (
                        <>
                          <Trash2 size={14} style={{ marginRight: '0.4rem' }} />
                          Delete Image
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-scale-in" style={styles.confirmModalContent}>
            <div style={styles.confirmIconContainer}>
              <AlertTriangle size={32} style={{ color: '#ef4444' }} />
            </div>
            
            <h3 style={styles.confirmTitle}>Delete Portfolio Image?</h3>
            <p style={styles.confirmText}>
              Are you sure you want to delete this specific image? This will permanently delete the MongoDB document and remove the file from the server uploads folder.
            </p>

            <div style={styles.confirmModalImagePreview}>
              <img 
                src={getFullFileUrl(itemToDelete.imageUrl || itemToDelete.image || '')} 
                alt="Selected to delete" 
                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px' }}
              />
            </div>

            <div style={styles.confirmButtons}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setItemToDelete(null)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDeleteConfirm}
                style={{ flex: 1, backgroundColor: '#dc2626', borderColor: '#dc2626' }}
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
    maxWidth: '1280px',
    margin: '0 auto',
    minHeight: '100vh',
  },
  headerFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem',
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '2.25rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  statsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  alert: {
    marginBottom: '1.5rem',
  },
  uploadCard: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  cardHeaderFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  cardSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginTop: '0.2rem',
  },
  refreshBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.4rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZone: {
    border: '2px dashed var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '2rem 1.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: 'var(--bg-secondary)',
    transition: 'border-color 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stagedCard: {
    border: '1px solid var(--primary)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  stagedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stagedTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  stagedPreviewContainer: {
    width: '100%',
    maxHeight: '200px',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  localImage: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '6px',
  },
  stagedActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  progressContainer: {
    marginTop: '0.5rem',
  },
  progressBarWrapper: {
    width: '100%',
    height: '6px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'var(--primary)',
    transition: 'width 0.2s ease',
  },
  progressText: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: '1.35rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '1.25rem',
  },
  loaderContainer: {
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: '4rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  galleryCard: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 'var(--border-radius-md)',
  },
  cardImageWrapper: {
    width: '100%',
    aspectRatio: '16/10',
    position: 'relative',
    backgroundColor: 'var(--bg-secondary)',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageIndexTag: {
    position: 'absolute',
    top: '0.5rem',
    left: '0.5rem',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    color: 'white',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  cardBody: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    flex: 1,
    justifyContent: 'space-between',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  dateText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  pathCode: {
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    padding: '0.35rem 0.5rem',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    wordBreak: 'break-all',
  },
  deleteBtn: {
    width: '100%',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
    marginTop: '0.25rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  confirmModalContent: {
    width: '100%',
    maxWidth: '440px',
    padding: '2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  confirmIconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  confirmText: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    lineHeight: 1.5,
  },
  confirmModalImagePreview: {
    width: '100%',
    margin: '0.25rem 0',
  },
  confirmButtons: {
    display: 'flex',
    gap: '0.75rem',
    width: '100%',
    marginTop: '0.25rem',
  }
};
