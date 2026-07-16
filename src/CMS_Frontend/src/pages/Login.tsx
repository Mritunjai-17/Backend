import { useState, type FormEvent } from 'react';
import { apiService } from '../services/api';
import { Shield, AlertTriangle } from 'lucide-react';
import { InputField } from '../components/FormElements';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
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
    <div className="login-container">
      <div className="glass-card login-card">
        <div className="login-header">
          <div className="login-logo">
            <Shield size={28} />
          </div>
          <h2>Admin CMS Login</h2>
          <p>Sign in to manage Midis CMS</p>
        </div>

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
  }
};
