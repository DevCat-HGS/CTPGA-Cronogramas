const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalyticsSchema = new Schema({
  itemType: {
    type: String,
    enum: ['guide', 'activity'],
    required: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType'
  },
  views: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  ratings: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeSpent: {
    type: Number, // Tiempo promedio en segundos
    default: 0
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

// Índice compuesto para búsquedas eficientes
AnalyticsSchema.index({ itemType: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);