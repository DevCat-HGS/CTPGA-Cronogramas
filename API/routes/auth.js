const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const refreshToken = require('../middleware/refreshToken');

// @route   POST api/auth
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Por favor incluya un email válido').isEmail(),
    check('password', 'La contraseña es requerida').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Verificar si el usuario existe
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'Credenciales inválidas' });
      }

      // Verificar si el usuario está activo
      if (user.status !== 'active') {
        return res.status(401).json({ msg: 'Su cuenta está pendiente de aprobación o ha sido rechazada' });
      }

      // Verificar contraseña
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Credenciales inválidas' });
      }

      // Actualizar estado en línea
      user.isOnline = true;
      user.lastActive = Date.now();
      await user.save();

      // Crear y devolver JWT
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
          res.json({ token, user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            area: user.area
          } });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   GET api/auth
// @desc    Obtener usuario autenticado
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/auth/logout
// @desc    Cerrar sesión de usuario
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Actualizar estado en línea
    const user = await User.findById(req.user.id);
    user.isOnline = false;
    user.lastActive = Date.now();
    await user.save();

    res.json({ msg: 'Sesión cerrada correctamente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/auth/refresh
// @desc    Renovar token JWT
// @access  Public
router.post('/refresh', refreshToken);

module.exports = router;