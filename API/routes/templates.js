const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Template = require('../models/Template');
const User = require('../models/User');

// @route   GET api/templates
// @desc    Get all templates
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const templates = await Template.find()
      .populate('creator', ['name', 'email'])
      .sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/templates/:id
// @desc    Get template by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('creator', ['name', 'email']);
    
    if (!template) {
      return res.status(404).json({ msg: 'Plantilla no encontrada' });
    }

    res.json(template);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Plantilla no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/templates
// @desc    Create a template
// @access  Private (Admin and SuperAdmin only)
router.post('/', [
  auth,
  [
    check('name', 'El nombre es requerido').not().isEmpty(),
    check('description', 'La descripción es requerida').not().isEmpty(),
    check('type', 'El tipo es requerido').not().isEmpty(),
    check('structure', 'La estructura es requerida').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Solo admin y superadmin pueden crear plantillas
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ msg: 'No autorizado para crear plantillas' });
  }

  try {
    const { name, description, type, structure, isDefault } = req.body;

    const newTemplate = new Template({
      name,
      description,
      type,
      structure,
      isDefault: isDefault || false,
      creator: req.user.id
    });

    const template = await newTemplate.save();
    res.json(template);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT api/templates/:id
// @desc    Update a template
// @access  Private (Admin and SuperAdmin only)
router.put('/:id', auth, async (req, res) => {
  // Solo admin y superadmin pueden actualizar plantillas
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ msg: 'No autorizado para actualizar plantillas' });
  }

  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ msg: 'Plantilla no encontrada' });
    }

    // Actualizar campos
    const { name, description, type, structure, isDefault } = req.body;
    if (name) template.name = name;
    if (description) template.description = description;
    if (type) template.type = type;
    if (structure) template.structure = structure;
    if (isDefault !== undefined) template.isDefault = isDefault;
    
    template.updatedAt = Date.now();

    await template.save();
    res.json(template);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Plantilla no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   DELETE api/templates/:id
// @desc    Delete a template
// @access  Private (SuperAdmin only)
router.delete('/:id', auth, async (req, res) => {
  // Solo superadmin puede eliminar plantillas
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ msg: 'No autorizado para eliminar plantillas' });
  }

  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ msg: 'Plantilla no encontrada' });
    }

    await template.remove();
    res.json({ msg: 'Plantilla eliminada' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Plantilla no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;