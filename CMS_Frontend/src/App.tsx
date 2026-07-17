import { useState, useEffect } from 'react';
import { apiService } from './services/api';
import DashboardNavbar from './components/DashboardNavbar';
import Blogs from './pages/Blogs';
import Portfolios from './pages/Portfolios';
import Contacts from './pages/Contacts';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('blogs');
  const [loading, setLoading] = useState<boolean>(true);

  // Check session status on startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await apiService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setActiveTab('blogs');
        } else {
          setUser(null);
          setActiveTab('login');
        }
      } catch (err) {
        setUser(null);
        setActiveTab('login');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    setActiveTab('blogs');
  };

  const handleLogout = async () => {
    await apiService.logout();
    setUser(null);
    setActiveTab('login');
  };

  const renderPage = () => {
    if (!user) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    switch (activeTab) {
      case 'blogs':
        return <Blogs />;
      case 'portfolio':
        return <Portfolios />;
      case 'contact':
        return <Contacts />;
      default:
        return <Blogs />;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
        <span style={{ marginTop: '1rem', color: '#94a3b8' }}>
          Initializing CMS Portal...
        </span>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      {/* Midis Logo in top-left corner */}
      {user && (
        <a href="https://www.midis.in/" target="_blank" rel="noopener noreferrer" style={styles.logoLink}>
          <img 
            src="https://www.midis.in/images/midis%20final%20logo-01.png" 
            alt="Midis Logo" 
            style={styles.logoImg} 
          />
        </a>
      )}

      {/* Floating Centered Pill Navbar - Rendered ONLY when logged in */}
      {user && (
        <DashboardNavbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
        />
      )}

      {/* Main Page Area */}
      <main style={styles.mainContent}>
        {renderPage()}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    paddingTop: '6rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoLink: {
    position: 'fixed',
    top: '1.5rem',
    left: '2.5rem',
    zIndex: 1001,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  logoImg: {
    height: '24px',
    width: 'auto',
    objectFit: 'contain',
  },
  mainContent: {
    width: '100%',
    maxWidth: '1200px',
    padding: '0 2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  loadingScreen: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-primary)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid var(--border-color)',
    borderTopColor: 'var(--primary)',
  }
};

export default App;
