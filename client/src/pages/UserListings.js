import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

function UserListings() {
  const { currentUser, login } = useContext(AuthContext);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  function refreshUser() {
    fetch('/check_session', { credentials: 'include' })
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
    fetch(`/listings/${editingId}`, {
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
    fetch(`/listings/${listingId}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then((res) => {
      if (res.ok) refreshUser();
      else alert('Failed to delete listing.');
    });
  }

  if (!currentUser) return <p>Loading user info...</p>;
  if (!currentUser.records?.length) return <p>You have no listings yet.</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Your Listings</h2>
      {currentUser.records.map((record) => (
        <div key={record.id} style={{ marginBottom: '2rem' }}>
          <h3>
            {record.title} by {record.artist}
          </h3>
          {record.listings.length === 0 ? (
            <p style={{ fontStyle: 'italic' }}>No listings for this record.</p>
          ) : (
            record.listings.map((listing) => {
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
                  {editingId === listing.id ? (
                    <form
                      onSubmit={handleEditSubmit}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                    >
                      <input
                        name="price"
                        type="number"
                        value={editData.price}
                        onChange={handleEditChange}
                        placeholder="Price"
                        required
                      />
                      <input
                        name="location"
                        type="text"
                        value={editData.location}
                        onChange={handleEditChange}
                        placeholder="Location"
                      />
                      <input
                        name="condition"
                        type="text"
                        value={editData.condition}
                        onChange={handleEditChange}
                        placeholder="Condition"
                      />
                      <select name="listing_type" value={editData.listing_type} onChange={handleEditChange}>
                        <option value="sale">Sale</option>
                        <option value="trade">Trade</option>
                        <option value="both">Both</option>
                      </select>
                      <input
                        name="image_url"
                        type="text"
                        value={editData.image_url}
                        onChange={handleEditChange}
                        placeholder="Image URL"
                      />
                      <textarea
                        name="description"
                        value={editData.description}
                        onChange={handleEditChange}
                        placeholder="Description"
                      />
                      <div>
                        <button type="submit">Save</button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          style={{ backgroundColor: '#f44336', color: '#fff', marginLeft: '0.5rem' }}
                        >
                          Cancel
                        </button>
                      </div>
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
                          alt={`${record.title} cover`}
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
            })
          )}
        </div>
      ))}
    </div>
  );
}

export default UserListings;

