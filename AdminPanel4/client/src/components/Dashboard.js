import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import ModalComponent from './ModalComponent';
import { jwtDecode } from 'jwt-decode';

const socket = io('http://localhost:5000');

const Dashboard = () => {
  const [modalData, setModalData] = useState(null);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);

      const handleMessageToDisplay = (data) => {
        setModalData({ ...data, id: decoded.id });
      };

      const handleCloseModal = () => {
        setModalData(null);
      };

      socket.emit('authenticate', decoded.id);
      socket.on('messageToDisplay', handleMessageToDisplay);
      socket.on('closeModal', handleCloseModal);

      const expirationTime = (decoded.exp * 1000) - Date.now();
      const logoutTimer = setTimeout(() => {
        localStorage.removeItem('token');
        socket.emit('userLogout', decoded.id);
        navigate('/login');
      }, expirationTime);

      return () => {
        clearTimeout(logoutTimer);
        socket.off('messageToDisplay', handleMessageToDisplay);
        socket.off('closeModal', handleCloseModal);
      };
    } catch (error) {
      console.error('Ошибка с токноом:', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    socket.emit('userLogout', userId);
    navigate('/login');
  };

  const closeModal = () => {
    setModalData(null);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard, user ID: {userId}</p>
      <button onClick={handleLogout}>Logout</button>
      {modalData && (
        <ModalComponent data={modalData} onClose={closeModal} socket={socket} userId={userId} />
      )}
    </div>
  );
};

export default Dashboard;
