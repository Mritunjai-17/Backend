import { useState, useEffect, type FormEvent } from 'react';
import { apiService, type Blog, API_BASE_URL } from '../services/api';
import { InputField } from '../components/FormElements';
import RichTextEditor from '../components/RichTextEditor';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  FileText, 
  X, 
  Image as ImageIcon, 
  Calendar, 
  AlertTriangle,
  Upload
} from 'lucide-react';

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Form states
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [coverUploading, setCoverUploading] = useState<boolean>(false);
  const [contentUploading, setContentUploading] = useState<boolean>(false);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await apiService.getBlogs();
      setBlogs(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedBlog(null);
    setTitle('');
    setContent('');
    setCoverImage('');
    setFormError('');
    setContentUploading(false);
    setModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setModalMode('edit');
    setSelectedBlog(blog);
    setTitle(blog.title);
    setContent(blog.content);
    setCoverImage(blog.coverImage || '');
    setFormError('');
    setContentUploading(false);
    setModalOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);
    setFormError('');

    const formData = new FormData();
    formData.append('upload', file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload cover image');
      }

      if (data.success && data.url) {
        setCoverImage(data.url);
      } else {
        throw new Error(data.message || 'Failed to retrieve cover image URL');
      }
    } catch (err: any) {
      setFormError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setCoverUploading(false);
      e.target.value = '';
    }
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setContentUploading(true);
    setFormError('');

    const formData = new FormData();
    formData.append('upload', file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload content image');
      }

      if (data.success && data.url) {
        const imageTag = `<p><img src="${data.url}" alt="Uploaded content image" /></p>`;
        setContent((prevContent) => (prevContent ? `${prevContent}\n${imageTag}` : imageTag));
      } else {
        throw new Error(data.message || 'Failed to retrieve image URL');
      }
    } catch (err: any) {
      setFormError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setContentUploading(false);
      e.target.value = '';
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError('Title and content are required');
      return;
    }

    setSubmitLoading(true);
    setFormError('');

    try {
      if (modalMode === 'create') {
        await apiService.createBlog(title, content, coverImage);
      } else if (modalMode === 'edit' && selectedBlog) {
        await apiService.updateBlog(selectedBlog._id, title, content, coverImage);
      }
      setModalOpen(false);
      fetchBlogs();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save blog post');
    } finally {
      setSubmitLoading(false);
    }
  };

  const openDeleteConfirm = (blog: Blog) => {
    setBlogToDelete(blog);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!blogToDelete) return;
    try {
      await apiService.deleteBlog(blogToDelete._id);
      setDeleteConfirmOpen(false);
      setBlogToDelete(null);
      fetchBlogs();
    } catch (err: any) {
      setError(err.message || 'Failed to delete blog post');
      setDeleteConfirmOpen(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={styles.pageContainer}>
      {/* Upper header action bar */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Blogs Manager</h1>
          <p style={styles.subtitle}>Create, edit, and delete news articles for Midis</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Create Blog Post
        </button>
      </div>

      {error && (
        <div className="alert-banner alert-banner-error" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table view */}
      {loading ? (
        <div style={styles.spinnerContainer}>
          <Loader2 size={40} className="spinner-loader" style={styles.spinner} />
          <span style={{ color: 'var(--text-secondary)' }}>Loading blogs database...</span>
        </div>
      ) : blogs.length === 0 ? (
        <div className="glass-card" style={styles.emptyCard}>
          <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Blogs Available</h3>
          <p style={{ marginTop: '0.25rem', marginBottom: '1rem' }}>Get started by adding your first article.</p>
          <button className="btn btn-secondary" onClick={openCreateModal}>
            <Plus size={16} /> Add Article
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Cover</th>
                <th>Title / Slug</th>
                <th>Date Created</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog._id}>
                  <td>
                    {blog.coverImage ? (
                      <img 
                        src={blog.coverImage} 
                        alt={blog.title} 
                        style={styles.thumbnail} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = ''; 
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div style={styles.thumbnailPlaceholder}>
                        <ImageIcon size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{blog.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {blog.slug}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} />
                      {formatDate(blog.createdAt)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                      <button 
                        className="btn-icon" 
                        onClick={() => openEditModal(blog)} 
                        title="Edit Article"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-icon" 
                        onClick={() => openDeleteConfirm(blog)} 
                        title="Delete Article"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal overlay (Create / Edit) */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={styles.modalContentOverride}>
            <div className="modal-header">
              <h3>{modalMode === 'create' ? 'Create Blog Post' : 'Edit Blog Post'}</h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert-banner alert-banner-error" style={{ marginBottom: '1.25rem' }}>
                    <AlertTriangle size={18} />
                    <span>{formError}</span>
                  </div>
                )}

                <InputField
                  label="Blog Title"
                  type="text"
                  placeholder="e.g. Exploring Midis 2.0 Feature Releases"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={submitLoading}
                />

                {/* Cover Image URL or File Upload */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Cover Image (Optional)
                  </label>
                  
                  {coverImage ? (
                    <div style={styles.coverPreviewContainer}>
                      <img src={coverImage} alt="Cover Preview" style={styles.coverPreviewImg} />
                      <button 
                        type="button" 
                        className="btn btn-danger btn-sm" 
                        style={styles.removeCoverBtn}
                        onClick={() => setCoverImage('')}
                      >
                        <Trash2 size={14} /> Remove Cover Image
                      </button>
                    </div>
                  ) : (
                    <div style={styles.coverUploadWrapper}>
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <label className="btn btn-secondary" style={styles.fileUploadLabel}>
                          {coverUploading ? (
                            <>
                              <Loader2 size={16} className="spinner-loader" style={styles.btnSpinner} />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload size={16} />
                              Upload from Device
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverUpload}
                            disabled={coverUploading || submitLoading}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        OR
                      </div>
                      <div style={{ flex: 2, minWidth: '240px' }}>
                        <input
                          type="url"
                          className="form-input"
                          placeholder="Paste cover image URL..."
                          value={coverImage}
                          onChange={(e) => setCoverImage(e.target.value)}
                          disabled={coverUploading || submitLoading}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Content
                    </label>
                    <label className="btn btn-secondary" style={styles.contentUploadBtn}>
                      {contentUploading ? (
                        <>
                          <Loader2 size={14} className="spinner-loader" style={styles.btnSpinner} />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          Upload Image from Device
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleContentImageUpload}
                        disabled={contentUploading || submitLoading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    onUploadingChange={setIsUploadingImage}
                    disabled={submitLoading}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setModalOpen(false)}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitLoading || isUploadingImage}
                >
                  {submitLoading ? (
                    <>
                      <Loader2 size={16} className="spinner-loader" style={styles.btnSpinner} />
                      Saving...
                    </>
                  ) : isUploadingImage ? (
                    'Uploading...'
                  ) : (
                    'Save Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deleteConfirmOpen && blogToDelete && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '450px' }}>
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <h3 style={{ color: 'var(--danger)' }}>Confirm Deletion</h3>
              <button className="btn-icon" onClick={() => setDeleteConfirmOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body" style={{ paddingBottom: '0.5rem' }}>
              <p>Are you sure you want to permanently delete <strong>"{blogToDelete.title}"</strong>?</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                This action cannot be undone.
              </p>
            </div>

            <div className="modal-footer" style={{ borderTop: 'none', backgroundColor: 'transparent' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteSubmit}
              >
                Delete Article
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
  spinnerContainer: {
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
    padding: '4rem 2rem',
    textAlign: 'center',
    borderRadius: 'var(--border-radius-md)',
  },
  coverPreviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px dashed var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
  },
  coverPreviewImg: {
    maxHeight: '120px',
    width: 'auto',
    borderRadius: '6px',
    objectFit: 'contain',
    border: '1px solid var(--border-color)',
  },
  removeCoverBtn: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.8rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  coverUploadWrapper: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  fileUploadLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
  },
  thumbnail: {
    width: '48px',
    height: '48px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
  },
  thumbnailPlaceholder: {
    width: '48px',
    height: '48px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)',
  },
  modalContentOverride: {
    maxWidth: '650px',
  },
  contentUploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--border-radius-md)',
  }
};
