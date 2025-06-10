import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

function Home() {
  const { currentUser } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    fetch('/listings', {credential: 'include'})
      .then(res => res.json())
      .then(data => {
        console.log('Fetched listings:', data);
        setListings(data);
      })
      .catch(err => console.error('Error fetching listings:', err));
  }, []);

  const handleAddToCart = (listing) => {
    addToCart(listing);
  };

  const handleAddToFavorites = (listingId) => {
    if (!currentUser) return;

    fetch('/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user_id: currentUser.id, listing_id: listingId }),
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || 'Listing favorited!');
      })
      .catch(err => console.error('Error favoriting listing:', err));
  };

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

      <hr style={{ margin: '2rem 0' }} />
      <h2>Latest Listings</h2>
      <div style={styles.grid}>
        {listings.map(listing => (
          <div key={listing.id} style={styles.card}>
            <img
              src={listing.image_url || '/default-album-cover.jpg'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-album-cover.jpg';
              }}
              alt={listing.record?.title || 'Album Cover'}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />

            <h3>{listing.record.title} by {listing.record.artist}</h3>
            <p><strong>Condition:</strong> {listing.condition}</p>
            <p><strong>Price:</strong> ${listing.price}</p>
            <p><strong>Seller:</strong> {listing.user.username}</p>

            {currentUser && (
              <>
                <button
                  style={styles.purchaseButton}
                  onClick={() => handleAddToCart(listing)}
                >
                  Add to Cart
                </button>
                <button
                  style={styles.favoriteButton}
                  onClick={() => handleAddToFavorites(listing.id)}
                >
                  ❤️ Favorite
                </button>
              </>
            )}
          </div>
        ))}
      </div>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    border: '1px solid #ddd',
    padding: '1rem',
    borderRadius: '6px',
    backgroundColor: '#fafafa',
  },
  purchaseButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#008080',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
  favoriteButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#f06292',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Home;
