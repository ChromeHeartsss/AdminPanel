import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Register = () => {
  const [message, setMessage] = useState('');
  const [userIds, setUserIds] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {

    async function fetchUserIds() {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        setUserIds(response.data.map(user => ({ ...user, status: 'offline', highlighted: false, animationKey: 0 })));
      } catch (error) {
        console.error('Error fetching user IDs:', error);
      }
    }

    fetchUserIds();

    const handleUserStatusChanged = ({ userId, status }) => {
      setUserIds(prevUserIds =>
        prevUserIds.map(user =>
          user.id === userId ? { ...user, status } : user
        )
      );
    };

    socket.on('highlightUser', (userId) => {
      setUserIds(prevUserIds =>
        prevUserIds.map(user =>
          user.id === userId ? { ...user, highlighted: true } : user
        )
      );
    
      setTimeout(() => {
        setUserIds(prevUserIds =>
          prevUserIds.map(user =>
            user.id === userId ? { ...user, highlighted: false } : user
          )
        );
      }, 10000);
    });
    


    socket.on('userStatusChanged', handleUserStatusChanged);

    return () => {
      socket.off('userStatusChanged', handleUserStatusChanged);
    };
  }, []);

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/register');
      const newUserId = response.data.id;
      setUserIds(prevUserIds => [...prevUserIds, { id: newUserId, status: 'offline' }]);
      setMessage(`User created with ID: ${newUserId}`);
    } catch (error) {
      setMessage('Registration failed');
      console.error('There was an error!', error);
    }
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    socket.emit('sendMessage', { message: inputMessage });
    setInputMessage('');
  };

  const handleDeleteAllUsers = async () => {
    try {
      await axios.delete('http://localhost:5000/api/users');
      setUserIds([]);
      setMessage('All users deleted successfully');
    } catch (error) {
      setMessage('Failed to delete users');
      console.error('Error deleting users:', error);
    }
  };

  return (
    <div>
      <button onClick={handleRegister}>Register</button>
      <button onClick={handleDeleteAllUsers}>Delete All Users</button>
      <p>{message}</p>
      <div>
        <h2>User IDs:</h2>
        <ul>
          {userIds.map((user) => (
            <li
              key={user.id}
              className={user.highlighted ? 'highlighted' : ''}
            >
              {user.id} - {user.status}
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={handleMessageSubmit}>
        <label>
          Enter message:
          <input
            type="text"
            name="message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
        </label>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Register;
