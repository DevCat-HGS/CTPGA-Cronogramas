const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');
const User = require('../models/User');

// @route   POST api/activities
// @desc    Crear una nueva actividad
// @access  Private (instructor, admin, superadmin)
router.post(
  '/',
  [
    auth,
    [
      check('title', 'El título es requerido').not().isEmpty(),
      check('description', 'La descripción es requerida').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, deadline } = req.body;

      // Crear nueva actividad
      const newActivity = new Activity({
        title,
        description,
        instructor: req.user.id,
        deadline: deadline ? new Date(deadline) : null
      });

      const activity = await newActivity.save();

      res.json(activity);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   GET api/activities
// @desc    Obtener todas las actividades
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let activities;

    // Si es instructor, solo mostrar sus actividades
    if (req.user.role === 'instructor') {
      activities = await Activity.find({ instructor: req.user.id })
        .populate('instructor', ['name', 'email'])
        .sort({ createdAt: -1 });
    } else {
      // Si es admin o superadmin, mostrar todas las actividades
      activities = await Activity.find()
        .populate('instructor', ['name', 'email'])
        .sort({ createdAt: -1 });
    }

    res.json(activities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/activities/:id
// @desc    Obtener una actividad por ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('instructor', ['name', 'email'])
      .populate('guides');

    if (!activity) {
      return res.status(404).json({ msg: 'Actividad no encontrada' });
    }

    // Verificar si el usuario tiene permiso para ver la actividad
    if (
      req.user.role === 'instructor' &&
      activity.instructor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    res.json(activity);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Actividad no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT api/activities/:id
// @desc    Actualizar una actividad
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'El título es requerido').not().isEmpty(),
      check('description', 'La descripción es requerida').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, deadline, status, progress } = req.body;

      // Buscar la actividad
      let activity = await Activity.findById(req.params.id);

      if (!activity) {
        return res.status(404).json({ msg: 'Actividad no encontrada' });
      }

      // Verificar si el usuario tiene permiso para actualizar la actividad
      if (
        req.user.role === 'instructor' &&
        activity.instructor.toString() !== req.user.id
      ) {
        return res.status(403).json({ msg: 'Acceso denegado' });
      }

      // Actualizar campos
      activity.title = title;
      activity.description = description;
      activity.deadline = deadline ? new Date(deadline) : activity.deadline;
      if (status) activity.status = status;
      if (progress !== undefined) activity.progress = progress;
      activity.updatedAt = Date.now();

      await activity.save();

      res.json(activity);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Actividad no encontrada' });
      }
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   DELETE api/activities/:id
// @desc    Eliminar una actividad
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Buscar la actividad
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ msg: 'Actividad no encontrada' });
    }

    // Verificar si el usuario tiene permiso para eliminar la actividad
    if (
      req.user.role === 'instructor' &&
      activity.instructor.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    await activity.remove();

    res.json({ msg: 'Actividad eliminada' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Actividad no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;