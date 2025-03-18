const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GuideVersionSchema = new Schema({
  guide: {
    type: Schema.Types.ObjectId,
    ref: 'Guide',
    required: true
  },
  versionNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  introduction: {
    type: String,
    required: true
  },
  objectives: [{
    type: String,
    required: true
  }],
  materials: [{
    type: String
  }],
  development: {
    type: String,
    required: true
  },
  evaluation: {
    type: String,
    required: true
  },
  resources: [{
    type: String
  }],
  additionalResources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['video', 'documento', 'enlace', 'imagen', 'otro'],
      default: 'enlace'
    }
  }],
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changeDescription: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GuideVersion', GuideVersionSchema);