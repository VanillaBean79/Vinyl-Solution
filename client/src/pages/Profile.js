// src/pages/Profile.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LogoutButton from '../components/LogoutButton';

function Profile() {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) return <p>Loading or not logged in...</p>;

  return (
    <div>
      <h1>Welcome, {currentUser.username}!</h1>
      
      <LogoutButton />
    </div>
  );
}

export default Profile;
