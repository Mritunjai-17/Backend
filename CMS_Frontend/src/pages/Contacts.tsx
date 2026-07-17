import { useState, type FormEvent } from 'react';
import { apiService } from '../services/api';
import { Mail, Send, Loader2 } from 'lucide-react';
import { InputField } from '../components/FormElements';

export default function Contacts() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Web Development');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const services = [
    'Web Development',
    'Graphic Designing',
    'Digital Marketing',
    'SEO Optimization',
    'Social Media Management',
    'Content Writing',
    'Brand Identity',
    'Other'
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // Frontend validations
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setErrorMsg('Full name is required.');
      return;
    }

    if (!trimmedEmail) {
      setErrorMsg('Email address is required.');
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    if (!trimmedMessage) {
      setErrorMsg('Message is required.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiService.submitContactForm({
        fullName: trimmedName,
        email: trimmedEmail,
        phone: phone.trim(),
        service,
        message: trimmedMessage
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Thank you for contacting us. We will get back to you shortly.');
        // Reset form
        setFullName('');
        setEmail('');
        setPhone('');
        setService('Web Development');
        setMessage('');
      } else {
        setErrorMsg('Failed to submit. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <Mail size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={styles.title}>Get In Touch</h2>
          <p style={styles.subtitle}>Have a project in mind? Let's build something great together.</p>
        </div>

        {successMsg && (
          <div className="alert-banner alert-banner-success" style={styles.alert}>
            <span style={{ fontSize: '0.9rem' }}>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="alert-banner alert-banner-error" style={styles.alert}>
            <span style={{ fontSize: '0.9rem' }}>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <InputField
            label="Full Name"
            type="text"
            placeholder="e.g. John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            required
          />

          <div style={styles.row}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <InputField
                label="Email Address"
                type="email"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <InputField
                label="Phone Number (Optional)"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Required</label>
            <select
              className="form-input"
              value={service}
              onChange={(e) => setService(e.target.value)}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {services.map((svc) => (
                <option key={svc} value={svc} style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  {svc}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-input"
              placeholder="Tell us about your project details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              required
              style={{ minHeight: '120px' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spinner-loader" style={styles.btnSpinner} />
                Sending Message...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem 1.5rem',
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: '650px',
    padding: '2.5rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    backgroundColor: 'var(--primary-glow)',
    borderRadius: 'var(--border-radius-md)',
    marginBottom: '1rem',
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
    marginTop: '0.5rem',
    maxWidth: '450px',
  },
  alert: {
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  row: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  submitBtn: {
    width: '100%',
    padding: '0.75rem',
    marginTop: '1rem',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  btnSpinner: {
    animation: 'spin 1s linear infinite',
    marginRight: '0.25rem',
  }
};
