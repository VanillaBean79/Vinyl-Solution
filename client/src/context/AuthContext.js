import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check session on initial load
  useEffect(() => {
    fetch('/check_session', { credentials: 'include' }) 
      .then((res) => {
        if (res.ok) {
          return res.json().then(setCurrentUser);
        }
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
  };

  const logout = () => {
    fetch('/logout', { method: 'DELETE', credentials: 'include' })
      .then(() => setCurrentUser(null))
      .catch((err) => console.error('Logout error:', err));
  };

  return (
    <AuthContext.Provider value={{ currentUser, 
    login, 
    logout, 
    authChecked,
    setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
