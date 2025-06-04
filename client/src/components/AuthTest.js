// client/src/components/AuthTest.js

import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuthTest = () => {
  const { currentUser, login, logout, authChecked } = useContext(AuthContext);

  if (!authChecked) return <p>Checking session...</p>;

  return (
    <div>
      <h2>Auth Test</h2>
      {currentUser ? (
        <>
          <p>Welcome, {currentUser.username}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <p>You are not logged in.</p>
          <button
            onClick={() =>
              login({ username: 'TestUser', id: 123 })
            }
          >
            Simulate Login
          </button>
        </>
      )}
    </div>
  );
};

export default AuthTest;
