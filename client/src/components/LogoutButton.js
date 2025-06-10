import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function LogoutButton() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();             // this calls the logout function from context
    navigate('/login');   // redirect to login after logout
  }

  return (
    <button onClick={handleLogout}>
      Log Out
    </button>
  );
}

export default LogoutButton;
