import { useState, type FormEvent } from 'react';
import { apiService } from '../services/api';
import { Shield, AlertTriangle } from 'lucide-react';
import { InputField } from '../components/FormElements';

interface RegisterProps {
  onRegisterSuccess: (message: string) => void;
  onNavigateToLogin: () => void;
}

export default function Register({ onRegisterSuccess, onNavigateToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Individual field errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validate = () => {
    let isValid = true;

    // Reset errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setApiError('');

    if (!name.trim()) {
      setNameError('Full name is required');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email address is required');
      isValid = false;
    } else {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Please enter a valid email address');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must contain at least 8 characters');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      const res = await apiService.register(name.trim(), email.trim(), password);
      if (res.success) {
        onRegisterSuccess(res.message || 'Registration successful. Please login.');
      } else {
        setApiError(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please try again.');
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
          <h2>Create Account</h2>
          <p>Sign up to manage Midis CMS</p>
        </div>

        {apiError && (
          <div className="alert-banner alert-banner-error">
            <AlertTriangle size={18} />
            <span style={{ fontSize: '0.85rem' }}>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <InputField
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            error={nameError}
          />

          <InputField
            label="Email Address"
            type="email"
            placeholder="admin@midis.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            error={emailError}
          />

          <InputField
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={passwordError}
          />

          <InputField
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            error={confirmPasswordError}
          />

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={styles.footerLinkContainer}>
          Already have an account?{' '}
          <button 
            type="button" 
            className="link-btn" 
            onClick={onNavigateToLogin}
            style={styles.linkBtn}
            disabled={loading}
          >
            Login
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
