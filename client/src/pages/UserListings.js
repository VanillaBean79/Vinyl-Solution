import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

function UserListings() {
  const { currentUser, login } = useContext(AuthContext);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  function refreshUser() {
    fetch('http://localhost:5555/check_session', { credentials: 'include' })
      .then((res) => res.json())
      .then(login);
  }

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
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    fetch(`http://localhost:5555/listings/${listingId}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then((res) => {
      if (res.ok) refreshUser();
      else alert('Failed to delete listing.');
    });
  }

  if (!currentUser) return <p>Loading...</p>;

  const hasRecords = Array.isArray(currentUser.records) && currentUser.records.length > 0;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Listings</h2>
      {hasRecords ? (
        currentUser.records.map((record) => (
          <div key={record.id} style={{ marginBottom: '2rem' }}>
            <h3>{record.title} by {record.artist}</h3>
            {Array.isArray(record.listings) && record.listings.length > 0 ? (
              record.listings.map((listing) => (
                <div key={listing.id} style={{ paddingLeft: '1rem', borderLeft: '3px solid #ddd', marginBottom: '1rem' }}>
                  {editingId === listing.id ? (
                    <form onSubmit={handleEditSubmit}>
                      <input
                        name="price"
                        type="number"
                        value={editData.price}
                        onChange={handleEditChange}
                        placeholder="Price"
                        style={{ marginRight: '0.5rem' }}
                      />
                      <button type="submit">Save</button>
                      <button type="button" onClick={() => setEditingId(null)} style={{ marginLeft: '0.5rem' }}>
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <p><strong>Price:</strong> ${listing.price}</p>
                      <p><strong>Condition:</strong> {listing.condition}</p>
                      <p><strong>Location:</strong> {listing.location}</p>
                      <p><strong>Type:</strong> {listing.listing_type}</p>
                      <p>{listing.description}</p>
                      <button onClick={() => handleEdit(listing)}>Edit</button>
                      <button onClick={() => handleDelete(listing.id)} style={{ marginLeft: '0.5rem' }}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p style={{ paddingLeft: '1rem' }}>No listings for this record.</p>
            )}
          </div>
        ))
      ) : (
        <p>You have no records or listings yet.</p>
      )}
    </div>
  );
}

export default UserListings;
