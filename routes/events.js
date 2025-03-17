const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Event = require('../models/Event');

// @route   POST api/events
// @desc    Crear un nuevo evento
// @access  Private (admin, superadmin)
router.post(
  '/',
  [
    auth,
    [
      check('title', 'El título es requerido').not().isEmpty(),
      check('description', 'La descripción es requerida').not().isEmpty(),
      check('startDate', 'La fecha de inicio es requerida').not().isEmpty(),
      check('endDate', 'La fecha de finalización es requerida').not().isEmpty()
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
      const { title, description, startDate, endDate, location, participants } = req.body;

      // Validar que la fecha de finalización sea posterior a la de inicio
      if (new Date(endDate) <= new Date(startDate)) {
        return res.status(400).json({ msg: 'La fecha de finalización debe ser posterior a la fecha de inicio' });
      }

      // Crear nuevo evento
      const newEvent = new Event({
        title,
        description,
        startDate,
        endDate,
        location,
        organizer: req.user.id,
        participants: participants || []
      });

      const event = await newEvent.save();

      res.json(event);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   GET api/events
// @desc    Obtener todos los eventos
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', ['name', 'email'])
      .populate('participants', ['name', 'email'])
      .sort({ startDate: 1 });

    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/events/:id
// @desc    Obtener un evento por ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', ['name', 'email'])
      .populate('participants', ['name', 'email']);

    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT api/events/:id
// @desc    Actualizar un evento
// @access  Private (admin, superadmin)
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'El título es requerido').not().isEmpty(),
      check('description', 'La descripción es requerida').not().isEmpty(),
      check('startDate', 'La fecha de inicio es requerida').not().isEmpty(),
      check('endDate', 'La fecha de finalización es requerida').not().isEmpty()
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
      const { title, description, startDate, endDate, location, participants, status } = req.body;

      // Validar que la fecha de finalización sea posterior a la de inicio
      if (new Date(endDate) <= new Date(startDate)) {
        return res.status(400).json({ msg: 'La fecha de finalización debe ser posterior a la fecha de inicio' });
      }

      // Buscar el evento
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ msg: 'Evento no encontrado' });
      }

      // Verificar si el usuario es el organizador o superadmin
      if (req.user.role !== 'superadmin' && event.organizer.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Acceso denegado' });
      }

      // Actualizar campos
      event.title = title;
      event.description = description;
      event.startDate = startDate;
      event.endDate = endDate;
      event.location = location;
      if (participants) event.participants = participants;
      if (status) event.status = status;
      event.updatedAt = Date.now();

      await event.save();

      res.json(event);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Evento no encontrado' });
      }
      res.status(500).send('Error del servidor');
    }
  }
);

// @route   DELETE api/events/:id
// @desc    Eliminar un evento
// @access  Private (admin, superadmin)
router.delete('/:id', auth, async (req, res) => {
  // Verificar permisos
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ msg: 'Acceso denegado' });
  }

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    // Verificar si el usuario es el organizador o superadmin
    if (req.user.role !== 'superadmin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    await event.remove();

    res.json({ msg: 'Evento eliminado' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/events/:id/participants
// @desc    Añadir participante a un evento
// @access  Private
router.post('/:id/participants', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    // Verificar si el usuario ya es participante
    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Ya eres participante de este evento' });
    }

    // Añadir participante
    event.participants.push(req.user.id);
    await event.save();

    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;