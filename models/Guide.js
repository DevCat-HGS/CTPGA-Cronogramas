const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GuideSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
  tags: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['teorica', 'practica', 'evaluativa', 'complementaria'],
    default: 'teorica'
  },
  difficulty: {
    type: String,
    enum: ['basica', 'intermedia', 'avanzada'],
    default: 'intermedia'
  },
  estimatedTime: {
    type: Number, // Tiempo estimado en minutos
    default: 60
  },
  additionalResources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['video', 'documento', 'enlace', 'imagen', 'otro'],
      default: 'enlace'
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  activity: {
    type: Schema.Types.ObjectId,
    ref: 'Activity'
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

module.exports = mongoose.model('Guide', GuideSchema);