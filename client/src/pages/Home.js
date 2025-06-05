import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Home() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div style={{ padding: '2rem' }}>
      {currentUser ? (
        <>
          <h1>Welcome back, {currentUser.username}!</h1>
          <p>Head over to your dashboard to manage your listings and favorites.</p>
          <Link to="/profile" style={styles.button}>Go to Dashboard</Link>
        </>
      ) : (
        <>
          <h1>Welcome to The Vinyl Solution 🎵</h1>
          <p>Discover, buy, and sell your favorite vinyl records with music lovers near you.</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/login" style={styles.button}>Login</Link>
            <Link to="/signup" style={{ ...styles.button, marginLeft: '1rem' }}>Sign Up</Link>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  button: {
    display: 'inline-block',
    padding: '0.6rem 1.2rem',
    backgroundColor: '#333',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
};

export default Home;
