const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const User = require('../models/User');

// @route   POST api/badges
// @desc    Crear una nueva insignia
// @access  Private (admin, superadmin)
router.post(
  '/',
  [
    auth,
    [
      check('name', 'El nombre es requerido').not().isEmpty(),
      check('description', 'La descripción es requerida').not().isEmpty(),
      check('icon', 'El icono es requerido').not().isEmpty(),
      check('criteria', 'Los criterios son requeridos').not().isEmpty(),
      check('category', 'La categoría es requerida').isIn(['content', 'participation', 'quality', 'achievement']),
      check('points', 'Los puntos deben ser un número').optional().isNumeric()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar permisos
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    try {
      const { name, description, icon, criteria, category, points } = req.body;

      // Verificar si la insignia ya existe
      let badge = await Badge.findOne({ name });
      if (badge) {
        return res.status(400).json({ msg: 'Esta insignia ya existe' });
      }

      // Crear nueva insignia
      const newBadge = new Badge({
        name,
        description,
        icon,
        criteria,
        category,
        points: points || 0,
        createdBy: req.user.id
      });

      badge = await newBadge.save();

      res.json(badge);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   GET api/badges
// @desc    Obtener todas las insignias
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const badges = await Badge.find().sort({ createdAt: -1 });
    res.json(badges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/badges/:id
// @desc    Obtener una insignia por ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    
    if (!badge) {
      return res.status(404).json({ msg: 'Insignia no encontrada' });
    }

    res.json(badge);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Insignia no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT api/badges/:id
// @desc    Actualizar una insignia
// @access  Private (admin, superadmin)
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'El nombre es requerido').optional().not().isEmpty(),
      check('description', 'La descripción es requerida').optional().not().isEmpty(),
      check('icon', 'El icono es requerido').optional().not().isEmpty(),
      check('criteria', 'Los criterios son requeridos').optional().not().isEmpty(),
      check('category', 'La categoría es requerida').optional().isIn(['content', 'participation', 'quality', 'achievement']),
      check('points', 'Los puntos deben ser un número').optional().isNumeric(),
      check('isActive', 'El estado debe ser un booleano').optional().isBoolean()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar permisos
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    try {
      const badge = await Badge.findById(req.params.id);
      
      if (!badge) {
        return res.status(404).json({ msg: 'Insignia no encontrada' });
      }

      // Actualizar campos
      const { name, description, icon, criteria, category, points, isActive } = req.body;
      
      if (name) badge.name = name;
      if (description) badge.description = description;
      if (icon) badge.icon = icon;
      if (criteria) badge.criteria = criteria;
      if (category) badge.category = category;
      if (points !== undefined) badge.points = points;
      if (isActive !== undefined) badge.isActive = isActive;
      
      badge.updatedAt = Date.now();

      await badge.save();

      res.json(badge);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Insignia no encontrada' });
      }
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   DELETE api/badges/:id
// @desc    Eliminar una insignia
// @access  Private (admin, superadmin)
router.delete('/:id', auth, async (req, res) => {
  // Verificar permisos
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ msg: 'Acceso denegado' });
  }

  try {
    const badge = await Badge.findById(req.params.id);
    
    if (!badge) {
      return res.status(404).json({ msg: 'Insignia no encontrada' });
    }

    await badge.deleteOne();

    res.json({ msg: 'Insignia eliminada' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Insignia no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/badges/assign/:badgeId/:userId
// @desc    Asignar una insignia a un usuario
// @access  Private (admin, superadmin)
router.post('/assign/:badgeId/:userId', auth, async (req, res) => {
  // Verificar permisos
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ msg: 'Acceso denegado' });
  }

  try {
    const badge = await Badge.findById(req.params.badgeId);
    if (!badge) {
      return res.status(404).json({ msg: 'Insignia no encontrada' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Verificar si el usuario ya tiene esta insignia
    let userBadge = await UserBadge.findOne({
      user: req.params.userId,
      badge: req.params.badgeId
    });

    if (userBadge) {
      // Si ya existe, actualizar el progreso
      userBadge.progress = 100;
      userBadge.isCompleted = true;
      userBadge.earnedAt = Date.now();
      await userBadge.save();
    } else {
      // Si no existe, crear una nueva asignación
      userBadge = new UserBadge({
        user: req.params.userId,
        badge: req.params.badgeId,
        progress: 100,
        isCompleted: true
      });
      await userBadge.save();
    }

    res.json(userBadge);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'ID no válido' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/badges/user/:userId
// @desc    Obtener todas las insignias de un usuario
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ user: req.params.userId })
      .populate('badge')
      .sort({ earnedAt: -1 });
    
    res.json(userBadges);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT api/badges/progress/:badgeId/:userId
// @desc    Actualizar el progreso de una insignia para un usuario
// @access  Private (admin, superadmin)
router.put('/progress/:badgeId/:userId', 
  [
    auth,
    [
      check('progress', 'El progreso debe ser un número entre 0 y 100').isInt({ min: 0, max: 100 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar permisos
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    try {
      const { progress } = req.body;
      
      // Verificar si existe la relación usuario-insignia
      let userBadge = await UserBadge.findOne({
        user: req.params.userId,
        badge: req.params.badgeId
      });

      if (!userBadge) {
        // Si no existe, crear una nueva
        userBadge = new UserBadge({
          user: req.params.userId,
          badge: req.params.badgeId,
          progress
        });
      } else {
        // Si existe, actualizar el progreso
        userBadge.progress = progress;
      }

      // Si el progreso es 100%, marcar como completada
      if (progress === 100) {
        userBadge.isCompleted = true;
        userBadge.earnedAt = Date.now();
      }

      await userBadge.save();

      res.json(userBadge);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'ID no válido' });
      }
      res.status(500).send('Error del servidor');
    }
  }
);

module.exports = router;