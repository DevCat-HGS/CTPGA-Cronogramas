const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TemplateSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['guide', 'activity', 'report'],
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  structure: {
    type: Object,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model('Template', TemplateSchema);