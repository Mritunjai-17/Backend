export const isDevelopment = 
  typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' || 
   window.location.hostname.startsWith('192.168.') || 
   window.location.hostname.startsWith('10.') || 
   window.location.hostname.endsWith('.local'));

export const isProduction = !isDevelopment;
export const API_BASE_URL = isProduction ? '/api/v1' : 'http://localhost:5000/api/v1';

export interface Blog {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  _id: string;
  imageUrl: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscriber {
  _id: string;
  fullName: string;
  email: string;
  domain: string;
  status: 'Active' | 'Contacted' | 'Unsubscribed';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const apiService = {
  // Check if API backend is running
  checkBackendHealth: async (): Promise<boolean> => {
    try {
      const baseUrl = isProduction ? '' : 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth Operations
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // Crucial for HTTP-only cookies
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Authentication failed');
    }

    return res.json();
  },

  register: async (name: string, email: string, password: string) => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }

    return res.json();
  },

  getCurrentUser: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include' // Crucial for HTTP-only cookies
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include' // Crucial for HTTP-only cookies
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  },

  // Blog CRUD Operations
  getBlogs: async (): Promise<Blog[]> => {
    const res = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'GET'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch blogs');
    }

    const json = await res.json();
    return json.data || [];
  },

  createBlog: async (title: string, content: string, coverImage?: string): Promise<Blog> => {
    const res = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, coverImage }),
      credentials: 'include' // Attaches HTTP-only auth token cookie
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create blog');
    }

    const json = await res.json();
    return json.data;
  },

  updateBlog: async (id: string, title: string, content: string, coverImage?: string): Promise<Blog> => {
    const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, coverImage }),
      credentials: 'include' // Attaches HTTP-only auth token cookie
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update blog');
    }

    const json = await res.json();
    return json.data;
  },

  deleteBlog: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
      credentials: 'include' // Attaches HTTP-only auth token cookie
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete blog');
    }
  },

  // Public Contact Form Submission
  submitContactForm: async (data: {
    fullName?: string;
    name?: string;
    email: string;
    phone?: string;
    service?: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: data.fullName || data.name,
        name: data.name || data.fullName,
        email: data.email,
        phone: data.phone,
        service: data.service || data.subject,
        subject: data.subject || data.service || 'General Inquiry',
        message: data.message
      })
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || result.error || 'Failed to submit contact request');
    }

    return result;
  },

  // Public Newsletter / Service Domain Subscription
  subscribeUser: async (data: {
    fullName: string;
    email: string;
    domain: string;
  }): Promise<{ success: boolean; message: string; data?: any }> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const res = await fetch(`${baseUrl}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || result.error || 'Failed to subscribe');
    }

    return result;
  },


  // Get contact messages for admin (filtered, searchable, paginated)
  getContacts: async (
    page: number,
    limit: number,
    search: string,
    status: string
  ): Promise<{
    data: any[];
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      status
    });

    const res = await fetch(`${baseUrl}/contact?${queryParams.toString()}`, {
      method: 'GET',
      credentials: 'include'
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Failed to fetch contact messages');
    }

    return result;
  },

  // Soft-delete a contact message
  deleteContact: async (id: string): Promise<void> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const res = await fetch(`${baseUrl}/contact/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete contact message');
    }
  },

  // Update contact message properties (read state, status)
  updateContactStatus: async (
    id: string,
    updateData: { status?: string; isRead?: boolean }
  ): Promise<any> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const res = await fetch(`${baseUrl}/contact/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData),
      credentials: 'include'
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Failed to update contact message status');
    }

    return result.data;
  },

  // Admin Management Operations
  getAdmins: async (search?: string, filter?: string): Promise<any> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (filter) queryParams.append('filter', filter);

    const res = await fetch(`${baseUrl}/admin/users?${queryParams.toString()}`, {
      method: 'GET',
      credentials: 'include'
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Failed to fetch administrators');
    }
    return result;
  },

  approveAdmin: async (id: string): Promise<any> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const res = await fetch(`${baseUrl}/admin/users/${id}/approve`, {
      method: 'PATCH',
      credentials: 'include'
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Failed to approve administrator');
    }
    return result;
  },

  rejectAdmin: async (id: string): Promise<any> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const res = await fetch(`${baseUrl}/admin/users/${id}/reject`, {
      method: 'PATCH',
      credentials: 'include'
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Failed to reject administrator');
    }
    return result;
  },

  deleteAdmin: async (id: string): Promise<any> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const res = await fetch(`${baseUrl}/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Failed to delete administrator');
    }
    return result;
  },

  // Portfolio Operations
  getPortfolio: async (): Promise<any> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const res = await fetch(`${baseUrl}/portfolio`, {
      method: 'GET',
      credentials: 'include'
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Failed to fetch portfolio gallery');
    }
    return result;
  },

  updatePortfolioImage: async (imageUrl: string): Promise<any> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const res = await fetch(`${baseUrl}/portfolio/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl }),
      credentials: 'include'
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Failed to add portfolio image');
    }
    return result;
  },

  uploadPortfolioFile: async (file: File, onProgress?: (percent: number) => void): Promise<{ success: boolean; url?: string; data?: any; error?: string }> => {
    return new Promise((resolve, reject) => {
      const baseUrl = API_BASE_URL.replace('/v1', '');
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `${baseUrl}/portfolio/upload`);
      xhr.withCredentials = true;
      
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        let response: any = {};
        try {
          response = JSON.parse(xhr.responseText || '{}');
        } catch (e) {
          response = {};
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            success: true,
            url: response.data?.imageUrl || response.url || response.data?.image,
            data: response.data
          });
        } else {
          reject(new Error(response.error || 'Upload failed'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during file upload'));
      };

      const formData = new FormData();
      formData.append('image', file);
      xhr.send(formData);
    });
  },

  uploadPortfolioImage: async (file: File, onProgress?: (percent: number) => void): Promise<{ success: boolean; url?: string; data?: any; error?: string }> => {
    return apiService.uploadPortfolioFile(file, onProgress);
  },

  deletePortfolioImage: async (id: string): Promise<any> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const res = await fetch(`${baseUrl}/portfolio/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Failed to delete portfolio image');
    }
    return result;
  },

  // Subscriber Operations for CMS
  getSubscribers: async (
    page: number,
    limit: number,
    search: string,
    status: string
  ): Promise<{
    data: Subscriber[];
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      status
    });

    const res = await fetch(`${baseUrl}/subscribe?${queryParams.toString()}`, {
      method: 'GET',
      credentials: 'include'
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Failed to fetch subscribers');
    }

    return result;
  },

  updateSubscriberStatus: async (
    id: string,
    updateData: { status?: string; isRead?: boolean }
  ): Promise<any> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const res = await fetch(`${baseUrl}/subscribe/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData),
      credentials: 'include'
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Failed to update subscriber status');
    }

    return result.data;
  },

  deleteSubscriber: async (id: string): Promise<void> => {
    const baseUrl = API_BASE_URL.replace('/v1', '');
    const res = await fetch(`${baseUrl}/subscribe/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete subscriber');
    }
  }
};
