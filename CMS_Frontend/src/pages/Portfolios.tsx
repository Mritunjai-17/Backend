import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText,
  Trash2,
  RefreshCw,
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  X,
  ExternalLink
} from 'lucide-react';

export default function Portfolios() {
  // Server state
  const [currentFileUrl, setCurrentFileUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Local selection state (before submit/upload)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>('');

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Alert messaging state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current live portfolio item on component mount
  const fetchPortfolio = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getPortfolio();
      if (res.success && res.data) {
        const path = res.data.imageUrl || res.data.image || '';
        setCurrentFileUrl(path);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch current portfolio file.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Format absolute backend URL for public serving
  const getFullFileUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
    return `${backendOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Helper to check if file is PDF
  const isPdf = (urlOrName: string, mimeType?: string) => {
    if (mimeType === 'application/pdf') return true;
    return urlOrName.toLowerCase().endsWith('.pdf');
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (JPG, PNG, WEBP, PDF)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(ext || '');

    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      setError('Invalid file type. Only JPG, PNG, WEBP images, and PDF documents are allowed.');
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

    // Revoke previous local object URL if existing
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    // Create new object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
  };

  // Remove locally selected file prior to submitting
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

  // Submit and upload selected file
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

      if (res.success && res.url) {
        setCurrentFileUrl(res.url);
        setSuccess('Portfolio file updated and stored successfully!');
        handleRemoveSelectedFile();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(res.error || 'Failed to upload portfolio file.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while uploading the file.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete portfolio file on server
  const handleDeleteConfirm = async () => {
    setIsDeleteOpen(false);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiService.deletePortfolioImage();
      if (res.success) {
        setCurrentFileUrl('/MIDIS/71c06f41f9f6c6715b4de3690ed53236 copy.webp');
        setSuccess(res.message || 'Portfolio file deleted successfully. Reverted to default placeholder.');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(res.error || 'Failed to delete portfolio file.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete portfolio file.');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Portfolio Management</h1>
          <p style={styles.subtitle}>Upload, replace, and delete portfolio images (JPG, PNG, WEBP) or PDF documents for the MIDIS website</p>
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

      {/* Main Content Grid */}
      <div style={styles.grid}>
        {/* Left Side: Upload & Control Panel */}
        <div className="glass-card" style={styles.controlCard}>
          <h3 style={styles.cardTitle}>
            {currentFileUrl && currentFileUrl.startsWith('/uploads/portfolio/') ? 'Replace Portfolio File' : 'Upload Portfolio File'}
          </h3>
          <p style={styles.cardDescription}>
            Select an image or PDF document from your local device. Replacing or deleting an existing file will clean it up on the server automatically.
          </p>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".jpg,.jpeg,.png,.webp,.pdf" 
            style={{ display: 'none' }}
          />

          {/* Staged File Selection Preview Card */}
          {selectedFile ? (
            <div style={styles.stagedCard}>
              <div style={styles.stagedHeader}>
                <span style={styles.stagedTitle}>Selected File Ready for Upload</span>
                <button 
                  type="button" 
                  onClick={handleRemoveSelectedFile}
                  disabled={uploading}
                  style={styles.closeBtn}
                  title="Remove selected file"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Local File Preview */}
              <div style={styles.stagedPreviewContainer}>
                {isPdf(selectedFile.name, selectedFile.type) ? (
                  <div style={styles.pdfCard}>
                    <FileText size={48} style={{ color: '#ef4444' }} />
                    <div style={styles.pdfDetails}>
                      <span style={styles.pdfName}>{selectedFile.name}</span>
                      <span style={styles.pdfSize}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document</span>
                    </div>
                  </div>
                ) : (
                  <div style={styles.localImageWrapper}>
                    <img src={localPreviewUrl} alt="Local Preview" style={styles.localImage} />
                  </div>
                )}
              </div>

              {/* Action Buttons for Selected File */}
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
                      <Upload size={16} style={{ marginRight: '0.5rem' }} />
                      Confirm & Upload
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={triggerFileInput}
                  disabled={uploading}
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            /* File Picker Trigger Area */
            <div 
              style={styles.dropZone}
              onClick={triggerFileInput}
            >
              <Upload size={36} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Click to browse local file
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Supports JPG, PNG, WEBP images or PDF files (Max 10MB)
              </p>
            </div>
          )}

          {uploading && (
            <div style={styles.progressContainer}>
              <div style={styles.progressBarWrapper}>
                <div style={{ ...styles.progressBar, width: `${uploadProgress}%` }} />
              </div>
              <span style={styles.progressText}>{uploadProgress}% completed</span>
            </div>
          )}

          {/* Delete Option if custom file is uploaded */}
          {currentFileUrl && currentFileUrl.startsWith('/uploads/portfolio/') && !selectedFile && (
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={() => setIsDeleteOpen(true)}
              disabled={loading || uploading}
              style={{ ...styles.actionBtn, backgroundColor: '#dc2626', borderColor: '#dc2626', marginTop: '1rem' }}
            >
              <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
              Delete Current Portfolio File
            </button>
          )}

          <div style={styles.requirementsList}>
            <h4 style={styles.reqTitle}>Requirements & Specs:</h4>
            <ul style={styles.reqUl}>
              <li>Supported extensions: .jpg, .jpeg, .png, .webp, .pdf</li>
              <li>Maximum file size limit: 10MB</li>
              <li>Stored directory: <code>uploads/portfolio/</code></li>
            </ul>
          </div>
        </div>

        {/* Right Side: Current Live Portfolio View */}
        <div className="glass-card" style={styles.previewCard}>
          <div style={styles.cardHeaderFlex}>
            <h3 style={styles.cardTitle}>Live Portfolio Display</h3>
            <button 
              type="button" 
              onClick={fetchPortfolio} 
              disabled={loading}
              style={styles.refreshBtn}
              title="Refresh status"
            >
              <RefreshCw size={14} className={loading ? "spinner-loader" : ""} />
            </button>
          </div>
          
          {loading ? (
            <div style={styles.loaderContainer}>
              <Loader2 size={32} className="spinner-loader" style={{ color: 'var(--primary)' }} />
              <span style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Loading live portfolio...</span>
            </div>
          ) : (
            <div style={styles.imageContainer}>
              {currentFileUrl ? (
                <div style={styles.imageWrapper}>
                  {isPdf(currentFileUrl) ? (
                    <div style={styles.pdfPreviewBox}>
                      <FileText size={64} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                      <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                        PDF Document Uploaded
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', textAlign: 'center' }}>
                        {currentFileUrl.split('/').pop()}
                      </p>
                      <a 
                        href={getFullFileUrl(currentFileUrl)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                      >
                        <ExternalLink size={14} />
                        View / Download PDF
                      </a>
                    </div>
                  ) : (
                    <img 
                      src={getFullFileUrl(currentFileUrl)} 
                      alt="Current Live Portfolio" 
                      style={styles.previewImage} 
                    />
                  )}
                  <div style={styles.currentLabel}>Current Live File</div>
                </div>
              ) : (
                <div style={styles.placeholderContainer}>
                  <ImageIcon size={48} style={{ color: 'var(--text-muted)' }} />
                  <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>No custom portfolio uploaded</p>
                </div>
              )}
            </div>
          )}

          {currentFileUrl && !loading && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>MongoDB Stored Relative Path:</span>
              <code style={styles.infoValue}>{currentFileUrl}</code>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-scale-in" style={styles.confirmModalContent}>
            <div style={styles.confirmIconContainer}>
              <AlertTriangle size={32} style={{ color: '#ef4444' }} />
            </div>
            
            <h3 style={styles.confirmTitle}>Delete Portfolio File?</h3>
            <p style={styles.confirmText}>
              Are you sure you want to delete this portfolio file from disk and database?
              The public website will revert to displaying the default collage fallback.
            </p>

            <div style={styles.confirmButtons}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsDeleteOpen(false)}
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
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
  },
  header: {
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
  alert: {
    marginBottom: '1.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '2.5rem',
    alignItems: 'start',
  },
  controlCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  cardDescription: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  dropZone: {
    border: '2px dashed var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '2.5rem 1.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: 'var(--bg-secondary)',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
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
    borderRadius: '4px',
  },
  stagedPreviewContainer: {
    width: '100%',
    maxHeight: '220px',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  localImageWrapper: {
    width: '100%',
    maxHeight: '220px',
    overflow: 'hidden',
    borderRadius: '6px',
  },
  localImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  pdfCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    width: '100%',
  },
  pdfDetails: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  pdfName: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pdfSize: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
  stagedActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  actionBtn: {
    width: '100%',
    padding: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.95rem',
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
  requirementsList: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
  },
  reqTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
    letterSpacing: '0.05em',
  },
  reqUl: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    paddingLeft: '1.25rem',
    margin: 0,
    lineHeight: 1.6,
  },
  previewCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cardHeaderFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  imageContainer: {
    width: '100%',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    aspectRatio: '16/9',
    overflow: 'hidden',
    position: 'relative',
  },
  loaderContainer: {
    width: '100%',
    aspectRatio: '16/9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  pdfPreviewBox: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    backgroundColor: 'var(--bg-secondary)',
  },
  currentLabel: {
    position: 'absolute',
    bottom: '0.75rem',
    left: '0.75rem',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    color: 'white',
    padding: '0.25rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  infoRow: {
    marginTop: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  infoLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  infoValue: {
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    padding: '0.5rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    wordBreak: 'break-all',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  confirmModalContent: {
    width: '100%',
    maxWidth: '450px',
    padding: '2.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.25rem',
  },
  confirmIconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTitle: {
    fontSize: '1.35rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  confirmText: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    lineHeight: 1.6,
  },
  confirmButtons: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
    marginTop: '0.5rem',
  }
};
