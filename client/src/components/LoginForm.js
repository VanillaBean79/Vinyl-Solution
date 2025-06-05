import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GitHubLoginButton from './GitHubLoginButton';


function LoginForm() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    fetch('http://localhost:5555/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // << Add this
        body: JSON.stringify(formData),
        })
    .then((res) => {
      if (res.ok) {
        res.json().then((user) => {
          login(user);               // updates AuthContext
          navigate('/profile');     // redirect after login
        });
      } else {
        res.json().then((err) => setError(err.error || 'Login failed'));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label>
        Username:
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </label>

      <br />

      <label>
        Password:
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </label>

      <br />

      <button type="submit">Log In</button>
      <GitHubLoginButton />
    </form>
  );
}

export default LoginForm;
