import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
        />

        {/* Protected Routes - Temporary Dashboard */}
        <Route
          path="/dashboard"
          element={user ? <TempDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

// Temporary Dashboard until we create the real one
function TempDashboard({ user, onLogout }) {
  return (
    <div>
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">🤖 CEA</div>
          <ul className="navbar-menu">
            <li><span style={{ color: '#6b7280' }}>{user.name}</span></li>
            <li>
              <button onClick={onLogout} className="btn btn-outline">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="page">
        <div className="container">
          <div className="card">
            <div className="card-header">
              <h1 className="card-title">✅ Login Successful!</h1>
              <p className="card-description">Welcome, {user.name}!</p>
            </div>
            <div>
              <p>Your account:</p>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                <li>Email: {user.email}</li>
                <li>Business: {user.businessName}</li>
              </ul>
              <div className="alert alert-success mt-3">
                🎉 Frontend is working! Backend is connected!
              </div>
              <p style={{ marginTop: '1rem', color: '#6b7280' }}>
                Next: We'll add the Dashboard, Forms, and Leads pages!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;