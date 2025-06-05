// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { currentUser } = useContext(AuthContext);

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.link}>Home</Link>
      {currentUser ? (
        <>
          <Link to="/profile" style={styles.link}>Dashboard</Link>
          <Link to="/profile/new-listing" style={styles.link}>New Listing</Link>
          <Link to="/profile/listings" style={styles.link}>My Listings</Link>
        </>
      ) : (
        <>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/signup" style={styles.link}>Sign Up</Link>
        </>
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
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default Navbar;
