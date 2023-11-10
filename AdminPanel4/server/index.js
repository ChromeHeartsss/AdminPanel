const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const jwt = require('jsonwebtoken');
const { Server } = require("socket.io");
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 5000;
const secret = 'testsecretkey123';

//MongoDB
mongoose.connect('mongodb://localhost:27017/usersdatabaseAP4', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));


app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const userSockets = {};


io.on('connection', (socket) => {

  socket.on('authenticate', (userId) => {
    userSockets[userId] = socket.id;
    io.emit('userStatusChanged', { userId, status: 'online' });
  });

  socket.on('userDisconnect', (userId) => {
    if (userSockets[userId]) {
      delete userSockets[userId];
      io.emit('userStatusChanged', { userId, status: 'offline' });
    }
  });

  socket.on('userLogout', (userId) => {
    if (userSockets[userId]) {
      delete userSockets[userId];
      io.emit('userStatusChanged', { userId, status: 'offline' });
    }
  });

  socket.on('disconnect', () => {
    const userId = getUserIdBySocketId(socket.id);
    if (userId) {
      delete userSockets[userId];
      io.emit('userStatusChanged', { userId, status: 'offline' });
    }
  });

  socket.on('sendMessage', (data) => {
    io.emit('messageToDisplay', { message: data.message });
  });

  socket.on('userClickedOk', (userId) => {
    console.log('userClickedOK')
    io.emit('highlightUser', userId);
  });
  
});

function getUserIdBySocketId(socketId) {
  return Object.keys(userSockets).find(userId => userSockets[userId] === socketId);
}

app.post('/api/login', async (req, res) => {
  try {
    const { id } = req.body;

    const user = await User.findOne({ id });
    if (user) {

      const token = jwt.sign({ id: user.id }, secret, { expiresIn: '5m' });
      res.json({ status: 'ok', token });
    } else {
      res.status(400).json({ error: 'Invalid ID' });
    }
  } catch (error) {
    console.error('Error during authentication', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const id = Math.floor(1000 + Math.random() * 9000).toString();
    const newUser = new User({ id });
    const savedUser = await newUser.save();
    res.status(201).json({ status: 'ok', id: savedUser.id });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'id');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.delete('/api/users', async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ message: 'All users deleted successfully' });
  } catch (error) {
    console.error('Error deleting users:', error);
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
