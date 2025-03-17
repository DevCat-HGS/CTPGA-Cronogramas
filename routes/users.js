const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/users
// @desc    Registrar un usuario
// @access  Public
router.post(
  '/',
  [
    check('name', 'El nombre es requerido').not().isEmpty(),
    check('email', 'Por favor incluya un email válido').isEmail(),
    check('password', 'Por favor ingrese una contraseña con 6 o más caracteres').isLength({ min: 6 }),
    check('role', 'El rol es requerido').isIn(['instructor', 'admin', 'superadmin'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, area } = req.body;

    try {
      // Verificar si el usuario ya existe
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'El usuario ya existe' });
      }

      // Si es admin, verificar que se proporcione el área
      if (role === 'admin' && !area) {
        return res.status(400).json({ msg: 'El área es requerida para administradores' });
      }

      // Crear nuevo usuario
      user = new User({
        name,
        email,
        password,
        role,
        area: role === 'admin' ? area : undefined,
        // Los superadmin se crean activos, los demás pendientes
        status: role === 'superadmin' ? 'active' : 'pending'
      });

      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Si es superadmin, devolver token inmediatamente
      if (role === 'superadmin') {
        const payload = {
          user: {
            id: user.id,
            role: user.role
          }
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      } else {
        // Para otros roles, informar que la solicitud está pendiente
        res.json({ msg: 'Solicitud de registro enviada. Pendiente de aprobación.' });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   GET api/users
// @desc    Obtener todos los usuarios
// @access  Private (admin, superadmin)
router.get('/', auth, async (req, res) => {
  try {
    // Verificar si el usuario tiene permisos
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    // Si es admin, solo mostrar instructores
    let query = {};
    if (req.user.role === 'admin') {
      query = { role: 'instructor' };
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/users/pending
// @desc    Obtener usuarios pendientes de aprobación
// @access  Private (admin, superadmin)
router.get('/pending', auth, async (req, res) => {
  try {
    // Verificar si el usuario tiene permisos
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    // Si es admin, solo mostrar instructores pendientes
    let query = { status: 'pending' };
    if (req.user.role === 'admin') {
      query.role = 'instructor';
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT api/users/:id/status
// @desc    Actualizar estado de un usuario (aprobar/rechazar)
// @access  Private (admin, superadmin)
router.put(
  '/:id/status',
  [
    auth,
    [
      check('status', 'El estado debe ser active o rejected').isIn(['active', 'rejected'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Verificar si el usuario tiene permisos
      if (!['admin', 'superadmin'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Acceso denegado' });
      }

      const { status } = req.body;

      // Buscar usuario
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }

      // Si es admin, solo puede aprobar instructores
      if (req.user.role === 'admin' && user.role !== 'instructor') {
        return res.status(403).json({ msg: 'No tiene permisos para modificar este usuario' });
      }

      // Actualizar estado
      user.status = status;
      await user.save();

      res.json(user);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   GET api/users/admins
// @desc    Obtener todos los administradores
// @access  Private (superadmin)
router.get('/admins', auth, async (req, res) => {
  try {
    // Verificar si el usuario es superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    const admins = await User.find({ role: 'admin' }).select('-password');
    res.json(admins);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;