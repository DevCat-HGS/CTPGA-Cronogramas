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
// @desc    Obtener todas las actividades con búsqueda avanzada
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { buildSearchQuery, buildPaginationOptions, buildSortOptions } = require('../utils/searchUtils');
    
    // Definir campos para búsqueda
    const textFields = ['title', 'description'];
    const exactFields = ['status', 'category'];
    const rangeFields = ['progress'];
    const arrayFields = ['tags'];
    
    // Construir query base
    let baseQuery = {};
    
    // Si es instructor, solo mostrar sus actividades
    if (req.user.role === 'instructor') {
      baseQuery.instructor = req.user.id;
    }
    
    // Construir query de búsqueda
    const searchQuery = buildSearchQuery(req.query, textFields, exactFields, rangeFields, arrayFields);
    
    // Combinar queries
    const finalQuery = { ...baseQuery, ...searchQuery };
    
    // Opciones de paginación
    const { page, limit, skip } = buildPaginationOptions(req.query);
    
    // Opciones de ordenamiento
    const sort = buildSortOptions(req.query);
    
    // Ejecutar consulta
    const activities = await Activity.find(finalQuery)
      .populate('instructor', ['name', 'email'])
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Contar total para metadata de paginación
    const total = await Activity.countDocuments(finalQuery);
    
    res.json({
      activities,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
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