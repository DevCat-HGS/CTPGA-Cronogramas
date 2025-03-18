const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const Guide = require('../models/Guide');
const Activity = require('../models/Activity');

// @route   POST api/feedback
// @desc    Crear un nuevo feedback o ticket
// @access  Private (todos los usuarios autenticados)
router.post(
  '/',
  [
    auth,
    [
      check('targetType', 'El tipo de objetivo es requerido').isIn(['guide', 'activity', 'system']),
      check('comment', 'El comentario es requerido').not().isEmpty(),
      check('rating', 'La calificación debe ser entre 1 y 5').optional().isInt({ min: 1, max: 5 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { targetType, targetId, rating, comment } = req.body;

      // Verificar que el targetId existe si no es feedback del sistema
      if (targetType !== 'system') {
        if (!targetId) {
          return res.status(400).json({ msg: 'ID del objetivo es requerido' });
        }

        // Verificar que el objetivo existe
        let target;
        if (targetType === 'guide') {
          target = await Guide.findById(targetId);
        } else if (targetType === 'activity') {
          target = await Activity.findById(targetId);
        }

        if (!target) {
          return res.status(404).json({ msg: `${targetType === 'guide' ? 'Guía' : 'Actividad'} no encontrada` });
        }
      }

      // Crear nuevo feedback
      const newFeedback = new Feedback({
        user: req.user.id,
        targetType,
        targetId: targetType !== 'system' ? targetId : undefined,
        rating: targetType !== 'system' ? rating : undefined,
        comment,
        status: 'pending'
      });

      const feedback = await newFeedback.save();

      // Emitir notificación a administradores (implementar con Socket.io)
      // io.to('admin').emit('notification', { type: 'new_feedback', feedbackId: feedback._id });

      res.json(feedback);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Objetivo no encontrado' });
      }
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   GET api/feedback
// @desc    Obtener todos los feedbacks con filtros opcionales
// @access  Private (admin, superadmin)
router.get('/', auth, async (req, res) => {
  try {
    // Verificar que el usuario sea admin o superadmin
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    // Construir filtros basados en query params
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.targetType) {
      filter.targetType = req.query.targetType;
    }

    if (req.query.user) {
      filter.user = req.query.user;
    }

    // Obtener feedbacks con paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email role')
      .populate({
        path: 'targetId',
        select: 'title',
        model: function(doc) {
          return doc.targetType === 'guide' ? 'Guide' : 'Activity';
        }
      });

    const total = await Feedback.countDocuments(filter);

    res.json({
      feedbacks,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/feedback/user
// @desc    Obtener feedbacks del usuario actual
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'targetId',
        select: 'title',
        model: function(doc) {
          return doc.targetType === 'guide' ? 'Guide' : 'Activity';
        }
      });

    res.json(feedbacks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/feedback/:id
// @desc    Obtener un feedback por ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.query.id)
      .populate('user', 'name email role')
      .populate({
        path: 'targetId',
        select: 'title',
        model: function(doc) {
          return doc.targetType === 'guide' ? 'Guide' : 'Activity';
        }
      });

    if (!feedback) {
      return res.status(404).json({ msg: 'Feedback no encontrado' });
    }

    // Verificar permisos
    if (
      req.user.role === 'instructor' &&
      feedback.user.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Feedback no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT api/feedback/:id/respond
// @desc    Responder a un feedback
// @access  Private (admin, superadmin)
router.put(
  '/:id/respond',
  [
    auth,
    [
      check('response', 'La respuesta es requerida').not().isEmpty(),
      check('status', 'El estado debe ser válido').isIn(['reviewed', 'resolved'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Verificar que el usuario sea admin o superadmin
      if (!['admin', 'superadmin'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Acceso denegado' });
      }

      const { response, status } = req.body;

      const feedback = await Feedback.findById(req.params.id);

      if (!feedback) {
        return res.status(404).json({ msg: 'Feedback no encontrado' });
      }

      // Actualizar feedback
      feedback.response = {
        text: response,
        respondedBy: req.user.id,
        respondedAt: Date.now()
      };
      feedback.status = status;
      feedback.updatedAt = Date.now();

      await feedback.save();

      // Emitir notificación al usuario que creó el feedback (implementar con Socket.io)
      // io.to(`user_${feedback.user}`).emit('notification', { type: 'feedback_response', feedbackId: feedback._id });

      res.json(feedback);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Feedback no encontrado' });
      }
      res.status(500).send('Error del servidor');
    }
  }
);

module.exports = router;