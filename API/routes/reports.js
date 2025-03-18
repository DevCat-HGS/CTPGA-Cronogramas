const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Report = require('../models/Report');

// @route   POST api/reports
// @desc    Crear un nuevo reporte
// @access  Private (admin, superadmin)
router.post(
  '/',
  [
    auth,
    [
      check('title', 'El título es requerido').not().isEmpty(),
      check('description', 'La descripción es requerida').not().isEmpty(),
      check('type', 'El tipo de reporte es requerido').isIn(['activity', 'instructor', 'event', 'general']),
      check('data', 'Los datos del reporte son requeridos').not().isEmpty(),
      check('format', 'El formato del reporte es requerido').isIn(['excel', 'pdf', 'csv'])
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
      const { title, description, type, data, format } = req.body;

      // Crear nuevo reporte
      const newReport = new Report({
        title,
        description,
        type,
        creator: req.user.id,
        data,
        format
      });

      const report = await newReport.save();

      // Aquí se podría implementar la lógica para generar el reporte en segundo plano
      // Por ahora, simplemente devolvemos el reporte creado

      res.json(report);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   GET api/reports
// @desc    Obtener todos los reportes
// @access  Private (admin, superadmin)
router.get('/', auth, async (req, res) => {
  // Verificar permisos
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ msg: 'Acceso denegado' });
  }

  try {
    const reports = await Report.find()
      .populate('creator', ['name', 'email'])
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/reports/:id
// @desc    Obtener un reporte por ID
// @access  Private (admin, superadmin)
router.get('/:id', auth, async (req, res) => {
  // Verificar permisos
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ msg: 'Acceso denegado' });
  }

  try {
    const report = await Report.findById(req.params.id)
      .populate('creator', ['name', 'email']);

    if (!report) {
      return res.status(404).json({ msg: 'Reporte no encontrado' });
    }

    res.json(report);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Reporte no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   DELETE api/reports/:id
// @desc    Eliminar un reporte
// @access  Private (superadmin)
router.delete('/:id', auth, async (req, res) => {
  // Verificar permisos
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ msg: 'Acceso denegado' });
  }

  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ msg: 'Reporte no encontrado' });
    }

    await report.remove();

    res.json({ msg: 'Reporte eliminado' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Reporte no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;