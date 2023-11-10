import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element=
              {
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
