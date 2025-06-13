import React, { useState, useEffect } from 'react';

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetch('/favorites', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setFavorites(data);
      });
  }, []);

  if (!favorites.length) return <p>You have no favorites yet.</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Your Favorites</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {favorites.map((fav) => {
          const listing = fav.listing;
          const record = listing.record;

          return (
            <div
              key={fav.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '6px',
                padding: '0.75rem',
                backgroundColor: '#fafafa',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              }}
            >
              {listing.image_url && (
                <img
                  src={listing.image_url}
                  alt={`${record.title} cover`}
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                  }}
                />
              )}
              <h3 style={{ fontSize: '1rem', margin: '0.5rem 0' }}>
                {record.title} by {record.artist}
              </h3>
              <p style={{ margin: '0.25rem 0' }}>
                <strong>Price:</strong> ${Number(listing.price).toFixed(2)}
              </p>
              <p style={{ margin: '0.25rem 0' }}>
                <strong>Condition:</strong> {listing.condition || 'N/A'}
              </p>
              <p style={{ margin: '0.25rem 0' }}>
                <strong>Location:</strong> {listing.location || 'N/A'}
              </p>
              <p style={{ margin: '0.25rem 0' }}>
                <strong>Type:</strong> {listing.listing_type}
              </p>
              {listing.description && (
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {listing.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FavoritesPage;
