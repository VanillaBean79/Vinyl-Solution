import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

function UserListings() {
  const { currentUser, login } = useContext(AuthContext);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [userListings, setUserListings] = useState([]);

  function refreshUser() {
    fetch('http://localhost:5555/check_session', { credentials: 'include' })
      .then((res) => res.json())
      .then(login);
  }

  useEffect(() => {
    if (currentUser && currentUser.records) {
      const listings = currentUser.records.flatMap((record) =>
        record.listings.map((listing) => ({
          ...listing,
          recordTitle: record.title,
          recordArtist: record.artist,
        }))
      );
      setUserListings(listings);
    }
  }, [currentUser]);

  function handleEdit(listing) {
    setEditingId(listing.id);
    setEditData({ ...listing });
  }

  function handleEditChange(e) {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  }

  function handleEditSubmit(e) {
    e.preventDefault();
    fetch(`http://localhost:5555/listings/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...editData, price: parseFloat(editData.price) }),
    }).then((res) => {
      if (res.ok) {
        setEditingId(null);
        refreshUser();
      } else {
        alert('Failed to update listing.');
      }
    });
  }

  function handleDelete(listingId) {
    if (!window.confirm('Are you sure?')) return;
    fetch(`http://localhost:5555/listings/${listingId}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then((res) => {
      if (res.ok) refreshUser();
      else alert('Failed to delete listing.');
    });
  }

  if (!currentUser) return <p>Loading user info...</p>;
  if (!userListings.length) return <p>You have no listings yet.</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Your Listings</h2>
      {userListings.map((listing) => {
        const priceFormatted = !isNaN(listing.price) ? Number(listing.price).toFixed(2) : '0.00';
        return (
          <div
            key={listing.id}
            style={{
              border: '1px solid #ccc',
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '6px',
            }}
          >
            <h3>
              {listing.recordTitle} by {listing.recordArtist}
            </h3>
            {editingId === listing.id ? (
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  name="price"
                  type="number"
                  value={editData.price}
                  onChange={handleEditChange}
                  placeholder="Price"
                  required
                  style={{ flex: '1' }}
                />
                <button type="submit">Save</button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  style={{ backgroundColor: '#f44336', color: '#fff' }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <p>
                  <strong>Price:</strong> ${priceFormatted}
                </p>
                <p>
                  <strong>Location:</strong> {listing.location || 'N/A'}
                </p>
                <p>
                  <strong>Condition:</strong> {listing.condition || 'N/A'}
                </p>
                <p>
                  <strong>Type:</strong> {listing.listing_type}
                </p>
                <p>{listing.description}</p>
                {listing.image_url && (
                  <img
                    src={listing.image_url}
                    alt={`${listing.recordTitle} cover`}
                    style={{ maxWidth: '150px', marginBottom: '0.5rem' }}
                  />
                )}
                <button onClick={() => handleEdit(listing)}>Edit</button>
                <button
                  onClick={() => handleDelete(listing.id)}
                  style={{ marginLeft: '0.5rem', backgroundColor: '#f44336', color: '#fff' }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default UserListings;
