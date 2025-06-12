import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

function NewListing() {
  const { currentUser, login } = useContext(AuthContext);

  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState('');
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
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetch('/records', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(err => console.error('Failed to fetch records:', err));
  }, []);

  useEffect(() => {
    if (selectedRecordId) {
      const selected = records.find(r => r.id === parseInt(selectedRecordId));
      if (selected) {
        setFormData(prev => ({
          ...prev,
          title: selected.title,
          artist: selected.artist,
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, title: '', artist: '' }));
    }
  }, [selectedRecordId, records]);

  function refreshUser() {
    fetch('/check_session', { credentials: 'include' })
      .then((res) => res.json())
      .then(login);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formDataToSend = new FormData();
    formDataToSend.append('image', file);

    try {
      const res = await fetch('/upload_image', {
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

  async function handleSubmit(e) {
  e.preventDefault();
  setSubmitError(null);

  // Build payload depending on whether a record is selected
  let payload = {
    user_id: currentUser?.id,
    price: parseFloat(formData.price),
    location: formData.location,
    condition: formData.condition,
    listing_type: formData.listing_type,
    description: formData.description,
    image_url: formData.image_url,
  };

  if (formData.record_id) {
    // Use existing record ID only, no title or artist
    payload.record_id = formData.record_id;
  } else {
    // No existing record selected, need title and artist
    if (!formData.title || !formData.artist) {
      setSubmitError('Title and Artist are required for new records.');
      return;
    }
    payload.title = formData.title;
    payload.artist = formData.artist;
  }

  console.log("Submitting payload:", payload);

  try {
    const res = await fetch('/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setFormData({
        title: '',
        artist: '',
        record_id: '',
        price: '',
        location: '',
        condition: '',
        listing_type: 'SALE',
        description: '',
        image_url: '',
      });
      refreshUser();
    } else {
      const errorData = await res.json();
      setSubmitError(errorData.error || 'Failed to create listing.');
    }
  } catch {
    setSubmitError('Network error. Please try again.');
  }
}


  if (!currentUser) return <p>Loading user...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Create a New Listing</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <label>
          Select a Record:
          <select
            value={selectedRecordId}
            onChange={(e) => setSelectedRecordId(e.target.value)}
          >
            <option value="">-- New Record --</option>
            {records.map((rec) => (
              <option key={rec.id} value={rec.id}>
                {rec.title} by {rec.artist}
              </option>
            ))}
          </select>
        </label>

        {!selectedRecordId && (
          <>
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
          </>
        )}

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
        <select
          name="listing_type"
          value={formData.listing_type}
          onChange={handleChange}
        >
          <option value="SALE">Sale</option>
          <option value="TRADE">Trade</option>
          <option value="BOTH">Both</option>
        </select>
        <input
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
        />

        <label>
          Upload Photo (optional):
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
          />
        </label>

        {uploading && <p>Uploading image...</p>}
        {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
        {submitError && <p style={{ color: 'red' }}>{submitError}</p>}

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
