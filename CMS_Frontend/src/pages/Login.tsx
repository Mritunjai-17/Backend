import { useState, type FormEvent } from 'react';
import { apiService } from '../services/api';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { InputField } from '../components/FormElements';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  onNavigateToRegister: () => void;
  successMessage?: string;
}

export default function Login({ onLoginSuccess, onNavigateToRegister, successMessage }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiService.login(email, password);
      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container auth-fade-in">
      <div className="glass-card login-card">
        <div className="login-header">
          <div className="login-logo">
            <Shield size={28} />
          </div>
          <h2>Admin CMS Login</h2>
          <p>Sign in to manage Midis CMS</p>
        </div>

        {successMessage && (
          <div className="alert-banner alert-banner-success">
            <CheckCircle size={18} />
            <span style={{ fontSize: '0.85rem' }}>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="alert-banner alert-banner-error">
            <AlertTriangle size={18} />
            <span style={{ fontSize: '0.85rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <InputField
            label="Email Address"
            type="email"
            placeholder="admin@midis.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <InputField
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footerLinkContainer}>
          Don't have an account?{' '}
          <button 
            type="button" 
            className="link-btn" 
            onClick={onNavigateToRegister}
            style={styles.linkBtn}
            disabled={loading}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  submitBtn: {
    width: '100%',
    padding: '0.75rem',
    marginTop: '1rem',
    fontSize: '0.95rem',
  },
  footerLinkContainer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    marginLeft: '0.25rem',
  }
};
