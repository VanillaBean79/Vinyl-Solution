import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

function Favorites() {
  const { currentUser } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetch(`/users/${currentUser.id}`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(user => setFavorites(user.favorites || []));
    }
  }, [currentUser]);

  if (!favorites.length) return <p>No favorites yet.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Favorites</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {favorites.map(listing => (
          <div key={listing.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <img src={listing.image_url} alt={listing.record.title} style={{ width: '100%' }} />
            <h3>{listing.record.title} by {listing.record.artist}</h3>
            <p>{listing.description}</p>
            <p><strong>${listing.price}</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;
