import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Spinner.css'; // Create this CSS file or use inline styles

function ProtectedRoute({ children }) {
  const { currentUser, authChecked } = useContext(AuthContext);

  if (!authChecked) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
