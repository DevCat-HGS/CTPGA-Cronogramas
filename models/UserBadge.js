const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserBadgeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badge: {
    type: Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
});

// Índice compuesto para evitar duplicados
UserBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

module.exports = mongoose.model('UserBadge', UserBadgeSchema);