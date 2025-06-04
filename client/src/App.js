import {BrowserRouter as Router, Routes, Route } from 'react-touter-dom'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Listings from './pages/Listings'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'


function App() {
  return(
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}


export default App

