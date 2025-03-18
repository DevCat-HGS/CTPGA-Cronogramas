const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['guide', 'activity', 'system'],
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    refPath: 'targetType',
    required: function() {
      return this.targetType !== 'system';
    }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: function() {
      return this.targetType !== 'system';
    }
  },
  comment: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  response: {
    text: String,
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);