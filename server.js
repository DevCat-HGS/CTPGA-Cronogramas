require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Inicializar Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ctpga-manager', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado...');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err.message);
    process.exit(1);
  }
};

connectDB();

// Definir rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/guides', require('./routes/guides'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/events', require('./routes/events'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/calendar', require('./routes/calendar'));

// Socket.io para notificaciones en tiempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Unirse a una sala específica según el rol del usuario
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Usuario unido a la sala: ${room}`);
  });

  // Manejar notificaciones
  socket.on('notification', (data) => {
    io.to(data.room).emit('notification', data.message);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/dist'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
  });
}

// Definir puerto
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));