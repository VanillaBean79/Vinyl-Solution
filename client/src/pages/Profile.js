import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import LogoutButton from '../components/LogoutButton';

function Profile() {
  const { currentUser, login } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]); // ✅ fixed destructuring

  // Fetch user's favorites
  useEffect(() => {
    fetch('http://localhost:5555/favorites', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then(setFavorites)
      .catch((err) => console.error('Failed to fetch favorites:', err));
  }, []);

  // Handle listing deletion
  function handleDelete(listingId) {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    fetch(`http://localhost:5555/listings/${listingId}`, {
      method: 'DELETE',
      credentials: 'include', // ✅ corrected typo
    })
      .then((res) => {
        if (res.ok) {
          // Refresh session to get updated listings
          return fetch('http://localhost:5555/check_session', {
            credentials: 'include',
          });
        } else {
          throw new Error('Failed to delete listing.');
        }
      })
      .then((res) => res.json())
      .then(login) // update context with new user data
      .catch((err) => alert(err.message));
  }

  if (!currentUser) return <p>Loading or not logged in...</p>;

  return (
    <div>
      <h1>Welcome, {currentUser.username}!</h1>
      <p>Email: {currentUser.email}</p>
      <LogoutButton />

      <h2>Your Listings</h2>
      {Array.isArray(currentUser.records) && currentUser.records.length > 0 ? (
        currentUser.records.map((record) => (
          <div key={record.id}>
            <h3>{record.title} by {record.artist}</h3>

            {Array.isArray(record.listings) && record.listings.length > 0 ? (
              record.listings.map((listing) => (
                <div
                  key={listing.id}
                  style={{
                    paddingLeft: "1rem",
                    borderLeft: "2px solid #ccc",
                    marginBottom: "10px",
                  }}
                >
                  <p>Price: ${listing.price}</p>
                  <p>Condition: {listing.condition}</p>
                  <p>Location: {listing.location}</p>
                  <p>Type: {listing.listing_type}</p>
                  <p>{listing.description}</p>
                  <button onClick={() => handleDelete(listing.id)}>Delete</button>
                </div>
              ))
            ) : (
              <p style={{ paddingLeft: "1rem" }}>No listings for this record.</p>
            )}
          </div>
        ))
      ) : (
        <p>You have no records or listings yet.</p>
      )}

      <h2>Your Favorites</h2>
      {favorites.length > 0 ? (
        favorites.map((fav) => (
          <div key={fav.id} style={{ marginBottom: '1rem' }}>
            <p><strong>Record:</strong> {fav.listing?.record?.title} by {fav.listing?.record?.artist}</p>
            <p><strong>Price:</strong> ${fav.listing?.price}</p>
            <p><strong>Seller:</strong> {fav.listing?.user?.username}</p>
          </div>
        ))
      ) : (
        <p>You haven't favorited any listings yet.</p>
      )}
    </div>
  );
}

export default Profile;
