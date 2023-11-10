const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    default: 'offline'
  }
});

module.exports = mongoose.model('User', userSchema);