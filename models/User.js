const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'instructor'],
    default: 'instructor'
  },
  area: {
    type: String,
    required: function() {
      return this.role === 'admin';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'rejected'],
    default: 'pending'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);