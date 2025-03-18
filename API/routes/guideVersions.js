const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Guide = require('../models/Guide');
const GuideVersion = require('../models/GuideVersion');

// @route   POST api/guide-versions/:guideId
// @desc    Crear una nueva versión de una guía
// @access  Private (instructor, admin, superadmin)
router.post(
  '/:guideId',
  [
    auth,
    [
      check('changeDescription', 'La descripción del cambio es requerida').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const guide = await Guide.findById(req.params.guideId);

      if (!guide) {
        return res.status(404).json({ msg: 'Guía no encontrada' });
      }

      // Verificar permisos
      if (
        req.user.role === 'instructor' &&
        guide.instructor.toString() !== req.user.id
      ) {
        return res.status(403).json({ msg: 'No tiene permisos para versionar esta guía' });
      }

      // Obtener el número de la última versión
      const lastVersion = await GuideVersion.findOne({ guide: guide._id })
        .sort({ versionNumber: -1 });

      const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

      // Crear nueva versión
      const newVersion = new GuideVersion({
        guide: guide._id,
        versionNumber,
        title: guide.title,
        introduction: guide.introduction,
        objectives: guide.objectives,
        materials: guide.materials,
        development: guide.development,
        evaluation: guide.evaluation,
        resources: guide.resources,
        additionalResources: guide.additionalResources,
        changedBy: req.user.id,
        changeDescription: req.body.changeDescription
      });

      await newVersion.save();

      res.json(newVersion);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Guía no encontrada' });
      }
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   GET api/guide-versions/:guideId
// @desc    Obtener todas las versiones de una guía
// @access  Private
router.get('/:guideId', auth, async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.guideId);

    if (!guide) {
      return res.status(404).json({ msg: 'Guía no encontrada' });
    }

    const versions = await GuideVersion.find({ guide: guide._id })
      .sort({ versionNumber: -1 })
      .populate('changedBy', 'name email');

    res.json(versions);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Guía no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/guide-versions/:guideId/:versionNumber
// @desc    Obtener una versión específica de una guía
// @access  Private
router.get('/:guideId/:versionNumber', auth, async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.guideId);

    if (!guide) {
      return res.status(404).json({ msg: 'Guía no encontrada' });
    }

    const version = await GuideVersion.findOne({
      guide: guide._id,
      versionNumber: req.params.versionNumber
    }).populate('changedBy', 'name email');

    if (!version) {
      return res.status(404).json({ msg: 'Versión no encontrada' });
    }

    res.json(version);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Guía o versión no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/guide-versions/compare/:guideId/:versionNumber1/:versionNumber2
// @desc    Comparar dos versiones de una guía
// @access  Private
router.get('/compare/:guideId/:versionNumber1/:versionNumber2', auth, async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.guideId);

    if (!guide) {
      return res.status(404).json({ msg: 'Guía no encontrada' });
    }

    const version1 = await GuideVersion.findOne({
      guide: guide._id,
      versionNumber: req.params.versionNumber1
    });

    const version2 = await GuideVersion.findOne({
      guide: guide._id,
      versionNumber: req.params.versionNumber2
    });

    if (!version1 || !version2) {
      return res.status(404).json({ msg: 'Una o ambas versiones no encontradas' });
    }

    res.json({ version1, version2 });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Guía o versión no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/guide-versions/restore/:guideId/:versionNumber
// @desc    Restaurar una versión anterior de una guía
// @access  Private (instructor, admin, superadmin)
router.post(
  '/restore/:guideId/:versionNumber',
  [
    auth,
    [
      check('restoreDescription', 'La descripción de la restauración es requerida').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const guide = await Guide.findById(req.params.guideId);

      if (!guide) {
        return res.status(404).json({ msg: 'Guía no encontrada' });
      }

      // Verificar permisos
      if (
        req.user.role === 'instructor' &&
        guide.instructor.toString() !== req.user.id
      ) {
        return res.status(403).json({ msg: 'No tiene permisos para restaurar esta guía' });
      }

      const versionToRestore = await GuideVersion.findOne({
        guide: guide._id,
        versionNumber: req.params.versionNumber
      });

      if (!versionToRestore) {
        return res.status(404).json({ msg: 'Versión no encontrada' });
      }

      // Actualizar la guía con los datos de la versión
      guide.title = versionToRestore.title;
      guide.introduction = versionToRestore.introduction;
      guide.objectives = versionToRestore.objectives;
      guide.materials = versionToRestore.materials;
      guide.development = versionToRestore.development;
      guide.evaluation = versionToRestore.evaluation;
      guide.resources = versionToRestore.resources;
      guide.additionalResources = versionToRestore.additionalResources;

      await guide.save();

      // Crear una nueva versión para registrar la restauración
      const lastVersion = await GuideVersion.findOne({ guide: guide._id })
        .sort({ versionNumber: -1 });

      const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

      const newVersion = new GuideVersion({
        guide: guide._id,
        versionNumber,
        title: guide.title,
        introduction: guide.introduction,
        objectives: guide.objectives,
        materials: guide.materials,
        development: guide.development,
        evaluation: guide.evaluation,
        resources: guide.resources,
        additionalResources: guide.additionalResources,
        changedBy: req.user.id,
        changeDescription: `Restauración de la versión ${req.params.versionNumber}: ${req.body.restoreDescription}`
      });

      await newVersion.save();

      res.json({ guide, newVersion });
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Guía o versión no encontrada' });
      }
      res.status(500).send('Error del servidor');
    }
  }
);

module.exports = router;