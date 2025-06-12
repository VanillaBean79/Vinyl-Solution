import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

function UserListings() {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [carouselIndices, setCarouselIndices] = useState({});

  useEffect(() => {
    if (currentUser?.records) {
      const initialIndices = {};
      currentUser.records.forEach((record) => {
        initialIndices[record.id] = 0;
      });
      setCarouselIndices(initialIndices);
    }
  }, [currentUser]);

  const handleEdit = (listing) => {
    setEditingId(listing.id);
    setEditData({ ...listing });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    fetch(`/listings/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...editData, price: parseFloat(editData.price) }),
    }).then((res) => {
      if (res.ok) {
        setEditingId(null);

        const updatedListing = { ...editData, id: editingId };

        const updatedRecords = currentUser.records.map((record) => ({
          ...record,
          listings: record.listings.map((l) =>
            l.id === editingId ? updatedListing : l
          ),
        }));

        setCurrentUser({ ...currentUser, records: updatedRecords });
      } else {
        alert('Failed to update listing.');
      }
    });
  };

  const handleDelete = (listingId) => {
    if (!window.confirm('Are you sure?')) return;

    fetch(`/listings/${listingId}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then((res) => {
      if (res.ok) {
        const updatedRecords = currentUser.records.map((record) => ({
          ...record,
          listings: record.listings.filter((l) => l.id !== listingId),
        }));

        setCurrentUser({ ...currentUser, records: updatedRecords });
      } else {
        alert('Failed to delete listing.');
      }
    });
  };

  const handleNext = (recordId, listingsLength) => {
    setCarouselIndices((prev) => ({
      ...prev,
      [recordId]: (prev[recordId] + 1) % listingsLength,
    }));
  };

  const handlePrev = (recordId, listingsLength) => {
    setCarouselIndices((prev) => ({
      ...prev,
      [recordId]: (prev[recordId] - 1 + listingsLength) % listingsLength,
    }));
  };

  if (!currentUser) return <p>Loading user info...</p>;
  if (!currentUser.records?.length) return <p>You have no listings yet.</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Your Listings</h2>
      {currentUser.records.map((record) => {
        const listings = record.listings;
        const currentIndex = carouselIndices[record.id] || 0;
        const listing = listings[currentIndex];

        return (
          <div
            key={record.id}
            style={{
              border: '2px solid #333',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
            }}
          >
            <h3>{record.title} by {record.artist}</h3>

            {listings.length === 0 ? (
              <p style={{ fontStyle: 'italic' }}>No listings for this record.</p>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button onClick={() => handlePrev(record.id, listings.length)} disabled={listings.length <= 1}>
                    ◀️
                  </button>

                  <div
                    style={{
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      padding: '1rem',
                      flex: 1,
                      margin: '0 1rem',
                      maxWidth: '100%',
                    }}
                  >
                    {editingId === listing.id ? (
                      <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                        <p><strong>Price:</strong> ${Number(listing.price).toFixed(2)}</p>
                        <p><strong>Location:</strong> {listing.location || 'N/A'}</p>
                        <p><strong>Condition:</strong> {listing.condition || 'N/A'}</p>
                        <p><strong>Type:</strong> {listing.listing_type}</p>
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

                  <button onClick={() => handleNext(record.id, listings.length)} disabled={listings.length <= 1}>
                    ▶️
                  </button>
                </div>
                <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  Listing {currentIndex + 1} of {listings.length}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default UserListings;
