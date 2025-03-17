const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Analytics = require('../models/Analytics');
const Guide = require('../models/Guide');
const Activity = require('../models/Activity');

// @route   POST api/analytics/view/:type/:id
// @desc    Registrar una vista de guía o actividad
// @access  Private
router.post('/view/:type/:id', auth, async (req, res) => {
  try {
    // Validar tipo
    if (!['guide', 'activity'].includes(req.params.type)) {
      return res.status(400).json({ msg: 'Tipo de elemento no válido' });
    }

    // Verificar que el elemento existe
    let item;
    if (req.params.type === 'guide') {
      item = await Guide.findById(req.params.id);
    } else {
      item = await Activity.findById(req.params.id);
    }

    if (!item) {
      return res.status(404).json({ msg: `${req.params.type === 'guide' ? 'Guía' : 'Actividad'} no encontrada` });
    }

    // Buscar o crear registro de analytics
    let analytics = await Analytics.findOne({
      itemType: req.params.type,
      itemId: req.params.id
    });

    if (!analytics) {
      analytics = new Analytics({
        itemType: req.params.type,
        itemId: req.params.id
      });
    }

    // Incrementar vistas
    analytics.views += 1;
    analytics.updatedAt = Date.now();

    await analytics.save();

    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Elemento no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/analytics/complete/:type/:id
// @desc    Registrar una finalización de guía o actividad
// @access  Private
router.post('/complete/:type/:id', auth, async (req, res) => {
  try {
    // Validar tipo
    if (!['guide', 'activity'].includes(req.params.type)) {
      return res.status(400).json({ msg: 'Tipo de elemento no válido' });
    }

    // Verificar que el elemento existe
    let item;
    if (req.params.type === 'guide') {
      item = await Guide.findById(req.params.id);
    } else {
      item = await Activity.findById(req.params.id);
    }

    if (!item) {
      return res.status(404).json({ msg: `${req.params.type === 'guide' ? 'Guía' : 'Actividad'} no encontrada` });
    }

    // Buscar o crear registro de analytics
    let analytics = await Analytics.findOne({
      itemType: req.params.type,
      itemId: req.params.id
    });

    if (!analytics) {
      analytics = new Analytics({
        itemType: req.params.type,
        itemId: req.params.id
      });
    }

    // Incrementar completados
    analytics.completions += 1;
    analytics.updatedAt = Date.now();

    await analytics.save();

    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Elemento no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/analytics/rate/:type/:id
// @desc    Calificar una guía o actividad
// @access  Private
router.post(
  '/rate/:type/:id',
  [
    auth,
    [
      check('score', 'La calificación debe ser un número entre 1 y 5').isInt({ min: 1, max: 5 }),
      check('comment', 'El comentario es opcional').optional()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Validar tipo
      if (!['guide', 'activity'].includes(req.params.type)) {
        return res.status(400).json({ msg: 'Tipo de elemento no válido' });
      }

      // Verificar que el elemento existe
      let item;
      if (req.params.type === 'guide') {
        item = await Guide.findById(req.params.id);
      } else {
        item = await Activity.findById(req.params.id);
      }

      if (!item) {
        return res.status(404).json({ msg: `${req.params.type === 'guide' ? 'Guía' : 'Actividad'} no encontrada` });
      }

      const { score, comment } = req.body;

      // Buscar o crear registro de analytics
      let analytics = await Analytics.findOne({
        itemType: req.params.type,
        itemId: req.params.id
      });

      if (!analytics) {
        analytics = new Analytics({
          itemType: req.params.type,
          itemId: req.params.id
        });
      }

      // Verificar si el usuario ya ha calificado este elemento
      const existingRatingIndex = analytics.ratings.findIndex(
        rating => rating.user.toString() === req.user.id
      );

      if (existingRatingIndex !== -1) {
        // Actualizar calificación existente
        analytics.ratings[existingRatingIndex].score = score;
        analytics.ratings[existingRatingIndex].comment = comment || '';
        analytics.ratings[existingRatingIndex].createdAt = Date.now();
      } else {
        // Agregar nueva calificación
        analytics.ratings.push({
          user: req.user.id,
          score,
          comment: comment || '',
          createdAt: Date.now()
        });
      }

      // Calcular promedio de calificaciones
      const totalScore = analytics.ratings.reduce((sum, rating) => sum + rating.score, 0);
      analytics.averageRating = totalScore / analytics.ratings.length;
      analytics.updatedAt = Date.now();

      await analytics.save();

      res.json(analytics);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Elemento no encontrado' });
      }
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   POST api/analytics/time/:type/:id
// @desc    Registrar tiempo dedicado a una guía o actividad
// @access  Private
router.post(
  '/time/:type/:id',
  [
    auth,
    [
      check('seconds', 'El tiempo debe ser un número positivo').isInt({ min: 1 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Validar tipo
      if (!['guide', 'activity'].includes(req.params.type)) {
        return res.status(400).json({ msg: 'Tipo de elemento no válido' });
      }

      // Verificar que el elemento existe
      let item;
      if (req.params.type === 'guide') {
        item = await Guide.findById(req.params.id);
      } else {
        item = await Activity.findById(req.params.id);
      }

      if (!item) {
        return res.status(404).json({ msg: `${req.params.type === 'guide' ? 'Guía' : 'Actividad'} no encontrada` });
      }

      const { seconds } = req.body;

      // Buscar o crear registro de analytics
      let analytics = await Analytics.findOne({
        itemType: req.params.type,
        itemId: req.params.id
      });

      if (!analytics) {
        analytics = new Analytics({
          itemType: req.params.type,
          itemId: req.params.id,
          timeSpent: seconds
        });
      } else {
        // Actualizar tiempo promedio
        // Fórmula: (tiempo_actual * num_registros + nuevo_tiempo) / (num_registros + 1)
        const totalRegistros = analytics.views || 1; // Usar vistas como aproximación de registros
        analytics.timeSpent = ((analytics.timeSpent * totalRegistros) + seconds) / (totalRegistros + 1);
      }

      analytics.updatedAt = Date.now();
      await analytics.save();

      res.json(analytics);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Elemento no encontrado' });
      }
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   GET api/analytics/:type/:id
// @desc    Obtener analytics de una guía o actividad
// @access  Private
router.get('/:type/:id', auth, async (req, res) => {
  try {
    // Validar tipo
    if (!['guide', 'activity'].includes(req.params.type)) {
      return res.status(400).json({ msg: 'Tipo de elemento no válido' });
    }

    const analytics = await Analytics.findOne({
      itemType: req.params.type,
      itemId: req.params.id
    }).populate('ratings.user', 'name');

    if (!analytics) {
      return res.status(404).json({ msg: 'No hay datos de analytics para este elemento' });
    }

    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Elemento no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/analytics/summary/:type
// @desc    Obtener resumen de analytics por tipo (guías o actividades)
// @access  Private (admin, superadmin)
router.get('/summary/:type', auth, async (req, res) => {
  // Verificar permisos
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ msg: 'Acceso denegado' });
  }

  try {
    // Validar tipo
    if (!['guide', 'activity'].includes(req.params.type)) {
      return res.status(400).json({ msg: 'Tipo de elemento no válido' });
    }

    const analytics = await Analytics.find({ itemType: req.params.type })
      .populate({
        path: 'itemId',
        select: 'title instructor',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      })
      .sort({ views: -1 });

    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;