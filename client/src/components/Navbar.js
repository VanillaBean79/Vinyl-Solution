// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.link}>Home</Link>
      {currentUser ? (
        <>
          <Link to="/profile" style={styles.link}>Dashboard</Link>
          <Link to="/profile/new-listing" style={styles.link}>New Listing</Link>
          <Link to="/profile/listings" style={styles.link}>My Listings</Link>
          <Link to="/favorites" style={styles.link}>Favorites</Link>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Log Out
          </button>
        </>
      ) : (
        !isHome && (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/signup" style={styles.link}>Sign Up</Link>
          </>
        )
      )}
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#333',
    padding: '1rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff4d4f',
    border: 'none',
    color: 'white',
    fontWeight: 'bold',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Navbar;
