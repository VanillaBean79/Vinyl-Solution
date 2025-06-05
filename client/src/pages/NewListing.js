// src/pages/NewListing.js
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

function NewListing() {
  const { currentUser, login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    price: '',
    location: '',
    condition: '',
    listing_type: 'SALE',
    description: '',
    image_url: '',
  });

  function refreshUser() {
    fetch('http://localhost:5555/check_session', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then(login);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...formData,
      user_id: currentUser?.id,
      price: parseFloat(formData.price),
    };

    fetch('http://localhost:5555/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    }).then((res) => {
      if (res.ok) {
        setFormData({
          title: '',
          artist: '',
          price: '',
          location: '',
          condition: '',
          listing_type: 'SALE',
          description: '',
          image_url: '',
        });
        refreshUser();
      } else {
        alert('Failed to create listing.');
      }
    });
  }

  if (!currentUser) return <p>Loading user...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Create a New Listing</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Record Title"
          required
        />
        <input
          name="artist"
          value={formData.artist}
          onChange={handleChange}
          placeholder="Artist"
          required
        />
        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          required
        />
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
        />
        <input
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          placeholder="Condition"
        />
        <select name="listing_type" value={formData.listing_type} onChange={handleChange}>
          <option value="SALE">Sale</option>
          <option value="TRADE">Trade</option>
          <option value="Both">Both</option>
        </select>
        <input
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <input
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="Image URL"
        />
        <button type="submit">Add Listing</button>
      </form>
    </div>
  );
}

export default NewListing;
