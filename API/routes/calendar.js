const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const Activity = require('../models/Activity');
const Guide = require('../models/Guide');
const User = require('../models/User');

// @route   GET api/calendar
// @desc    Obtener todos los eventos del calendario (eventos, actividades y guías)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Filtros de fecha
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setDate(new Date().getDate() - 30)); // Por defecto, 30 días atrás
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date(new Date().setDate(new Date().getDate() + 60)); // Por defecto, 60 días adelante
    
    // Obtener eventos
    let eventsQuery = Event.find({
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { 
          $and: [
            { startDate: { $lte: startDate } },
            { endDate: { $gte: endDate } }
          ]
        }
      ]
    }).populate('organizer', 'name');
    
    // Si es instructor, solo mostrar eventos donde es organizador o participante
    if (req.user.role === 'instructor') {
      eventsQuery = eventsQuery.find({
        $or: [
          { organizer: req.user.id },
          { participants: req.user.id }
        ]
      });
    }
    
    const events = await eventsQuery.lean();
    
    // Obtener actividades con fechas límite en el rango
    let activitiesQuery = Activity.find({
      deadline: { $gte: startDate, $lte: endDate }
    }).populate('instructor', 'name');
    
    // Si es instructor, solo mostrar sus actividades
    if (req.user.role === 'instructor') {
      activitiesQuery = activitiesQuery.find({ instructor: req.user.id });
    }
    
    const activities = await activitiesQuery.lean();
    
    // Formatear todos los elementos para el calendario
    const calendarItems = [
      // Formatear eventos
      ...events.map(event => ({
        id: event._id,
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        description: event.description,
        location: event.location,
        organizer: event.organizer,
        type: 'event',
        status: event.status,
        color: '#4CAF50' // Verde para eventos
      })),
      
      // Formatear actividades
      ...activities.map(activity => ({
        id: activity._id,
        title: activity.title,
        start: activity.deadline, // Fecha límite como fecha de inicio
        end: activity.deadline, // Misma fecha para que aparezca como un punto en el calendario
        description: activity.description,
        instructor: activity.instructor,
        type: 'activity',
        status: activity.status,
        progress: activity.progress,
        color: '#2196F3' // Azul para actividades
      }))
    ];
    
    res.json(calendarItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET api/calendar/user
// @desc    Obtener calendario personalizado del usuario
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    // Filtros de fecha
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date(new Date().setDate(new Date().getDate() + 60));
    
    // Obtener eventos donde el usuario es organizador o participante
    const events = await Event.find({
      $and: [
        {
          $or: [
            { startDate: { $gte: startDate, $lte: endDate } },
            { endDate: { $gte: startDate, $lte: endDate } },
            { 
              $and: [
                { startDate: { $lte: startDate } },
                { endDate: { $gte: endDate } }
              ]
            }
          ]
        },
        {
          $or: [
            { organizer: req.user.id },
            { participants: req.user.id }
          ]
        }
      ]
    }).populate('organizer', 'name').lean();
    
    // Obtener actividades del usuario (si es instructor)
    let activities = [];
    if (req.user.role === 'instructor') {
      activities = await Activity.find({
        instructor: req.user.id,
        deadline: { $gte: startDate, $lte: endDate }
      }).lean();
    } else if (req.user.role === 'student') {
      // Para estudiantes, obtener actividades asignadas a sus grupos
      const user = await User.findById(req.user.id).populate('groups');
      if (user && user.groups && user.groups.length > 0) {
        const groupIds = user.groups.map(group => group._id);
        activities = await Activity.find({
          groups: { $in: groupIds },
          deadline: { $gte: startDate, $lte: endDate }
        }).populate('instructor', 'name').lean();
      }
    }
    
    // Formatear todos los elementos para el calendario personalizado
    const calendarItems = [
      // Formatear eventos
      ...events.map(event => ({
        id: event._id,
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        description: event.description,
        location: event.location,
        organizer: event.organizer,
        type: 'event',
        status: event.status,
        color: '#4CAF50' // Verde para eventos
      })),
      
      // Formatear actividades
      ...activities.map(activity => ({
        id: activity._id,
        title: activity.title,
        start: activity.deadline,
        end: activity.deadline,
        description: activity.description,
        instructor: activity.instructor,
        type: 'activity',
        status: activity.status,
        progress: activity.progress,
        color: '#2196F3' // Azul para actividades
      }))
    ];
    
    res.json(calendarItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;