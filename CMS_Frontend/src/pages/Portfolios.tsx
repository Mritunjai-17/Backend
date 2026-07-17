import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { 
  Upload, 
  Image as ImageIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';

export default function Portfolios() {
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [previewIsPdf, setPreviewIsPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch the current portfolio image on mount
  const fetchPortfolio = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getPortfolio();
      if (res.success && res.data) {
        setImageUrl(res.data.imageUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch the portfolio image.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const getFullImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const backendOrigin = apiBase.replace('/v1', '');
    return `${backendOrigin}${path}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, WEBP images, and PDF files are allowed.');
      return;
    }

    // 2. Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size too large. Maximum size allowed is 10MB.');
      return;
    }

    setError('');
    setSuccess('');
    
    // Set PDF preview state flag
    setPreviewIsPdf(file.type === 'application/pdf');

    // Create local object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // 3. Upload immediately
    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to server and track progress
      const uploadRes = await apiService.uploadPortfolioImage(file, (progress) => {
        setUploadProgress(progress);
      });

      if (uploadRes.success && uploadRes.url) {
        // Save the updated image URL to Portfolio model
        const saveRes = await apiService.updatePortfolioImage(uploadRes.url);
        if (saveRes.success) {
          setImageUrl(uploadRes.url);
          setSuccess('Portfolio image updated successfully!');
          setPreviewUrl('');
          setPreviewIsPdf(false);
          setTimeout(() => setSuccess(''), 4000);
        } else {
          setError(saveRes.error || 'Failed to save portfolio image URL.');
        }
      } else {
        setError(uploadRes.error || 'Failed to upload portfolio image.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during image upload.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteOpen(false);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiService.deletePortfolioImage();
      if (res.success) {
        setImageUrl('/MIDIS/71c06f41f9f6c6715b4de3690ed53236 copy.webp');
        setPreviewIsPdf(false);
        setSuccess(res.message || 'Portfolio image deleted successfully.');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(res.error || 'Failed to delete portfolio image.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete portfolio image.');
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
          <h1 style={styles.title}>Manage Portfolio</h1>
          <p style={styles.subtitle}>Upload and replace the single collage portfolio image for the public website</p>
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

      {/* Main content grid */}
      <div style={styles.grid}>
        {/* Left Side: Upload controls */}
        <div className="glass-card" style={styles.controlCard}>
          <h3 style={styles.cardTitle}>Change Portfolio File</h3>
          <p style={styles.cardDescription}>
            The portfolio is displayed as a single high-quality designed image or PDF on the public website. Replacing this file will automatically update the website.
          </p>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".jpg,.jpeg,.png,.webp,.pdf" 
            style={{ display: 'none' }}
          />

          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={triggerFileInput}
            disabled={loading || uploading}
            style={styles.uploadBtn}
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="spinner-loader" style={{ marginRight: '0.5rem' }} />
                Uploading ({uploadProgress}%)
              </>
            ) : (
              <>
                <Upload size={16} style={{ marginRight: '0.5rem' }} />
                Upload New Portfolio Image
              </>
            )}
          </button>

          {imageUrl && imageUrl.startsWith('/uploads/portfolio/') && (
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={() => setIsDeleteOpen(true)}
              disabled={loading || uploading}
              style={{ ...styles.uploadBtn, marginTop: '0.75rem', backgroundColor: '#dc2626', borderColor: '#dc2626' }}
            >
              Delete Portfolio Image
            </button>
          )}

          {uploading && (
            <div style={styles.progressContainer}>
              <div style={styles.progressBarWrapper}>
                <div style={{ ...styles.progressBar, width: `${uploadProgress}%` }} />
              </div>
              <span style={styles.progressText}>{uploadProgress}% completed</span>
            </div>
          )}

          <div style={styles.requirementsList}>
            <h4 style={styles.reqTitle}>File Requirements:</h4>
            <ul>
              <li>Accepted formats: JPG, PNG, WEBP, PDF</li>
              <li>Maximum file size: 10MB</li>
              <li>Recommended ratio: 16:9 landscape</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Image preview */}
        <div className="glass-card" style={styles.previewCard}>
          <h3 style={styles.cardTitle}>Portfolio Preview</h3>
          
          {loading ? (
            <div style={styles.loaderContainer}>
              <Loader2 size={32} className="spinner-loader" style={{ color: 'var(--primary)' }} />
              <span style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Loading portfolio image...</span>
            </div>
          ) : (
            <div style={styles.imageContainer}>
              {previewUrl ? (
                <div style={styles.imageWrapper}>
                  {previewIsPdf ? (
                    <iframe 
                      src={previewUrl} 
                      title="New PDF Preview" 
                      style={{ width: '100%', height: '100%', border: 'none' }} 
                    />
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="New Portfolio Preview" 
                      style={styles.previewImage} 
                    />
                  )}
                  <div style={styles.previewLabel}>New File Preview</div>
                </div>
              ) : imageUrl ? (
                <div style={styles.imageWrapper}>
                  {imageUrl.toLowerCase().endsWith('.pdf') ? (
                    <iframe 
                      src={getFullImageUrl(imageUrl)} 
                      title="Current Live PDF" 
                      style={{ width: '100%', height: '100%', border: 'none' }} 
                    />
                  ) : (
                    <img 
                      src={getFullImageUrl(imageUrl)} 
                      alt="Current Portfolio" 
                      style={styles.previewImage} 
                    />
                  )}
                  <div style={styles.currentLabel}>Current Live File</div>
                </div>
              ) : (
                <div style={styles.placeholderContainer}>
                  <ImageIcon size={48} style={{ color: 'var(--text-muted)' }} />
                  <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>No portfolio file uploaded yet</p>
                </div>
              )}
            </div>
          )}

          {imageUrl && !loading && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Stored File Path:</span>
              <code style={styles.infoValue}>{imageUrl}</code>
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
            
            <h3 style={styles.confirmTitle}>Delete Portfolio Image?</h3>
            <p style={styles.confirmText}>
              Are you sure you want to delete the custom uploaded portfolio image? 
              This will revert the website to show the default placeholder collage.
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
    fontSize: '2.5rem',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  uploadBtn: {
    width: '100%',
    padding: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.95rem',
    marginTop: '0.5rem',
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
    marginTop: '1.5rem',
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
  previewCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
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
  previewLabel: {
    position: 'absolute',
    bottom: '0.75rem',
    left: '0.75rem',
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
  },
  currentLabel: {
    position: 'absolute',
    bottom: '0.75rem',
    left: '0.75rem',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    color: 'white',
    padding: '0.25rem 0.5rem',
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
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  confirmText: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  confirmButtons: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
    marginTop: '0.5rem',
  }
};
