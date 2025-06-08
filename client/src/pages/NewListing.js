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

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  function refreshUser() {
    fetch('http://localhost:5555/check_session', { credentials: 'include' })
      .then((res) => res.json())
      .then(login);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Handle image file selection & upload
  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formDataToSend = new FormData();
    formDataToSend.append('image', file);

    try {
      const res = await fetch('http://localhost:5555/upload_image', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
      });

      if (!res.ok) throw new Error('Image upload failed');

      const data = await res.json();
      setFormData((prev) => ({ ...prev, image_url: data.image_url }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
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

        {/* New file input for image */}
        <label>
          Upload Photo (optional):
          <input
            type="file"
            accept="image/*"
            capture="environment"  // allows using camera on phones
            onChange={handleImageChange}
          />
        </label>

        {uploading && <p>Uploading image...</p>}
        {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}

        {/* Preview uploaded image */}
        {formData.image_url && (
          <div>
            <p>Uploaded Image Preview:</p>
            <img
              src={formData.image_url}
              alt="Uploaded preview"
              style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
            />
          </div>
        )}

        <button type="submit" disabled={uploading}>
          Add Listing
        </button>
      </form>
    </div>
  );
}

export default NewListing;
