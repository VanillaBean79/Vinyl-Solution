// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import UserListings from './pages/UserListings';
import NewListing from './pages/NewListing';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import AuthTest from './components/AuthTest';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import Cart from './pages/Cart'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/auth-test" element={<AuthTest />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/listings"
            element={
              <ProtectedRoute>
                <UserListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/new-listing"
            element={
              <ProtectedRoute>
                <NewListing />
              </ProtectedRoute>
            }
          />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
