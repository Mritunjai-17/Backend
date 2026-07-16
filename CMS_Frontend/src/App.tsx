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
    backgroundColor: '#090d16',
    color: '#f8fafc',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    paddingTop: '6rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
    backgroundColor: '#090d16',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid rgba(99, 102, 241, 0.1)',
    borderTopColor: '#6366f1',
  }
};

export default App;
