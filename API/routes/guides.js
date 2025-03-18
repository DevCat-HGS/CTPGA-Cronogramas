const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Guide = require('../models/Guide');
const Activity = require('../models/Activity');

// @route   POST api/guides
// @desc    Crear una nueva guía
// @access  Private (instructor, admin, superadmin)
router.post(
  '/',
  [
    auth,
    [
      check('title', 'El título es requerido').not().isEmpty(),
      check('introduction', 'La introducción es requerida').not().isEmpty(),
      check('objectives', 'Los objetivos son requeridos').isArray({ min: 1 }),
      check('development', 'El desarrollo es requerido').not().isEmpty(),
      check('evaluation', 'La evaluación es requerida').not().isEmpty(),
      check('activity', 'La actividad asociada es requerida').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title,
        introduction,
        objectives,
        materials,
        development,
        evaluation,
        resources,
        tags,
        activity
      } = req.body;

      // Verificar si la actividad existe
      const activityDoc = await Activity.findById(activity);
      if (!activityDoc) {
        return res.status(404).json({ msg: 'Actividad no encontrada' });
      }

      // Verificar si el usuario es el instructor de la actividad
      if (
        req.user.role === 'instructor' &&
        activityDoc.instructor.toString() !== req.user.id
      ) {
        return res.status(403).json({ msg: 'No tiene permisos para crear guías para esta actividad' });
      }

      // Crear nueva guía
      const newGuide = new Guide({
        title,
        instructor: req.user.id,
        introduction,
        objectives,
        materials: materials || [],
        development,
        evaluation,
        resources: resources || [],
        tags: tags || [],
        activity
      });

      const guide = await newGuide.save();

      // Actualizar la actividad para incluir la guía
      activityDoc.guides.push(guide._id);
      await activityDoc.save();

      res.json(guide);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Actividad no encontrada' });
      }
      res.status(500).send('Error del servidor');
    }
  }
);
// @route   GET api/guides
// @desc    Obtener todas las guías con filtros opcionales
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Construir filtros basados en query params
    const filter = {};
    
    // Filtros básicos
    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: 'i' };
    }
    
    if (req.query.instructor) {
      filter.instructor = req.query.instructor;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filtros avanzados
    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
      filter.tags = { $in: tags };
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }
    
    // Filtro por fecha
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      filter.createdAt = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      filter.createdAt = { $lte: new Date(req.query.endDate) };
    }
    
    // Opciones de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Opciones de ordenamiento
    const sort = {};
    if (req.query.sortBy) {
      sort[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Por defecto, ordenar por fecha de creación descendente
    }
    
    // Ejecutar consulta con filtros, paginación y ordenamiento
    const guides = await Guide.find(filter)
      .populate('instructor', 'name')
      .populate('activity', 'title')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Contar total de documentos para metadata de paginación
    const total = await Guide.countDocuments(filter);
    
    res.json({
      guides,
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

// @route   GET api/guides/:id
// @desc    Obtener una guía por ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id)
      .populate('instructor', ['name', 'email'])
      .populate('activity');

    if (!guide) {
      return res.status(404).json({ msg: 'Guía no encontrada' });
    }

    // Verificar si el usuario tiene permiso para ver la guía
    if (
      req.user.role === 'instructor' &&
      guide.instructor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    res.json(guide);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Guía no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT api/guides/:id
// @desc    Actualizar una guía
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'El título es requerido').not().isEmpty(),
      check('introduction', 'La introducción es requerida').not().isEmpty(),
      check('objectives', 'Los objetivos son requeridos').isArray({ min: 1 }),
      check('development', 'El desarrollo es requerido').not().isEmpty(),
      check('evaluation', 'La evaluación es requerida').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title,
        introduction,
        objectives,
        materials,
        development,
        evaluation,
        resources,
        tags,
        status
      } = req.body;

      // Buscar la guía
      let guide = await Guide.findById(req.params.id);

      if (!guide) {
        return res.status(404).json({ msg: 'Guía no encontrada' });
      }

      // Verificar si el usuario tiene permiso para actualizar la guía
      if (
        req.user.role === 'instructor' &&
        guide.instructor.toString() !== req.user.id
      ) {
        return res.status(403).json({ msg: 'Acceso denegado' });
      }

      // Actualizar campos
      guide.title = title;
      guide.introduction = introduction;
      guide.objectives = objectives;
      guide.materials = materials || guide.materials;
      guide.development = development;
      guide.evaluation = evaluation;
      guide.resources = resources || guide.resources;
      guide.tags = tags || guide.tags;
      if (status && ['admin', 'superadmin'].includes(req.user.role)) {
        guide.status = status;
      }
      guide.updatedAt = Date.now();

      await guide.save();

      res.json(guide);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Guía no encontrada' });
      }
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   DELETE api/guides/:id
// @desc    Eliminar una guía
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Buscar la guía
    const guide = await Guide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({ msg: 'Guía no encontrada' });
    }

    // Verificar si el usuario tiene permiso para eliminar la guía
    if (
      req.user.role === 'instructor' &&
      guide.instructor.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    // Eliminar la guía de la actividad asociada
    const activity = await Activity.findById(guide.activity);
    if (activity) {
      activity.guides = activity.guides.filter(
        (guideId) => guideId.toString() !== req.params.id
      );
      await activity.save();
    }

    await guide.remove();

    res.json({ msg: 'Guía eliminada' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Guía no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;