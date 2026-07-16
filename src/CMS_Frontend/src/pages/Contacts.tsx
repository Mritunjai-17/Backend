

export default function Contacts() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Contact</h1>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    padding: '4rem 2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  }
};
