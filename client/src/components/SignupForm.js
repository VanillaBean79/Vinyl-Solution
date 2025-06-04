import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function SignupForm() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState(null);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    fetch('http://localhost:5555/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((r) => {
        if (r.ok) {
          return r.json().then((user) => {
            login(user);
            navigate('/profile');
          });
        } else {
          return r.json().then((err) => setErrors(err.error || 'Signup failed'));
        }
      })
      .catch(() => setErrors('Network error. Please try again.'));
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>

      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username"
        required
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        type="email"
        required
      />
      <input
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        type="password"
        required
      />
      <button type="submit">Sign Up</button>

      {errors && <p style={{ color: 'red' }}>{errors}</p>}
    </form>
  );
}

export default SignupForm;
